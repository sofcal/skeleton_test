$drive = "Z:"
$acctKey = "$env:FORTIFY_COPY_KEY"
$directory = "$env:INSTALLER_DIRECTORY"

$source = "$drive\Tools\Fortify_SCA\18.20"
$destination = "$directory\Fortify_SCA\18.20"

Write-Host "Get-Fortify: Copying Fortify from $source to $destination"

[string]$user = 'sageazuredevtestlabs\sageazuredevtestlabs'
cmdkey /add:sageazuredevtestlabs.file.core.windows.net /user:$user /pass:$acctKey
net use $drive \\sageazuredevtestlabs.file.core.windows.net\sagesecurity\shareddrive
Copy-Item $source -Destination $destination -Recurse
net use $drive /delete

Write-Host "Get-Fortify: Copy complete"