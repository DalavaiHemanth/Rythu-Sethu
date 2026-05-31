import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { SCHEMES, CENTERS } from './src/data/staticData';
import { UploadedDoc, Message } from './src/types';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' })); // Support larger leaf photos

// In-memory document storage for the farmer/officer GO uploads (RAG context)
let uploadedDocuments: UploadedDoc[] = [
  {
    id: 'go_1',
    title: 'Telangana Rythu Bharosa Operational Guidelines 2026',
    content: 'AGRICULTURE & COOPERATION DEPARTMENT - Rythu Bharosa scheme is improved to provide input subsidy support of Rs. 15,000 per acre per year (divided equally in two terms: Rs. 7,500 for Kharif and Rs. 7,500 for Rabi). Landowners registered under the Pattadar database of the Dharani Portal are fully covered. Tenancy systems are audited by village secretaries for additional support. Funds will be directly disbursed through DBT into Bank accounts linked with Aadhaar cards.',
    uploadDate: '2026-04-12T10:00:00Z',
    charCount: 428
  },
  {
    id: 'go_2',
    title: 'Government Circular on Paddy Crop Pests & Zinc Deficiencies',
    content: 'AGRI ADVISORY PANEL TELANGANA: Recent heavy clay soil settings in Nizamabad, Siddipet, and Suryapet have shown widespread iron and zinc deficiencies in Paddy crop (leaves turning pale yellow or bronze, growth retardation, especially between 40-70 days of transplantation). Farmers are advised to spray Zinc Sulphate (Chelated Zn) at 2g per liter of water. Ensure proper drainage. Subsidies for micro-nutrients are registered under local Rythu Vedikas.',
    uploadDate: '2026-05-18T14:30:00Z',
    charCount: 412
  }
];

// Lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not defined pin. Please configure it in your Secrets Panel.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// 1. Documents API (RAG storage)
app.get('/api/documents', (req, res) => {
  res.json(uploadedDocuments);
});

app.post('/api/documents/upload', (req, res) => {
  const { id, title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  // Support updating existing policies in context memory
  if (id) {
    const index = uploadedDocuments.findIndex((d) => d.id === id);
    if (index !== -1) {
      uploadedDocuments[index] = {
        ...uploadedDocuments[index],
        title,
        content,
        uploadDate: new Date().toISOString(),
        charCount: content.length,
      };
      res.status(200).json(uploadedDocuments[index]);
      return;
    }
  }

  const newDoc: UploadedDoc = {
    id: `go_${Date.now()}`,
    title,
    content,
    uploadDate: new Date().toISOString(),
    charCount: content.length
  };
  uploadedDocuments.push(newDoc);
  res.status(201).json(newDoc);
});

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  uploadedDocuments = uploadedDocuments.filter((doc) => doc.id !== id);
  res.json({ success: true });
});

