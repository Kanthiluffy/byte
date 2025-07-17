# Use official Node.js image with Debian
FROM node:18-bullseye

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install required language tools and AI dependencies
# - openjdk-17-jdk: For Java code execution
# - build-essential, g++: For C++ code execution
# - python3, python3-pip: For Python code execution and AI services
# - python3-venv: For Python virtual environments
# - ffmpeg: Required by OpenAI Whisper for audio processing
# - curl: For health checks
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    build-essential \
    g++ \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install OpenAI Whisper for speech-to-text functionality
RUN pip3 install --no-cache-dir openai-whisper

# Pre-download the base Whisper model to improve performance
# This prevents the first-time model download delay in production
RUN python3 -c "import whisper; whisper.load_model('base')"

# Set Python environment variables
ENV PYTHONPATH=/usr/local/lib/python3.9/site-packages
ENV PATH="/usr/local/bin:$PATH"

# Set Java environment variables  
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Verify installations work
RUN node --version && npm --version && java -version && javac -version && g++ --version && python3 --version && python3 -m whisper --help

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create temp directory with proper permissions
RUN mkdir -p temp && chmod 755 temp

# Set environment variables for AI features
ENV ENABLE_AI_FEATURES=true
ENV ENABLE_VOICE_FEATURES=true
ENV AI_MODEL=gemini-1.5-flash
ENV NODE_ENV=production

# Note: The following environment variables should be set at runtime:
# - GOOGLE_API_KEY: Required for AI tutor functionality
# - MONGODB_URI: Database connection string
# - JWT_SECRET: JWT token secret
# - SESSION_SECRET: Session secret for authentication

# Expose the port
EXPOSE 5000

# Add health check for application and AI services
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
