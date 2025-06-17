import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    search: ''
  });
  const [searchInput, setSearchInput] = useState(''); // Input value state
  const searchTimeoutRef = useRef(null);
  
  const { user } = useAuth();

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ 
        ...prev, 
        search: searchInput.trim() 
      }));
    }, 500); // Increased debounce to 500ms

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  // Fetch problems when filters change
  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        difficulty: filters.difficulty || undefined,
        search: filters.search || undefined,
        limit: 20
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('Fetching problems with params:', params); // Debug log

      const response = await problemsAPI.getAll(params);
      setProblems(response.data.problems || []);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to fetch problems');
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const handleDifficultyChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, difficulty: value }));
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#27ae60';
      case 'Medium': return '#f39c12';
      case 'Hard': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading problems...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Choose a problem to start coding</p>
        </div>        <div className="dashboard-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filters.difficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
              className="difficulty-filter"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="problems-grid">
          {problems.length === 0 ? (
            <div className="no-problems">
              <p>No problems found. Try adjusting your filters.</p>
            </div>
          ) : (
            problems.map((problem) => (
              <div key={problem._id} className="problem-card">
                <div className="problem-header">
                  <h3 className="problem-title">
                    <Link to={`/problem/${problem._id}`}>
                      {problem.title}
                    </Link>
                  </h3>
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                
                <div className="problem-stats">
                  <div className="stat">
                    <span className="stat-label">Acceptance:</span>
                    <span className="stat-value">{problem.acceptanceRate}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Submissions:</span>
                    <span className="stat-value">{problem.totalSubmissions}</span>
                  </div>
                </div>

                {problem.tags && problem.tags.length > 0 && (
                  <div className="problem-tags">
                    {problem.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Link to={`/problem/${problem._id}`} className="solve-button">
                  Solve Problem
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
