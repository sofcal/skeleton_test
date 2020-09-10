<#
.SYNOPSIS
Uploads scan files to specified ThreadFix site.
.DESCRIPTION
Uploads one or more scan files. Wrapper for ThreadFix API
https://denimgroup.atlassian.net/wiki/spaces/TDOC/pages/22908335/Upload+Scan+-+API
https://denimgroup.atlassian.net/wiki/spaces/TDOC/pages/22908435/Multiple+File+Scan+Upload+-+API
.PARAMETER ThreadFixUri
URI of threadfix server
.PARAMETER ApiKey
API Key with permissions to uplaod for specified application.
.PARAMETER ApplicationId
ApplicationId to attach scan file to
.PARAMETER ScanFile
Path to file(s) to upload to ThreadFix
.PARAMETER BulkUpload
Optional Parameter. When uploading multiple files this determines if the files are uploaded as separate scans or not.
Defaults to False.
True = Upload the files as separate scan files.
False = Upload the files as a single scan.
.EXAMPLE
Upload a single scan file
uploadThreadFixScan.ps1 -ThreadFixUri $URI -ApiKey $ApiKey -ApplicationId 12 -ScanFile 'C:\temp\dependency-check-report.xml'
.EXAMPLE
Upload multiple scan files
uploadThreadFixScan.ps1 -ThreadFixUri $URI -ApiKey $ApiKey -ApplicationId 12 -ScanFile 'C:\temp\dependency-check-report.xml','C:\temp\fortify-results.xml' -BulkUpload True
#>

param (
    [Parameter(Mandatory=$True)][string]$ThreadFixUri,
    [Parameter(Mandatory=$True)][string]$ApiKey,
    [Parameter(Mandatory=$True)][int]$ApplicationId,
    [Parameter(Mandatory=$True)]$ScanFile,
    [Parameter(Mandatory=$False)][bool]$BulkUpload = $False,
    [Parameter(Mandatory=$False)][string]$ApiVersion = "2.7.9"
)

Function Invoke-ThreadFixAPI {
    <#
    .SYNOPSIS
    Invoke the ThreadFix API
    .PARAMETER ThreadFixUri
    ThreadFix server Uri
    .PARAMETER Method
    REST Method to be applied to the specified resource
    .PARAMETER Resource
    API Resource to use
    .PARAMETER Parameters
    List of parameters to send with the API call
    .EXAMPLE
    Invoke-ThreadFixAPI -Uri https://internalserver.com/threadfix -Method Get -Resource /applications/$appId/scans
    #>

    [CmdletBinding(SupportsShouldProcess=$True)]
    param (
        [Parameter(Mandatory=$True)][string]$ServerUri,
        [Parameter(Mandatory=$True)]$Headers,
        [Parameter(Mandatory=$True)][ValidateSet("GET","PUT","POST","DELETE","PATCH")]$Method,
        [Parameter(Mandatory=$True)][string]$Resource,
        [Parameter(Mandatory=$False)][string]$Parameters,
        [Parameter(Mandatory=$False)]$Form

    )

    if ($PSCmdlet.ShouldProcess("Will perform $Method on $Resource for $ServerUri")) {
        #Verify if parameters have been provided
        if ($PSBoundParameters.ContainsKey('Parameters')) {
            #Sanitise parameters for spaces
            $Parameters = $Parameters.Replace(' ','+')
            $URI = $ServerUri + $Resource + $Parameters
        } else {
            $URI = $ServerUri + $Resource
        }
        if ($PSBoundParameters.ContainsKey('Form')) {
            try {
                Invoke-RestMethod -Headers $Headers -Method $Method -Form $Form -ContentType application/json -Uri $URI
            } catch {
                Throw $Error[0]
            }
        } else {
            try {
                Invoke-RestMethod -Headers $Headers -Method $Method -ContentType application/json -Uri $URI
            } catch {
                Throw $Error[0]
            }
        }
    }
}

Write-Host "Upload-ThreadFixScan: Started"

# Strip /rest from parameter Uri if provided, as this is bundled in with URI creation
if ($ThreadFixUri.EndsWith('/rest')) {
    $ThreadFixUri = $ThreadFixUri.TrimEnd('/rest')
}
if ($ThreadFixUri.EndsWith('/')) {
    $ThreadFixUri = $ThreadFixUri.TrimEnd('/')
}

$Headers = @{
    "Authorization" = "APIKEY " + $ApiKey
}

Write-Host "Upload-ThreadFixScan: Parsed URI: $ThreadFixUri, Count: $($ScanFile.Count)"
if ($ScanFile.Count -eq 1) {
    Write-Host "Upload-ThreadFixScan: Single file upload"
    $resource = "/rest/$ApiVersion/applications/$ApplicationId/upload"
    $form = @{
        file = Get-Item -Path $ScanFile
    }
} else {
    Write-Host "Upload-ThreadFixScan: Multi file upload"
    $resource = "/rest/$ApiVersion/applications/$ApplicationId/upload/multi"
    $form = @{
        bulkUpload = $BulkUpload
        file = Get-Item -Path $ScanFile
    }
}

Write-Host "Upload-ThreadFixScan: Invoking ThreadfixApi"
Invoke-ThreadFixAPI -ServerUri $ThreadFixUri -Headers $Headers -Method POST -Resource $resource -Form $form 
Write-Host "Upload-ThreadFixScan: Ended"