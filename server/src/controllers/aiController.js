const axios = require('axios');
const User = require('../models/User');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_PROMPT = `You are CodeFusion AI, an expert coding assistant embedded in a collaborative coding platform. 
You help developers by:
- Explaining code clearly and concisely
- Generating high-quality code snippets
- Fixing bugs and suggesting improvements
- Optimizing code for performance and readability
- Adding documentation and comments
- Refactoring code to follow best practices
- Generating unit tests
- Converting code between languages
- Analyzing time and space complexity
- Explaining algorithms and data structures

Always format code with proper syntax highlighting using markdown code blocks.
Be concise, accurate, and developer-friendly.`;

// @desc    Chat with AI
// @route   POST /api/ai/chat
exports.chat = async (req, res, next) => {
  try {
    const { message, code, language, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const apiKey = process.env.GEMINI_API_KEY;

    // Build context-aware prompt
    let fullMessage = message;
    if (code) {
      fullMessage = `Here is the ${language || 'code'} I'm working with:\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\n${message}`;
    }

    if (!apiKey || apiKey === 'your_gemini_api_key') {
      // Fallback mock response for demo
      const mockResponses = {
        explain: `## Code Explanation\n\nThis code performs the following operations:\n\n1. **Initialization** - Sets up the required variables\n2. **Processing** - Applies the core logic\n3. **Output** - Returns the computed result\n\nThe overall time complexity is **O(n)** and space complexity is **O(1)**.\n\n> 💡 **Tip**: Consider using more descriptive variable names for better readability.`,
        fix: `## Bug Fix\n\nI found the issue! Here's the corrected code:\n\n\`\`\`javascript\n// Fixed version\nfunction solution(arr) {\n  return arr.filter(Boolean).reduce((a, b) => a + b, 0);\n}\n\`\`\`\n\n**What was wrong**: The original code didn't handle null/undefined values in the array.`,
        generate: `## Generated Code\n\nHere's the implementation:\n\n\`\`\`javascript\nconst solution = async (input) => {\n  try {\n    const result = await processData(input);\n    return { success: true, data: result };\n  } catch (error) {\n    console.error('Error:', error.message);\n    return { success: false, error: error.message };\n  }\n};\n\`\`\`\n\nThis follows best practices with **async/await**, **error handling**, and **clean return format**.`,
        default: `## CodeFusion AI Response\n\nI'm here to help with your coding questions! I can:\n\n- 🔍 **Explain** complex code\n- 🐛 **Fix** bugs and errors  \n- ⚡ **Optimize** performance\n- 📝 **Generate** code snippets\n- 🧪 **Write** unit tests\n- 🔄 **Convert** between languages\n\n*Note: Connect your Gemini API key in .env for full AI capabilities.*`,
      };

      const lowerMsg = message.toLowerCase();
      let response = mockResponses.default;
      if (lowerMsg.includes('explain') || lowerMsg.includes('what')) response = mockResponses.explain;
      else if (lowerMsg.includes('fix') || lowerMsg.includes('error') || lowerMsg.includes('bug')) response = mockResponses.fix;
      else if (lowerMsg.includes('generate') || lowerMsg.includes('create') || lowerMsg.includes('write')) response = mockResponses.generate;

      await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.aiUsage': 1 } });

      return res.json({ success: true, response, isDemo: true });
    }

    // Real Gemini API call
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${fullMessage}` }] },
    ];

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      { contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } },
      { timeout: 30000 }
    );

    const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.aiUsage': 1 } });

    res.json({ success: true, response: aiText });
  } catch (error) {
    if (error.response?.status === 400) {
      return res.status(400).json({ success: false, message: 'Invalid API request' });
    }
    next(error);
  }
};

// @desc    Explain code
// @route   POST /api/ai/explain
exports.explainCode = async (req, res, next) => {
  req.body.message = 'Please explain this code in detail. What does it do? What is the time and space complexity?';
  return exports.chat(req, res, next);
};

// @desc    Fix code
// @route   POST /api/ai/fix
exports.fixCode = async (req, res, next) => {
  req.body.message = 'Please find and fix any bugs or issues in this code. Explain what was wrong.';
  return exports.chat(req, res, next);
};

// @desc    Optimize code
// @route   POST /api/ai/optimize
exports.optimizeCode = async (req, res, next) => {
  req.body.message = 'Please optimize this code for better performance and readability. Follow best practices.';
  return exports.chat(req, res, next);
};

// @desc    Generate tests
// @route   POST /api/ai/tests
exports.generateTests = async (req, res, next) => {
  req.body.message = 'Please generate comprehensive unit tests for this code. Use Jest or appropriate testing framework.';
  return exports.chat(req, res, next);
};

// @desc    Add comments/docs
// @route   POST /api/ai/document
exports.addDocumentation = async (req, res, next) => {
  req.body.message = 'Please add comprehensive JSDoc comments and documentation to this code.';
  return exports.chat(req, res, next);
};
