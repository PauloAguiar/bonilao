if ($deployUsername -eq $null)
{
        Write-Host 'Missing $deployUsername'
        exit
}

if ($deployPassword -eq $null)
{
        Write-Host 'Missing $deployPassword'
        exit
}

$filePath = "./testService.zip"
$apiUrl = "https://bonilao.scm.azurewebsites.net/api/zipdeploy"
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $deployUsername, $deployPassword)))
$userAgent = "powershell/1.0"

Invoke-RestMethod -Uri $apiUrl -Headers @{Authorization=("Basic {0}" -f $base64AuthInfo)} -UserAgent $userAgent -Method POST -InFile $filePath -ContentType "multipart/form-data"