const axios = require('axios');

const PISTON_API = 'https://emkc.org/api/v2/piston';

const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  c: { language: 'c', version: '10.2.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.50.0' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
  swift: { language: 'swift', version: '5.3.3' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
  bash: { language: 'bash', version: '5.2.0' },
  sql: { language: 'sqlite3', version: '3.36.0' },
};

// @desc    Execute code
// @route   POST /api/execute
exports.executeCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript', stdin = '', args = [] } = req.body;

    if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

    const langConfig = LANGUAGE_MAP[language.toLowerCase()];
    if (!langConfig) {
      return res.status(400).json({ success: false, message: `Language '${language}' not supported` });
    }

    const startTime = Date.now();

    const response = await axios.post(`${PISTON_API}/execute`, {
      language: langConfig.language,
      version: langConfig.version,
      files: [{ content: code }],
      stdin,
      args,
      compile_timeout: 10000,
      run_timeout: 5000,
    }, { timeout: 20000 });

    const executionTime = Date.now() - startTime;
    const { run, compile } = response.data;

    res.json({
      success: true,
      output: run?.stdout || '',
      stderr: run?.stderr || compile?.stderr || '',
      exitCode: run?.code ?? compile?.code ?? 0,
      executionTime,
      language,
    });
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({ success: false, message: 'Execution timed out (5s limit)' });
    }
    next(error);
  }
};

// @desc    Get supported languages
// @route   GET /api/execute/languages
exports.getSupportedLanguages = (req, res) => {
  res.json({
    success: true,
    languages: Object.keys(LANGUAGE_MAP).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      version: LANGUAGE_MAP[key].version,
    })),
  });
};
