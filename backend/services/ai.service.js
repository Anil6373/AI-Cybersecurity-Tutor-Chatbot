// ============================================================
//  services/ai.service.js
//  Handles communication with OpenAI, Anthropic (Claude),
//  and Google Gemini. Auto-selects best available provider.
// ============================================================

'use strict';

// ── OpenAI ────────────────────────────────────────────────
async function callOpenAI(message, systemPrompt) {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model:    'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: message },
    ],
    max_tokens:  1500,
    temperature: 0.7,
  });

  const choice = response.choices[0];
  return {
    content:     choice.message.content,
    model_used:  'openai',
    token_count: response.usage?.total_tokens ?? null,
  };
}

// ── Anthropic (Claude) ────────────────────────────────────
async function callClaude(message, systemPrompt) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client    = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: message }],
  });

  return {
    content:     response.content[0].text,
    model_used:  'claude',
    token_count: (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0),
  };
}

// ── Google Gemini ─────────────────────────────────────────
async function callGemini(message, systemPrompt) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(
    `${systemPrompt}\n\nUser: ${message}`
  );
  const response = result.response;

  return {
    content:     response.text(),
    model_used:  'gemini',
    token_count: null, // Gemini SDK doesn't reliably expose token counts
  };
}

// ── OpenRouter ────────────────────────────────────────────
async function callOpenRouter(message, systemPrompt) {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });

  const response = await client.chat.completions.create({
    model: 'openrouter/free', // Automatically routes to available free models
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  });

  const choice = response.choices[0];
  return {
    content: choice.message.content,
    model_used: 'openrouter',
    token_count: response.usage?.total_tokens ?? null,
  };
}

// ── DeepSeek (NVIDIA API) ─────────────────────────────────
async function callDeepSeek(message, systemPrompt) {
  try {
    require('dotenv').config(); // Restart-safe dotenv loading
    
    if (!process.env.NVIDIA_API_KEY || !process.env.NVIDIA_API_KEY.trim()) {
      throw new Error("Missing NVIDIA_API_KEY in environment variables. Please check your .env file.");
    }

    const apiKey = process.env.NVIDIA_API_KEY.trim();
    const modelName = process.env.DEEPSEEK_MODEL || 'deepseek-ai/deepseek-v3.2';
    
    // 1. Detailed Logging
    const maskedKey = `${apiKey.substring(0, 8)}...`;
    console.log('\n[DeepSeek/NVIDIA] --- Starting Request ---');
    console.log(`[DeepSeek/NVIDIA] Key present: true`);
    console.log(`[DeepSeek/NVIDIA] Key prefix:  ${maskedKey}`);
    console.log(`[DeepSeek/NVIDIA] Base URL:    https://integrate.api.nvidia.com/v1`);
    console.log(`[DeepSeek/NVIDIA] Model:       ${modelName}`);
    console.log(`[DeepSeek/NVIDIA] Request reaching provider...`);

    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY.trim(),
      baseURL: "https://integrate.api.nvidia.com/v1",
      timeout: 30000,   // 30 second hard limit — fail fast instead of hanging
      maxRetries: 0,    // don't retry on timeout; let caller handle fallback
    });

    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: message },
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 1500,
      extra_body: { chat_template_kwargs: { thinking: false } }
    });

    const choice = response.choices[0];
    console.log(`[DeepSeek/NVIDIA] Success! Provider Response Status: 200 OK`);
    console.log(`[DeepSeek/NVIDIA] Provider Response Tokens: ${response.usage?.total_tokens}`);
    console.log('[DeepSeek/NVIDIA] --------------------------\n');
    return {
      content:     choice.message.content,
      model_used:  'deepseek',
      token_count: response.usage?.total_tokens ?? null,
    };
  } catch (err) {
    console.error('\n[DeepSeek/NVIDIA] --- API ERROR ---');
    console.error('[DeepSeek/NVIDIA] Status:', err.status || 'No Status (Timeout/Network Error)');
    console.error('[DeepSeek/NVIDIA] Message:', err.message);
    if (err.response) {
      console.error('[DeepSeek/NVIDIA] Response Data:', JSON.stringify(err.response.data || err.response, null, 2));
    }
    console.error('[DeepSeek/NVIDIA] -------------------\n');
    
    // ── FALLBACK TO OPENROUTER ───────────────────────
    if (process.env.OPENROUTER_API_KEY) {
      console.log('[DeepSeek] NVIDIA failed, falling back to OpenRouter...');
      return await callOpenRouter(message, systemPrompt);
    }
    
    throw err; // rethrow if no fallback available
  }
}

// ── Auto-select: try in priority order ───────────────────
async function callAuto(message, systemPrompt) {
  const providers = [
    { key: 'ANTHROPIC_API_KEY', fn: callClaude,  name: 'claude'  },
    { key: 'OPENAI_API_KEY',    fn: callOpenAI,  name: 'openai'  },
    { key: 'GEMINI_API_KEY',    fn: callGemini,  name: 'gemini'  },
    { key: 'NVIDIA_API_KEY',    fn: callDeepSeek, name: 'deepseek' },
    { key: 'OPENROUTER_API_KEY', fn: callOpenRouter, name: 'openrouter' },
  ];

  const available = providers.filter((p) => {
    const k = process.env[p.key];
    return k && !k.startsWith('your_');
  });

  if (available.length === 0) {
    throw new Error('No AI provider API keys are configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in .env');
  }

  // Try each available provider in order, fall back on error
  for (const provider of available) {
    try {
      return await provider.fn(message, systemPrompt);
    } catch (err) {
      console.warn(`[AI] ${provider.name} failed:`, err.message, '— trying next…');
    }
  }

  throw new Error('All configured AI providers failed. Check your API keys and quotas.');
}

// ── Cybersecurity system prompt ───────────────────────────
const CYBER_TUTOR_SYSTEM_PROMPT = `You are Cyber Tutor AI, an expert cybersecurity educator.
Your role is to teach cybersecurity concepts clearly, accurately, and at the appropriate level for the learner.

Guidelines:
- Explain technical concepts in simple, approachable language
- Use real-world examples and analogies when helpful
- Provide code snippets or command examples where relevant
- Cover topics like network security, cryptography, ethical hacking, OWASP, threat analysis, and career paths
- Always remind learners to practice only on systems they own or have explicit permission to test
- Be encouraging and supportive of learning
- Format responses with clear headings and bullet points where appropriate
- Keep responses focused and concise (under 600 words unless the topic truly requires more detail)`;

// ── Main dispatcher ───────────────────────────────────────
async function getAIResponse(message, model = 'auto') {
  const systemPrompt = CYBER_TUTOR_SYSTEM_PROMPT;

  switch (model) {
    case 'openai': return callOpenAI(message, systemPrompt);
    case 'claude': return callClaude(message, systemPrompt);
    case 'gemini': return callGemini(message, systemPrompt);
    case 'deepseek': return callDeepSeek(message, systemPrompt);
    case 'openrouter': return callOpenRouter(message, systemPrompt);
    case 'auto':
    default:       return callAuto(message, systemPrompt);
  }
}

module.exports = { getAIResponse };
