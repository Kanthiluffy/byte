import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to CodeJudge</h1>
          <p className="hero-subtitle">
            Master coding skills through challenging problems and real-time feedback
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="cta-button primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="cta-button primary">
                  Get Started
                </Link>
                <Link to="/login" className="cta-button secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose CodeJudge?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Real-time Execution</h3>
              <p>Get instant feedback on your code with our fast execution engine supporting multiple programming languages.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Challenging Problems</h3>
              <p>Solve problems across different difficulty levels - from beginner-friendly to expert-level challenges.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Detailed Analytics</h3>
              <p>Track your progress with comprehensive statistics and performance insights.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Multiple Languages</h3>
              <p>Code in JavaScript, Python, C++, or Java - choose your preferred programming language.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <h2 className="section-title">Platform Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Problems Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Code Submissions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4</div>
              <div className="stat-label">Supported Languages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
