# CodeJudge - Online Coding Platform

A full-stack MERN application for solving coding problems with multi-language support and real-time code execution.

## 🚀 Features

- **Multi-language Support**: Python, C++, Java
- **Real-time Code Execution**: 5-second timeout with proper error handling
- **User Authentication**: JWT + Google OAuth
- **Role-based Access**: Admin dashboard for problem management
- **Modern UI**: React with Vite, responsive design
- **Online Judge**: Automated test case validation

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Monaco Editor for code editing
- Axios for API calls

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Passport.js for Google OAuth
- Docker deployment ready

## 🏗️ Project Structure

```
byte/
├── frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
└── render.yaml       # Deployment configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Environment Variables

**Backend (.env):**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id (optional)
```

## 📝 Seeding Data

Run the seed script to add initial problems and admin user:

```bash
cd backend
node seed.js
```

**Default Admin User:**
- Email: admin@codejudge.com
- Password: admin123

**Default Test User:**
- Email: user@codejudge.com
- Password: user123

## 🐳 Deployment

### Render.com (Recommended)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure deployment:**
   - Environment: Docker
   - Dockerfile path: `./backend/Dockerfile`
   - Port: 5000
4. **Set environment variables in Render dashboard**
5. **Deploy**

### Manual Docker Build

```bash
cd backend
docker build -t codejudge .
docker run -p 5000:5000 --env-file .env codejudge
```

## 🧪 Testing

The platform includes comprehensive testing for:
- Code execution in all supported languages
- Authentication flows
- Problem management
- Submission validation

See `TESTING_GUIDE.md` for detailed testing instructions.

## 📋 Supported Languages

| Language | Compiler/Interpreter | Version |
|----------|---------------------|---------|
| Python   | python3             | 3.9+    |
| C++      | g++                 | 10.2+   |
| Java     | OpenJDK             | 17+     |

## 🔒 Security Features

- Input sanitization and validation
- Secure code execution in isolated processes
- Process timeout protection
- CORS configuration
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the `TESTING_GUIDE.md`
2. Review environment variable configuration
3. Ensure all dependencies are installed
4. Check deployment logs for specific errors

---


