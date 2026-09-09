$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$source = Get-Content -Raw -LiteralPath (Join-Path $projectRoot 'app/achievement-badges.ts')
$mapping = ($source.Substring($source.IndexOf('=') + 1).Trim().TrimEnd(';')) | ConvertFrom-Json
$checked = 0
foreach ($entry in $mapping.PSObject.Properties) {
    $file = Join-Path $projectRoot ('public' + $entry.Value)
    $bitmap = [System.Drawing.Bitmap]::FromFile($file)
    try {
        if (-not [System.Drawing.Image]::IsAlphaPixelFormat($bitmap.PixelFormat)) {
            throw "No alpha channel: $($entry.Name)"
        }
        foreach ($point in @(@(0, 0), @(($bitmap.Width-1), 0), @(0, ($bitmap.Height-1)), @(($bitmap.Width-1), ($bitmap.Height-1)))) {
            # Some PNG encoders retain alpha=1 in a corner (less than 0.4% opacity).
            if ($bitmap.GetPixel($point[0], $point[1]).A -gt 1) {
                throw "Opaque background corner: $($entry.Name)"
            }
        }
        if ($bitmap.GetPixel([int]($bitmap.Width/2), [int]($bitmap.Height/2)).A -lt 200) {
            throw "Badge center unexpectedly transparent: $($entry.Name)"
        }
        $checked++
    } finally {
        $bitmap.Dispose()
    }
}
Write-Output "PASS: $checked badges have alpha channels, transparent corners and visible centers."
