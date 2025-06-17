import React, { useState, useEffect } from 'react';
import './ProblemForm.css';

const ProblemForm = ({ problem, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    constraints: '',
    timeLimit: 5,
    memoryLimit: 128,
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (problem) {
      setFormData({
        title: problem.title || '',
        description: problem.description || '',
        difficulty: problem.difficulty || 'Easy',
        constraints: problem.constraints || '',
        // Convert timeLimit from milliseconds to seconds for display
        timeLimit: problem.timeLimit ? Math.round(problem.timeLimit / 1000) : 5,
        memoryLimit: problem.memoryLimit || 128,
        examples: problem.examples?.length ? problem.examples : [{ input: '', output: '', explanation: '' }],
        testCases: problem.testCases?.length ? problem.testCases : [{ input: '', expectedOutput: '', isHidden: false }],
        isActive: problem.isActive !== undefined ? problem.isActive : true
      });
    }
  }, [problem]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...formData.examples];
    newExamples[index][field] = value;
    setFormData(prev => ({ ...prev, examples: newExamples }));
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index) => {
    if (formData.examples.length > 1) {
      setFormData(prev => ({
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index)
      }));
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = field === 'isHidden' ? value : value;
    setFormData(prev => ({ ...prev, testCases: newTestCases }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const removeTestCase = (index) => {
    if (formData.testCases.length > 1) {
      setFormData(prev => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index)
      }));
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submissions
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (formData.testCases.length === 0) {
        throw new Error('At least one test case is required');
      }

      // Filter out empty examples and test cases
      const cleanedData = {
        ...formData,
        // Convert timeLimit from seconds to milliseconds for backend
        timeLimit: formData.timeLimit * 1000,
        examples: formData.examples.filter(ex => ex.input.trim() && ex.output.trim()),
        testCases: formData.testCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim())
      };

      if (cleanedData.testCases.length === 0) {
        throw new Error('At least one valid test case is required');
      }

      // Pass the cleaned data to parent component for API call
      await onSave(cleanedData);
      
      // Only close the form if the save was successful
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="problem-form-overlay">
      <div className="problem-form-modal">
        <div className="form-header">
          <h2>{problem ? 'Edit Problem' : 'Create New Problem'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="problem-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeLimit">Time Limit (seconds)</label>
              <input
                type="number"
                id="timeLimit"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleInputChange}
                min="1"
                max="60"
              />
            </div>

            <div className="form-group">
              <label htmlFor="memoryLimit">Memory Limit (MB)</label>
              <input
                type="number"
                id="memoryLimit"
                name="memoryLimit"
                value={formData.memoryLimit}
                onChange={handleInputChange}
                min="64"
                max="512"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="constraints">Constraints</label>
            <textarea
              id="constraints"
              name="constraints"
              value={formData.constraints}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          {/* Examples Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>Examples</h3>
              <button type="button" onClick={addExample} className="add-button">
                Add Example
              </button>
            </div>
            {formData.examples.map((example, index) => (
              <div key={index} className="example-form">
                <div className="example-header">
                  <h4>Example {index + 1}</h4>
                  {formData.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Input</label>
                    <textarea
                      value={example.input}
                      onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Output</label>
                    <textarea
                      value={example.output}
                      onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                      rows="2"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Explanation (optional)</label>
                  <textarea
                    value={example.explanation}
                    onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Test Cases Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>Test Cases *</h3>
              <button type="button" onClick={addTestCase} className="add-button">
                Add Test Case
              </button>
            </div>
            {formData.testCases.map((testCase, index) => (
              <div key={index} className="testcase-form">
                <div className="testcase-header">
                  <h4>Test Case {index + 1}</h4>
                  <div className="testcase-controls">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                      />
                      Hidden
                    </label>
                    {formData.testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Input *</label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      rows="3"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Expected Output *</label>
                    <textarea
                      value={testCase.expectedOutput}
                      onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                      rows="3"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Active (visible to users)
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Saving...' : (problem ? 'Update Problem' : 'Create Problem')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemForm;
