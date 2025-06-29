# Use official Node.js image with Debian
FROM node:18-bullseye

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install required language tools
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    build-essential \
    g++ \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment variables  
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Verify installations work
RUN node --version && npm --version && java -version && javac -version && g++ --version && python3 --version

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

# Expose the port
EXPOSE 5000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
