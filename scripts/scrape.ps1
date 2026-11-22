# Collect events with Claude Code in headless mode (project skill: collect-events),
# then validate the result. Usage:  pwsh scripts/scrape.ps1
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

$backup = "data/events.backup.json"
Copy-Item data/events.json $backup -Force

claude -p "/collect-events" --allowedTools "Skill,WebSearch,WebFetch,Read,Write(data/events.json),Bash(npm run validate*)"
if ($LASTEXITCODE -ne 0) { throw "claude -p failed ($LASTEXITCODE)" }

npm run validate
if ($LASTEXITCODE -ne 0) {
  Copy-Item $backup data/events.json -Force
  throw "data/events.json failed validation; restored the previous version from $backup"
}
Write-Host "Done. Review with: git diff data/events.json"
