import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api';
import WhisperVoiceManager from '../../utils/whisperVoiceManager';

const AITutor = ({ problem, onClose, onStartCoding }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const voiceManagerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Initialize Whisper voice manager
    const initializeVoice = async () => {
      try {
        voiceManagerRef.current = new WhisperVoiceManager();
        
        const isSupported = await voiceManagerRef.current.isSupported();
        
        if (isSupported) {
          setVoiceEnabled(true);
        } else {
          setVoiceEnabled(false);
          console.warn('Whisper voice recording not available - microphone access required');
        }
      } catch (error) {
        console.warn('Voice features not available:', error);
        setVoiceEnabled(false);
      }
    };
    
    initializeVoice();
    startTutorSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceManagerRef.current) {
        voiceManagerRef.current.cleanup();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startTutorSession = async () => {
    try {
      setIsLoading(true);
      console.log('Starting tutor session for problem:', problem._id);
      const response = await aiAPI.startTutorSession({ problemId: problem._id });
      
      console.log('Tutor session response:', response.data);
      
      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setSessionStarted(true);
        const welcomeMessage = {
          role: 'tutor',
          content: response.data.message,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
        
        // Speak welcome message if voice is enabled
        if (voiceEnabled) {
          setTimeout(() => {
            speakMessage(response.data.message);
          }, 500);
        }
      } else {
        setSessionStarted(false);
        toast.error(response.data.message || 'Failed to start tutoring session');
      }
    } catch (error) {
      console.error('Failed to start tutor session:', error);
      setSessionStarted(false);
      if (error.response?.status === 401) {
        toast.error('Please log in to use the AI tutor');
      } else if (error.response?.status === 404) {
        toast.error('AI tutor service not available');
      } else {
        toast.error('Failed to start tutoring session');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim() || !sessionId) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to tutor:', { sessionId, message: message.trim() });
      const response = await aiAPI.chatWithTutor({
        sessionId,
        message: message.trim()
      });

      console.log('Tutor chat response:', response.data);

      if (response.data.success) {
        const tutorMessage = {
          role: 'tutor',
          content: response.data.response,
          timestamp: response.data.timestamp
        };
        setMessages(prev => [...prev, tutorMessage]);
        
        // Speak tutor response if voice is enabled
        if (voiceEnabled) {
          setTimeout(() => {
            speakMessage(response.data.response);
          }, 300);
        }
      } else {
        toast.error(response.data.message || 'Failed to get tutor response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to continue the conversation');
      } else if (error.response?.status === 404) {
        toast.error('Tutoring session not found. Please restart.');
      } else {
        toast.error('Failed to get tutor response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (text) => {
    if (!voiceManagerRef.current || !voiceEnabled) return;
    
    // Clean text for better speech synthesis
    const cleanText = text
      .replace(/✅/g, 'Good points:')
      .replace(/⚠️/g, 'Consider this:')
      .replace(/💡/g, 'Suggestion:')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');

    voiceManagerRef.current.speak(
      cleanText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      (error) => {
        console.error('Speech error:', error);
        setIsSpeaking(false);
      }
    );
  };

  const startVoiceInput = async () => {
    if (!voiceManagerRef.current || isRecording) return;

    console.log('Starting voice recording...');
    setIsRecording(true);

    await voiceManagerRef.current.startRecording(
      (progress) => {
        setRecordingProgress(progress);
      },
      (error) => {
        console.error('Recording error:', error);
        setIsRecording(false);
        setRecordingProgress(false);
        
        if (error === 'microphone-denied') {
          toast.error('Please allow microphone access to use voice input');
        } else if (error === 'microphone-not-found') {
          toast.error('No microphone found - please check your audio devices');
        } else if (error === 'recording-failed') {
          toast.error('Failed to start recording - please try again');
        } else {
          toast.error('Voice recording failed - please type your message instead');
        }
      },
      (transcript, confidence) => {
        console.log('Voice transcription completed:', transcript);
        setIsRecording(false);
        setRecordingProgress(false);
        
        if (transcript && transcript.trim()) {
          setInputMessage(transcript.trim());
          toast.success(`Voice input recorded! Confidence: ${Math.round(confidence * 100)}%`);
        } else {
          toast('No speech detected - please try speaking again', { icon: '🎤' });
        }
      }
    );
  };

  const stopVoiceInput = async () => {
    if (!voiceManagerRef.current || !isRecording) return;

    console.log('Stopping voice recording...');
    
    try {
      await voiceManagerRef.current.stopRecording(
        (transcript, confidence) => {
          console.log('Voice transcription completed:', transcript);
          setIsRecording(false);
          setRecordingProgress(false);
          
          if (transcript && transcript.trim()) {
            setInputMessage(transcript.trim());
            toast.success(`Voice input recorded! Confidence: ${Math.round(confidence * 100)}%`);
          } else {
            toast('No speech detected in recording', { icon: '🎤' });
          }
        },
        (error) => {
          console.error('Stop recording error:', error);
          setIsRecording(false);
          setRecordingProgress(false);
          
          if (error === 'transcription-failed') {
            toast.error('Failed to transcribe speech - please try again');
          } else if (error === 'network-error') {
            toast.error('Network error during transcription - check your connection');
          } else if (error === 'authentication-required') {
            toast.error('Please log in to use voice features');
          } else if (error === 'service-not-available') {
            toast.error('Speech service not available - please try again later');
          } else if (error === 'invalid-audio') {
            toast.error('Invalid audio format - please try recording again');
          } else {
            toast.error('Failed to process voice input - please try again');
          }
        }
      );
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setRecordingProgress(false);
      toast.error('Failed to stop recording');
    }
  };

  const stopSpeaking = () => {
    if (voiceManagerRef.current) {
      voiceManagerRef.current.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const messageToSend = inputMessage.trim();
    if (messageToSend) {
      sendMessage(messageToSend);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const endSession = async () => {
    if (sessionId) {
      try {
        await aiAPI.endTutorSession({ sessionId });
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
    onClose();
  };

  const proceedToCoding = () => {
    endSession();
    onStartCoding();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Personal Tutor</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {problem.title} • {sessionId ? `Session: ${sessionId.slice(0, 8)}...` : 'No Session'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Voice toggle */}
            {voiceEnabled && (
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
                title="Toggle voice"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            
            {/* Close button */}
            <button onClick={endSession} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !isLoading && !sessionStarted && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Session Failed to Start</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Unable to connect to the AI tutor service. Please check your connection and try again.
                </p>
                <button
                  onClick={startTutorSession}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Retrying...' : 'Retry Connection'}
                </button>
              </div>
            </div>
          )}
          
          {messages.length === 0 && !isLoading && sessionStarted && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Welcome to AI Tutoring!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  I'm here to help you understand this problem before you start coding.
                  Share your initial thoughts or ask any questions!
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Type your message below or use the voice input button
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-gray-600 dark:text-gray-400">Tutor is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your approach or ask questions..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                rows="2"
                disabled={isLoading || isRecording}
              />
              
              {isRecording && (
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-500 font-medium">Recording...</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              {/* Voice input button */}
              {voiceEnabled ? (
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceInput : startVoiceInput}
                  className={`p-3 rounded-lg transition-colors relative ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  disabled={isLoading}
                  title={isRecording ? 'Stop recording' : 'Start voice recording'}
                >
                  {isRecording ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                  
                  {isRecording && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="p-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  disabled
                  title="Voice input requires microphone permissions"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
              
              {/* Send button */}
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim() || isRecording}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
          
          {/* Action buttons */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Stop Speaking
                  </div>
                </button>
              )}
              
              {!voiceEnabled && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Voice features require microphone access
                </div>
              )}
              
              {isRecording && (
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  🎤 Recording... Click the red button to stop
                </div>
              )}
            </div>
            
            <button
              onClick={proceedToCoding}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Ready to Code! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
