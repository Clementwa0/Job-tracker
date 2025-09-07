const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const groqModels = [
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma-7b-it'
];

// Helper function to clean and parse JSON responses
function safeJsonParse(jsonString) {
  try {
    // Remove potential markdown code blocks
    let cleaned = jsonString.replace(/```json|```/g, '').trim();
    
    // Try to parse directly first
    return JSON.parse(cleaned);
  } catch (initialError) {
    console.log('Initial JSON parse failed, attempting to fix common issues');
    
    try {
      // Try to find JSON object within the text
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No JSON object found in response');
    } catch (secondError) {
      console.error('Failed to parse JSON after cleanup attempts:', secondError);
      throw new Error(`Failed to parse AI response: ${secondError.message}`);
    }
  }
}

async function callGroqAPI(cvText, model) {
  const groqApiKey = process.env.GROQ_API_KEY;

  const systemPrompt = `You are a professional CV reviewer and ATS (Applicant Tracking System) expert. 
    
Analyze the provided CV text and return feedback in STRICT JSON format with the following structure:
{
  "formatting_and_structure": "bullet points with specific recommendations",
  "grammar_and_clarity": "bullet points with specific recommendations", 
  "skills_match": "bullet points with specific recommendations",
  "achievements_and_impact": "bullet points with specific recommendations",
  "ats_compatibility": "bullet points with specific recommendations",
  "ats_score": number from 0-100,
  "recommended_jobs": "bullet points with 5 specific job titles that match this CV profile"
}

IMPORTANT: 
1. Respond ONLY with valid JSON. Do not include any other text or markdown formatting.
2. Ensure all strings are properly escaped.
3. Do not include trailing commas in JSON objects.
4. The ats_score must be a number, not a string.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { 
          role: 'system', 
          content: systemPrompt 
        },
        { 
          role: 'user', 
          content: `Please analyze this CV:\n\n${cvText.substring(0, 10000)}` 
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from AI service');
  }

  return data.choices[0].message.content.trim();
}

async function cvReviewHandler(req, res) {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders).status(200).send('ok');
    return;
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).set(corsHeaders).json({ error: 'Method not allowed' });
    }

    const { cvText } = req.body;

    if (!cvText) {
      return res.status(400).set(corsHeaders).json({ error: 'CV text is required' });
    }

    if (cvText.length < 50) {
      return res.status(400).set(corsHeaders).json({ error: 'CV text must be at least 50 characters long' });
    }

    let aiResponseText;
    let feedback;
    
    for (let i = 0; i < groqModels.length; i++) {
      try {
        aiResponseText = await callGroqAPI(cvText, groqModels[i]);
        console.log(`Raw AI response from ${groqModels[i]}:`, aiResponseText);
        
        // Use our safe JSON parser
        feedback = safeJsonParse(aiResponseText);
        break; // stop on first successful response
      } catch (err) {
        console.error(`Model ${groqModels[i]} failed:`, err.message);
        if (i === groqModels.length - 1) {
          // All models failed, throw the last error
          throw err;
        }
      }
    }

    // Validate the response structure
    const requiredFields = [
      'formatting_and_structure',
      'grammar_and_clarity',
      'skills_match',
      'achievements_and_impact',
      'ats_compatibility',
      'ats_score',
      'recommended_jobs',
    ];

    for (const field of requiredFields) {
      if (!(field in feedback)) {
        console.error(`Missing field in AI response: ${field}`);
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure ats_score is a number
    if (typeof feedback.ats_score !== 'number') {
      feedback.ats_score = parseInt(feedback.ats_score) || 50;
    }
    
    if (feedback.ats_score < 0 || feedback.ats_score > 100) {
      feedback.ats_score = 50;
    }

    // Ensure recommended_jobs is a string with bullet points
    if (typeof feedback.recommended_jobs !== 'string') {
      if (Array.isArray(feedback.recommended_jobs)) {
        feedback.recommended_jobs = feedback.recommended_jobs
          .map(job => `• ${typeof job === 'string' ? job : JSON.stringify(job)}`)
          .join('\n');
      } else {
        feedback.recommended_jobs = '• Software Developer\n• Project Manager\n• Business Analyst\n• Product Owner\n• Technical Consultant';
      }
    }

    // Ensure all other text fields are strings
    const textFields = [
      'formatting_and_structure',
      'grammar_and_clarity',
      'skills_match',
      'achievements_and_impact',
      'ats_compatibility'
    ];

    textFields.forEach(field => {
      if (typeof feedback[field] !== 'string') {
        if (Array.isArray(feedback[field])) {
          feedback[field] = feedback[field]
            .map(item => `• ${typeof item === 'string' ? item : JSON.stringify(item)}`)
            .join('\n');
        } else {
          feedback[field] = '• Review your CV content\n• Ensure proper formatting\n• Include relevant keywords';
        }
      }
    });

    return res.status(200).set(corsHeaders).json(feedback);
  } catch (error) {
    console.error('Function error:', error);
    
    // Provide a detailed fallback response
    const fallbackFeedback = {
      formatting_and_structure:
        '• Ensure your CV has clear sections (Experience, Education, Skills)\n• Use consistent formatting throughout\n• Include appropriate white space for readability',
      grammar_and_clarity:
        '• Review grammar and spelling throughout the document\n• Use clear, concise language\n• Ensure consistent tense usage',
      skills_match:
        '• Include relevant technical skills for your target role\n• Add industry-specific keywords\n• Highlight transferable skills',
      achievements_and_impact:
        '• Quantify accomplishments with specific metrics\n• Include percentage improvements where possible\n• Highlight leadership and initiative',
      ats_compatibility:
        '• Use standard section headers (Experience, Education, Skills)\n• Avoid complex formatting, tables, or columns\n• Save as PDF for best compatibility',
      recommended_jobs:
        '• Software Developer - Strong technical background\n• Project Manager - Good organizational skills\n• Business Analyst - Analytical capabilities\n• Product Owner - Strategic thinking abilities\n• Technical Consultant - Problem-solving expertise',
      ats_score: 70,
    };

    return res.status(200).set(corsHeaders).json(fallbackFeedback);
  }
}

module.exports = cvReviewHandler;