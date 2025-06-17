#!/bin/bash

echo "Testing Docker builds for CodeJudge platform..."

# Function to test a dockerfile
test_dockerfile() {
    local dockerfile=$1
    local tag=$2
    
    echo "========================================="
    echo "Testing $dockerfile"
    echo "========================================="
    
    # Build the image
    if docker build -f $dockerfile -t $tag .; then
        echo "✓ Build successful for $dockerfile"
        
        # Test if the container starts and languages are available
        if docker run --rm $tag sh -c "node --version && java -version && g++ --version && python3 --version"; then
            echo "✓ All languages verified for $dockerfile"
            echo "✓ $dockerfile is working correctly"
        else
            echo "✗ Language verification failed for $dockerfile"
        fi
    else
        echo "✗ Build failed for $dockerfile"
    fi
    
    echo ""
}

# Test the main Dockerfile
test_dockerfile "Dockerfile" "codejudge:main"

# Test the Ubuntu Dockerfile
test_dockerfile "Dockerfile.ubuntu" "codejudge:ubuntu"

# Test the Alpine Dockerfile if it exists
if [ -f "Dockerfile.alpine" ]; then
    test_dockerfile "Dockerfile.alpine" "codejudge:alpine"
fi

echo "========================================="
echo "Docker build testing complete!"
echo "========================================="
