import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { problemsAPI, submissionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProblemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    fetchProblem();
  }, [id]);
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Enter to submit
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!submitting && user) {
          handleSubmit();
        }
      }
      // F11 for fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      // Escape to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [submitting, user, isFullscreen]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getById(id);
      setProblem(response.data);
      updateCodeTemplate('python');
    } catch (err) {
      setError('Failed to fetch problem details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCodeTemplate = (lang) => {
    const templates = {
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
}`,
      javascript: `// Write your solution here
function solution() {
    // Your code here
    return result;
}`
    };
    
    setLanguage(lang);
    setCode(templates[lang] || templates.python);
  };  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    try {
      setSubmitting(true);
      
      // Submit code and get submission ID
      const submitResponse = await submissionsAPI.submit({
        problemId: id,
        code,
        language
      });
      
      const submissionId = submitResponse.data.submissionId;
      
      // Show initial feedback
      toast.success('Code submitted! Executing...');
      
      // Set initial pending state
      setSubmissionResult({
        status: 'RUNNING',
        output: null,
        error: null,
        executionTime: null,
        memoryUsed: null
      });
      
      // Poll for results
      pollSubmissionResult(submissionId);
      
    } catch (err) {
      toast.error('Failed to submit solution');
      console.error(err);
      setSubmitting(false);
    }
  };

  const pollSubmissionResult = async (submissionId, attempts = 0) => {
    const maxAttempts = 30; // Poll for up to 30 seconds
    
    if (attempts >= maxAttempts) {
      toast.error('Execution timeout - please try again');
      setSubmitting(false);
      return;
    }
    
    try {
      const response = await submissionsAPI.getById(submissionId);
      const submission = response.data;
      
      if (submission.status === 'Running' || submission.status === 'Pending') {
        // Still executing, poll again after 1 second
        setTimeout(() => pollSubmissionResult(submissionId, attempts + 1), 1000);
        return;
      }
      
      // Execution completed
      setSubmissionResult({
        status: submission.status.toUpperCase(),
        output: submission.testCaseResults?.[0]?.output || 'No output',
        error: submission.compilationError || null,
        executionTime: submission.executionTime,
        memoryUsed: null, // Not tracked in current backend
        passedTestCases: submission.passedTestCases,
        totalTestCases: submission.totalTestCases
      });
      
      if (submission.status === 'Accepted') {
        toast.success('Solution Accepted! 🎉');
      } else {
        toast.error(`Solution ${submission.status}`);
      }
      
    } catch (err) {
      console.error('Error polling submission:', err);
      toast.error('Error checking submission status');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDifficulty = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      hard: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty?.toLowerCase()] || colors.medium;
  };

  const renderExamples = () => {
    if (!problem?.examples?.length) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Examples</h3>
        {problem.examples.map((example, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                <div className="mt-1 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 p-2">
                  <code className="text-sm text-gray-900 dark:text-gray-100 font-mono">{example.input}</code>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Output:</span>
                <div className="mt-1 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 p-2">
                  <code className="text-sm text-gray-900 dark:text-gray-100 font-mono">{example.output}</code>
                </div>
              </div>
              {example.explanation && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Explanation:</span>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{example.explanation}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderConstraints = () => {
    // Fix: constraints is a string in the backend, not an array
    if (!problem?.constraints || typeof problem.constraints !== 'string' || problem.constraints.trim().length === 0) {
      return null;
    }

    // Split constraints by line breaks or semicolons to display as a list
    const constraintsList = problem.constraints
      .split(/[\n;]/)
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (constraintsList.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Constraints</h3>
        {constraintsList.length === 1 ? (
          // If it's just one constraint, display as paragraph
          <p className="text-sm text-gray-600 dark:text-gray-400">{constraintsList[0]}</p>
        ) : (
          // If multiple constraints, display as list
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {constraintsList.map((constraint, index) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  const renderSubmissionResult = () => {
    if (!submissionResult) return null;

    const statusColors = {
      ACCEPTED: 'text-green-600 bg-green-50 border-green-200',
      WRONG_ANSWER: 'text-red-600 bg-red-50 border-red-200',
      TIME_LIMIT_EXCEEDED: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      RUNTIME_ERROR: 'text-red-600 bg-red-50 border-red-200',
      COMPILATION_ERROR: 'text-orange-600 bg-orange-50 border-orange-200',
      RUNNING: 'text-blue-600 bg-blue-50 border-blue-200',
      PENDING: 'text-gray-600 bg-gray-50 border-gray-200'
    };

    return (
      <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Submission Result</h4>
          <div className="flex items-center space-x-2">
            {submissionResult.status === 'RUNNING' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[submissionResult.status] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
              {submissionResult.status === 'RUNNING' ? 'Executing...' : submissionResult.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {/* Test case results */}
        {submissionResult.passedTestCases !== undefined && submissionResult.totalTestCases !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Test Cases:</span>
              <span className={`font-medium ${submissionResult.passedTestCases === submissionResult.totalTestCases ? 'text-green-600' : 'text-red-600'}`}>
                {submissionResult.passedTestCases}/{submissionResult.totalTestCases} passed
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${submissionResult.passedTestCases === submissionResult.totalTestCases ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${(submissionResult.passedTestCases / submissionResult.totalTestCases) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {submissionResult.output && submissionResult.status !== 'RUNNING' && (
          <div className="mb-3">
            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Output:</h5>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto text-gray-900 dark:text-gray-100 font-mono">
              {submissionResult.output}
            </pre>
          </div>
        )}
        
        {submissionResult.error && (
          <div className="mb-3">
            <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">Error:</h5>
            <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm overflow-x-auto text-red-900 dark:text-red-100 font-mono border border-red-200 dark:border-red-800">
              {submissionResult.error}
            </pre>
          </div>
        )}
        
        {submissionResult.status !== 'RUNNING' && (
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Execution Time:</span> {submissionResult.executionTime || 'N/A'}ms
            </div>
            <div>
              <span className="font-medium">Memory Used:</span> {submissionResult.memoryUsed || 'N/A'}KB
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Problem Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The requested problem could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{problem.title}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${formatDifficulty(problem.difficulty)}`}>
                  {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                </span>
                {problem.tags && Array.isArray(problem.tags) && problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>      {isFullscreen ? (
        // Fullscreen Code Editor
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-800">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{problem.title} - Code Editor</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Exit Fullscreen"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language:</label>
                <select
                  value={language}
                  onChange={(e) => updateCodeTemplate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={setCode}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 16,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'line',
                  selectOnLineNumbers: true,
                  cursorStyle: 'line',
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
                  tabSize: 2,
                  insertSpaces: true
                }}
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Press Ctrl+Enter to submit • F11 for fullscreen • Esc to exit
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !user}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  submitting || !user
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Solution'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Normal Split Layout
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Problem Description */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Problem Description</h2>
                <div className="prose max-w-none text-gray-700 dark:text-gray-300">
                  <p className="whitespace-pre-wrap">{problem.description}</p>
                </div>
              </div>

              {renderExamples()}
              {renderConstraints()}
            </div>
          </div>

          {/* Code Editor and Submission */}
          <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Code Editor</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language:</label>
                  <select
                    value={language}
                    onChange={(e) => updateCodeTemplate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
              </div><div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <Editor
                  height="600px"
                  language={language === 'cpp' ? 'cpp' : language}
                  value={code}
                  onChange={setCode}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    cursorStyle: 'line',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    tabSize: 2,
                    insertSpaces: true
                  }}
                />
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Press Ctrl+Enter to submit
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !user}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    submitting || !user
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Solution'
                  )}
                </button>
              </div>

              {!user && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Please log in to submit your solution.
                  </p>
                </div>
              )}              {renderSubmissionResult()}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ProblemDetail;