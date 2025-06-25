const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const aiCodeReview = async (code, language = 'javascript') => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('Google API key not configured');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
        Analyze the following ${language} code and provide a comprehensive but concise review:

        \`\`\`${language}
        ${code}
        \`\`\`

        Please provide:
        1. **Code Quality**: Rate the code quality (1-10) and explain why
        2. **Strengths**: What the code does well
        3. **Issues**: Any bugs, logical errors, or problems you identify
        4. **Improvements**: Specific suggestions for optimization, readability, or best practices
        5. **Security**: Any security concerns (if applicable)
        
        Keep the review concise but actionable. Focus on the most important points.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return {
            success: true,
            review: text,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('AI Code Review Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate code review',
            timestamp: new Date().toISOString()
        };
    }
};

const aiHint = async (problemDescription, userCode, language = 'javascript') => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('Google API key not configured');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
        Problem Description:
        ${problemDescription}

        User's Current Code (${language}):
        \`\`\`${language}
        ${userCode}
        \`\`\`

        The user is stuck on this coding problem. Provide a helpful hint without giving away the complete solution:
        
        1. **Direction**: Point them in the right direction without spoiling the solution
        2. **Approach**: Suggest the algorithmic approach or data structure to consider
        3. **Next Step**: What should they focus on next in their code
        4. **Common Pitfalls**: Warn about common mistakes for this type of problem
        
        Keep hints encouraging and educational. Don't provide the complete solution.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return {
            success: true,
            hint: text,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('AI Hint Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate hint',
            timestamp: new Date().toISOString()
        };
    }
};

module.exports = {
    aiCodeReview,
    aiHint,
};
