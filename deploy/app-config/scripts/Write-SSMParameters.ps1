Param(
    [Parameter(Mandatory=$true)][string]$product,
    [Parameter(Mandatory=$true)][string]$env,
    [Parameter(Mandatory=$true)][string]$region,
    [Parameter(Mandatory=$true)][string]$folder,
    [Parameter(Mandatory=$false)][string]$profileName,
    [string]$keySpec = 'AES_128'
)

#################################
# Uploads values to param-store
#################################
function Write-SSMParameters
(
    [string]$product,
    [string]$env,
    [string]$region,
    [string]$filePath    
)
{

    Write-Host "[Write-SSMParameters] started"

    $keyId = "alias/$product-$env-$region-config";
    $hierarchy = "/$product-$env/"

    Write-Host "[Write-SSMParameters] generated keyId and Hierarchy (key_alias: $keyId, hierarchy: $hierarchy)"
    Write-Host "[Write-SSMParameters] parsing JSON content (filePath: $filePath)"

    #read JSON config file and select the appropriate region section
    $parsed = (Get-Content -Raw -Path $filePath | ConvertFrom-Json).$($region)

    #create an array from the object property names so we can iterate over them
    $array = $parsed.psobject.Properties

    foreach($key in $array){
        #get the actual param object from the key name
        $param = $parsed.$($key.Name);
        
        try {
            if($param.Value -eq $null){
                try {
                    #null value means we want to delete the parameter
                    $name = "$($hierarchy)$($key.Name)"
                    Remove-SSMParameter -Name "$name" -Force
                    Write-Host "[Write-SSMParameters] Parameter removed successfully (key: $name)" -ForegroundColor Green -BackgroundColor Black
                }
                catch
                {
                    Write-Host "[Write-SSMParameters] Parameter could not be deleted; was it already removed? (key: $key)" -ForegroundColor Yellow -BackgroundColor Black
				}
            } 
            else {
                #otherwise we're either adding or updating
                $name = "$($hierarchy)$($key.Name)"
                $type = $param.Type
                $value = $param.Value
                
                # SecureStrings needs to be encrypted, so the cmdlet is called with the -KeyId flag
                if($type -eq "SecureString"){
                    Write-SSMParameter -KeyId $keyId -Name "$name" -Overwrite $true -Type "$type" -Value "$value"
                } 
                else {
                    Write-SSMParameter -Name "$name" -Overwrite $true -Type "$type" -Value "$value" 
                }

                Write-Host "[Write-SSMParameters] Parameter created/updated successfully (key: $name)" -ForegroundColor Green -BackgroundColor Black
            }
        } 
        catch [Exception]
        {
            echo $_.Exception.GetType().FullName, $_.Exception.Message
            # throw up some info if a problem occurred
            Write-Error "[Write-SSMParameters] Error when handling parameter (key: ${key.Name})"
        } 
    }
    Write-Host "[Write-SSMParameters] ended"
}

Write-Host "------------------------------------------------------------------------------"
Write-Host "Starting SSM Parameters Task:`n (product: $product; env: $env; region: $region; folder: $folder)"
Write-Host "------------------------------------------------------------------------------"

Set-DefaultAWSRegion -Region $region

if (![System.IO.Path]::IsPathRooted($folder)) {
	$folder = "$PSScriptRoot/$folder";
}

$decrypt = "$PSScriptRoot/Decrypt-AppConfig.ps1";
$decryptedPath = .$decrypt -folder $folder -env $env -region $region -profileName $profileName

Write-Host "[Write-SSMParameters] decrypted config file (decryptedPath: $decryptedPath)"

if (![System.IO.Path]::IsPathRooted($decryptedPath)) {
	$decryptedPath = "$PSScriptRoot/$decryptedPath";
}

Write-SSMParameters -product $product -env $env -region $region -filePath $decryptedPath