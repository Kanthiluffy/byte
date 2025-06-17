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

  useEffect(() => {
    fetchProblem();
  }, [id]);

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
    
    setCode(templates[lang] || templates.python);
  };

  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'python': return 'python';
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      case 'javascript': return 'javascript';
      default: return 'python';
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
      
      pollSubmissionResult(submissionId);
    } catch (err) {
      toast.error('Failed to submit code: ' + (err.response?.data?.message || err.message), { id: 'submit' });
    } finally {
      setSubmitting(false);
    }
  };

  const pollSubmissionResult = async (submissionId) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await submissionsAPI.getById(submissionId);
        const result = response.data;

        if (result.status !== 'Pending' && result.status !== 'Running') {
          setSubmissionResult(result);
          
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
          setTimeout(poll, 1000);
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

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'Easy': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': 
        return 'bg-red-100 text-red-800 border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Problem</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Problem Not Found</h2>
            <p className="text-gray-600">The requested problem could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Problem Description */}
        <div className="bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-8">
            {/* Problem Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyStyle(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>

            {/* Description Section */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Description
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {problem.description}
                  </div>
                </div>
              </div>

              {/* Examples Section */}
              {problem.examples && problem.examples.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Examples
                  </h3>
                  <div className="space-y-6">
                    {problem.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4">Example {index + 1}:</h4>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-1">Input:</div>
                            <code className="text-blue-600 font-mono text-sm">{example.input}</code>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-1">Output:</div>
                            <code className="text-green-600 font-mono text-sm">{example.output}</code>
                          </div>
                          {example.explanation && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <div className="text-sm font-medium text-blue-900 mb-1">Explanation:</div>
                              <div className="text-blue-800 text-sm">{example.explanation}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints Section */}
              {problem.constraints && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Constraints
                  </h3>
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <div className="text-orange-900 whitespace-pre-wrap font-mono text-sm">
                      {problem.constraints}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor Section */}
        <div className="bg-gray-900 flex flex-col">
          {/* Editor Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <label className="text-sm font-medium text-gray-300">Language:</label>
                </div>
                <select 
                  value={language} 
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm appearance-none cursor-pointer"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="python" className="bg-gray-700 text-white">Python</option>
                  <option value="cpp" className="bg-gray-700 text-white">C++</option>
                  <option value="java" className="bg-gray-700 text-white">Java</option>
                  <option value="javascript" className="bg-gray-700 text-white">JavaScript</option>
                </select>
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className={`inline-flex items-center px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  submitting 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
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
                insertSpaces: true,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>

          {/* Submission Result */}
          {submissionResult && (
            <div className="bg-white border-t border-gray-200 p-6 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Submission Result
                </h3>
                <button
                  onClick={() => setSubmissionResult(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                submissionResult.status === 'Accepted' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : submissionResult.status === 'Wrong Answer'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : submissionResult.status === 'Time Limit Exceeded'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : submissionResult.status === 'Compilation Error'
                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {submissionResult.status === 'Accepted' && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {submissionResult.status !== 'Accepted' && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                Status: {submissionResult.status}
              </div>
              
              {submissionResult.status === 'Accepted' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-green-800 font-semibold">🎉 Congratulations!</div>
                      <div className="text-green-700 text-sm">Your solution is correct!</div>
                    </div>
                  </div>
                </div>
              )}
              
              {submissionResult.compilationError && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Compilation Error:
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <pre className="text-red-800 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                      {submissionResult.compilationError}
                    </pre>
                  </div>
                </div>
              )}
              
              {submissionResult.testCaseResults && submissionResult.testCaseResults.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Test Results:
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="text-blue-800 font-medium">
                      Passed: {submissionResult.passedTestCases || 0} / {submissionResult.totalTestCases || 0}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {submissionResult.testCaseResults.slice(0, 3).map((result, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${
                        result.passed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center mb-3">
                          {result.passed ? (
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className={`font-semibold ${
                            result.passed ? 'text-green-800' : 'text-red-800'
                          }`}>
                            Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {!result.passed && (
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="bg-white rounded p-2 border">
                                <div className="text-gray-600 font-medium mb-1">Input:</div>
                                <code className="text-blue-600 font-mono text-xs">{result.input}</code>
                              </div>
                              <div className="bg-white rounded p-2 border">
                                <div className="text-gray-600 font-medium mb-1">Expected:</div>
                                <code className="text-green-600 font-mono text-xs">{result.expectedOutput}</code>
                              </div>
                              <div className="bg-white rounded p-2 border">
                                <div className="text-gray-600 font-medium mb-1">Your Output:</div>
                                <code className="text-red-600 font-mono text-xs">{result.actualOutput || 'No output'}</code>
                              </div>
                            </div>
                            {result.error && (
                              <div className="bg-white rounded p-2 border border-red-300">
                                <div className="text-red-600 font-medium mb-1">Error:</div>
                                <code className="text-red-700 font-mono text-xs">{result.error}</code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
