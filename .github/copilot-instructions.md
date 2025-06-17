# Copilot Instructions for CodeJudge Platform

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack MERN application for a coding platform called "CodeJudge" that allows users to solve coding problems and administrators to manage them.

## Tech Stack
- **Frontend:** React with Vite, React Router, Monaco Editor for code editing
- **Backend:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + Google OAuth using Passport.js
- **Deployment:** Frontend on Vercel, Backend on Render

## Project Structure
- `frontend/` - React application with Vite
- `backend/` - Express.js API server

## Key Features
1. **User Authentication:** Email/password + Google OAuth with role-based access (admin/user)
2. **Problem Management:** Admins can create/edit coding problems with test cases
3. **Code Execution:** Support for JavaScript, Python, C++, Java with 5-second timeout
4. **Online Judge:** Real-time compilation feedback and test case validation

## Coding Guidelines
- Use modern ES6+ JavaScript syntax
- Implement proper error handling and validation
- Follow RESTful API design principles
- Use environment variables for sensitive configuration
- Implement proper security measures (input sanitization, CORS, etc.)
- Write clean, readable, and well-documented code

## Frontend Specific
- Use functional components with React hooks
- Implement React Router for navigation
- Use Monaco Editor for code editing
- Make API calls with axios
- Handle authentication state with React Context

## Backend Specific
- Use Express.js middleware for authentication and validation
- Implement mongoose schemas with proper validation
- Use bcryptjs for password hashing
- Implement JWT for session management
- Use child_process for secure code execution
- Follow MVC architecture pattern
