const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Store conversation sessions in memory (in production, use Redis or database)
const conversationSessions = new Map();

const aiPersonalTutor = async (userId, problemId, problemData, userMessage, conversationHistory = []) => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('Google API key not configured');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Create conversation context
        const conversationContext = conversationHistory.map(msg => 
            `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`
        ).join('\n');

        const prompt = `
        You are an experienced coding tutor helping a student solve programming problems. Your role is to guide students to think through problems step-by-step, not give direct solutions.

        **Problem Context:**
        Title: ${problemData.title}
        Description: ${problemData.description}
        Difficulty: ${problemData.difficulty}
        ${problemData.constraints ? `Constraints: ${problemData.constraints}` : ''}
        ${problemData.examples && problemData.examples.length > 0 ? 
            `Examples: ${problemData.examples.map(ex => `Input: ${ex.input}, Output: ${ex.output}`).join('; ')}` 
            : ''
        }

        **Previous Conversation:**
        ${conversationContext}

        **Student's Latest Message:**
        "${userMessage}"

        **Instructions for Response:**
        1. **Analyze their approach** - Is it on the right track?
        2. **Provide structured feedback** using these sections:
           - ✅ **Strengths**: What's good about their thinking
           - ⚠️ **Considerations**: Potential issues or missing elements  
           - 💡 **Guidance**: Gentle nudges toward better approaches
        3. **Ask guiding questions** to help them think deeper
        4. **Encourage elaboration** on their thought process
        5. **DO NOT give direct code solutions** - only conceptual guidance
        6. **Be encouraging and supportive**
        7. **If they seem ready to code, acknowledge it and wish them well**

        **Response Style:**
        - Conversational and friendly
        - Use emojis for visual structure
        - Ask 1-2 thoughtful questions to guide their thinking
        - Keep responses concise but comprehensive
        - Maintain a tutor's encouraging tone

        **Example Response Format:**
        "I like where your thinking is heading! Let me share some thoughts:

        ✅ **Strengths**: [What they got right]
        
        ⚠️ **Considerations**: [What they might want to think about]
        
        💡 **Guidance**: [Gentle nudges]

        Before you start coding, consider: [thoughtful question]"

        Remember: You're a tutor, not a solution provider. Guide them to discover answers themselves.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const tutorResponse = response.text();
        
        return {
            success: true,
            response: tutorResponse,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('AI Personal Tutor Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate tutor response',
            timestamp: new Date().toISOString()
        };
    }
};

const startTutorSession = (userId, problemId, problemData) => {
    const sessionId = `${userId}_${problemId}_${Date.now()}`;
    conversationSessions.set(sessionId, {
        userId,
        problemId,
        problemData,
        history: [],
        startTime: new Date().toISOString()
    });
    return sessionId;
};

const addToConversation = (sessionId, role, content) => {
    const session = conversationSessions.get(sessionId);
    if (session) {
        session.history.push({
            role,
            content,
            timestamp: new Date().toISOString()
        });
    }
};

const getConversationHistory = (sessionId) => {
    const session = conversationSessions.get(sessionId);
    return session ? session.history : [];
};

const endTutorSession = (sessionId) => {
    conversationSessions.delete(sessionId);
};

const getSession = (sessionId) => {
    return conversationSessions.get(sessionId);
};

module.exports = {
    aiPersonalTutor,
    startTutorSession,
    addToConversation,
    getConversationHistory,
    endTutorSession,
    getSession
};
