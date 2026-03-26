$file = 'public/index.html'
$content = Get-Content $file -Raw

$bad = @"
  <div class="loader-ring"></div>
  <div class="absolute inset-0 flex items-center justify-center">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  </div>
  </div>
  <div class="loader-text">Loading NewsAtlas...</div>
  </div>
"@

$good = @"
  <div id="page-loader">
    <div class="loader-logo">
      <div class="loader-ring"></div>
      <div class="absolute inset-0 flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      </div>
    </div>
    <div class="loader-text">Loading NewsAtlas...</div>
  </div>
"@

$content = $content.Replace($bad, $good)
$content = $content -replace "\r\n", "`n"
Set-Content $file $content -NoNewline
Write-Host "Done"
