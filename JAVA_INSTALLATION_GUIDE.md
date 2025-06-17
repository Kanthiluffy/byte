# Java Installation Guide for Production Deployment

## Problem Description

Error encountered when submitting Java code in production:
```
/bin/sh: 1: javac: not found
```

This indicates that the Java Development Kit (JDK) is not installed on the production server.

## Solution

### 1. Install OpenJDK on Linux Server

For **Ubuntu/Debian** systems:
```bash
# Update package list
sudo apt update

# Install OpenJDK 11 (recommended)
sudo apt install openjdk-11-jdk

# Verify installation
javac -version
java -version
```

For **CentOS/RHEL/Rocky Linux** systems:
```bash
# Install OpenJDK 11
sudo yum install java-11-openjdk-devel

# Or for newer versions
sudo dnf install java-11-openjdk-devel

# Verify installation
javac -version
java -version
```

For **Alpine Linux** (Docker):
```bash
# Install OpenJDK
apk add openjdk11-jdk

# Verify installation
javac -version
java -version
```

### 2. Docker Deployment

If using Docker, update your Dockerfile:

```dockerfile
# Use a base image with Java support
FROM node:18-alpine

# Install OpenJDK
RUN apk add --no-cache openjdk11-jdk g++ python3

# Set JAVA_HOME (optional but recommended)
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk

# Copy your application
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

### 3. Alternative: Multi-stage Docker Build

```dockerfile
# Stage 1: Base with all language support
FROM node:18-alpine as base

# Install all required language tools
RUN apk add --no-cache \
    openjdk11-jdk \
    g++ \
    python3 \
    py3-pip

# Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk
ENV PATH="$JAVA_HOME/bin:$PATH"

# Stage 2: Application
FROM base as app

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

### 4. Render.com Deployment

For Render.com, add a build command to install Java:

In your `render.yaml` or build settings:
```yaml
services:
  - type: web
    name: codejudge-backend
    env: node
    buildCommand: |
      apt-get update && 
      apt-get install -y openjdk-11-jdk && 
      npm install
    startCommand: npm start
```

Or use a custom Dockerfile approach on Render.

### 5. Heroku Deployment

For Heroku, use buildpacks:

```bash
# Add Java buildpack
heroku buildpacks:add heroku/java

# Add Node.js buildpack
heroku buildpacks:add heroku/nodejs

# Deploy
git push heroku main
```

Or create a `.buildpacks` file:
```
https://github.com/heroku/heroku-buildpack-java
https://github.com/heroku/heroku-buildpack-nodejs
```

## Code Enhancement

The backend now includes automatic language availability checking:

### Enhanced Error Handling

```javascript
// In codeExecutor.js
async checkLanguageAvailability(language) {
  const checkCommands = {
    python: 'python --version',
    cpp: 'g++ --version', 
    java: 'javac -version'
  };
  
  const command = checkCommands[language];
  if (!command) return true;
  
  try {
    await this.runCommand(command, this.tempDir, 5000);
    return true;
  } catch (error) {
    return false;
  }
}
```

### Better Error Messages

Instead of cryptic errors, users now see:
```json
{
  "status": "System Error",
  "error": "Java (JDK) is not installed on this server. Please contact the administrator.",
  "testCaseResults": []
}
```

## Testing Java Installation

Use the provided test script to verify Java works:

```javascript
// test-java-availability.js
const codeExecutor = require('./src/services/codeExecutor');

const javaCode = `
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
        sc.close();
    }
}`;

async function testJava() {
  console.log('Testing Java availability...');
  
  const testCases = [
    { input: "5 3", expectedOutput: "8" },
    { input: "10 20", expectedOutput: "30" }
  ];
  
  try {
    const result = await codeExecutor.executeCode(javaCode, 'java', testCases);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.status === 'Accepted') {
      console.log('✅ Java is working correctly!');
    } else if (result.status === 'System Error') {
      console.log('❌ Java is not installed:', result.error);
    } else {
      console.log('⚠️ Java installed but code failed:', result.status);
    }
  } catch (error) {
    console.error('❌ Error testing Java:', error.message);
  }
}

testJava();
```

## Verification Commands

After installation, verify with these commands:

```bash
# Check Java compiler
javac -version
# Expected: javac 11.x.x

# Check Java runtime  
java -version
# Expected: openjdk version "11.x.x"

# Check environment variable (optional)
echo $JAVA_HOME
# Expected: /usr/lib/jvm/java-11-openjdk or similar
```

## Recommended JDK Versions

- **OpenJDK 11**: Long-term support, widely compatible
- **OpenJDK 17**: Newer LTS version, good performance
- **OpenJDK 8**: Older but stable, if needed

Avoid Oracle JDK in production due to licensing requirements.

## Troubleshooting

### Issue: `java: command not found` (during execution)
**Solution**: Install JRE along with JDK:
```bash
sudo apt install openjdk-11-jre openjdk-11-jdk
```

### Issue: Permission denied
**Solution**: Ensure proper file permissions in temp directory:
```bash
chmod 755 /path/to/temp/directory
```

### Issue: ClassNotFoundException
**Solution**: Verify class name matches filename (Solution.java → Solution.class)

## Production Checklist

- [ ] Java JDK installed (`javac` available)
- [ ] Java JRE installed (`java` available) 
- [ ] Temp directory writable
- [ ] Test script passes
- [ ] Error handling working
- [ ] Cleanup functioning

## Alternative: Disable Java Support

If Java installation is not possible, you can temporarily disable Java support:

```javascript
// In frontend problem submission form
const supportedLanguages = ['python', 'cpp']; // Remove 'java'

// In backend validation
if (language === 'java') {
  return res.status(400).json({
    message: 'Java submissions are temporarily unavailable'
  });
}
```

The enhanced error handling will now provide clear feedback when Java is not available, making it easier to diagnose and fix the issue! 🚀
