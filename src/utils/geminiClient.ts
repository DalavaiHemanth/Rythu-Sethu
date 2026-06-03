import { SCHEMES, CENTERS } from '../data/staticData';
import { UploadedDoc, Message } from '../types';

// Default static documents in case local storage is empty
const DEFAULT_DOCUMENTS: UploadedDoc[] = [
  {
    id: 'go_1',
    title: 'Telangana Rythu Bharosa Operational Guidelines 2026',
    content:
      'AGRICULTURE & COOPERATION DEPARTMENT - Rythu Bharosa scheme is improved to provide input subsidy support of Rs. 15,000 per acre per year (divided equally in two terms: Rs. 7,500 for Kharif and Rs. 7,500 for Rabi). Landowners registered under the Pattadar database of the Dharani Portal are fully covered. Tenancy systems are audited by village secretaries for additional support. Funds will be directly disbursed through DBT into Bank accounts linked with Aadhaar cards.',
    uploadDate: '2026-04-12T10:00:00Z',
    charCount: 428,
  },
  {
    id: 'go_2',
    title: 'Government Circular on Paddy Crop Pests & Zinc Deficiencies',
    content:
      'AGRI ADVISORY PANEL TELANGANA: Recent heavy clay soil settings in Nizamabad, Siddipet, and Suryapet have shown widespread iron and zinc deficiencies in Paddy crop (leaves turning pale yellow or bronze, growth retardation, especially between 40-70 days of transplantation). Farmers are advised to spray Zinc Sulphate (Chelated Zn) at 2g per liter of water. Ensure proper drainage. Subsidies for micro-nutrient fertilizers are registered under local Rythu Vedikas.',
    uploadDate: '2026-05-18T14:30:00Z',
    charCount: 412,
  },
];

// 1. API Key Accessors
export function getGeminiApiKey(): string | null {
  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('rythu_sethu_gemini_api_key');
    if (savedKey && savedKey.trim() !== '') {
      return savedKey.trim();
    }
  }
  // Check the baked env variable from build time
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }
  return null;
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rythu_sethu_gemini_api_key', key.trim());
  }
}

export function clearGeminiApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rythu_sethu_gemini_api_key');
  }
}

// 2. Documents/RAG storage manager with Local Storage resilience
export async function getDocuments(): Promise<UploadedDoc[]> {
  try {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.log(
      'Backend not available or failed fetching docs, falling back to client localStorage:',
      err
    );
  }

  // Local storage fallback for static deployments (e.g. GitLab Pages)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rythu_sethu_custom_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_DOCUMENTS;
      }
    } else {
      localStorage.setItem(
        'rythu_sethu_custom_docs',
        JSON.stringify(DEFAULT_DOCUMENTS)
      );
      return DEFAULT_DOCUMENTS;
    }
  }
  return DEFAULT_DOCUMENTS;
}

export async function uploadDocument(
  title: string,
  content: string,
  id?: string
): Promise<UploadedDoc> {
  const payload = { id, title, content };

  // Try server first
  try {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.log(
      'Backend upload failed, processing on local storage fallback:',
      err
    );
  }

  // Local storage fallback execution
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rythu_sethu_custom_docs');
    let docs: UploadedDoc[] = saved
      ? JSON.parse(saved)
      : [...DEFAULT_DOCUMENTS];

    if (id) {
      const idx = docs.findIndex((d) => d.id === id);
      if (idx !== -1) {
        docs[idx] = {
          ...docs[idx],
          title,
          content,
          uploadDate: new Date().toISOString(),
          charCount: content.length,
        };
        localStorage.setItem('rythu_sethu_custom_docs', JSON.stringify(docs));
        return docs[idx];
      }
    }

    const newDoc: UploadedDoc = {
      id: `go_${Date.now()}`,
      title,
      content,
      uploadDate: new Date().toISOString(),
      charCount: content.length,
    };
    docs.push(newDoc);
    localStorage.setItem('rythu_sethu_custom_docs', JSON.stringify(docs));
    return newDoc;
  }
  throw new Error('Fallback storage not available.');
}

export async function deleteDocument(id: string): Promise<boolean> {
  // Try server first
  try {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.log(
      'Backend deletion failed, matching on local storage fallback:',
      err
    );
  }

  // Local storage fallback execution
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rythu_sethu_custom_docs');
    if (saved) {
      let docs: UploadedDoc[] = JSON.parse(saved);
      docs = docs.filter((d) => d.id !== id);
      localStorage.setItem('rythu_sethu_custom_docs', JSON.stringify(docs));
      return true;
    }
  }
  return false;
}

