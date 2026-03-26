$file = 'public/index.html'
$content = Get-Content $file -Raw

# Fix remaining status badge text
$content = $content -replace 'System Online \? Uplink Established', 'Live'
$content = $content -replace 'System Online.*Uplink Established', 'Live'

# Remove canvas-backdrop script (heavy animated canvas)
$content = $content -replace '<script type="module" src="/js/core/canvas-backdrop\.js"></script>', ''

# Remove canvas-backdrop HTML element if present
$content = $content -replace '<canvas[^>]*id="canvas-backdrop"[^>]*></canvas>', ''
$content = $content -replace '<div[^>]*canvas-backdrop[^>]*></div>', ''

# Fix remaining UPLINK references
$content = $content -replace 'UPLINK', 'Status'

Set-Content $file $content -NoNewline
Write-Host 'Canvas and remaining jargon cleaned'
