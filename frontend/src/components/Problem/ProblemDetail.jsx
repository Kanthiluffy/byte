import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { problemsAPI, submissionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ProblemDetail.css';

const ProblemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getById(id);
      setProblem(response.data);
      
      // Set default code template based on language
      updateCodeTemplate('javascript');
    } catch (err) {
      setError('Failed to fetch problem details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const updateCodeTemplate = (lang) => {
    const templates = {
      javascript: `// Write your solution here
function solution() {
    // Your code here
    return result;
}`,
      python: `# Write your solution here
def solution():
    # Your code here
    return result`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
      java: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}`
    };
    
    setCode(templates[lang] || templates.javascript);
  };

  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'python': return 'python';
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      default: return 'javascript';
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    updateCodeTemplate(newLanguage);
  };
  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionResult(null);
      
      toast.loading('Submitting your code...', { id: 'submit' });
      
      const response = await submissionsAPI.submit({
        problemId: id,
        code,
        language
      });

      const submissionId = response.data.submissionId;
      
      toast.success('Code submitted! Evaluating...', { id: 'submit' });
      
      // Poll for results
      pollSubmissionResult(submissionId);
    } catch (err) {
      toast.error('Failed to submit code: ' + (err.response?.data?.message || err.message), { id: 'submit' });
    } finally {
      setSubmitting(false);
    }
  };
  const pollSubmissionResult = async (submissionId) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await submissionsAPI.getById(submissionId);
        const result = response.data;

        if (result.status !== 'Pending' && result.status !== 'Running') {
          setSubmissionResult(result);
          
          // Show appropriate toast based on result
          if (result.status === 'Accepted') {
            toast.success('🎉 Congratulations! Your solution is correct!');
          } else if (result.status === 'Wrong Answer') {
            toast.error('Wrong Answer - Check your logic');
          } else if (result.status === 'Time Limit Exceeded') {
            toast.error('Time Limit Exceeded - Optimize your solution');
          } else if (result.status === 'Compilation Error') {
            toast.error('Compilation Error - Check your syntax');
          } else {
            toast.error(`Submission failed: ${result.status}`);
          }
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000); // Poll every second
        } else {
          setSubmissionResult({ status: 'Timeout', error: 'Submission timed out' });
          toast.error('Submission timed out - Please try again');
        }
      } catch (err) {
        console.error('Error polling submission:', err);
        setSubmissionResult({ status: 'Error', error: 'Failed to get submission result' });
        toast.error('Failed to get submission result');
      }
    };

    poll();
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
      <div className="loading-container">
        <div className="loading-spinner">Loading problem...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="error-container">
        <div className="error-message">Problem not found</div>
      </div>
    );
  }

  return (
    <div className="problem-detail">
      <div className="problem-layout">
        {/* Problem Description */}
        <div className="problem-description">
          <div className="problem-header">
            <h1>{problem.title}</h1>
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className="problem-content">
            <div className="section">
              <h3>Description</h3>
              <div className="description-text">
                {problem.description}
              </div>
            </div>

            {problem.examples && problem.examples.length > 0 && (
              <div className="section">
                <h3>Examples</h3>
                {problem.examples.map((example, index) => (
                  <div key={index} className="example">
                    <h4>Example {index + 1}:</h4>
                    <div className="example-content">
                      <div><strong>Input:</strong> {example.input}</div>
                      <div><strong>Output:</strong> {example.output}</div>
                      {example.explanation && (
                        <div><strong>Explanation:</strong> {example.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {problem.constraints && (
              <div className="section">
                <h3>Constraints</h3>
                <div className="constraints-text">
                  {problem.constraints}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="code-section">
          <div className="editor-header">
            <div className="language-selector">
              <label>Language:</label>
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="submit-button"
            >
              {submitting ? 'Submitting...' : 'Submit Code'}
            </button>
          </div>          <div className="monaco-editor-container">
            <Editor
              height="400px"
              language={getMonacoLanguage(language)}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                glyphMargin: true,
                folding: true,
                lineNumbers: 'on',
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                tabSize: 2,
                insertSpaces: true
              }}
            />
          </div>

          {/* Submission Result */}
          {submissionResult && (
            <div className="submission-result">
              <h3>Submission Result</h3>
              <div className={`result-status ${submissionResult.status.toLowerCase().replace(/\s+/g, '-')}`}>
                Status: {submissionResult.status}
              </div>
              
              {submissionResult.status === 'Accepted' && (
                <div className="success-message">
                  🎉 Congratulations! Your solution is correct!
                </div>
              )}
              
              {submissionResult.compilationError && (
                <div className="error-details">
                  <h4>Compilation Error:</h4>
                  <pre>{submissionResult.compilationError}</pre>
                </div>
              )}
              
              {submissionResult.testCaseResults && submissionResult.testCaseResults.length > 0 && (
                <div className="test-results">
                  <h4>Test Results:</h4>
                  <div className="test-summary">
                    Passed: {submissionResult.passedTestCases || 0} / {submissionResult.totalTestCases || 0}
                  </div>
                  
                  {submissionResult.testCaseResults.slice(0, 3).map((result, index) => (
                    <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                      <div className="test-case-header">
                        Test Case {index + 1}: {result.passed ? '✅ Passed' : '❌ Failed'}
                      </div>
                      {!result.passed && (
                        <div className="test-case-details">
                          <div><strong>Input:</strong> {result.input}</div>
                          <div><strong>Expected:</strong> {result.expectedOutput}</div>
                          <div><strong>Your Output:</strong> {result.actualOutput || 'No output'}</div>
                          {result.error && <div><strong>Error:</strong> {result.error}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
