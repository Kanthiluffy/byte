#!/bin/bash

echo "🐍 CodeJudge Python Deployment Verification"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "backend/Dockerfile" ]; then
    echo "❌ Please run this from the root project directory"
    echo "   Expected: /path/to/byte"
    echo "   Current: $(pwd)"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "✅ Found backend/Dockerfile"

# Check Dockerfile content
echo ""
echo "🔍 Checking Dockerfile for Python..."
if grep -q "python3" backend/Dockerfile; then
    echo "✅ Python3 found in Dockerfile"
    grep -n "python3" backend/Dockerfile
else
    echo "❌ Python3 NOT found in Dockerfile"
    echo "   This is likely the issue!"
fi

# Check if Ubuntu alternative exists
if [ -f "backend/Dockerfile.ubuntu" ]; then
    echo "✅ Ubuntu Dockerfile alternative available"
else
    echo "⚠️  Ubuntu Dockerfile alternative not found"
fi

# Check render.yaml
echo ""
echo "🔍 Checking render.yaml..."
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml found"
    echo "   Dockerfile path: $(grep dockerfilePath render.yaml || echo 'Not specified')"
else
    echo "⚠️  render.yaml not found"
fi

# Check git status
echo ""
echo "🔍 Checking git status..."
if command -v git &> /dev/null; then
    if git status --porcelain | grep -q "backend/Dockerfile"; then
        echo "⚠️  backend/Dockerfile has uncommitted changes"
        echo "   Run: git add . && git commit -m 'Fix Python in Dockerfile' && git push"
    else
        echo "✅ Dockerfile changes are committed"
    fi
    
    echo "   Latest commit: $(git log -1 --oneline)"
else
    echo "⚠️  Git not available"
fi

# Test local Docker build (if Docker is available)
echo ""
echo "🔍 Testing local Docker build..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    echo "   You can test with: docker build -f backend/Dockerfile -t test-build ."
    echo "   Then verify Python: docker run --rm test-build python3 --version"
else
    echo "⚠️  Docker not available for local testing"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Ensure all changes are pushed to GitHub"
echo "2. Go to Render dashboard and manually deploy"
echo "3. Check build logs for Python installation"
echo "4. Test: https://your-app.onrender.com/api/test/languages"
echo "5. Submit Python code in frontend"

echo ""
echo "🚀 If Python is still missing, try:"
echo "   - Use Dockerfile.ubuntu instead of Dockerfile"
echo "   - Clear Render build cache by changing something in Dockerfile"
echo "   - Contact Render support with build logs"
