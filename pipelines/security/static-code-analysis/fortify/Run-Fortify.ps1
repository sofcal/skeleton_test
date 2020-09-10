#Identify the working folder
# $workingFolder = Split-Path -parent $MyInvocation.MyCommand.Definition | Split-Path -parent | Split-Path -parent | Split-Path -parent | Split-Path -parent

$IN = $env:IN
$OUT = $env:OUT

Write-Output "Run-Fortify: Running Fortify scan in: $IN"

$BUILD_ID = "v1"

# -Dcom.fortify.sca.follow.imports=false
# This is needed after every exclusion as there is currenty an exclusion issue with Fortify version 18.20
$WORKAROUND = "-Dcom.fortify.sca.follow.imports=false"

#Exclusions - Files and Folders to ignore when scanning
$EX = " $EX -exclude `"**\*.Tests\**`" $WORKAROUND"
$EX = " $EX -exclude `"**\*Test*\**`" $WORKAROUND"

#Inclusions - Files/Folders to scan
$INCLUDE = "$INCLUDE $IN"

#Disable Python Scanning licence error
Add-Content -Path "C:\HPE_Fortify\HPE_Fortify_SCA_and_Apps\Core\config\fortify-sca.properties" -Value "\r\ncom.fortify.sca.DISabledLanguages=python"

#clean build ID
iex "C:\HPE_Fortify\HPE_Fortify_SCA_and_Apps\bin\sourceanalyzer.exe -b $BUILD_ID -clean"

Write-Host "Run-Fortify: SourceAnalyzer clean complete"

#Build projects and exclude unwanted files
iex "C:\HPE_Fortify\HPE_Fortify_SCA_and_Apps\bin\sourceanalyzer.exe -b $BUILD_ID $EX $INCLUDE"

Write-Host "Run-Fortify: SourceAnalyzer build complete"

#Scan build
iex "C:\HPE_Fortify\HPE_Fortify_SCA_and_Apps\bin\sourceanalyzer.exe -b $BUILD_ID -scan -f $OUT\fortify-report.fpr"

Write-Host "Run-Fortify: SourceAnalyzer scan complete"
Write-Host "Run-Fortify: Ended"