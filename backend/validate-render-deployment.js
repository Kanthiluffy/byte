const fs = require('fs');
const path = require('path');

function validateDockerfile() {
  console.log('🐳 Validating Dockerfile for Render deployment...\n');
  
  const dockerfilePath = path.join(__dirname, 'Dockerfile');
  
  if (!fs.existsSync(dockerfilePath)) {
    console.log('❌ Dockerfile not found!');
    return false;
  }
  
  const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
  const lines = dockerfileContent.split('\n');
  
  const checks = [
    {
      name: 'Base Image',
      check: content => content.includes('FROM node:'),
      message: 'Should use Node.js base image'
    },
    {
      name: 'Java Installation',
      check: content => content.includes('openjdk-11-jdk'),
      message: 'Should install OpenJDK 11'
    },
    {
      name: 'C++ Installation', 
      check: content => content.includes('g++'),
      message: 'Should install G++ compiler'
    },
    {
      name: 'Python Installation',
      check: content => content.includes('python3'),
      message: 'Should install Python 3'
    },
    {
      name: 'Java Environment',
      check: content => content.includes('JAVA_HOME'),
      message: 'Should set JAVA_HOME environment variable'
    },
    {
      name: 'Working Directory',
      check: content => content.includes('WORKDIR /app'),
      message: 'Should set working directory'
    },
    {
      name: 'Package Installation',
      check: content => content.includes('npm ci'),
      message: 'Should install npm packages'
    },
    {
      name: 'Temp Directory',
      check: content => content.includes('mkdir -p temp'),
      message: 'Should create temp directory'
    },
    {
      name: 'Port Exposure',
      check: content => content.includes('EXPOSE 5000'),
      message: 'Should expose port 5000'
    },
    {
      name: 'Start Command',
      check: content => content.includes('CMD') && content.includes('server.js'),
      message: 'Should have start command for server.js'
    },
    {
      name: 'Health Check',
      check: content => content.includes('HEALTHCHECK'),
      message: 'Should include health check'
    }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  checks.forEach(check => {
    const result = check.check(dockerfileContent);
    const status = result ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.message}`);
    if (result) passed++;
  });
  
  console.log(`\n📊 Validation Result: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('🎉 Dockerfile is ready for Render deployment!');
    
    console.log('\n📋 Next Steps for Render Deployment:');
    console.log('1. Push your code to GitHub');
    console.log('2. Connect your repo to Render');
    console.log('3. Create new Web Service');
    console.log('4. Set Environment to "Docker"');
    console.log('5. Set Dockerfile path to "backend/Dockerfile"');
    console.log('6. Configure environment variables:');
    console.log('   - NODE_ENV=production');
    console.log('   - MONGODB_URI=your-connection-string');
    console.log('   - FRONTEND_URL=your-frontend-url');
    console.log('7. Deploy!');
    
    console.log('\n🔍 After deployment, test with:');
    console.log('curl https://your-app.onrender.com/api/health');
    
    return true;
  } else {
    console.log('⚠️ Dockerfile needs fixes before deployment');
    return false;
  }
}

// Also validate render.yaml if it exists
function validateRenderConfig() {
  const renderConfigPath = path.join(__dirname, '..', 'render.yaml');
  
  if (fs.existsSync(renderConfigPath)) {
    console.log('\n📄 render.yaml configuration found');
    console.log('✅ Infrastructure as Code setup available');
    console.log('💡 You can deploy using render.yaml or manual configuration');
  } else {
    console.log('\n💡 Optional: render.yaml not found (manual configuration will be used)');
  }
}

// Validate package.json scripts
function validatePackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    console.log('\n📦 Package.json validation:');
    
    if (packageJson.scripts && packageJson.scripts.start) {
      console.log('✅ Start script defined:', packageJson.scripts.start);
    } else {
      console.log('❌ Start script missing! Add: "start": "node server.js"');
    }
    
    if (packageJson.main) {
      console.log('✅ Main entry point:', packageJson.main);
    } else {
      console.log('⚠️ Main entry point not specified');
    }
    
    // Check for important dependencies
    const deps = packageJson.dependencies || {};
    const requiredDeps = ['express', 'mongoose', 'cors'];
    
    requiredDeps.forEach(dep => {
      if (deps[dep]) {
        console.log(`✅ ${dep}: ${deps[dep]}`);
      } else {
        console.log(`❌ Missing dependency: ${dep}`);
      }
    });
  }
}

// Run all validations
console.log('🚀 Render Deployment Preparation Check\n');
console.log('=====================================\n');

const dockerfileValid = validateDockerfile();
validateRenderConfig();
validatePackageJson();

console.log('\n=====================================');

if (dockerfileValid) {
  console.log('🎯 Ready for Render deployment!');
  console.log('📚 See RENDER_DEPLOYMENT_FIX.md for detailed instructions');
} else {
  console.log('🔧 Please fix the issues above before deploying');
}
