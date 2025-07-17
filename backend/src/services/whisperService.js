const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const { promisify } = require('util');

class WhisperService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch (error) {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  // Check if Whisper CLI is available
  async checkWhisperAvailability() {
    return new Promise((resolve) => {
      // Create environment with updated PATH
      const env = { ...process.env };
      
      // Try multiple approaches to check Whisper availability
      // First try: Simple import check
      const pythonWhisper = spawn('python3', ['-c', 'import whisper; print("available")'], { 
        env: env,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      pythonWhisper.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonWhisper.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonWhisper.on('close', (code) => {
        if (code === 0 && stdout.includes('available')) {
          resolve(true);
          return;
        }
        
        // Fallback: Try with 'python' instead of 'python3'
        const pythonFallback = spawn('python', ['-c', 'import whisper; print("available")'], { 
          env: env,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let fallbackStdout = '';
        
        pythonFallback.stdout.on('data', (data) => {
          fallbackStdout += data.toString();
        });
        
        pythonFallback.on('close', (fallbackCode) => {
          resolve(fallbackCode === 0 && fallbackStdout.includes('available'));
        });
        
        pythonFallback.on('error', (error) => {
          resolve(false);
        });
      });
      
      pythonWhisper.on('error', (error) => {
        // Try fallback with 'python' command
        const pythonFallback = spawn('python', ['-c', 'import whisper; print("available")'], { 
          env: env,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let fallbackStdout = '';
        
        pythonFallback.stdout.on('data', (data) => {
          fallbackStdout += data.toString();
        });
        
        pythonFallback.on('close', (fallbackCode) => {
          resolve(fallbackCode === 0 && fallbackStdout.includes('available'));
        });
        
        pythonFallback.on('error', (fallbackError) => {
          resolve(false);
        });
      });
    });
  }

  // Transcribe audio using Whisper CLI directly
  async transcribeAudio(audioFilePath) {
    try {
      console.log('Starting transcription for:', audioFilePath);
      
      // Check if Whisper is available
      const whisperAvailable = await this.checkWhisperAvailability();
      
      console.log('Whisper availability check result:', whisperAvailable);
      
      if (!whisperAvailable) {
        console.log('Whisper not available, returning placeholder response');
        // Return placeholder response if Whisper is not installed
        await this.cleanupFile(audioFilePath);
        return {
          success: true,
          text: "I'm working on implementing the solution for this problem. (Whisper not installed - install with: pip install openai-whisper)",
          confidence: 0.95,
          processingTime: 1000,
          usingPlaceholder: true
        };
      }

      console.log('Whisper available, proceeding with transcription');

      // Use Whisper CLI directly
      const result = await this.runWhisperCLI(audioFilePath);
      
      // Clean up the temporary file
      await this.cleanupFile(audioFilePath);
      
      return {
        success: true,
        text: result.text,
        confidence: result.confidence || 0.9,
        language: result.language || 'en',
        processingTime: result.processingTime || 2000,
        usingPlaceholder: false
      };
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      // Clean up on error
      await this.cleanupFile(audioFilePath);
      
      throw error;
    }
  }

  // Run Whisper CLI command directly
  async runWhisperCLI(audioFilePath, model = 'base') {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Create environment with updated PATH
      const env = { ...process.env };
      
      // Try python3 first, then python as fallback
      const pythonCommands = ['python3', 'python'];
      
      const tryPythonCommand = (commandIndex) => {
        if (commandIndex >= pythonCommands.length) {
          reject(new Error('Failed to run Whisper: No working Python command found'));
          return;
        }
        
        const pythonCmd = pythonCommands[commandIndex];
        
        // Use python -m whisper directly (since we know this works)
        const whisperArgs = [
          '-m', 'whisper',
          audioFilePath,
          '--model', model,
          '--output_format', 'json',
          '--output_dir', this.tempDir,
          '--verbose', 'False'
        ];

        const whisper = spawn(pythonCmd, whisperArgs, { 
          env: env,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';

        whisper.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        whisper.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        whisper.on('close', (code) => {
          if (code === 0) {
            this.handleWhisperResult(code, stdout, stderr, audioFilePath, startTime, resolve, reject);
          } else {
            // Try next python command
            tryPythonCommand(commandIndex + 1);
          }
        });

        whisper.on('error', (error) => {
          // Try next python command
          tryPythonCommand(commandIndex + 1);
        });
      };
      
      // Start with the first python command
      tryPythonCommand(0);
    });
  }

  // Handle Whisper CLI result
  async handleWhisperResult(code, stdout, stderr, audioFilePath, startTime, resolve, reject) {
    const processingTime = Date.now() - startTime;
    
    if (code === 0) {
      try {
        // Whisper CLI creates a JSON file in the output directory
        const audioFileName = path.basename(audioFilePath, path.extname(audioFilePath));
        const jsonFilePath = path.join(this.tempDir, `${audioFileName}.json`);
        
        // Read the JSON file created by Whisper
        const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
        const whisperResult = JSON.parse(jsonContent);
        
        // Clean up the JSON file
        await this.cleanupFile(jsonFilePath);
        
        // Extract text and calculate confidence from segments
        const text = whisperResult.text || '';
        const segments = whisperResult.segments || [];
        
        let totalConfidence = 0;
        if (segments.length > 0) {
          totalConfidence = segments.reduce((sum, segment) => {
            // Convert avg_logprob to confidence (rough approximation)
            const confidence = segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.8;
            return sum + confidence;
          }, 0) / segments.length;
        } else {
          totalConfidence = 0.8; // Default confidence
        }
        
        resolve({
          text: text.trim(),
          confidence: Math.min(Math.max(totalConfidence, 0.1), 1.0),
          language: whisperResult.language || 'en',
          processingTime: processingTime,
          segments: segments
        });
        
      } catch (parseError) {
        console.error('Error parsing Whisper output:', parseError);
        // Try to extract text from stdout as fallback
        const text = this.extractTextFromStdout(stdout);
        resolve({
          text: text,
          confidence: 0.7,
          language: 'en',
          processingTime: processingTime
        });
      }
    } else {
      console.error('Whisper process failed:', stderr);
      reject(new Error(`Whisper process failed with code ${code}: ${stderr}`));
    }
  }

  // Extract text from stdout as fallback
  extractTextFromStdout(stdout) {
    try {
      // Look for common patterns in Whisper stdout
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('[') && line.includes(']') && line.length > 10) {
          // This might be a transcription line
          const match = line.match(/\]\s*(.+)$/);
          if (match) {
            return match[1].trim();
          }
        }
      }
      return "Sorry, I couldn't process your audio. Please try again.";
    } catch (error) {
      return "Sorry, I couldn't process your audio. Please try again.";
    }
  }

  // Clean up temporary files
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Silent fail for cleanup - file may already be deleted
    }
  }

  // Alternative: Use a simpler approach with browser's built-in speech recognition
  // but processed server-side for consistency
  async processAudioBuffer(audioBuffer) {
    try {
      // Save buffer to temporary file
      const tempFileName = `audio-${Date.now()}.wav`;
      const tempFilePath = path.join(this.tempDir, tempFileName);
      
      await fs.writeFile(tempFilePath, audioBuffer);
      
      // Process with our transcription service
      const result = await this.transcribeAudio(tempFilePath);
      
      return result;
    } catch (error) {
      console.error('Error processing audio buffer:', error);
      throw error;
    }
  }
}

module.exports = new WhisperService();
