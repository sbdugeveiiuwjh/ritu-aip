import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Support base64 image uploads from camera and device gallery (15mb limit)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// In-memory rate limiter: max 120 requests per 60 seconds per IP
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: 'Rate limit reached. Please wait a few seconds before sending another message.',
      retryAfterSeconds: retryAfter,
    });
    return;
  }

  record.count += 1;
  next();
};

// Cleanup old rate limit keys periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

// Helper to get GoogleGenAI client with current env key
function getGeminiClient(): { ai: GoogleGenAI; key: string } {
  const key = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return { ai, key };
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const { key } = getGeminiClient();
  const hasKey = Boolean(key && key.trim().length > 0 && key !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    service: 'RITU AI API Server',
    model: 'gemini-3.1-flash-lite',
    apiKeyConfigured: hasKey,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Assistant System Instructions for RITU AI
function getSystemInstruction(mode: string, language: string): string {
  const corePrinciples = `You are RITU AI, a world-class, intelligent, friendly, and accurate all-in-one AI assistant (आपकी अपनी ऑल-इन-वन एआई सहायक).
Tagline: "Socho mat... Bas RITU AI se poochho!"

MAIN GOAL:
Provide accurate, clear, useful, well-structured, and natural answers comparable in quality to a leading professional AI assistant.

1. VISION & IMAGE RECOGNITION:
- You have advanced multimodal vision capabilities.
- When an image or photo is attached (e.g. photos of handwritten math questions, homework, science diagrams, textbooks, code screenshots, objects, signs, or recipes), thoroughly analyze the image.
- For math & science problems in photos: transcribe the equation/problem clearly, solve it step-by-step with full transparency, verify calculations, and provide the final result.
- For general image questions: describe details accurately and answer what the user asked about the image.

2. ANSWER QUALITY & DIRECTNESS:
- Always understand the user's complete question before answering.
- Answer the exact question first in the very first sentence, then explain details if needed.
- Adapt answer length to the complexity of the question:
  * For simple questions (e.g. "2 + 2 कितना होता है?"), give an immediate, short, direct answer (e.g. "2 + 2 = 4."). Do not add filler paragraphs.
  * For complex or conceptual questions, provide a structured explanation with examples.
- Use simple, natural language that matches the user's language:
  * If the user writes in Hindi (हिन्दी), respond in natural Hindi using Devanagari script.
  * If the user writes in Hinglish, respond in natural, friendly Hinglish.
  * If the user writes in English, respond in articulate, modern English.
- Avoid unnecessarily long answers, repetitive sentences, boilerplate filler, and confusing technical jargon.
- Jump straight into the solution without robotic introductions.
- Avoid excessive emojis or exaggerated praise.
- Never invent facts, calculations, features, or citations.
- If important information is missing, ask a short, polite clarifying question.

3. CONVERSATION CONTEXT & FOLLOW-UPS:
- Maintain active awareness of the entire conversation history.
- When the user asks a follow-up like "मुझे समझ नहीं आया, आसान करके बताओ।" or "Explain more simply":
  * Do NOT repeat the previous explanation.
  * Refer back to what was being discussed and re-explain it more simply from scratch using an everyday analogy or clear bullet points.

4. MATHEMATICS AND SCIENCE:
- Verify all calculations, equations, signs, units, and results before responding.
- Show the important steps for mathematical problems so the reasoning is transparent.
- Check assumptions, definitions, units, signs, and final results.
- Distinguish between real numbers and complex numbers when relevant.
- Clearly state when a mathematical expression is undefined, ambiguous, or dependent on assumptions.
- Do not present an uncertain mathematical result as a proven fact.
- Clean formatting: Use clean, human-readable mathematical notation (e.g. (-1)^(-1) = -1, or a^2 + b^2 = c^2).
- NEVER output raw LaTeX delimiters such as $$, \\[, \\], \\( or \\) because they render poorly on chat screens.
- Specific exponentiation rule: When discussing (-1)^(-1), explain that under ordinary integer exponentiation, (-1)^(-1) = 1 / (-1)^1 = 1 / -1 = -1. Note that the broader complex-power interpretation x^x requires additional branch choices, but for integer exponents it evaluates directly to -1.

5. EXPLANATION STYLE:
Use this response structure when appropriate:
- Direct Answer
- Simple Explanation
- Step-by-Step Solution
- Example
- Final Result
Do not force every heading into every answer. Use only what genuinely helps the user.

6. HONESTY AND UNCERTAINTY:
- If an answer is uncertain, explain exactly what is uncertain.
- Do not pretend to have searched the live internet if external tools are unavailable.
- Never fabricate citations, sources, statistics, or live information.
- Clearly distinguish established facts, estimates, assumptions, and examples.`;

  let langInstruction = '';
  if (language === 'hi') {
    langInstruction = `\nSPECIFIC LANGUAGE REQUIREMENT: The user has selected Hindi. Respond purely in natural, fluent Hindi using Devanagari script. Use clear terminology.`;
  } else if (language === 'hinglish') {
    langInstruction = `\nSPECIFIC LANGUAGE REQUIREMENT: The user has selected Hinglish. Respond in natural, conversational Hinglish (Hindi words written in Latin script, mixed with English).`;
  } else if (language === 'en') {
    langInstruction = `\nSPECIFIC LANGUAGE REQUIREMENT: The user has selected English. Respond in clear, professional English.`;
  } else {
    langInstruction = `\nSPECIFIC LANGUAGE REQUIREMENT: Automatically detect and match the language and dialect of the user's inquiry (English, Hindi, or Hinglish).`;
  }

  let modeInstruction = '';
  switch (mode) {
    case 'study':
      modeInstruction = `
MODE: Study & Learning Assistant
- Explain school and college topics at the user's specific learning level.
- Solve questions and homework step-by-step. If an image of a math/physics/chemistry problem is provided, solve it with full derivation.
- Define unfamiliar terms before using them.
- Give simple, relatable everyday examples.
- Generate practice questions, quizzes, and revision summaries when requested.`;
      break;
    case 'writer':
      modeInstruction = `
MODE: Professional Writing Assistant
- Produce natural, relevant, high-quality writing based on the requested format:
  * Articles and blog posts
  * Professional & formal emails
  * YouTube & Reels video scripts (with hook, scenes, and narration)
  * Social media captions & hashtags
  * Product descriptions
  * Translation between Hindi and English
  * Grammar correction & polishing
  * Text rewriting and summarization
- Strictly follow the requested language, tone, audience, and length.
- Deliver the finished text directly ready to use without conversational meta-introductions.`;
      break;
    case 'coding':
      modeInstruction = `
MODE: Coding Assistant
- Provide code that matches the requested language, framework, and environment (HTML/CSS, JavaScript, TypeScript, Python, React, SQL, etc.).
- Check syntax and explain how to run or preview the code.
- Always wrap code in markdown code blocks with the exact language identifier (e.g. \`\`\`html, \`\`\`python, \`\`\`tsx).
- When possible, help diagnose errors directly from the user's actual error message or screenshot.`;
      break;
    default:
      modeInstruction = `
MODE: General AI Assistant
- Provide direct, helpful, well-reasoned answers to questions on any topic.`;
      break;
  }

  return `${corePrinciples}\n${langInstruction}\n${modeInstruction}`;
}

// Cleanly format multi-turn messages including multimodal image parts
interface ChatMessagePayload {
  role: 'user' | 'model';
  content: string;
  image?: {
    mimeType: string;
    data: string;
  };
}

function formatMultiTurnContents(messages: ChatMessagePayload[]) {
  const filtered = messages
    .filter((m) => m && ((typeof m.content === 'string' && m.content.trim().length > 0) || m.image))
    .slice(-14);

  if (filtered.length === 0) {
    return [{ role: 'user', parts: [{ text: 'Hello' }] }];
  }

  const result: { role: 'user' | 'model'; parts: any[] }[] = [];

  for (const msg of filtered) {
    const role: 'user' | 'model' = msg.role === 'model' ? 'model' : 'user';
    const text = (msg.content || '').trim();
    const parts: any[] = [];

    // Attach image inlineData if present (supports vision Q&A)
    if (msg.image && msg.image.data && msg.image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: msg.image.mimeType,
          data: msg.image.data,
        },
      });
    }

    if (text) {
      parts.push({ text });
    } else if (parts.length === 0) {
      parts.push({ text: 'Please analyze this.' });
    }

    if (result.length === 0) {
      if (role === 'user') {
        result.push({ role: 'user', parts });
      }
    } else {
      const prev = result[result.length - 1];
      if (prev.role === role) {
        prev.parts.push(...parts);
      } else {
        result.push({ role, parts });
      }
    }
  }

  // Ensure conversation ends with user role
  if (result.length === 0 || result[result.length - 1].role !== 'user') {
    const lastUser = [...filtered].reverse().find((m) => m.role === 'user') || filtered[filtered.length - 1];
    const text = (lastUser.content || '').trim() || 'Please analyze this image.';
    const parts: any[] = [];
    if (lastUser.image && lastUser.image.data && lastUser.image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: lastUser.image.mimeType,
          data: lastUser.image.data,
        },
      });
    }
    parts.push({ text });
    result.push({ role: 'user', parts });
  }

  return result;
}