// 2. Chatbot response generation (multi-lingual and multi-modal)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, quizAnswers, locationInfo, language = 'en' } = req.body as {
      messages: Message[];
      quizAnswers?: Record<string, boolean>;
      locationInfo?: { district?: string; type?: string };
      language?: 'te' | 'ur' | 'en';
    };

    if (!messages || messages.length === 0) {
      res.status(400).json({ error: 'Messages are required' });
      return;
    }

    const ai = getGeminiClient();
    const lastMessage = messages[messages.length - 1];

    let systemInstruction = `You are "Rythu Sethu", a legendary, multi-lingual, friendly agriculture expert chatbot and scheme eligibility officer for Telangana's farmers.
Your core goal is to guide Telangana's farmers elegantly in their preferred language (Telugu natively, English, or Urdu) regarding crop plan diagnostics, government scheme options, and physical Rythu Vedika contacts.

Key background knowledge:
- Telangana agriculture has 3 major crop seasons: Vanakalam (Kharif), Yasangi (Rabi), and Summer.
- Core Crops: Paddy (వరి), Cotton (ప్రత్తి), Redgram (కందులు), Maize (మొక్కజొన్న), Chillies (మిరప).
- Telangana Soils: Red soils (Chalaka) are 48%, Black soils (Regur) are 25%, followed by alluvial soils and Dubba gravels.
- Major pests: Stem borer, Blast (అగ్గి తెగులు), Gall midge, Helicoverpa, Leaf folder in paddy and cotton.
- Common issue: Iron/zinc crop deficiency when leaves turn pale yellow around 40-70 days. Spray Zinc Sulphate (2g/L).

Telangana State Schemes Database:
${JSON.stringify(SCHEMES, null, 2)}

Rythu Vedika & Krishi Vigyan Kendras (KVKs) centers in Telangana:
${JSON.stringify(CENTERS, null, 2)}

Additional Context from Government Orders (GOs) and Policy Circulars (RAG):
${uploadedDocuments.map(d => `Document: "${d.title}" - Uploaded ${d.uploadDate}:\n${d.content}`).join('\n\n')}

Current Farmer's Profile (if known from the eligibility quiz):
${quizAnswers ? `Quiz results: Resident of Telangana? ${quizAnswers.isResident ? 'YES' : 'NO'}. Landowner/Pattadar? ${quizAnswers.isLandowner ? 'YES' : 'NO'}. Small & Marginal Farmer (Owns <= 5 acres)? ${quizAnswers.isSmallFarmer ? 'YES' : 'NO'}. Outstanding short-term crop loans? ${quizAnswers.hasCropLoan ? 'YES' : 'NO'}. Interested in micro-irrigation subsisides & water saving? ${quizAnswers.needsInsurance ? 'YES' : 'NO'}.` : 'Quiz results: Not completed yet.'}

Current Localized District Input:
${locationInfo?.district ? `Farmer is located in: "${locationInfo.district}" district. Direct them to suitable centers nearby if relevant.` : 'No registration district provided.'}

RESPONSE GUIDELINES:
1. Always reply in the requested language: ${language === 'te' ? 'Telugu (తెలుగు)' : language === 'ur' ? 'Urdu (اردو)' : 'English'}. Include warm greetings (e.g. "నమస్తే రైతు సోదరులకు / సమాధాన్ నివారణ్" or similar in Urdu/English). Be extremely clear, simple, and human. Avoid heavy text; use concise Bullet Points.
2. If the user presents a crop disease or health issue (including look/yellowing leaves/spots), provide:
   - Root cause hypothesis (especially Paddy pest or nutritional deficiency of Iron/Zinc).
   - Immediate treatment (organic compost, spray proportions, fertilizer advice).
   - The government subsidy scheme they might qualify for (like subsidized fertilizers or TG-MIP micro-irrigation tools) which matches their condition.
   - Proactive advice pointing to their nearest Rythu Vedika or KVK in their district.
3. If their profile/quiz results match eligibility for Rythu Bharosa, Rythu Bima, Loan Waiver, or TG-MIP, explicitly highlight those, explain the benefits, and detail exactly "How to Apply" at their Rythu Vedika cluster.
4. When they upload a leaf photo, examine it with your visual capability and diagnose what plant health conditions or pest infestations you observe in the picture. Tell them clearly what you diagnozed.
5. If they ask about a custom policy, check the uploaded Government Orders (GOs) context carefully.
6. Mention at least one local contact or Rythu Vedika center if applicable.`;

    // Process chat history and formats for Gemini API
    const contents: any[] = [];
    
    // Add history except the last message
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    // Prepare last message parts
    const lastParts: any[] = [];
    if (lastMessage.image) {
      // Strip base64 prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = lastMessage.image.replace(/^data:image\/\w+;base64,/, '');
      lastParts.push({
        inlineData: {
          mimeType: lastMessage.image.match(/^data:([^;]+);/)?.[1] || 'image/jpeg',
          data: base64Data
        }
      });
    }
    
    lastParts.push({ text: lastMessage.content });
    contents.push({
      role: 'user',
      parts: lastParts
    });

    // Run generateContent from @google/genai SDK
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || 'Sorry, I faced an issue processing your query.';
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred during chat advisory processing.'
    });
  }
});

