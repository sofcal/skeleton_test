#pre-req: Powershell 6.0

##Supported for all types
#usage: pwsh Update-AppConfig.ps1 "<VERB>" "<path_to_json_relative_to_this_script" "<key>" ["<value>" "<Type>" -region "<region>"]
#usage: pwsh Update-AppConfig.ps1 -operation "<VERB>" -filePath "<path_to_json_relative_to_this_script" -key "<key>" [-value "<value>" -type "<Type>" -region "<region>"]
#usage: pwsh UpdateConfiguration.ps1 "Create" "../config.dev01.json""new_key" "new_value" "String"
#usage: pwsh UpdateConfiguration.ps1 "Read" "../config.dev01.json" "existing_key"
#usage: pwsh UpdateConfiguration.ps1 "Update" "../config.dev01.json" "existing_key" "new_value"
#usage: pwsh UpdateConfiguration.ps1 "Delete" "../config.dev01.json" "existing_key"

## Only supported for StringList Types
#usage: pwsh UpdateConfiguration.ps1 "Append" "../config.dev01.json" "existing_stringlist_key" "value_x,value_y"
#usage: pwsh UpdateConfiguration.ps1 "Remove" "../config.dev01.json" "existing_stringlist_key" "value_x,value_y"

param
(
    [Parameter(Mandatory=$true,Position=0,HelpMessage='operation to perform')]
    [string]$verb,
    [Parameter(Mandatory=$true,Position=1,HelpMessage='environment being modified')]
    [string]$env,
    [Parameter(Mandatory=$false,HelpMessage='path to configuration files')]
    [string]$folder = "..",
    [Parameter(Mandatory=$false,HelpMessage='key to Update')]
    [string]$key,
    [Parameter(Mandatory=$false,HelpMessage='value to Update')]
    [string]$value="",
    [Parameter(Mandatory=$false,HelpMessage='type to Update')]
    [string]$type="",
    [Parameter(Mandatory=$false,HelpMessage='tegion to apply update')]
    [string]$region = "eu-west-1",
    [Parameter(Mandatory=$false,HelpMessage='logging level, default info')]
    [string]$logLevel = "info",
    [Parameter(Mandatory=$false,HelpMessage='specifies whether a backup should be made of the existing config')]
    [switch]$backup = $false
)

$ErrorActionPreference = 'Stop'

$SCRIPT_NAME = "Update-AppConfig"

$ll_debug = 0
$ll_info = 1
$ll_warning = 2
$ll_error = 3
$ll_requested = if ($logLevel -eq "debug") { $ll_debug } elseif ($logLevel -eq "error") { $ll_error } elseif ($logLevel -eq "warning") { $ll_warning } else { $ll_info }

$hl_success = 0
$hl_info = 1
$hl_warning = 2
$hl_error = 3

#############                         ##################
############# File handling functions ##################
#############                         ##################


########################################################
# Loads the spefied config file from disk and validates
#  the json content
# Throws if file missing or JSON invalid
########################################################
function LoadFile
(
    [Parameter(Mandatory=$false,Position=0)]
    [switch]$noThrow=$false
)
{
    Log -level $ll_debug -message "Loading and validating file: $folder"
    try {
        $targetJSON = Get-Content -Raw $folder
        ValidateJSON -jsonToValidate $targetJSON

        $json = $targetJSON | ConvertFrom-Json
        return $json
    } catch [Exception] {
        if ($noThrow -eq $true) {
            return $null
		}

        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        throwError -errorMessage "Unable to load target file"
    }
}

########################################################
# Retrieves the specified Key from the JSON
# Throws if file missing or JSON invalid
########################################################
function GetKey(
    [Parameter(Mandatory=$true)]
    $json
)
{
    Log -level $ll_debug -message "checking for existing key/value: $key"
    # Find Key in Region
    $foundRegion = $json.PSObject.Properties | Where-Object {$_.Name -eq $region}
    if($foundRegion){
        $found = $foundRegion.Value.PSObject.Properties | Where-Object {$_.Name -eq $key}
        return $found
     } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        ThrowError -errorMessage "region cannot be found in the specified target"
    }
}

