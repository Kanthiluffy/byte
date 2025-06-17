import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    problems: 150,
    users: 10000,
    submissions: 50000
  });

  // Animated counter effect
  useEffect(() => {
    const animateValue = (start, end, duration, callback) => {
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        callback(current);
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };
      tick();
    };

    // Animate stats
    animateValue(0, 150, 2000, (val) => setStats(prev => ({ ...prev, problems: val })));
    animateValue(0, 10000, 2500, (val) => setStats(prev => ({ ...prev, users: val })));
    animateValue(0, 50000, 3000, (val) => setStats(prev => ({ ...prev, submissions: val })));
  }, []);

  const features = [
    {
      icon: "🚀",
      title: "Lightning Fast Execution",
      description: "Get instant feedback with our optimized execution engine supporting JavaScript, Python, C++, and Java.",
      highlight: "< 5s execution time"
    },
    {
      icon: "🎯",
      title: "Curated Problem Set",
      description: "Practice with carefully selected problems ranging from Easy to Hard difficulty levels.",
      highlight: "150+ problems"
    },
    {
      icon: "📊",
      title: "Detailed Analytics",
      description: "Track your progress with comprehensive statistics and performance insights.",
      highlight: "Real-time tracking"
    },
    {
      icon: "🏆",
      title: "Smart Judging System",
      description: "Advanced test case validation with memory and time limit constraints.",
      highlight: "100% accurate"
    },
    {
      icon: "💡",
      title: "Code Editor",
      description: "Professional Monaco editor with syntax highlighting and auto-completion.",
      highlight: "VS Code experience"
    },
    {
      icon: "🌟",
      title: "Progress Tracking",
      description: "Monitor your coding journey with detailed submission history and success rates.",
      highlight: "Personal dashboard"
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">✨ Welcome to the future of coding practice</span>
            </div>
            <h1 className="hero-title">
              Master <span className="text-gradient">Coding Skills</span><br />
              Through Intelligent Practice
            </h1>
            <p className="hero-subtitle">
              Join thousands of developers improving their skills with our comprehensive 
              coding platform. Practice, learn, and excel with real-time feedback.
            </p>
            
            <div className="hero-actions">
              {isAuthenticated ? (
                <div className="authenticated-actions">
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    <span>📊</span>
                    Go to Dashboard
                  </Link>
                  <div className="welcome-back">
                    <span>Welcome back, <strong>{user?.name?.split(' ')[0]}</strong>! 👋</span>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-xl">
                    <span>🚀</span>
                    Start Coding Now
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-xl">
                    <span>🔑</span>
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Stats Section */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{stats.problems.toLocaleString()}+</div>
                <div className="stat-label">Coding Problems</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">{stats.users.toLocaleString()}+</div>
                <div className="stat-label">Active Developers</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">{stats.submissions.toLocaleString()}+</div>
                <div className="stat-label">Code Submissions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Developers Choose CodeJudge</h2>
            <p className="section-subtitle">
              Everything you need to accelerate your coding journey in one powerful platform
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-highlight">{feature.highlight}</div>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Level Up Your Coding Skills?</h2>
              <p className="cta-subtitle">
                Join our community and start solving problems today. It's free to get started!
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-xl">
                  <span>🎯</span>
                  Create Free Account
                </Link>
                <div className="cta-note">
                  <span>✅ No credit card required</span>
                  <span>✅ Access to 50+ free problems</span>
                </div>
              </div>
            </div>
          </div>        </section>
      )}
    </div>
  );
};

export default Home;