// Serve agricultural news / advisories dynamically
app.get('/api/agri-news', (req, res) => {
  const lang = req.query.lang || 'en';
  const newsEn = [
    { id: 1, title: 'Rythu Bharosa Kharif installment release initiated by the state.', date: 'May 28, 2026' },
    { id: 2, title: 'State implements 24x7 free power checks. Report interruptions at nearest Rythu Vedikas.', date: 'May 24, 2026' }
  ];
  const newsTe = [
    { id: 1, title: 'రైతు భరోసా ఖరీఫ్ పెట్టుబడి సాయం విడుదల ప్రక్రియ ప్రారంభం.', date: 'మే 28, 2026' },
    { id: 2, title: '24 గంటల ఉచిత నాణ్యమైన విద్యుత్ సరఫరా పర్యవేక్షణ. అంతరాయాలు ఉంటే రైతు వేదికల్లో ఫిర్యాదు చేయండి.', date: 'మే 24, 2026' }
  ];
  const newsUr = [
    { id: 1, title: 'ریتھو بھروسہ خریف قسط جاری کرنے کا عمل شروع ہو گیا ہے۔', date: 'مئی 28، 2026' },
    { id: 2, title: 'ریاست 24 گھنٹے مفت بجلی فراہم کرتی ہے۔ کسی بھی رکاوٹ کی اطلاع ریتھو ویدیکا پر دیں۔', date: 'مئی 24، 2026' }
  ];
  
  if (lang === 'te') res.json(newsTe);
  else if (lang === 'ur') res.json(newsUr);
  else res.json(newsEn);
});