########################################################
# Helper function to load file and get property in one
#  call
########################################################
function LoadAndGet
{
    $json = LoadFile
    $found = GetKey -json $json
    return $found
}

########################################################
# Validates JSON Content
# Throws if JSON not valid
########################################################
function ValidateJSON
(
    [Parameter(Mandatory=$true,Position=0)]
    $jsonToValidate
)
{
    try {
        $something = $jsonToValidate | Test-JSON
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        throwError -errorMessage "JSON is invalid"
    }
}

########################################################
# Creates a backup of the current config content, before
#  saving the modified content to disk
# Throws if either file could not be written
########################################################
function SaveOutput
(
    [Parameter(Mandatory=$true)]
    $json
)
{
    Log -level $ll_debug -message "Saving output: $folder"

    $output = $json | ConvertTo-Json
    ValidateJSON -jsonToValidate $output
    try {
        if ($backup -eq $true) {
            $bck = $json.PSObject.Copy() | ConvertTo-Json
            $bckTarget = $folder.Replace(".json",".bck")

            Set-Content $bckTarget $bck

            Log -level $ll_debug -message "Backup created @$bckTarget"
        }

        Set-Content $folder $output
        Log -level $ll_debug -message "$folder saved successfully"
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        ThrowError -errorMessage "Error saving JSON"
    }
}



#############                         ##################
#############    Helper Functions     ##################
#############                         ##################

########################################################
# Helper function for existing the script when an
#  'error' occurs
########################################################
function ThrowError
(
    [Parameter(Mandatory=$true,Position=0)] $errorMessage
)
{
    Log -level $ll_error -message "ERROR: $($errorMessage)" -highlight $hl_error
    exit 1
}

########################################################
# Helper function for sanitizing StringList input
########################################################
function Sanitize
(
     [Parameter(Mandatory=$true,Position=0)]
     $stringToSanitize
)
{
    Log -level $ll_debug -message "sanitizing StringList value"
    # removing leading and trailing commas;
    # split by comma
    # trim whitespace from each entry
    # join together with commas
    return ( $stringToSanitize.Trim(',', ' ').split(',') | % { $_.Trim() } ) -join ','
}

function Log(
    [Parameter(Mandatory=$true)] $level,
    [Parameter(Mandatory=$true)] $message,
    [Parameter(Mandatory=$false)] $highlight=$hl_info
)
{
    # we only log if the appropriate log level was set
    if ($level -ge $ll_requested) {
        $out = "[$SCRIPT_NAME] $message"

        if ($highlight -eq $hl_error) {
            Write-Host $out -ForegroundColor Red
        } elseif ($highlight -eq $hl_warning) {
            Write-Host $out -ForegroundColor Yellow
		} elseif ($highlight -eq $hl_success) {
            Write-Host $out -ForegroundColor Green
		} else {
            Write-Host $out
		}
	}
}


#############                         ##################
#############    Config Operations    ##################
#############                         ##################


########################################################
# Creates a new config file for the specified
#  environment and region
########################################################
function CreateConfig
{
    try {
        Log -level $ll_debug -message "creating config @'$folder' with region: $region"

        $existing = LoadFile $true
        if ($existing -ne $null) {
            throwError -errorMessage "config already exists for given region and environment"
		}

        $json = [PSCustomObject]@{
            $region = [PSCustomObject]@{ }
        }

        SaveOutput $json
        Log -level $ll_info -message "${folder}: successfully created config" -highlight $hl_success
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        throwError -errorMessage "failed to create config"
	}
}

########################################################
# Creates a region section in the specified config
########################################################
function CreateRegion
{
    try {
        Log -level $ll_debug -message "creating config region: $region"

        $json = LoadFile
        $json | Add-Member -Type NoteProperty -Name $region -Value @{} | ConvertTo-Json

        SaveOutput $json
        Log -level $ll_info -message "${region}: successfully created config region" -highlight $hl_success
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        throwError -errorMessage "region already exists in config"
	}
}