// Helper to construct PJTSAU system instructions for chat
async function buildChatSystemInstruction(
  quizAnswers: Record<string, boolean> | null,
  locationInfo: { district?: string } | undefined,
  language: 'te' | 'en' | 'ur'
): Promise<string> {
  const docs = await getDocuments();

  return `You are "Rythu Sethu", a legendary, multi-lingual, friendly agriculture expert chatbot and scheme eligibility officer for Telangana's farmers.
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
${docs.map((d) => `Document: "${d.title}" - Uploaded ${d.uploadDate}:\n${d.content}`).join('\n\n')}

Current Farmer's Profile (if known from the eligibility quiz):
${quizAnswers ? `Quiz results: Resident of Telangana? ${quizAnswers.isResident ? 'YES' : 'NO'}. Landowner/Pattadar? ${quizAnswers.isLandowner ? 'YES' : 'NO'}. Small & Marginal Farmer (Owns <= 5 acres)? ${quizAnswers.isSmallFarmer ? 'YES' : 'NO'}. Outstanding short-term crop loans? ${quizAnswers.hasCropLoan ? 'YES' : 'NO'}. Interested in micro-irrigation subsidies & water saving? ${quizAnswers.needsInsurance ? 'YES' : 'NO'}.` : 'Quiz results: Not completed yet.'}

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
4. When they upload a leaf photo, examine it with your visual capability and diagnose what plant health conditions or pest infestations you observe in the picture. Tell them clearly what you diagnosed.
5. If they ask about a custom policy, check the uploaded Government Orders (GOs) context carefully.
6. Mention at least one local contact or Rythu Vedika center if applicable.`;
}