// 3. Soil Health Card AI Analysis Endpoint
app.post('/api/analyze-soil-card', async (req, res) => {
  try {
    const { values, image, language = 'en' } = req.body;
    const ai = getGeminiClient();

    let contents: any[] = [];
    let promptText = "";
    let crop = 'paddy';
    let acres = 3;
    let season = 'kharif';

    if (values) {
      crop = values.crop;
      acres = values.acres;
      season = values.season;
      const { soilTexture, pH, organicCarbon, nitrogen, phosphorus, potassium, zincDeficient, ironDeficient } = values;
      promptText = `Provide tailored scientific fertilizer recommendations for ${acres} acres of ${crop} in the ${season} season under Telangana agricultural soil patterns.
      The soil health card lab metrics entered manually by the farmer are:
      - Soil Texture / Type: ${soilTexture === 'clay' ? 'Regur / Clay soil' : soilTexture === 'loamy' ? 'Chalaka / Loamy soil' : 'Dubba / Sandy soil'}
      - Soil pH balance: ${pH}
      - Organic Carbon (OC%): ${organicCarbon}
      - Available Lab Nitrogen (N): ${nitrogen}
      - Available Lab Phosphorus (P): ${phosphorus}
      - Available Lab Potassium (K): ${potassium}
      - Secondary Trace Micronutrient deficiencies: ${zincDeficient ? 'Zinc (Zn) deficiency confirmed' : 'None'}, ${ironDeficient ? 'Iron (Fe) deficiency confirmed' : 'None'}.`;
    } else {
      crop = req.body.crop || 'Paddy';
      acres = req.body.acres || 3;
      promptText = `Analyze this uploaded image of a Telangana Soil Health Card document/slip.
      1. Carefully scan the labels, numerical grids, and chemical findings.
      2. Extract and parse parameters: Soil pH, Organic Carbon (OC), Nitrogen (N), Phosphorus (P), Potassium (K), and trace micronutrients like Zinc (Zn) and Iron (Fe).
      3. For the crop type of "${crop}" and land size of ${acres} acres, produce a customized fertilizer dosage recommendation. Use standard PJTSAU University guidelines.`;
    }

    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = image.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }

    contents.push({ text: promptText });

    const systemInstruction = `You are a legendary Telangana State Soil Chemist and Senior Agricultural Advisor from PJTSAU University (Professor Jayashankar Telangana State Agricultural University).
Your job is to analyze a farmer's Soil Health Card (either via extracted manual values or by reading the uploaded image) and compile a deeply personalized, micro-targeted fertilizer recommendation and soil health plan.

You MUST write the recommendations exclusively in the farmer's requested language: ${language === 'te' ? 'Telugu (తెలుగు)' : language === 'ur' ? 'Urdu (اردو)' : 'English'}.
Always begin your advice with a warm, respectful farmer greeting like:
- In Telugu: "నమస్తే రైతు సోదరులకు! మీ భూసార పరీక్షా పత్రం ప్రకారం మా సిఫార్సులు క్రింది విధంగా ఉన్నాయి:"
- In Urdu: "نمستے کسان بھائیو! آپ کی مٹی کی صحت رپورٹ کے مطابق کھاد کا سائنسی مشورہ درج ذیل ہے:"
- In English: "Namaste Farmer! Based on your Soil Health Card, here is your personalized AI scientific fertilizer prescription:"

Make your recommendations comprehensive and cover:
1. Soil Diagnostic Summary: Explain what their current pH and Organic Carbon levels mean (e.g. if pH is acidic, alkaline or normal, if OC is low or high). Show this clearly.
2. Specialized Soil Treatment: If the pH is low (acidic), strongly recommend applying Lime, dolomite, or organic compost before sowing. If pH is high (alkaline/saline), strongly recommend applying Gypsum (exact recommended amount in bags or kg/acre based on crop requirements), or practicing green manuring with Dhaincha (జీలుగ) / Sunnhemp (జనుము).
3. Optimized NPK Split-dose: Design a customized split application dosage of Urea, DAP, and MOP bags/kg for their exact acreage (${acres} acres) and crop (${crop}) in Yasangi (Rabi) or Vanakalam (Kharif) season.
   - If Nitrogen is Low, recommend increasing standard Urea by 25%. If high, decrease it.
   - If Phosphorus is Low, increase DAP by 25%.
   - If Potassium is Low, increase MOP (Potash) by 30%.
   - Detail the split application schedule (Basal dose, Tillering/First top dressing, and flowering/Second top dressing).
4. Micronutrient Diagnostics:
   - If Zinc (Zn) deficiency or Iron (Fe) deficiency is noted, give clear, highly actionable solutions (e.g., Basal application of Zinc Sulphate 20-25 kg per acre, or spray Chelated Zinc 2g/L or Ferrous Sulphate 0.5% as a rescue remedy).
5. Organic Soil Upbringing: Emphasize adding organic compost, Neem cake, or vermicompost if Organic Carbon is Low.

Ensure the recommendations are beautifully formatted with clear headings, bullets, and numbers. Do not use complex scientific jargon without translating it to standard local terminology (such as "సారవంతం", "ఆమ్లత్వం", "క్షారత్వం", "జింక్ లోపం"). Keep paragraphs well-spaced to prevent text overlapping and ensure legibility!`;

    // Fetch structured output using Type schema from @google/genai
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.5,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT' as any,
          properties: {
            soilPh: { type: 'NUMBER' as any, description: 'The absolute soil pH value extracted or provided.' },
            organicCarbon: { type: 'STRING' as any, description: 'Organic carbon content parsed or provided: low, medium, high.' },
            nitrogen: { type: 'STRING' as any, description: 'Available Nitrogen (N) rating: low, medium, high.' },
            phosphorus: { type: 'STRING' as any, description: 'Available Phosphorus (P) rating: low, medium, high.' },
            potassium: { type: 'STRING' as any, description: 'Available Potassium (K) rating: low, medium, high.' },
            micronutrientDeficiencies: { 
              type: 'ARRAY' as any, 
              items: { type: 'STRING' as any }, 
              description: 'Micronutrients deficient like Zinc, Iron, Sulphur, Boron' 
            },
            recommendationsMarkdown: { 
              type: 'STRING' as any, 
              description: 'Complete localized personalized detailed advisory, fertilizer split schedule, and chemical soil treatment recommendations.' 
            }
          },
          required: ['soilPh', 'organicCarbon', 'nitrogen', 'phosphorus', 'potassium', 'recommendationsMarkdown']
        }
      }
    });

    const outputText = response.text || '{}';
    res.json(JSON.parse(outputText));

  } catch (error: any) {
    console.error('Soil Health Card AI Analyzer Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI Soil Health diagnosis.'
    });
  }
});


// 4. Vite development middleware / Production bundle serving
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware mounted.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static files route mounted.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rythu Sethu Server] Running efficiently on http://localhost:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error('Failed to initialize server:', err);
});
