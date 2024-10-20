# Default directory path - CHANGE THIS TO YOUR PROJECT PATH
$defaultDirectory = "C:\Users\atiq\Desktop\Boss\1-ruf work\commentcodetemplate\src\auth"

# Parameters
param(
    [Parameter(Mandatory=$false)]
    [string]$targetDirectory = $defaultDirectory,
    
    [Parameter(Mandatory=$false)]
    [string[]]$fileExtensions = @('.cs', '.js', '.py', '.java', '.cpp', '.ts'),
    
    [Parameter(Mandatory=$false)]
    [switch]$uncomment = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$specificFile = ""
)

# Comment markers for different file types
$commentMarkers = @{
    '.cs'   = @('// ', '/*', '*/')
    '.js'   = @('// ', '/*', '*/')
    '.ts'   = @('// ', '/*', '*/')
    '.py'   = @('# ', '"""', '"""')
    '.java' = @('// ', '/*', '*/')
    '.cpp'  = @('// ', '/*', '*/')
}

# Function to comment out code in a file
function CommentOutCode {
    param($filePath)
    
    $extension = [System.IO.Path]::GetExtension($filePath)
    if (-not $commentMarkers.ContainsKey($extension)) {
        Write-Warning "Unsupported file type: $filePath"
        return
    }
    
    $content = Get-Content $filePath -Raw
    $markers = $commentMarkers[$extension]
    
    # If content is not already commented
    if (-not $content.TrimStart().StartsWith($markers[1])) {
        $commentedContent = "$($markers[1])`n$content`n$($markers[2])"
        Set-Content -Path $filePath -Value $commentedContent
        Write-Host "Commented out: $filePath"
    } else {
        Write-Host "File is already commented: $filePath"
    }
}

# Function to uncomment code in a file
function UncommentCode {
    param($filePath)
    
    $extension = [System.IO.Path]::GetExtension($filePath)
    if (-not $commentMarkers.ContainsKey($extension)) {
        Write-Warning "Unsupported file type: $filePath"
        return
    }
    
    $content = Get-Content $filePath -Raw
    $markers = $commentMarkers[$extension]
    
    # If content starts with block comment
    if ($content.TrimStart().StartsWith($markers[1])) {
        # Remove first occurrence of start marker and last occurrence of end marker
        $content = $content.TrimStart()
        $content = $content.Substring($markers[1].Length)
        $content = $content.TrimEnd()
        $content = $content.Substring(0, $content.Length - $markers[2].Length)
        Set-Content -Path $filePath -Value $content
        Write-Host "Uncommented: $filePath"
    } else {
        Write-Host "File is not commented: $filePath"
    }
}

# Verify directory exists
if (-not (Test-Path $targetDirectory)) {
    Write-Error "Directory not found: $targetDirectory"
    exit 1
}

# Function to process specific file
function ProcessSpecificFile {
    param($fileName)
    
    # Search for the file recursively in the target directory
    $files = Get-ChildItem -Path $targetDirectory -Recurse -File | 
             Where-Object { $_.Name -eq $fileName }
    
    if ($files.Count -eq 0) {
        Write-Host "File '$fileName' not found in directory or subdirectories."
        return
    }
    
    if ($files.Count -gt 1) {
        Write-Host "Multiple files found with name '$fileName'. Processing all instances:"
    }
    
    foreach ($file in $files) {
        if ($uncomment) {
            UncommentCode $file.FullName
        } else {
            CommentOutCode $file.FullName
        }
    }
}

# Main execution logic
Write-Host "Working directory: $targetDirectory"

if ($specificFile -ne "") {
    # Process specific file
    Write-Host "Processing specific file: $specificFile"
    ProcessSpecificFile $specificFile
} else {
    # Process all files
    $files = Get-ChildItem -Path $targetDirectory -Recurse -File | 
             Where-Object { $fileExtensions -contains $_.Extension }
    
    $totalFiles = $files.Count
    Write-Host "Found $totalFiles files to process..."
    
    foreach ($file in $files) {
        if ($uncomment) {
            UncommentCode $file.FullName
        } else {
            CommentOutCode $file.FullName
        }
    }
    
    Write-Host "`nProcess completed. Processed $totalFiles files."
}