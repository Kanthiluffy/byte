# CodeJudge Platform

A full-stack MERN application for a coding platform that allows users to solve coding problems and administrators to manage them.

## 🚀 Current Status: FULLY FUNCTIONAL ✅

- ✅ Backend API fully implemented and running
- ✅ Frontend React app with modern UI completed
- ✅ Database seeded with 10 test problems
- ✅ Authentication system (Email/Password + Google OAuth)
- ✅ Monaco Editor integration for code editing
- ✅ Real-time code execution with 4 languages
- ✅ Admin dashboard with full CRUD operations
- ✅ Toast notifications for better UX
- ✅ Fully responsive design
- ✅ Comprehensive testing guide included

## 🧪 Quick Test

**Login Credentials:**
- **Admin**: admin@codejudge.com / admin123
- **User**: user@codejudge.com / user123

**Test URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Features

### User Features
- 🔐 **User Authentication**: Email/password + Google OAuth with JWT
- 📝 **Problem Solving**: Browse and solve coding problems with Monaco Editor
- 💻 **Multi-language Support**: JavaScript, Python, C++, Java with syntax highlighting
- ⚡ **Real-time Execution**: Instant feedback with 5-second timeout and secure sandboxing
- 📊 **Test Case Validation**: Comprehensive testing with detailed results display
- 🏆 **Difficulty Levels**: Easy, Medium, Hard problems with color-coded badges
- 🔔 **Toast Notifications**: Real-time feedback for all user actions

### Admin Features
- 🛠️ **Problem Management**: Full CRUD operations for coding problems
- 📈 **Dashboard Analytics**: Platform statistics and submission monitoring
- 👥 **User Management**: Monitor user activity and submissions
- 🔍 **Submission Monitoring**: Track all code submissions with detailed results
- 🎯 **Test Case Management**: Create and manage problem test cases

## Tech Stack

### Frontend
- **React 19** with Vite for fast development
- **React Router v7** for client-side routing
- **Monaco Editor** for professional code editing
- **React Hot Toast** for notifications
- **Axios** for API communication
- **Modern CSS3** with responsive design

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for stateless authentication
- **Passport.js** for Google OAuth integration
- **bcryptjs** for secure password hashing
- **Child Process** for secure code execution
- **CORS** for cross-origin resource sharing

### Security & Performance
- **Input Sanitization** to prevent XSS attacks
- **SQL Injection Protection** with Mongoose
- **Secure Code Execution** with timeouts and sandboxing
- **JWT Token Validation** for protected routes
- **Environment Variables** for sensitive configuration

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth & validation
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Code execution service
│   ├── temp/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── assets/
│   └── public/
└── .github/
    └── copilot-instructions.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

5. Start the development server:
```bash
npm run dev
```

## Usage

### For Users
1. **Register/Login**: Create an account or sign in with Google
2. **Browse Problems**: View problems by difficulty level
3. **Solve Problems**: Write code in your preferred language
4. **Submit & Test**: Get instant feedback on your solution

### For Admins
1. **Access Admin Panel**: Available for users with admin role
2. **Create Problems**: Add new coding challenges
3. **Monitor Platform**: View statistics and user activity
4. **Manage Content**: Edit or deactivate problems

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID
- `POST /api/admin/problems` - Create problem (admin)
- `PUT /api/admin/problems/:id` - Update problem (admin)

### Submissions
- `POST /api/submissions` - Submit code
- `GET /api/submissions/:id` - Get submission result
- `GET /api/submissions/user/:userId` - Get user submissions

## Code Execution

The platform supports secure code execution for:
- **JavaScript**: Node.js runtime
- **Python**: Python 3 interpreter
- **C++**: GCC compiler
- **Java**: OpenJDK compiler and runtime

### Security Features
- 5-second execution timeout
- Input sanitization
- Process isolation
- Resource usage monitoring

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@codejudge.com or create an issue in the GitHub repository.

## Acknowledgments

- React and Node.js communities
- MongoDB for database solutions
- Google OAuth for authentication
- All contributors and testers
