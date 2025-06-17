# Test Docker builds for CodeJudge platform
Write-Host "Testing Docker builds for CodeJudge platform..." -ForegroundColor Green

function Test-Dockerfile {
    param(
        [string]$DockerfilePath,
        [string]$Tag
    )
    
    Write-Host "=========================================" -ForegroundColor Yellow
    Write-Host "Testing $DockerfilePath" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Yellow
    
    # Build the image
    $buildResult = docker build -f $DockerfilePath -t $Tag .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build successful for $DockerfilePath" -ForegroundColor Green
        
        # Test if the container starts and languages are available
        $testResult = docker run --rm $Tag sh -c "node --version && java -version && g++ --version && python3 --version"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ All languages verified for $DockerfilePath" -ForegroundColor Green
            Write-Host "✓ $DockerfilePath is working correctly" -ForegroundColor Green
        } else {
            Write-Host "✗ Language verification failed for $DockerfilePath" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Build failed for $DockerfilePath" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test the main Dockerfile
Test-Dockerfile -DockerfilePath "Dockerfile" -Tag "codejudge:main"

# Test the Ubuntu Dockerfile
Test-Dockerfile -DockerfilePath "Dockerfile.ubuntu" -Tag "codejudge:ubuntu"

# Test the Alpine Dockerfile if it exists
if (Test-Path "Dockerfile.alpine") {
    Test-Dockerfile -DockerfilePath "Dockerfile.alpine" -Tag "codejudge:alpine"
}

Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Docker build testing complete!" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
