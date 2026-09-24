# purge_cf.ps1 — purge Cloudflare cache apos deploy
# Credenciais lidas do .env.local (nunca commitar valores aqui)
# Uso: .\scripts\purge_cf.ps1

$envFile = Join-Path $PSScriptRoot "..\..\..\whatsapp-ai-system\.env.local"
if (-not (Test-Path $envFile)) {
    Write-Error ".env.local nao encontrado em $envFile"
    exit 1
}

$CF_ZONE_ID = $null
$CF_API_TOKEN = $null

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^CF_ZONE_ID=(.+)$')  { $CF_ZONE_ID  = $Matches[1].Trim() }
    if ($_ -match '^CF_API_TOKEN=(.+)$') { $CF_API_TOKEN = $Matches[1].Trim() }
}

if (-not $CF_ZONE_ID -or -not $CF_API_TOKEN) {
    Write-Error "CF_ZONE_ID e/ou CF_API_TOKEN nao encontrados no .env.local"
    Write-Host "Adicionar ao .env.local:"
    Write-Host "CF_ZONE_ID=seu_zone_id"
    Write-Host "CF_API_TOKEN=seu_token_cache_purge_only"
    exit 1
}

$urls = @(
    "https://lp.eposmktfilmsia.com.br/epos-dashboard.html",
    "https://lp.eposmktfilmsia.com.br/fm-dashboard.html",
    "https://lp.eposmktfilmsia.com.br/guides/epos-dashboard.html",
    "https://lp.eposmktfilmsia.com.br/guides/fm-dashboard.html",
    "https://lp.eposmktfilmsia.com.br/login-epos.html",
    "https://lp.eposmktfilmsia.com.br/login-fm.html"
)

$jsonFile = [System.IO.Path]::GetTempFileName() + ".json"
[System.IO.File]::WriteAllText($jsonFile, (@{ files = $urls } | ConvertTo-Json), [System.Text.Encoding]::UTF8)

$bodyBytes = [System.IO.File]::ReadAllBytes($jsonFile)
$resp = Invoke-RestMethod `
    -Uri "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" `
    -Method Post `
    -ContentType "application/json; charset=utf-8" `
    -Headers @{ Authorization = "Bearer $CF_API_TOKEN" } `
    -Body $bodyBytes

Remove-Item $jsonFile -ErrorAction SilentlyContinue

if ($resp.success) {
    Write-Host "OK CF cache purgado: $($urls.Count) URLs"
} else {
    Write-Error "Falha no purge: $($resp.errors | ConvertTo-Json)"
    exit 1
}