########################################################
# Removes a region section in the specified config
########################################################
function RemoveRegion
{
    try {
        Log -level $ll_debug -message "removing config region: $region"

        $json = LoadFile
        $json.PSObject.Properties.Remove($region)

        SaveOutput $json
        Log -level $ll_info -message "${region}: successfully removed config region" -highlight $hl_success
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        throwError -errorMessage "Failed to create config"
	}
}

#############                         ##################
#############  Config Key Operations  ##################
#############                         ##################


########################################################
# Adds an entirely new key/value to the config section
########################################################
function CreateKey 
{
    try {
        Log -level $ll_debug -message "creating config key: $key"
        
        # check for required properties
        if ( ($key -eq "") -or ($type -eq "") -or ($value -eq "") ) {
            throwError -errorMessage "-key, -type, and -value must be provided"
        }

        if (($type -ne "String") -and ($type -ne "StringList") -and ($type -ne "SecureString") ) {
            throwError -errorMessage "-type must be one of [String, StringList, SecureString]"
		}

        $json = LoadFile
        $found = GetKey -json $json

        if($found){
            throwError -errorMessage "${key}: already exists in the specified region"
        }

        # if we're dealing with a stringlist, we still need to sanitize the input.
        if ($type -eq "StringList") {
            $value = Sanitize -stringToSanitize $value
	    }

        # create the new hash and object
        $hash = @{ Type = $type; Value = $value }
        $obj = New-Object PSObject -Property $hash

        # add the object to the existing config
        $json.$region | Add-Member -Type NoteProperty -Name $key -Value $obj | ConvertTo-Json
        
        SaveOutput $json
        Log -level $ll_info -message "${key}: successfully created" -highlight $hl_success
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        throwError -errorMessage "failed to create key"
	}
}

########################################################
# Reads the value of an existing key
#    WARNING - DO NOT USE THIS FUNCTION ON PIPELINES
########################################################
function ReadKeyValue
{
    try {
        Log -level $ll_debug -message "reading config key: $key"

        # check for required properties
        if ( ($key -eq "") ) {
            ThrowError -errorMessage "-key must be provided"
        }

        $found = LoadAndGet

        if(!$found){
            ThrowError -errorMessage "${key} cannot be found in the specified region"
        }

        Write-Host "$($found.Name | ConvertTo-Json): $($found.Value | ConvertTo-Json)"
        Log -level $ll_info -message "${key}: successfully read" -highlight $hl_success
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        ThrowError -errorMessage "failed to read key"
	}
}

########################################################
# Updates the value of an existing key
########################################################
function UpdateKeyValue {
    try {
        Log -level $ll_debug -message "updating config key: $key"

        # check for required properties
        if ( ($key -eq "") -or ($value -eq "") ) {
            ThrowError -errorMessage "-key and -value must be provided"
        }

        $json = LoadFile
        $found = GetKey -json $json

        if(!$found) {
            ThrowError -errorMessage "${key} cannot be found in the specified region"
        }

        # if we're dealing with a stringlist, we still need to sanitize the input.
        if ($found.value.type -eq "StringList") {
            $value = Sanitize -stringToSanitize $value
	    }

        if($found.value.value -eq $value){
            # log only; but let the user know
            Log -level $ll_info -message "${key}: specified value matches existing value" -highlight $hl_success
        } else {
            # update the existing key with the new value
            $found.value.value = $value
            SaveOutput $json
            Log -level $ll_info -message "${key}: successfully updated" -highlight $hl_success
        }
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        ThrowError -errorMessage "failed to update key"
	}
}

