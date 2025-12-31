$path = 'd:\AI\ecosystem-IP-ai\src\app\(dashboard)\projects\[id]\page.tsx'
Write-Host "Reading from: $path"

try {
    $lines = [System.IO.File]::ReadAllLines($path)
    $newLines = New-Object System.Collections.Generic.List[string]
    
    $inGarbageBlock = $false
    $garbageStart = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $lineNum = $i + 1
        
        # Detect start of garbage block (right after CharacterStudio TabsContent closes)
        # Look for empty lines followed by orphan div after character tab
        if ($line -match '^\s*</TabsContent>\s*$' -and $lineNum -gt 1390 -and $lineNum -lt 1400) {
            # Keep this line, but mark next lines as potential garbage
            $newLines.Add($line)
            
            # Check if next non-empty line is orphan div (not a TabsContent)
            $j = $i + 1
            while ($j -lt $lines.Count -and $lines[$j].Trim() -eq '') {
                $j++
            }
            
            if ($j -lt $lines.Count -and $lines[$j] -match '<div' -and $lines[$j] -notmatch 'TabsContent') {
                $inGarbageBlock = $true
                $garbageStart = $j
                Write-Host "Found garbage block starting at line $($j + 1)"
            }
            continue
        }
        
        # Detect end of garbage block (Story Tab comment)
        if ($inGarbageBlock -and $line -match 'STORY TAB') {
            $inGarbageBlock = $false
            Write-Host "Garbage block ends before line $lineNum (removed $($lineNum - $garbageStart - 1) lines)"
            # Add this line and continue normally
            # But first fix any spacing issues in the line
            $line = $line -replace '\{\s*/\*\s*', '{/* '
            $line = $line -replace '\s*\*/\s*\}', ' */}'
        }
        
        # Skip garbage lines
        if ($inGarbageBlock) {
            continue
        }
        
        # Fix common syntax issues
        $line = $line -replace '</div\s+>', '</div>'
        $line = $line -replace '</TabsContent\s+>', '</TabsContent>'
        $line = $line -replace '</Tabs\s+>', '</Tabs>'
        $line = $line -replace '</main\s+>', '</main>'
        $line = $line -replace '<\s+TabsContent', '<TabsContent'
        $line = $line -replace 'value\s+=\s+"', 'value="'
        $line = $line -replace 'className\s+=\s+"', 'className="'
        $line = $line -replace '"\s+>', '">'
        
        $newLines.Add($line)
    }
    
    [System.IO.File]::WriteAllLines($path, $newLines.ToArray())
    Write-Host "Fixed! Removed garbage and syntax errors. New line count: $($newLines.Count)"
} catch {
    Write-Host "Error: $_"
}
