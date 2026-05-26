# Test script: fire a sample intake payload at the production webhook
# Usage: .\scripts\test-webhook.ps1
# Requires: n8n WF01 active and listening

$body = @{
  first_name            = "John"
  last_name             = "Doe"
  date_of_birth         = "1990-03-15"
  ssn_last4             = "4321"
  street                = "123 Main St"
  city                  = "Houston"
  state                 = "TX"
  zip                   = "77001"
  email                 = "johndoe@example.com"
  phone                 = "555-867-5309"
  plan_tier             = "standard"
  consent_given         = $true
  disclosure_acknowledged = $true
  croa_contract_signed  = $true
  credit_data_source    = "identityiq"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
      -Method POST `
      -Uri "https://cybertyai.app.n8n.cloud/webhook/credit-repair/intake" `
      -ContentType "application/json" `
      -Body $body
    Write-Host "SUCCESS:"
    $response | ConvertTo-Json
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "STATUS: $statusCode"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "BODY: $($reader.ReadToEnd())"
}