########################################################
# Deletes an existing key and it's value
########################################################
function DeleteKey {
    try {
        Log -level $ll_debug -message "deleting config key: $key"

        # check for required properties
        if ( ($key -eq "") ) {
            ThrowError -errorMessage "-key must be provided"
        }

        $json = LoadFile
        $found = GetKey -json $json
    
        if(!$found) {
            ThrowError -errorMessage "${key} cannot be found in the specified region"
        }

        $foundRegion.Value.PSObject.Properties.Remove($found.Name)
        SaveOutput $json
        Log -level $ll_info -message "${key}: successfully deleted" -highlight $hl_success
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        ThrowError -errorMessage "failed to delete key"
    }
}

########################################################
# Adds an additional value to a StringList key
########################################################
function AppendKeyValue
{
    try {
        Log -level $ll_debug -message "appending config key value: $key"

        # check for required properties
        if ( ($key -eq "") -or ($value -eq "") ) {
            ThrowError -errorMessage "-key and -value must be provided"
        }

        $json = LoadFile
        $found = GetKey -json $json

        if(!$found){
            ThrowError -errorMessage "${key} cannot be found in the specified region"
        }

        # Only applicable for StringList entries
        if ($found.value.type -ne "StringList") {
            ThrowError -errorMessage "append can only be used on keys with type: StringList"
            return;
        }
   
        $value = Sanitize -stringToSanitize $value

        $inputArray = $value.split(',')
        $foundArray = $found.value.Value.split(',')

        $value = ($foundArray + $inputArray | select -unique) -join ','
        if($found.value.value -eq $value){
            # log only; but let the user know
            Log -level $ll_info -message "${key}: specified value matches existing value" -highlight $hl_success
        } else {
            $found.value.Value = $value

            SaveOutput $json
            Log -level $ll_info -message "${key}: successfully appended key value" -highlight $hl_success
        }
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        ThrowError -errorMessage "failed to append key value"
    }
}

########################################################
# Removes a value from a StringList key
########################################################
function RemoveKeyValue
{
    try {
        Log -level $ll_debug -message "removing config key value: $key"

        # check for required properties
        if ( ($key -eq "") -or ($value -eq "") ) {
            ThrowError -errorMessage "-key and -value must be provided"
        }

        $json = LoadFile
        $found = GetKey -json $json
    
        if(!$found){
            ThrowError -errorMessage "${key} cannot be found in the specified region"
        }

        # Only applicable for StringList entries
        if ($found.value.type -ne "StringList") {
            ThrowError -errorMessage "remove can only be used on keys with type: StringList"
            return;
        }
        
        $value = Sanitize -stringToSanitize $value

        $removeArray = $value.split(',')
        $foundArray = $found.value.value.split(',')

        $value = ( $foundArray | Where {$removeArray -NotContains $_} ) -join ','
        if($found.value.value -eq $value){
            # log only; but let the user know
            Log -level $ll_info -message "${key}: specified value matches existing value" -highlight $hl_success
        } else {
            $found.value.value = $value

            SaveOutput $json
            Log -level $ll_info -message "${key}: successfully removed key value" -highlight $hl_success
        }
    } catch [Exception] {
        Log -level $ll_debug -message "$_.Exception.GetType().FullName, $_.Exception.Message" -highlight $hl_error
        ThrowError -errorMessage "failed to delete key"
    }
}


#############                         ##################
#############          MAIN           ##################
#############                         ##################

Log -level $ll_debug -message "STARTED: (verb: $verb; folder: $folder; env: $env; region: $region)"

if ($env -eq ""){
    throwError -errorMessage "invalid environment"
}

if (![System.IO.Path]::IsPathRooted($folder)) {
	$folder = "$PSScriptRoot/$folder";
}

$folder = "$folder/config.$env.json"

# Process Operation
switch($verb){
    "CreateConfig" { CreateConfig }
    "CreateRegion" { CreateRegion }
    "RemoveRegion" { RemoveRegion }
    "Create" { CreateKey }
    "Read" { ReadKeyValue }
    "Update" { UpdateKeyValue }
    "Delete" { DeleteKey }
    "Append" { AppendKeyValue }
    "Remove" { RemoveKeyValue }
    default { Write-Host "Invalid Operation" }
}