// Helper to construct PJTSAU system instructions for Soil Health Card
function buildSoilSystemInstruction(
  crop: string,
  acres: number,
  language: 'te' | 'en' | 'ur'
): string {
  return `You are a legendary Telangana State Soil Chemist and Senior Agricultural Advisor from PJTSAU University (Professor Jayashankar Telangana State Agricultural University).
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
}

// 3. Main Chat Core (Hybrid routing)
export async function generateChatResponse(params: {
  messages: Message[];
  quizAnswers?: Record<string, boolean>;
  locationInfo?: { district?: string };
  language?: 'te' | 'en' | 'ur';
}): Promise<{ reply: string }> {
  const apiKey = getGeminiApiKey();
  const isStaticPlatform =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('gitlab.io') ||
      window.location.hostname.includes('github.io') ||
      (window.location.hostname.includes('localhost') === false &&
        !window.location.hostname.includes('run.app')));

  // Attempt backend FIRST only if we are NOT on a static platform AND we do not have a client-configured API key
  if (!isStaticPlatform && !apiKey) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.log(
        'Express API backend unreachable, falling back to direct client REST API:',
        err
      );
    }
  }

  // Fallback: Direct call to Google Developer Gemini REST API
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not defined. Please enter your Gemini API Key in the settings panel (Key icon at the top) to enable AI advisory on GitLab Pages.'
    );
  }

  const systemInstruction = await buildChatSystemInstruction(
    params.quizAnswers || null,
    params.locationInfo,
    params.language || 'te'
  );

  // Process history messages into Google REST format
  const restContents = params.messages.map((msg) => {
    const parts: any[] = [];
    if (msg.image) {
      const base64Data = msg.image.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = msg.image.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }
    parts.push({ text: msg.content });
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts,
    };
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: restContents,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message || 'Gemini API transaction returned an error.';
    throw new Error(`Gemini API Error: ${message}`);
  }

  const result = await response.json();
  const reply =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Sorry, no diagnostic response was received.';
  return { reply };
}

// 4. Main Soil Health Analyzer Core (Hybrid routing)
export async function generateSoilCardAnalysis(params: {
  values: any | null;
  image: string | null;
  language?: 'te' | 'en' | 'ur';
}): Promise<any> {
  const apiKey = getGeminiApiKey();
  const isStaticPlatform =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('gitlab.io') ||
      window.location.hostname.includes('github.io') ||
      (window.location.hostname.includes('localhost') === false &&
        !window.location.hostname.includes('run.app')));

  // Attempt backend FIRST only if we are NOT on a static platform AND we do not have a client-configured API key
  if (!isStaticPlatform && !apiKey) {
    try {
      const res = await fetch('/api/analyze-soil-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.log(
        'Express Soil API backend unreachable, falling back to direct client REST API:',
        err
      );
    }
  }

  // Fallback: Direct call to Google Developer Gemini REST API
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not defined. Please enter your Gemini API Key in the settings panel (Key icon at the top) to enable AI soil diagnosis on GitLab Pages.'
    );
  }

  const crop = params.values?.crop || 'paddy';
  const acres = params.values?.acres || 3;
  const systemInstruction = buildSoilSystemInstruction(
    crop,
    acres,
    params.language || 'te'
  );

  let promptText = '';
  let contents: any[] = [];

  if (params.values) {
    const {
      soilTexture,
      pH,
      organicCarbon,
      nitrogen,
      phosphorus,
      potassium,
      zincDeficient,
      ironDeficient,
    } = params.values;
    promptText = `Provide tailored scientific fertilizer recommendations for ${acres} acres of ${crop} under Telangana agricultural soil patterns.
    The soil health card lab metrics entered manually by the farmer are:
    - Soil Texture / Type: ${soilTexture === 'clay' ? 'Regur / Clay soil' : soilTexture === 'loamy' ? 'Chalaka / Loamy soil' : 'Dubba / Sandy soil'}
    - Soil pH balance: ${pH}
    - Organic Carbon (OC%): ${organicCarbon}
    - Available Lab Nitrogen (N): ${nitrogen}
    - Available Lab Phosphorus (P): ${phosphorus}
    - Available Lab Potassium (K): ${potassium}
    - Secondary Trace Micronutrient deficiencies: ${zincDeficient ? 'Zinc (Zn) deficiency confirmed' : 'None'}, ${ironDeficient ? 'Iron (Fe) deficiency confirmed' : 'None'}.`;
  } else {
    promptText = `Analyze this uploaded image of a Telangana Soil Health Card document/slip.
    1. Carefully scan the labels, numerical grids, and chemical findings.
    2. Extract and parse parameters: Soil pH, Organic Carbon (OC), Nitrogen (N), Phosphorus (P), Potassium (K), and trace micronutrients like Zinc (Zn) and Iron (Fe).
    3. For the crop type of "${crop}" and land size of ${acres} acres, produce a customized fertilizer dosage recommendation. Use standard PJTSAU University guidelines.`;
  }

  if (params.image) {
    const base64Data = params.image.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = params.image.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
    contents.push({
      inlineData: {
        mimeType,
        data: base64Data,
      },
    });
  }

  contents.push({ parts: [{ text: promptText }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            ...(params.image
              ? [
                  {
                    inlineData: {
                      mimeType:
                        params.image.match(/^data:([^;]+);/)?.[1] ||
                        'image/jpeg',
                      data: params.image.replace(
                        /^data:image\/\w+;base64,/,
                        ''
                      ),
                    },
                  },
                ]
              : []),
            { text: promptText },
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.5,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            soilPh: {
              type: 'NUMBER',
              description: 'The absolute soil pH value extracted or provided.',
            },
            organicCarbon: {
              type: 'STRING',
              description:
                'Organic carbon content parsed or provided: low, medium, high.',
            },
            nitrogen: {
              type: 'STRING',
              description: 'Available Nitrogen (N) rating: low, medium, high.',
            },
            phosphorus: {
              type: 'STRING',
              description:
                'Available Phosphorus (P) rating: low, medium, high.',
            },
            potassium: {
              type: 'STRING',
              description: 'Available Potassium (K) rating: low, medium, high.',
            },
            micronutrientDeficiencies: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description:
                'Micronutrients deficient like Zinc, Iron, Sulphur, Boron',
            },
            recommendationsMarkdown: {
              type: 'STRING',
              description:
                'Complete localized personalized detailed advisory, fertilizer split schedule, and chemical soil treatment recommendations.',
            },
          },
          required: [
            'soilPh',
            'organicCarbon',
            'nitrogen',
            'phosphorus',
            'potassium',
            'recommendationsMarkdown',
          ],
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      'Gemini API soil card analysis transaction failed.';
    throw new Error(`Gemini API Error: ${message}`);
  }

  const result = await response.json();
  const replyRaw = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!replyRaw) {
    throw new Error('Failed to parse diagnostic JSON result from Gemini.');
  }

  return JSON.parse(replyRaw);
}
