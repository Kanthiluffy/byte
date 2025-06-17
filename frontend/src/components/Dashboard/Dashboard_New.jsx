import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [allProblems, setAllProblems] = useState([]);
  const [displayedProblems, setDisplayedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  
  const { user } = useAuth();

  // Load all problems once on component mount
  useEffect(() => {
    fetchAllProblems();
  }, []);

  // Filter problems whenever search term or difficulty filter changes
  useEffect(() => {
    filterProblems();
  }, [allProblems, searchTerm, difficultyFilter]);

  const fetchAllProblems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await problemsAPI.getAll({ limit: 100 });
      const problems = response.data.problems || [];
      setAllProblems(problems);
      setDisplayedProblems(problems);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to fetch problems. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = [...allProblems];

    // Apply difficulty filter
    if (difficultyFilter) {
      filtered = filtered.filter(problem => problem.difficulty === difficultyFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(problem => {
        const titleMatch = problem.title.toLowerCase().includes(searchLower);
        const tagMatch = problem.tags && problem.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        return titleMatch || tagMatch;
      });
    }

    setDisplayedProblems(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setDifficultyFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
  };

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
      <div className="dashboard">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading problems...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Choose a problem to start coding</p>
        </div>

        <div className="dashboard-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search problems by title or tags..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={difficultyFilter}
              onChange={handleDifficultyChange}
              className="difficulty-filter"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {(searchTerm || difficultyFilter) && (
            <div className="filter-group">
              <button 
                onClick={handleClearFilters}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          {searchTerm || difficultyFilter ? (
            <p>
              Showing {displayedProblems.length} of {allProblems.length} problems
              {searchTerm && ` matching "${searchTerm}"`}
              {difficultyFilter && ` (${difficultyFilter} difficulty)`}
            </p>
          ) : (
            <p>Showing all {allProblems.length} problems</p>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchAllProblems} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        <div className="problems-grid">
          {displayedProblems.length === 0 ? (
            <div className="no-problems">
              {searchTerm || difficultyFilter ? (
                <div>
                  <p>No problems found matching your criteria.</p>
                  <button onClick={handleClearFilters} className="clear-filters-btn">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <p>No problems available at the moment.</p>
              )}
            </div>
          ) : (
            displayedProblems.map((problem) => (
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
                    <span className="stat-value">{problem.acceptanceRate || 0}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Submissions:</span>
                    <span className="stat-value">{problem.totalSubmissions || 0}</span>
                  </div>
                </div>

                {problem.tags && problem.tags.length > 0 && (
                  <div className="problem-tags">
                    {problem.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 3 && (
                      <span className="tag more-tags">
                        +{problem.tags.length - 3} more
                      </span>
                    )}
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
