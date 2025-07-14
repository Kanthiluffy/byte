// Voice utilities for speech recognition and synthesis
class VoiceManager {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.voices = [];
    
    this.initializeVoices();
    this.setupSpeechRecognition();
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

  setupSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  isSupported() {
    return !!(this.recognition && this.synthesis);
  }

  startListening(onResult, onError, onEnd) {
    if (!this.recognition || this.isListening) return;

    this.isListening = true;
    let finalTranscript = '';
    let interimTranscript = '';

    this.recognition.onresult = (event) => {
      interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      onResult(finalTranscript, interimTranscript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd(finalTranscript);
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

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
}

export default VoiceManager;
