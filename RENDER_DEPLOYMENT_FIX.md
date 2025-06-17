# Render.com Deployment Fix for Java Support

## Problem Description

Error encountered on Render.com deployment:
```
Running build command 'apt-get update && apt-get install -y openjdk-11-jdk && npm install'...
Reading package lists...
E: List directory /var/lib/apt/lists/partial is missing. - Acquire (30: Read-only file system)
==> Build failed 😞
```

**Cause**: Render.com uses a read-only file system during builds, preventing direct package installation via `apt-get`.

## Solution Options

### Option 1: Use Dockerfile (Recommended)

Create a `Dockerfile` in your backend directory:

```dockerfile
# Use Node.js with Ubuntu base that includes build tools
FROM node:18

# Install required language tools
RUN apt-get update && apt-get install -y \
    openjdk-11-jdk \
    g++ \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy application code
COPY . .

# Create temp directory with proper permissions
RUN mkdir -p temp && chmod 755 temp

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### Option 2: Use Docker Hub Pre-built Image

Create a `Dockerfile` using a pre-built image:

```dockerfile
# Use custom image with all languages pre-installed
FROM coderunner/node-multi-lang:latest

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Ensure temp directory exists
RUN mkdir -p temp && chmod 755 temp

EXPOSE 5000
CMD ["npm", "start"]
```

### Option 3: Use Nixpacks Configuration

Create a `nixpacks.toml` file in your backend directory:

```toml
[phases.setup]
nixPkgs = ['nodejs', 'npm', 'openjdk11', 'gcc', 'python3']

[phases.build]
cmds = ['npm install']

[phases.start]
cmd = 'npm start'

[variables]
JAVA_HOME = '/nix/store/...-openjdk-11.../lib/openjdk'
```

### Option 4: Multi-Language Buildpack

Create a `.buildpacks` file in your backend directory:

```
https://github.com/heroku/heroku-buildpack-java
https://github.com/heroku/heroku-buildpack-python  
https://github.com/heroku/heroku-buildpack-nodejs
```

## Render.com Configuration

### Using Dockerfile (Recommended)

1. **Create the Dockerfile** in your backend directory (as shown above)

2. **Update Render Settings**:
   - **Build Command**: Leave empty (Docker handles this)
   - **Start Command**: Leave empty (Docker handles this)
   - **Dockerfile Path**: `backend/Dockerfile`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-connection-string
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

### Using Native Build (Alternative)

If you prefer not to use Docker, use Render's native environment:

1. **Build Command**:
   ```bash
   npm install
   ```

2. **Start Command**:
   ```bash
   node deployment-check.js && npm start
   ```

3. **Add Java Support via render.yaml**:
   ```yaml
   services:
     - type: web
       name: codejudge-backend
       env: docker
       dockerfilePath: ./backend/Dockerfile
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGODB_URI
           fromDatabase:
             name: mongodb
             property: connectionString
   ```

## Updated Backend Code for Render

### Disable Java Temporarily (Quick Fix)

If you need to deploy immediately without Java support, update the frontend to disable Java:

```javascript
// In your frontend problem submission component
const supportedLanguages = ['python', 'cpp']; // Remove 'java'
```

And add this check in your backend:

```javascript
// In submissions route
if (language === 'java') {
  return res.status(400).json({
    success: false,
    message: 'Java submissions are temporarily unavailable while we set up the deployment environment.'
  });
}
```

### Enhanced Error Handling

The existing language availability checker will now show:

```json
{
  "status": "System Error", 
  "error": "Java (JDK) is not installed on this server. Please contact the administrator.",
  "testCaseResults": []
}
```

## Complete Render Deployment Steps

### Step 1: Prepare Your Repository

```bash
# Create Dockerfile in backend directory
cd backend
# Copy the Dockerfile content from above

# Test locally first
docker build -t codejudge-backend .
docker run -p 5000:5000 --env-file .env codejudge-backend
```

### Step 2: Configure Render Service

1. **Connect Repository**: Link your GitHub repo to Render
2. **Service Type**: Web Service  
3. **Environment**: Docker
4. **Root Directory**: `backend` (if backend is in subdirectory)
5. **Dockerfile Path**: `./Dockerfile`

### Step 3: Set Environment Variables

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
FRONTEND_URL=https://your-frontend-app.onrender.com
PORT=5000
```

### Step 4: Deploy and Verify

```bash
# After deployment, test the health endpoint
curl https://your-backend-app.onrender.com/api/health

# Test language availability
curl -X POST https://your-backend-app.onrender.com/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "test",
    "language": "java", 
    "code": "public class Solution { public static void main(String[] args) { System.out.println(\"test\"); } }"
  }'
```

## Troubleshooting

### Build Still Fails?

1. **Check Dockerfile syntax**:
   ```bash
   docker build -t test-build .
   ```

2. **Use different base image**:
   ```dockerfile
   FROM ubuntu:20.04
   RUN apt-get update && apt-get install -y nodejs npm openjdk-11-jdk g++ python3
   ```

3. **Contact Render Support**: They can enable custom buildpacks

### Runtime Issues?

1. **Check deployment logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Test the health endpoint** first
4. **Run deployment check**:
   ```bash
   curl https://your-app.onrender.com/api/health
   ```

## Alternative: Separate Services

Consider splitting the services:

1. **Code Execution Service**: Dedicated container with all languages
2. **Main Backend**: Node.js API without compilation requirements
3. **Queue System**: Redis for handling code execution requests

This architecture is more scalable and avoids deployment complexity.

## Quick Deploy Template

Here's a complete working Dockerfile for immediate deployment:

```dockerfile
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openjdk-11-jdk \
    g++ \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set environment
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV NODE_ENV=production

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Setup temp directory
RUN mkdir -p temp && chmod 755 temp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-5000}/api/health || exit 1

EXPOSE 5000

CMD ["node", "server.js"]
```

This should resolve the Render deployment issues and get your CodeJudge platform running with full language support! 🚀
