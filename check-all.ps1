$ErrorActionPreference = "SilentlyContinue"

$checks = @(
    @{ Name = "OPM Backend";        Port = 3000; Url = $null },
    @{ Name = "OPM Frontend";       Port = 4200; Url = "http://localhost:4200" },
    @{ Name = "PTE Backend";        Port = 3001; Url = $null },
    @{ Name = "PTE Frontend";       Port = 4201; Url = "http://localhost:4201" },
    @{ Name = "PMA Backend";        Port = 3002; Url = $null },
    @{ Name = "PMA Frontend";       Port = 4202; Url = "http://localhost:4202" },
    @{ Name = "Reporting API";      Port = 8000; Url = "http://localhost:8000/health" },
    @{ Name = "Reporting Frontend"; Port = 4203; Url = "http://localhost:4203" },
    @{ Name = "MongoDB";            Port = 27017; Url = $null },
    @{ Name = "PostgreSQL";         Port = 5432; Url = $null }
)

function Test-Port([int]$Port) {
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $task = $client.ConnectAsync("127.0.0.1", $Port)
        return $task.Wait(2000) -and $client.Connected
    } catch {
        return $false
    } finally {
        $client.Dispose()
    }
}

$failed = 0
Write-Host ""
Write-Host "PFE platform health check" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

foreach ($check in $checks) {
    $ok = $false
    if ($check.Url) {
        try {
            $response = Invoke-WebRequest -Uri $check.Url -UseBasicParsing -TimeoutSec 10
            $ok = $response.StatusCode -eq 200
            if ($check.Name -eq "Reporting API") {
                $health = $response.Content | ConvertFrom-Json
                $ok = $ok -and $health.status -eq "ok"
            }
        } catch {
            $ok = $false
        }
    } else {
        $ok = Test-Port $check.Port
    }

    if ($ok) {
        Write-Host ("[OK]   {0,-22} port {1}" -f $check.Name, $check.Port) -ForegroundColor Green
    } else {
        Write-Host ("[FAIL] {0,-22} port {1}" -f $check.Name, $check.Port) -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
if ($failed -eq 0) {
    Write-Host "All services are ready for the demo." -ForegroundColor Green
    exit 0
}

Write-Host "$failed service(s) need attention. Check .local-data\logs." -ForegroundColor Yellow
exit 1
