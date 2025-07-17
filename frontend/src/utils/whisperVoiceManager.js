import RecordRTC from 'recordrtc';
import { speechAPI } from '../services/api';

class WhisperVoiceManager {
  constructor() {
    this.recorder = null;
    this.stream = null;
    this.isRecording = false;
    this.isSpeaking = false;
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    
    this.initializeVoices();
  }

  initializeVoices() {
    const loadVoices = () => {
      this.voices = this.synthesis.getVoices();
      // Prefer female voices for tutoring (more welcoming)
      this.selectedVoice = this.voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Zira')
      ) || this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
    };

    loadVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }
  }

  async isSupported() {
    try {
      // Check if browser supports MediaRecorder
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      // Check if we can access microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.warn('Microphone access not available:', error);
      return false;
    }
  }

  async startRecording(onProgress, onError, onComplete) {
    try {
      if (this.isRecording) {
        console.warn('Already recording');
        return;
      }

      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Whisper prefers 16kHz
        }
      });

      // Create recorder with optimal settings for Whisper
      this.recorder = new RecordRTC(this.stream, {
        type: 'audio',
        mimeType: 'audio/webm;codecs=opus',
        sampleRate: 16000,
        numberOfAudioChannels: 1,
        checkForInactiveTracks: true,
        bufferSize: 16384
      });

      this.recorder.startRecording();
      this.isRecording = true;

      // Call progress callback periodically
      if (onProgress) {
        this.progressInterval = setInterval(() => {
          onProgress(this.isRecording);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      
      if (error.name === 'NotAllowedError') {
        onError('microphone-denied');
      } else if (error.name === 'NotFoundError') {
        onError('microphone-not-found');
      } else {
        onError('recording-failed');
      }
    }
  }

  async stopRecording(onComplete, onError) {
    if (!this.isRecording || !this.recorder) {
      console.warn('Not currently recording');
      return;
    }

    this.isRecording = false;
    
    // Clear progress interval
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    return new Promise((resolve, reject) => {
      this.recorder.stopRecording(() => {
        try {
          const audioBlob = this.recorder.getBlob();
          
          // Clean up
          this.cleanup();
          
          // Send to backend for transcription
          this.transcribeAudio(audioBlob, onComplete, onError);
          resolve(audioBlob);
        } catch (error) {
          console.error('Error stopping recording:', error);
          this.cleanup();
          onError('stop-recording-failed');
          reject(error);
        }
      });
    });
  }

  async transcribeAudio(audioBlob, onComplete, onError) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onError('authentication-required');
        return;
      }

      // Use the API service for consistent configuration
      const response = await speechAPI.transcribe(audioBlob);

      if (response.data.success) {
        onComplete(response.data.transcription, response.data.confidence);
      } else {
        console.error('Transcription failed:', response.data.message);
        onError('transcription-failed');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      if (error.response?.status === 401) {
        onError('authentication-required');
      } else if (error.response?.status === 404) {
        onError('service-not-available');
      } else if (error.response?.status === 400) {
        onError('invalid-audio');
      } else {
        onError('network-error');
      }
    }
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.recorder) {
      this.recorder.destroy();
      this.recorder = null;
    }
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // Text-to-speech functionality (unchanged)
  speak(text, onStart, onEnd, onError) {
    if (!this.synthesis) return;

    // Stop any current speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      if (onError) onError(event.error);
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  setVoice(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.selectedVoice = voice;
    }
  }

  getAvailableVoices() {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  // Get recording status
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      isSpeaking: this.isSpeaking,
      hasRecorder: !!this.recorder,
      hasStream: !!this.stream
    };
  }
}

export default WhisperVoiceManager;
