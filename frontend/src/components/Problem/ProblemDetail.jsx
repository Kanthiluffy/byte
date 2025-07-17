import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { problemsAPI, submissionsAPI, aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AITutor from './AITutor';
import Analytics from '../../utils/analytics';

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
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [codeReview, setCodeReview] = useState(null);
  const [hint, setHint] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [tutorCompleted, setTutorCompleted] = useState(false);
  const [aiCheckComplete, setAiCheckComplete] = useState(false);
  
  useEffect(() => {
    fetchProblem();
    checkAiAvailability();
  }, [id]);
  
  // Separate effect to handle tutor completion logic after AI availability is checked
  useEffect(() => {
    if (!aiCheckComplete) return; // Wait for AI check to complete
    
    // Check if user has completed tutor for this problem before
    if (user && id && aiAvailable) {
      const tutorKey = `tutor_completed_${user.id}_${id}`;
      const hasCompletedBefore = localStorage.getItem(tutorKey) === 'true';
      if (hasCompletedBefore) {
        setTutorCompleted(true);
        return;
      }
    }
    
    // If user is not logged in or AI is not available, mark tutor as completed
    if (!user || !aiAvailable) {
      setTutorCompleted(true);
    } else {
      setTutorCompleted(false);
    }
  }, [id, user, aiAvailable, aiCheckComplete]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Enter to submit
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!submitting && user && (tutorCompleted || !aiAvailable)) {
          handleSubmit();
        }
      }
      // F11 for fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        if (tutorCompleted || !aiAvailable || !user) {
          setIsFullscreen(!isFullscreen);
        }
      }
      // Escape to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [submitting, user, isFullscreen, tutorCompleted, aiAvailable]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getById(id);
      setProblem(response.data);
      updateCodeTemplate('python');
      
      // Track problem view
      Analytics.track('problem_viewed', { 
        problemId: id, 
        problemTitle: response.data?.title,
        difficulty: response.data?.difficulty,
        userId: user?.id 
      });
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
  };
  
  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    if (!tutorCompleted && aiAvailable && user) {
      toast.error('Please complete the tutoring session first or skip it to start coding');
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
  
  const checkAiAvailability = async () => {
    try {
      const response = await aiAPI.getStatus();
      setAiAvailable(response.data.available);
    } catch (error) {
      console.error('Failed to check AI availability:', error);
      setAiAvailable(false);
    } finally {
      setAiCheckComplete(true);
    }
  };

  const handleGetCodeReview = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before requesting a review');
      return;
    }

    try {
      setAiLoading(true);
      const response = await aiAPI.getCodeReview({
        code,
        language
      });
      
      if (response.data.success) {
        setCodeReview(response.data.review);
        setHint(null);
        setShowAiPanel(true);
        toast.success('AI code review generated!');
      } else {
        toast.error(response.data.message || 'Failed to generate code review');
      }
    } catch (error) {
      console.error('Code review error:', error);
      toast.error('Failed to generate code review');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before requesting a hint');
      return;
    }

    try {
      setAiLoading(true);
      const response = await aiAPI.getHint({
        problemId: id,
        code,
        language
      });
      
      if (response.data.success) {
        setHint(response.data.hint);
        setCodeReview(null);
        setShowAiPanel(true);
        toast.success('AI hint generated!');
      } else {
        toast.error(response.data.message || 'Failed to generate hint');
      }
    } catch (error) {
      console.error('Hint error:', error);
      toast.error('Failed to generate hint');
    } finally {
      setAiLoading(false);
    }
  };

  const handleStartTutor = () => {
    setShowTutor(true);
    Analytics.track('tutor_started', { 
      problemId: id, 
      problemTitle: problem?.title,
      userId: user?.id 
    });
  };

  const handleTutorComplete = () => {
    setShowTutor(false);
    setTutorCompleted(true);
    
    // Save completion status for this user and problem
    if (user && id) {
      const tutorKey = `tutor_completed_${user.id}_${id}`;
      localStorage.setItem(tutorKey, 'true');
    }
    
    Analytics.track('tutor_completed', { 
      problemId: id, 
      problemTitle: problem?.title,
      userId: user?.id 
    });
    
    toast.success('Great! Now you can start coding your solution.');
  };

  const handleSkipTutor = () => {
    setTutorCompleted(true);
    
    // Save completion status for this user and problem
    if (user && id) {
      const tutorKey = `tutor_completed_${user.id}_${id}`;
      localStorage.setItem(tutorKey, 'true');
    }
    
    Analytics.track('tutor_skipped', { 
      problemId: id, 
      problemTitle: problem?.title,
      userId: user?.id 
    });
    
    toast.info('Tutor skipped. You can start coding directly.');
  };

  // Debug function to reset tutor state
  const resetTutorState = () => {
    setTutorCompleted(false);
    setShowTutor(false);
    if (user && id) {
      const tutorKey = `tutor_completed_${user.id}_${id}`;
      localStorage.removeItem(tutorKey);
    }
    toast.info('Tutor state reset. Refresh the page to see the tutor prompt.');
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
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Constraints</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
          {constraintsList.map((constraint, index) => (
            <li key={index}>{constraint}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSubmissionResult = () => {
    if (!submissionResult) return null;
    
    const statusColors = {
      'ACCEPTED': 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      'WRONG_ANSWER': 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      'RUNTIME_ERROR': 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      'COMPILATION_ERROR': 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      'TIME_LIMIT_EXCEEDED': 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200',
      'RUNNING': 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    };
    
    const statusColor = statusColors[submissionResult.status] || 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200';
    
    return (
      <div className={`mt-6 rounded-lg border p-4 ${statusColor}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Submission Result</h4>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-opacity-50">
            {submissionResult.status}
          </span>
        </div>
        
        {submissionResult.status === 'RUNNING' && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-600 dark:text-blue-400">Executing your code...</span>
          </div>
        )}
        
        {(submissionResult.passedTestCases !== undefined && submissionResult.totalTestCases !== undefined) && (
          <div className="mb-3">
            <div className="flex justify-between mb-1">
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
      </div>
      
      {isFullscreen ? (
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
              <div className="flex space-x-3">
                {aiAvailable && user && (
                  <>
                    <button
                      onClick={handleGetHint}
                      disabled={aiLoading || !user}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        aiLoading || !user
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                      title="Get a hint for your solution"
                    >
                      {aiLoading && hint === null ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Getting Hint...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          AI Hint
                        </div>
                      )}
                    </button>
                    <button
                      onClick={handleGetCodeReview}
                      disabled={aiLoading || !user}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        aiLoading || !user
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                      title="Get an AI code review for your solution"
                    >
                      {aiLoading && codeReview === null ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Reviewing...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          AI Review
                        </div>
                      )}
                    </button>
                  </>
                )}
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
            
            {/* AI Panel for Code Review or Hint in Fullscreen Mode */}
            {showAiPanel && (codeReview || hint) && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {codeReview ? 'AI Code Review' : 'AI Hint'}
                  </h3>
                  <button 
                    onClick={() => setShowAiPanel(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 max-h-[30vh] overflow-y-auto">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {codeReview && (
                      <div className="space-y-4">
                        <div className="whitespace-pre-wrap">{codeReview}</div>
                      </div>
                    )}
                    {hint && (
                      <div className="space-y-4">
                        <div className="whitespace-pre-wrap">{hint}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Normal Split Layout
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* AI Tutor Modal */}
          {showTutor && (
            <AITutor 
              problem={problem}
              onStartCoding={handleTutorComplete}
              onClose={() => setShowTutor(false)}
            />
          )}

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
              <div className="p-6">
                {/* AI Tutor Introduction */}
                {!tutorCompleted && aiAvailable && user && (
                  <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          🤖 AI Personal Tutor Available
                        </h3>
                        <p className="text-blue-800 dark:text-blue-200 mb-4">
                          Before you start coding, would you like to discuss your approach with our AI tutor? 
                          The tutor can help you understand the problem, brainstorm solutions, and guide you through the thinking process.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleStartTutor}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Start Tutoring Session
                          </button>
                          <button
                            onClick={handleSkipTutor}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                          >
                            Skip & Code Directly
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tutorCompleted && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                        Ready to code! You can still use AI hints and code review while coding.
                      </span>
                      <div className="ml-auto flex space-x-2">
                        {aiAvailable && (
                          <button
                            onClick={() => {
                              setTutorCompleted(false);
                              // Clear localStorage for this problem
                              if (user && id) {
                                const tutorKey = `tutor_completed_${user.id}_${id}`;
                                localStorage.removeItem(tutorKey);
                              }
                              setShowTutor(true);
                            }}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                          >
                            Restart Tutor
                          </button>
                        )}
                        <button
                          onClick={resetTutorState}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Reset & Refresh
                        </button>
                      </div>
                    </div>
                  </div>
                )}              
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Code Editor</h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      disabled={!tutorCompleted && aiAvailable && user}
                      className={`p-1 transition-colors ${
                        !tutorCompleted && aiAvailable && user
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                      title={!tutorCompleted && aiAvailable && user ? "Complete tutoring first" : (isFullscreen ? "Exit Fullscreen" : "Fullscreen")}
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
                      disabled={!tutorCompleted && aiAvailable && user}
                      className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                        !tutorCompleted && aiAvailable && user ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </div>
                </div>
                
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden relative">
                  {!tutorCompleted && aiAvailable && user && (
                    <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Code Editor Locked</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Start a tutoring session or skip to unlock the code editor
                        </p>
                        <div className="flex space-x-3 justify-center">
                          <button
                            onClick={handleStartTutor}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Start Tutor
                          </button>
                          <button
                            onClick={handleSkipTutor}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
                    {!tutorCompleted && aiAvailable && user ? (
                      "Complete tutoring session to start coding"
                    ) : (
                      "Press Ctrl+Enter to submit"
                    )}
                  </div>
                  <div className="flex space-x-3">
                    {aiAvailable && user && tutorCompleted && (
                      <>
                        <button
                          onClick={handleGetHint}
                          disabled={aiLoading || !user}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            aiLoading || !user
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                          title="Get a hint for your solution"
                        >
                          {aiLoading && hint === null ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Getting Hint...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                              AI Hint
                            </div>
                          )}
                        </button>
                        <button
                          onClick={handleGetCodeReview}
                          disabled={aiLoading || !user}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            aiLoading || !user
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                          title="Get an AI code review for your solution"
                        >
                          {aiLoading && codeReview === null ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Reviewing...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              AI Review
                            </div>
                          )}
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !user || (!tutorCompleted && aiAvailable && user)}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        submitting || !user || (!tutorCompleted && aiAvailable && user)
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                      }`}
                      title={!tutorCompleted && aiAvailable && user ? "Complete tutoring session first" : ""}
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

                {!user && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Please log in to access the AI tutor and submit your solution.
                    </p>
                  </div>
                )}
                
                {/* AI Panel for Code Review or Hint */}
                {showAiPanel && (codeReview || hint) && (
                  <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {codeReview ? 'AI Code Review' : 'AI Hint'}
                      </h3>
                      <button 
                        onClick={() => setShowAiPanel(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {codeReview && (
                          <div className="space-y-4">
                            <div className="whitespace-pre-wrap">{codeReview}</div>
                          </div>
                        )}
                        {hint && (
                          <div className="space-y-4">
                            <div className="whitespace-pre-wrap">{hint}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {renderSubmissionResult()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;
