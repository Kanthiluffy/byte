# 🐍 CodeJudge Python Deployment Verification
Write-Host "🐍 CodeJudge Python Deployment Verification" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend\Dockerfile")) {
    Write-Host "❌ Please run this from the root project directory" -ForegroundColor Red
    Write-Host "   Expected: \path\to\byte" -ForegroundColor Yellow
    Write-Host "   Current: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "✅ Found backend\Dockerfile" -ForegroundColor Green

# Check Dockerfile content
Write-Host ""
Write-Host "🔍 Checking Dockerfile for Python..." -ForegroundColor Yellow
$dockerfileContent = Get-Content "backend\Dockerfile" -Raw
if ($dockerfileContent -match "python3") {
    Write-Host "✅ Python3 found in Dockerfile" -ForegroundColor Green
    $lines = Get-Content "backend\Dockerfile"
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match "python3") {
            Write-Host "   Line $($i+1): $($lines[$i])" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ Python3 NOT found in Dockerfile" -ForegroundColor Red
    Write-Host "   This is likely the issue!" -ForegroundColor Yellow
}

# Check if Ubuntu alternative exists
if (Test-Path "backend\Dockerfile.ubuntu") {
    Write-Host "✅ Ubuntu Dockerfile alternative available" -ForegroundColor Green
} else {
    Write-Host "⚠️  Ubuntu Dockerfile alternative not found" -ForegroundColor Yellow
}

# Check render.yaml
Write-Host ""
Write-Host "🔍 Checking render.yaml..." -ForegroundColor Yellow
if (Test-Path "render.yaml") {
    Write-Host "✅ render.yaml found" -ForegroundColor Green
    $renderContent = Get-Content "render.yaml" -Raw
    if ($renderContent -match "dockerfilePath: (.+)") {
        Write-Host "   Dockerfile path: $($matches[1])" -ForegroundColor Cyan
    } else {
        Write-Host "   Dockerfile path: Not specified" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  render.yaml not found" -ForegroundColor Yellow
}

# Check git status
Write-Host ""
Write-Host "🔍 Checking git status..." -ForegroundColor Yellow
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitStatus = git status --porcelain
    $dockerfileChanged = $gitStatus | Where-Object { $_ -match "backend/Dockerfile" }
    
    if ($dockerfileChanged) {
        Write-Host "⚠️  backend/Dockerfile has uncommitted changes" -ForegroundColor Yellow
        Write-Host "   Run: git add . && git commit -m 'Fix Python in Dockerfile' && git push" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Dockerfile changes are committed" -ForegroundColor Green
    }
    
    $latestCommit = git log -1 --oneline
    Write-Host "   Latest commit: $latestCommit" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Git not available" -ForegroundColor Yellow
}

# Test local Docker build (if Docker is available)
Write-Host ""
Write-Host "🔍 Testing local Docker build..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker is available" -ForegroundColor Green
    Write-Host "   You can test with: docker build -f backend/Dockerfile -t test-build ." -ForegroundColor Cyan
    Write-Host "   Then verify Python: docker run --rm test-build python3 --version" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Docker not available for local testing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "1. Ensure all changes are pushed to GitHub" -ForegroundColor White
Write-Host "2. Go to Render dashboard and manually deploy" -ForegroundColor White
Write-Host "3. Check build logs for Python installation" -ForegroundColor White
Write-Host "4. Test: https://your-app.onrender.com/api/test/languages" -ForegroundColor White
Write-Host "5. Submit Python code in frontend" -ForegroundColor White

Write-Host ""
Write-Host "🚀 If Python is still missing, try:" -ForegroundColor Green
Write-Host "   - Use Dockerfile.ubuntu instead of Dockerfile" -ForegroundColor Yellow
Write-Host "   - Clear Render build cache by changing something in Dockerfile" -ForegroundColor Yellow
Write-Host "   - Contact Render support with build logs" -ForegroundColor Yellow