// Extract response text safely from GenerateContentResponse
function extractResponseText(response: any): string {
  if (response?.text && typeof response.text === 'string' && response.text.trim()) {
    return response.text.trim();
  }
  const parts = response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const textPart = parts
      .map((p: any) => (typeof p.text === 'string' ? p.text : ''))
      .join('')
      .trim();
    if (textPart) return textPart;
  }
  return '';
}

interface ChatRequestBody {
  messages: ChatMessagePayload[];
  mode?: 'general' | 'writer' | 'image' | 'edit' | 'study' | 'coding';
  language?: 'auto' | 'en' | 'hi' | 'hinglish';
  temperature?: number;
}

// Chat & Vision Endpoint
app.post('/api/chat', rateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, mode = 'general', language = 'auto', temperature = 0.7 }: ChatRequestBody = req.body;

    // 1. Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Invalid request: "messages" array is required.' });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const hasText = typeof lastMessage?.content === 'string' && lastMessage.content.trim().length > 0;
    const hasImage = Boolean(lastMessage?.image?.data);

    if (!hasText && !hasImage) {
      res.status(400).json({ error: 'Invalid request: Message must contain text or an image attachment.' });
      return;
    }

    if (hasText && lastMessage.content.length > 8000) {
      res.status(400).json({ error: 'Message is too long. Please limit prompts to 8000 characters.' });
      return;
    }

    // 2. Check API Key
    const { ai, key } = getGeminiClient();
    if (!key || key.trim().length === 0 || key === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'Gemini API key is not configured in the server environment. Please set GEMINI_API_KEY in your AI Studio Secrets panel.',
      });
      return;
    }

    // 3. Prepare pristine multi-turn contents preserving conversation context & images
    const contents = formatMultiTurnContents(messages);
    const systemInstruction = getSystemInstruction(mode, language);

    // 4. Resilient multi-model candidate fallback
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let replyText = '';
    let usedModel = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction,
            temperature: Math.max(0.1, Math.min(1.0, temperature)),
            maxOutputTokens: 8192,
          },
        });

        replyText = extractResponseText(response);
        if (replyText) {
          usedModel = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[RITU AI] Model "${modelName}" failed:`, err?.message || err);
      }
    }

    if (!replyText || replyText.length === 0) {
      const errMsg = lastError?.message || 'The AI model returned an empty response.';
      res.status(502).json({
        error: 'RITU AI was unable to generate a complete answer. Please try rephrasing your request.',
        details: errMsg,
      });
      return;
    }

    res.json({
      text: replyText,
      mode,
      language,
      model: usedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gemini API Error in /api/chat:', error?.message || error);

    let friendlyMessage = 'Unable to connect to AI service. Please try again in a few moments.';
    let statusCode = 500;

    const errMsg = (error?.message || '').toLowerCase();
    if (errMsg.includes('api_key') || errMsg.includes('unauthenticated') || errMsg.includes('api key')) {
      friendlyMessage = 'Authentication error: Invalid or missing Gemini API key. Please check your credentials.';
      statusCode = 401;
    } else if (errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('resource_exhausted')) {
      friendlyMessage = 'The AI service rate limit or quota has been reached. Please wait a minute and try again.';
      statusCode = 429;
    } else if (errMsg.includes('503') || errMsg.includes('demand') || errMsg.includes('unavailable') || errMsg.includes('overloaded')) {
      friendlyMessage = 'The AI model is experiencing high demand right now. Please retry in a few moments.';
      statusCode = 503;
    } else if (errMsg.includes('safety') || errMsg.includes('blocked')) {
      friendlyMessage = 'The request could not be completed because it triggered AI safety guidelines. Please modify your prompt.';
      statusCode = 400;
    }

    res.status(statusCode).json({
      error: friendlyMessage,
      details: error?.message,
    });
  }
});

// Image Generation Endpoint
app.post('/api/generate-image', rateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, style = 'Cinematic', aspectRatio = '1:1' } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Image prompt is required.' });
      return;
    }

    const { ai, key } = getGeminiClient();
    if (!key || key.trim().length === 0 || key === 'MY_GEMINI_API_KEY') {
      res.status(503).json({ error: 'Gemini API key is not configured.' });
      return;
    }

    const enhancedPrompt = `${prompt.trim()}, ${style} style, high quality, sharp focus, detailed composition`;

    // Attempt generation with official image models
    const candidateModels = ['gemini-3.1-flash-lite-image', 'gemini-nano-banana-2.1'];
    let generatedImageUrl = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [{ text: enhancedPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });

        const parts = response?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }

        if (generatedImageUrl) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[RITU AI] Model ${modelName} image generation error:`, err?.message || err);
      }
    }

    if (generatedImageUrl) {
      res.json({
        success: true,
        imageUrl: generatedImageUrl,
        prompt,
        style,
        aspectRatio,
      });
      return;
    }

    const isQuota = lastError?.status === 429 || lastError?.message?.includes('quota') || lastError?.message?.includes('RESOURCE_EXHAUSTED');
    res.json({
      success: false,
      error: isQuota
        ? 'AI Image Generation model requires a billed project API key (quota limit: 0 on free tier). Please select a paid key in AI Studio.'
        : (lastError?.message || 'Unable to generate image.'),
      prompt,
      style,
      aspectRatio,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to process image request.', details: err?.message });
  }
});

