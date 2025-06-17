import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import ProblemForm from './ProblemForm';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardData();
    } else if (activeTab === 'problems') {
      fetchProblems();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProblems({ limit: 20 });
      setProblems(response.data.problems || response.data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = () => {
    setEditingProblem(null);
    setShowProblemForm(true);
  };

  const handleEditProblem = (problem) => {
    setEditingProblem(problem);
    setShowProblemForm(true);
  };
  const handleDeleteProblem = async (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await adminAPI.deleteProblem(problemId);
        setProblems(problems.filter(p => p._id !== problemId));
        setError(''); // Clear any previous errors
        toast.success('Problem deleted successfully!');
        
        // Refresh dashboard stats if we're on overview tab
        if (activeTab === 'overview') {
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Error deleting problem:', error);
        const errorMessage = 'Failed to delete problem';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };
  const handleProblemSubmit = async (problemData) => {
    try {
      if (editingProblem) {
        const response = await adminAPI.updateProblem(editingProblem._id, problemData);
        setProblems(problems.map(p => p._id === editingProblem._id ? response.data : p));
        toast.success('Problem updated successfully!');
      } else {
        const response = await adminAPI.createProblem(problemData);
        setProblems([...problems, response.data]);
        toast.success('Problem created successfully!');
      }
      setShowProblemForm(false);
      setEditingProblem(null);
      setError(''); // Clear any previous errors
      
      // Refresh dashboard stats if we're on overview tab
      if (activeTab === 'overview') {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error saving problem:', error);
      toast.error(editingProblem ? 'Failed to update problem' : 'Failed to create problem');
      throw error; // Re-throw to let ProblemForm handle the error
    }
  };

  const renderOverview = () => {
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!dashboardData) return null;

    const { statistics, recentSubmissions } = dashboardData;

    return (
      <div className="overview-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-number">{statistics.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h3>Total Problems</h3>
            <div className="stat-number">{statistics.totalProblems}</div>
          </div>
          <div className="stat-card">
            <h3>Total Submissions</h3>
            <div className="stat-number">{statistics.totalSubmissions}</div>
          </div>
          <div className="stat-card">
            <h3>Acceptance Rate</h3>
            <div className="stat-number">{statistics.acceptanceRate}%</div>
          </div>
        </div>

        <div className="recent-submissions">
          <h3>Recent Submissions</h3>
          <div className="submissions-table">
            <div className="table-header">
              <div>User</div>
              <div>Problem</div>
              <div>Status</div>
              <div>Time</div>
            </div>
            {recentSubmissions.map((submission) => (
              <div key={submission._id} className="table-row">
                <div>{submission.userId?.name || 'Unknown'}</div>
                <div>{submission.problemId?.title || 'Unknown'}</div>
                <div className={`status ${submission.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {submission.status}
                </div>
                <div>{new Date(submission.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProblems = () => {
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
      <div className="problems-content">
        <div className="section-header">
          <h3>Manage Problems</h3>
          <button className="create-button" onClick={handleCreateProblem}>
            Create New Problem
          </button>
        </div>

        {problems.length === 0 ? (
          <div className="empty-state">
            <h3>No problems found</h3>
            <p>Create your first problem to get started!</p>
          </div>
        ) : (
          <div className="problems-table">
            <div className="table-header">
              <div>Title</div>
              <div>Difficulty</div>
              <div>Tags</div>
              <div>Test Cases</div>
              <div>Created</div>
              <div>Actions</div>
            </div>
            {problems.map((problem) => (
              <div key={problem._id} className="table-row">
                <div className="problem-title">{problem.title}</div>
                <div className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </div>
                <div className="tags-cell">
                  {problem.tags?.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div>{problem.testCases?.length || 0}</div>
                <div>{new Date(problem.createdAt).toLocaleDateString()}</div>
                <div className="actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEditProblem(problem)}
                    title="Edit Problem"
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteProblem(problem._id)}
                    title="Delete Problem"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage problems, users, and monitor platform activity</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            Problems
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'problems' && renderProblems()}
          {activeTab === 'users' && (
            <div className="coming-soon">
              <h3>User Management</h3>
              <p>User management features coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {showProblemForm && (
        <ProblemForm
          problem={editingProblem}
          onSubmit={handleProblemSubmit}
          onCancel={() => {
            setShowProblemForm(false);
            setEditingProblem(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
