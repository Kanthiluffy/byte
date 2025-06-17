import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    skills: [],
    preferredLanguage: 'python',
    profileVisibility: 'public'
  });

  useEffect(() => {
    fetchProfile();
  }, [id, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let response;

      if (!id || (user && id === user.id)) {
        // Own profile or no ID specified
        response = await profileAPI.getProfile();
        setIsOwnProfile(true);
      } else {
        // Public profile
        response = await profileAPI.getPublicProfile(id);
        setIsOwnProfile(false);
      }

      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        location: response.data.location || '',
        website: response.data.website || '',
        github: response.data.github || '',
        linkedin: response.data.linkedin || '',
        skills: response.data.skills || [],
        preferredLanguage: response.data.preferredLanguage || 'python',
        profileVisibility: response.data.profileVisibility || 'public'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleSave = async () => {
    try {
      const response = await profileAPI.updateProfile(formData);
      setProfile(response.data);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#27ae60';
      case 'Medium': return '#f39c12';
      case 'Hard': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getSuccessRate = () => {
    if (!profile?.stats?.totalSubmissions) return 0;
    return Math.round((profile.stats.successfulSubmissions / profile.stats.totalSubmissions) * 100);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=120&background=3b82f6&color=fff`} 
              alt={profile?.name}
            />
          </div>
          
          <div className="profile-info">
            <div className="profile-name-section">
              <h1>{profile?.name}</h1>
              {isOwnProfile && (
                <button 
                  className={`edit-button ${editMode ? 'save' : 'edit'}`}
                  onClick={editMode ? handleSave : () => setEditMode(true)}
                >
                  {editMode ? 'Save Changes' : 'Edit Profile'}
                </button>
              )}
            </div>
            
            {editMode ? (
              <div className="edit-form">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="profile-input"
                />
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="profile-textarea"
                  rows="3"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="profile-input"
                />
                <input
                  type="url"
                  name="website"
                  placeholder="Website URL"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="profile-input"
                />
                <input
                  type="text"
                  name="github"
                  placeholder="GitHub username"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="profile-input"
                />
                <input
                  type="text"
                  name="linkedin"
                  placeholder="LinkedIn username"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="profile-input"
                />
                <input
                  type="text"
                  placeholder="Skills (comma separated)"
                  value={formData.skills.join(', ')}
                  onChange={handleSkillsChange}
                  className="profile-input"
                />
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                  className="profile-select"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <select
                  name="profileVisibility"
                  value={formData.profileVisibility}
                  onChange={handleInputChange}
                  className="profile-select"
                >
                  <option value="public">Public Profile</option>
                  <option value="private">Private Profile</option>
                </select>
              </div>
            ) : (
              <div className="profile-details">
                {profile?.bio && <p className="bio">{profile.bio}</p>}
                
                <div className="profile-meta">
                  {profile?.location && (
                    <span className="meta-item">
                      <i className="icon">📍</i> {profile.location}
                    </span>
                  )}
                  {profile?.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="meta-item">
                      <i className="icon">🌐</i> Website
                    </a>
                  )}
                  {profile?.github && (
                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="meta-item">
                      <i className="icon">💻</i> GitHub
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="meta-item">
                      <i className="icon">💼</i> LinkedIn
                    </a>
                  )}
                </div>

                {profile?.skills?.length > 0 && (
                  <div className="skills">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="stats-section">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{profile?.stats?.problemsSolved || 0}</div>
                <div className="stat-label">Problems Solved</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getSuccessRate()}%</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{profile?.stats?.totalSubmissions || 0}</div>
                <div className="stat-label">Total Submissions</div>
              </div>
            </div>

            <div className="difficulty-stats">
              <div className="difficulty-stat">
                <span className="difficulty-label" style={{ color: getDifficultyColor('Easy') }}>
                  Easy: {profile?.stats?.easyProblems || 0}
                </span>
              </div>
              <div className="difficulty-stat">
                <span className="difficulty-label" style={{ color: getDifficultyColor('Medium') }}>
                  Medium: {profile?.stats?.mediumProblems || 0}
                </span>
              </div>
              <div className="difficulty-stat">
                <span className="difficulty-label" style={{ color: getDifficultyColor('Hard') }}>
                  Hard: {profile?.stats?.hardProblems || 0}
                </span>
              </div>
            </div>
          </div>

          {profile?.recentSubmissions?.length > 0 && (
            <div className="recent-submissions">
              <h2>Recent Submissions</h2>
              <div className="submissions-list">
                {profile.recentSubmissions.map((submission) => (
                  <div key={submission._id} className="submission-item">
                    <div className="submission-problem">
                      <h3>{submission.problemId?.title}</h3>
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(submission.problemId?.difficulty) }}
                      >
                        {submission.problemId?.difficulty}
                      </span>
                    </div>
                    <div className="submission-meta">
                      <span className={`status ${submission.status}`}>{submission.status}</span>
                      <span className="submission-date">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
