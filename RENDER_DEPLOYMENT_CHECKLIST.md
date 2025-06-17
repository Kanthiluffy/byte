# 🚀 Render.com Deployment Checklist

## Pre-Deployment

### 1. Local Testing
- [ ] Backend runs locally (`npm run dev`)
- [ ] All languages work locally:
  ```bash
  cd backend
  node test-java-availability.js
  node test-cpp-platform.js
  node deployment-check.js
  ```

### 2. Docker Testing (Choose One)
- [ ] Test main Dockerfile: `./test-docker-builds.ps1` (Windows) or `./test-docker-builds.sh` (Linux/Mac)
- [ ] OR manually test: `docker build -t codejudge . && docker run --rm codejudge sh -c "java -version && g++ --version && python3 --version"`

### 3. Environment Setup
- [ ] MONGODB_URI configured (MongoDB Atlas connection string)
- [ ] FRONTEND_URL configured (your frontend domain)
- [ ] JWT_SECRET generated
- [ ] All required environment variables in .env.example

## Render.com Setup

### 1. Repository Connection
- [ ] GitHub repository connected to Render
- [ ] Auto-deploy enabled for main branch
- [ ] Build path set to root (/)

### 2. Service Configuration
- [ ] Service type: Web Service
- [ ] Environment: Docker
- [ ] Dockerfile path: `./backend/Dockerfile` (or `./backend/Dockerfile.ubuntu`)
- [ ] Port: 5000
- [ ] Health check path: `/api/health`

### 3. Environment Variables (Set in Render Dashboard)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-google-client-id (if using OAuth)
GOOGLE_CLIENT_SECRET=your-google-client-secret (if using OAuth)
```

### 4. Plan Selection
- [ ] Starter Plan (minimum for multi-language support)
- [ ] Free tier may have limitations for C++/Java compilation

## Post-Deployment Verification

### 1. Basic Health Check
- [ ] `https://your-app.onrender.com/api/health` returns 200
- [ ] Response includes all language versions

### 2. API Endpoints
- [ ] `GET /api/problems` returns problem list
- [ ] `POST /api/auth/register` accepts new users
- [ ] `GET /api/admin/stats` works for admin users

### 3. Code Execution Testing
- [ ] Submit Python solution
- [ ] Submit C++ solution  
- [ ] Submit Java solution
- [ ] All return proper compilation/execution results

### 4. Performance Testing
- [ ] Response times < 30 seconds for code execution
- [ ] No timeout errors on initial cold start
- [ ] Memory usage stays within limits

## Automated Verification

```bash
# Update RENDER_URL in the script first
cd backend
RENDER_URL=https://your-app.onrender.com node verify-render-deployment.js
```

## Common Issues & Solutions

### Build Failures
- **Java package error**: Use `Dockerfile.ubuntu` instead of main `Dockerfile`
- **Memory issues**: Upgrade to Starter plan
- **Timeout during build**: Optimize Dockerfile layers

### Runtime Issues
- **Cold start timeouts**: Use health checks and warming strategies
- **Code execution hangs**: Check timeout settings (5s limit)
- **Permission errors**: Verify temp directory permissions

### CORS Issues
- **Frontend can't connect**: Check FRONTEND_URL environment variable
- **Trailing slash issues**: Ensure no trailing slash in FRONTEND_URL

## Monitoring

### Render Dashboard
- [ ] Build logs show successful deployment
- [ ] Runtime logs show no recurring errors
- [ ] Health checks passing consistently
- [ ] Resource usage within limits

### External Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Monitor response times
- [ ] Set up error alerting

## Rollback Plan

### If Deployment Fails
1. Check build logs in Render dashboard
2. Revert to last working commit
3. Use alternative Dockerfile (`Dockerfile.ubuntu`)
4. Deploy from a stable branch

### If Runtime Issues
1. Check runtime logs
2. Verify environment variables
3. Test individual endpoints
4. Scale down/up the service

## Success Criteria ✅

- [ ] All health checks pass
- [ ] All language compilers work
- [ ] Code execution completes within timeouts
- [ ] CORS configured correctly
- [ ] Database connections stable
- [ ] No memory leaks or crashes
- [ ] Response times acceptable

## Next Steps After Successful Deployment

1. Deploy frontend to Vercel/Netlify
2. Update frontend API base URL
3. Test end-to-end user flows
4. Set up monitoring and alerts
5. Configure custom domain (optional)
6. Set up SSL certificate (auto with Render)

---

**Last Updated**: After Java package fix - Use `openjdk-17-jdk` or `Dockerfile.ubuntu`