// Real Image Editing Endpoint (like Google Gemini image editing)
app.post('/api/edit-image', rateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, instruction } = req.body;
    if (!image || !image.data || !instruction) {
      res.status(400).json({ error: 'Both original image and editing instruction are required.' });
      return;
    }

    const { ai, key } = getGeminiClient();
    if (!key || key.trim().length === 0 || key === 'MY_GEMINI_API_KEY') {
      res.status(503).json({ error: 'Gemini API key is not configured.' });
      return;
    }

    const mimeType = image.mimeType || 'image/jpeg';
    const base64Data = image.data;

    // Send original image inlineData + text prompt to the image model
    const candidateModels = ['gemini-3.1-flash-lite-image', 'gemini-nano-banana-2.1'];
    let editedImageUrl = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: instruction.trim(),
              },
            ],
          },
        });

        const parts = response?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            editedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }

        if (editedImageUrl) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[RITU AI] Model ${modelName} image edit error:`, err?.message || err);
      }
    }

    if (editedImageUrl) {
      res.json({
        success: true,
        imageUrl: editedImageUrl,
        originalUrl: image.previewUrl || `data:${mimeType};base64,${base64Data}`,
        instruction,
      });
      return;
    }

    const isQuota = lastError?.status === 429 || lastError?.message?.includes('quota') || lastError?.message?.includes('RESOURCE_EXHAUSTED');
    res.json({
      success: false,
      error: isQuota
        ? 'AI Image Editing model requires an active paid project API key with image generation quota (gemini-3.1-flash-lite-image). Please select a billed key in AI Studio.'
        : (lastError?.message || 'Unable to edit image.'),
      originalUrl: image.previewUrl || `data:${mimeType};base64,${base64Data}`,
      instruction,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to edit image.', details: err?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RITU AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
