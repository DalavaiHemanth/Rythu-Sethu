import React, { useState, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Upload, 
  Sparkles, 
  Sliders, 
  CheckCircle, 
  Undo2, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Lightbulb, 
  Trash2, 
  Info,
  Layers,
  ThermometerSnowflake,
  FlaskConical
} from 'lucide-react';
import { LanguageKey } from '../data/translations';

interface SoilHealthCardProps {
  language: LanguageKey;
}

interface SoilValues {
  crop: 'paddy' | 'cotton' | 'chilli' | 'maize';
  soilTexture: 'clay' | 'loamy' | 'sandy';
  pH: number;
  organicCarbon: 'low' | 'medium' | 'high';
  nitrogen: 'low' | 'medium' | 'high';
  phosphorus: 'low' | 'medium' | 'high';
  potassium: 'low' | 'medium' | 'high';
  zincDeficient: boolean;
  ironDeficient: boolean;
  acres: number;
  season: 'kharif' | 'rabi';
}

export default function SoilHealthCard({ language }: SoilHealthCardProps) {
  // Tabs: manual input vs camera/upload card
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  
  // Soil metrics states
  const [soilValues, setSoilValues] = useState<SoilValues>({
    crop: 'paddy',
    soilTexture: 'loamy',
    pH: 7.0,
    organicCarbon: 'medium',
    nitrogen: 'medium',
    phosphorus: 'medium',
    potassium: 'medium',
    zincDeficient: false,
    ironDeficient: false,
    acres: 3,
    season: 'kharif'
  });

  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  // AI response states
  const [isPending, startTransition] = useTransition();
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [aiReport, setAiReport] = useState<{
    soilPh?: number;
    organicCarbon?: string;
    nitrogen?: string;
    phosphorus?: string;
    potassium?: string;
    micronutrientDeficiencies?: string[];
    recommendationsMarkdown?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio/TTS state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic status translations local to Soil card for robustness
  const tl = {
    en: {
      shcTitle: "AI Soil Health Card Advisor",
      shcSubtitle: "Personalize your farm fertilization plan beyond standard ratios. Upload your Soil Health card or input verified lab values for AI diagnostic recommendations.",
      manualTab: "🔬 Manual Lab Report",
      uploadTab: "📸 Upload Card Image",
      cropSelect: "Selected Crop",
      acresLabel: "Land Acres",
      seasonLabel: "Crop Season",
      soilType: "Soil Texture",
      clay: "Black Soil (Regur/నల్ల రేగడి)",
      loamy: "Red Soil (Chalaka/చలక)",
      sandy: "Sandy/Dubba (ఇసుక నేలలు)",
      phLabel: "Soil pH (Acidic/Alkaline Balance)",
      stronglyAcidic: "Strongly Acidic (Amma/ఆమ్ల)",
      acidic: "Moderately Acidic",
      neutral: "Ideal Neutral (సాధారణం)",
      alkaline: "Moderately Alkaline",
      stronglyAlkaline: "Strongly Alkaline (Kshara/క్షార)",
      ocLabel: "Organic Carbon (OC %)",
      low: "Low (< 0.5% - Highly Deficient)",
      medium: "Medium (0.5% - 0.75%)",
      high: "High (> 0.75% - Rich fertility)",
      nLabel: "Available Nitrogen (N)",
      pLabel: "Available Phosphorus (P)",
      kLabel: "Available Potassium (K)",
      micronutrients: "Trace Micronutrient Deficiencies",
      zincDef: "Zinc (Zn) Deficiency (pale/bronzed mid leaf)",
      ironDef: "Iron (Fe) Deficiency (chlorosis/white tops)",
      analyzeBtn: "Analyze Soil & Recommend 🧪",
      analyzing: "AI Analyzing Soil Card...",
      reportTitle: "AI Regionalized Fertilizer Prescription & Amendment",
      listenBtn: "Listen Advice 🔊",
      stopBtn: "Stop Voice 🔇",
      resetBtn: "Clear & Reset 🔄",
      fymComp: "Farmyard Manure / Bio-fertilizer suggested.",
      dropText: "Drag & drop your Soil Health Card photo here, or click to upload",
      orText: "Supports JPG, PNG up to 10MB",
      cardSelected: "Selected image:",
      removeBtn: "Remove photo",
      noResults: "Submit the soil health card parameters to generate a personalized fertilizer plan tailored to Telangana conditions.",
      validationError: "Please enter a valid card input or upload a photo."
    },
    te: {
      shcTitle: "AI సాయిల్ హెల్త్ కార్డ్ సలహాదారు",
      shcSubtitle: "సాధారణ ఎరువుల లెక్కల కంటే అదనంగా మీ నేల సారాన్ని బట్టి ఖచ్చితమైన ప్రణాళిక. మీ భూసార పరీక్ష కార్డు ఫోటోను అప్‌లోడ్ చేయండి లేదా నేరుగా వివరాలు నమోదు చేసి నివేదిక పొందండి.",
      manualTab: "🔬 నేల పరీక్ష వివరాలు",
      uploadTab: "📸 భూసార కార్డు అప్‌లోడ్",
      cropSelect: "సాగు పంట",
      acresLabel: "పొలం పరిమాణం (ఎకరాలు)",
      seasonLabel: "పంట కాలం",
      soilType: "నేల రకం",
      clay: "నల్ల రేగడి నేల (కూడిక)",
      loamy: "చలక / ఇసుక రేగడి నేలలు",
      sandy: "దుబ్బ నేలలు (ఇసుక నేలలు)",
      phLabel: "నేల pH విలువ (ఆమ్లత్వ/క్షారత్వ తీవ్రత)",
      stronglyAcidic: "తీవ్ర ఆమ్లత్వం (pH < 5.5) ⚠️",
      acidic: "మిత ఆమ్లత్వం (pH 5.5 - 6.5)",
      neutral: "సరైన సాధారణ స్థితి (pH 6.5 - 7.5) ✅",
      alkaline: "మిత క్షారత్వం (pH 7.5 - 8.5)",
      stronglyAlkaline: "తీవ్ర క్షారత్వం (pH > 8.5) ⚠️",
      ocLabel: "సేంద్రీయ కర్బనం (OC %)",
      low: "తక్కువ (< 0.5% - ఎరువులు అవసరం)",
      medium: "మధ్యస్థం (0.5% - 0.75%)",
      high: "ఎక్కువ (> 0.75% - సారవంతమైనది)",
      nLabel: "లభ్య నత్రజని (N)",
      pLabel: "లభ్య భాస్వరం (P)",
      kLabel: "లభ్య పొటాషియం (K)",
      micronutrients: "లఘు పోషకాల లోపాలు (ఉంటే గుర్తులను ఓకే చేయండి)",
      zincDef: "జింక్ (Zn) లోపం (ఆకులు తెల్లబడటం/ఇనుము రంగు రావడం)",
      ironDef: "ఇనుము (Fe) లోపం (కొత్తగా వచ్చే ఆకులు పసుపుబారడం)",
      analyzeBtn: "నేల సారాన్ని విశ్లేషించు 🧪",
      analyzing: "AI నేల సారాన్ని విశ్లేషిస్తోంది...",
      reportTitle: "AI ఎరువుల సిఫార్సు & నేల చికిత్స ప్రణాళిక",
      listenBtn: "సలహా వినండి 🔊",
      stopBtn: "ఆపండి 🔇",
      resetBtn: "రీసెట్ చేయండి 🔄",
      fymComp: "సేంద్రీయ గుళికలు లేదా పశువుల పెంట అవసరము.",
      dropText: "భూసార పరీక్ష పత్రం ఫోటోను ఇక్కడ వేయండి లేదా క్లిక్ చేసి సెలెక్ట్ చేయండి",
      orText: "JPG, PNG చిత్రాలకు మాత్రమే మద్దతు ఉంది (గరిష్టంగా 10MB)",
      cardSelected: "ఎంచుకున్న చిత్రం:",
      removeBtn: "చిత్రం తొలగించు",
      noResults: "తెలంగాణ వాతావరణం, పంటల ఆధారంగా మీ నేలకు తగిన ఎరువుల సిఫార్సుల ప్రణాళికను సిద్ధం చేయడానికి వివరాలను నమోదు చేయండి.",
      validationError: "దయచేసి భూసార కార్డు విలువలను నమోదు చేయండి లేదా సరైన ఫోటోను అప్‌లోడ్ చేయండి."
    },
    ur: {
      shcTitle: "سوائل ہیلتھ کارڈ AI مشیر",
      shcSubtitle: "فصل کی پیداوار بڑھانے کے لیے عمومی حساب سے آگے مٹی کی جانچ کے مطابق کھاد کا مشورہ۔ اپنے کارڈ کی تصویر اپ لوڈ کریں یا معلومات کا اندراج کریں۔",
      manualTab: "🔬 مٹی لیبارٹری رپورٹ",
      uploadTab: "📸 سوائل کارڈ اپ لوڈ",
      cropSelect: "منتخب فصل",
      acresLabel: "زمین کا رقبہ (ایکڑ)",
      seasonLabel: "فصل کا موسم",
      soilType: "مٹی کی ساخت",
      clay: "کالی مٹی (ریگوڑ)",
      loamy: "سرخ مٹی (چالاکا)",
      sandy: "ریتیلی مٹی (ڈبا)",
      phLabel: "مٹی کی pH سطح (تیزابیت اور اساس کا تناسب)",
      stronglyAcidic: "شدید تیزابی (pH < 5.5) ⚠️",
      acidic: "معتدل تیزابی (pH 5.5 - 6.5)",
      neutral: "معتدل بہترین (pH 6.5 - 7.5) ✅",
      alkaline: "معتدل اساسی (pH 7.5 - 8.5)",
      stronglyAlkaline: "شدید اساسی (pH > 8.5) ⚠️",
      ocLabel: "نامیاتی کاربن (OC %)",
      low: "کم (< 0.5% - شدید ضرورت)",
      medium: "درمیانہ (0.5% - 0.75%)",
      high: "زیادہ (> 0.75% - انتہائی زرخیز)",
      nLabel: "نائٹروجن (N) کی سطح",
      pLabel: "فاسفورس (P) کی سطح",
      kLabel: "پوٹاشیم (K) کی سطح",
      micronutrients: "مائیکرو غذائی اجزاء کی کمی",
      zincDef: "زنک (Zn) کی کمی (پتے پیلے یا جلی ہوئی لکیریں)",
      ironDef: "آئرن (Fe) کی کمی (پتوں کا سفیدی مائل ہونا)",
      analyzeBtn: "مٹی کا تجزیہ کریں 🧪",
      analyzing: "کھاد کا سائنسی تجزیہ جاری ہے...",
      reportTitle: "AI کھاد کا مشورہ اور مٹی کا علاج",
      listenBtn: "مشورہ سنیں 🔊",
      stopBtn: "آواز بند کریں 🔇",
      resetBtn: "صاف کریں 🔄",
      fymComp: "نامیاتی کھاد یا گوبر کا استعمال تجویز کیا جاتا ہے۔",
      dropText: "اپنے مٹی کی صحت کارڈ کی تصویر یہاں کھینچیں یا فائل تلاش کرنے کے لیے کلک کریں",
      orText: "صرف تصاویر (JPG، PNG) کی گنجائش ہے (زیادہ سے زیادہ 10MB)",
      cardSelected: "منتخب تصویر:",
      removeBtn: "تصویر ہٹائیں",
      noResults: "تیلنگانہ کی مقامی زمین اور فصلوں کے مطابق کھاد کا سائنسی علاج اور ذاتی مشورہ حاصل کرنے کے لیے معلومات درج کریں۔",
      validationError: "براہ کرم مٹی کی جانچ کی معلومات درج کریں یا تصویر اپ لوڈ کریں"
    }
  };

  const cur = tl[language] || tl.en;

  // Render classification helpers based on values
  const getPHStatus = (val: number) => {
    if (val < 5.5) return { text: cur.stronglyAcidic, color: 'text-amber-800 bg-amber-100 border-amber-300' };
    if (val < 6.5) return { text: cur.acidic, color: 'text-orange-700 bg-orange-50 border-orange-200' };
    if (val <= 7.5) return { text: cur.neutral, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (val <= 8.5) return { text: cur.alkaline, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    return { text: cur.stronglyAlkaline, color: 'text-purple-800 bg-purple-100 border-purple-300' };
  };

  const getOCStatus = (oc: 'low' | 'medium' | 'high') => {
    switch(oc) {
      case 'low': return { text: cur.low, color: 'text-rose-800 bg-rose-50 border-rose-200' };
      case 'medium': return { text: cur.medium, color: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'high': return { text: cur.high, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    }
  };

  // Convert uploaded image to base64 for API transmission
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Text-to-Speech execution following strict agricultural rules
  const handleSpeak = (textToSpeak: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any running speech before initiating new
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    // Timeout buffer clear as prescribed by Rythu Sethu rules
    setTimeout(() => {
      // Remove markdown characters and clean up output for speech synthesis
      const cleanText = textToSpeak
        .replace(/[*#`_\-]/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .substring(0, 1200);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Assign fallback voice region code
      if (language === 'te') {
        utterance.lang = 'te-IN';
      } else if (language === 'ur') {
        utterance.lang = 'ur-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      // Query local physical speech systems voices
      const voices = window.speechSynthesis.getVoices();
      let targetVoice = null;
      if (language === 'te') {
        targetVoice = voices.find(v => v.lang.startsWith('te') || v.lang.includes('te-IN'));
      } else if (language === 'ur') {
        targetVoice = voices.find(v => v.lang.startsWith('ur') || v.lang.includes('ur-IN'));
      } else {
        targetVoice = voices.find(v => v.lang.startsWith('en') || v.lang.includes('en-IN') || v.lang.includes('en-US'));
      }

      if (targetVoice) utterance.voice = targetVoice;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  // Run AI processing via server-side endpoint
  const handleAnalyze = () => {
    setErrorMsg(null);
    setAiReport(null);
    
    // Stop any speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Cycle through loader steps to reassure farmers
    const loadingMessagesEn = [
      "Interpreting nitrogen-to-potassium ratios...",
      "Calibrating micro-nutrition requirements...",
      "Configuring soil pH amendment adjustments...",
      "Integrating PJTSAU Agriculture University guidelines..."
    ];
    const loadingMessagesTe = [
      "నత్రజని-భాస్వరం శాతాన్ని లెక్కిస్తోంది...",
      "సూక్ష్మ పోషకాల లోపాలను పరిశీలిస్తోంది...",
      "నేల పి.హెచ్ (pH) సవరణలను సిద్ధం చేస్తోంది...",
      "వ్యవసాయ వర్సిటీ శాస్త్రవేత్తల గైడ్‌లైన్స్‌ను జోడిస్తోంది..."
    ];
    const loadingMessagesUr = [
      "نائٹروجن اور پوٹاشیم کے تناسب کا موازنہ جاری ہے...",
      "مائیکرو غذائی اجزاء کا سائنسی مطالعہ کیا جا رہا ہے...",
      "مٹی کے علاج کا نسخہ تیار ہو رہا ہے...",
      "یونیورسٹی کے زرعی قواعد مرتب کیے جا رہے ہیں..."
    ];

    const messages = language === 'te' ? loadingMessagesTe : language === 'ur' ? loadingMessagesUr : loadingMessagesEn;
    setLoadingStep(messages[0]);
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingStep(messages[index]);
    }, 2200);

    startTransition(async () => {
      try {
        const payload = {
          values: activeTab === 'manual' ? soilValues : null,
          image: activeTab === 'upload' ? imagePreview : null,
          language
        };

        const res = await fetch('/api/analyze-soil-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Server error occured parsing soil metrics.');
        }

        const data = await res.json();
        setAiReport(data);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Unable to complete AI soil health card review.');
      } finally {
        clearInterval(interval);
        setLoadingStep('');
      }
    });
  };

  const handleReset = () => {
    setAiReport(null);
    setErrorMsg(null);
    handleRemoveImage();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Space helper for regional languages
  const getOutputTextStyles = () => {
    if (language === 'te') {
      return 'leading-[1.95] tracking-[0.035em] text-stone-900 text-xs sm:text-sm font-sans whitespace-pre-line';
    } else if (language === 'ur') {
      return 'leading-[1.95] tracking-[0.04em] text-stone-900 text-xs sm:text-sm font-sans whitespace-pre-line';
    } else {
      return 'leading-relaxed text-stone-900 text-xs sm:text-sm font-sans whitespace-pre-line';
    }
  };

  return (
    <div className="bg-transparent space-y-6" id="soil-health-advisory-root">
      {/* Title block */}
      <div className="bg-white p-5 rounded-xl border border-earth-100 text-left space-y-1.5 shadow-3xs">
        <h3 className="text-lg font-display font-black text-crop-900 tracking-tight flex items-center gap-2">
          <FlaskConical className="w-5.5 h-5.5 text-crop-600 animate-pulse animate-duration-3000" />
          {cur.shcTitle}
        </h3>
        <p className={`text-xs text-stone-600 leading-relaxed ${language === 'te' ? 'leading-[1.75]' : ''}`}>
          {cur.shcSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Metric inputs and Uploads form card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-earth-100 text-left space-y-5 shadow-3xs">
          
          {/* Section tab bar */}
          <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200 w-full" id="shc-sub-tabs">
            <button
              onClick={() => { setActiveTab('manual'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 rounded-md text-xs font-bold text-center transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 ${
                activeTab === 'manual' 
                  ? 'bg-crop-600 font-black text-white shadow-3xs' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {cur.manualTab}
            </button>
            <button
              onClick={() => { setActiveTab('upload'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 rounded-md text-xs font-bold text-center transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 ${
                activeTab === 'upload' 
                  ? 'bg-crop-600 font-black text-white shadow-3xs' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              {cur.uploadTab}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'manual' ? (
              <motion.div
                key="manual-entry-block"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {/* Crop select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{cur.cropSelect}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'paddy', label: language === 'te' ? 'వరి (Paddy)' : 'Paddy' },
                      { id: 'cotton', label: language === 'te' ? 'ప్రత్తి (Cotton)' : 'Cotton' },
                      { id: 'chilli', label: language === 'te' ? 'మిరప (Chilli)' : 'Chilli' },
                      { id: 'maize', label: language === 'te' ? 'మొక్కజొన్న (Maize)' : 'Maize' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSoilValues(prev => ({ ...prev, crop: item.id as any }))}
                        className={`py-2 px-1 border rounded text-xs font-sans font-bold text-center cursor-pointer min-h-[44px] transition-all flex items-center justify-center ${
                          soilValues.crop === item.id
                            ? 'bg-crop-50 border-crop-600 text-crop-900 shadow-3xs ring-2 ring-crop-500/10'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Acres + Season row */}
                <div className="grid grid-cols-2 gap-3 pb-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">{cur.acresLabel}</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={soilValues.acres}
                      onChange={(e) => setSoilValues(prev => ({ ...prev, acres: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-crop-500 min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">{cur.seasonLabel}</label>
                    <select
                      value={soilValues.season}
                      onChange={(e) => setSoilValues(prev => ({ ...prev, season: e.target.value as any }))}
                      className="w-full px-2 py-2 border border-stone-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-crop-500 min-h-[44px]"
                    >
                      <option value="kharif">🌾 Vanakalam</option>
                      <option value="rabi">❄️ Yasangi</option>
                    </select>
                  </div>
                </div>

                {/* Texture select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{cur.soilType}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'clay', label: cur.clay },
                      { id: 'loamy', label: cur.loamy },
                      { id: 'sandy', label: cur.sandy }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSoilValues(prev => ({ ...prev, soilTexture: item.id as any }))}
                        className={`p-2 border rounded text-[10px] sm:text-xs font-sans font-semibold text-center cursor-pointer min-h-[44px] transition-all flex flex-col justify-center items-center ${
                          soilValues.soilTexture === item.id
                            ? 'bg-crop-50 border-crop-600 text-crop-900 font-bold shadow-3xs'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-605'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 mb-1 text-stone-500" />
                        <span className="leading-tight">{item.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* pH Slider */}
                <div className="space-y-1.5 p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                    <span className="flex items-center gap-1">🔬 {cur.phLabel}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block border ${getPHStatus(soilValues.pH).color}`}>
                      pH: {soilValues.pH.toFixed(1)} ({getPHStatus(soilValues.pH).text})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4.0}
                    max={10.0}
                    step={0.1}
                    value={soilValues.pH}
                    onChange={(e) => setSoilValues(prev => ({ ...prev, pH: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 my-2"
                  />
                  <div className="flex justify-between text-[9px] font-mono font-bold text-stone-400">
                    <span>4.0 (Amma/Acid)</span>
                    <span>7.0 (Neutral)</span>
                    <span>10.0 (Kshara/Alkaline)</span>
                  </div>
                </div>

                {/* NPK grid picker */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Nitrogen */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-700 block text-center uppercase tracking-wider">{cur.nLabel}</span>
                    <select
                      value={soilValues.nitrogen}
                      onChange={(e) => setSoilValues(prev => ({ ...prev, nitrogen: e.target.value as any }))}
                      className="w-full px-2 py-2 border border-stone-200 rounded-lg text-xs font-bold text-center bg-white min-h-[44px]"
                    >
                      <option value="low">🔴 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟢 High</option>
                    </select>
                  </div>
                  {/* Phosphorus */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-700 block text-center uppercase tracking-wider">{cur.pLabel}</span>
                    <select
                      value={soilValues.phosphorus}
                      onChange={(e) => setSoilValues(prev => ({ ...prev, phosphorus: e.target.value as any }))}
                      className="w-full px-2 py-2 border border-stone-200 rounded-lg text-xs font-bold text-center bg-white min-h-[44px]"
                    >
                      <option value="low">🔴 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟢 High</option>
                    </select>
                  </div>
                  {/* Potassium */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-700 block text-center uppercase tracking-wider">{cur.kLabel}</span>
                    <select
                      value={soilValues.potassium}
                      onChange={(e) => setSoilValues(prev => ({ ...prev, potassium: e.target.value as any }))}
                      className="w-full px-2 py-2 border border-stone-200 rounded-lg text-xs font-bold text-center bg-white min-h-[44px]"
                    >
                      <option value="low">🔴 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟢 High</option>
                    </select>
                  </div>
                </div>

                {/* OC pickers */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-stone-700 block">{cur.ocLabel}</label>
                  <select
                    value={soilValues.organicCarbon}
                    onChange={(e) => setSoilValues(prev => ({ ...prev, organicCarbon: e.target.value as any }))}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-xs font-bold bg-white min-h-[44px]"
                  >
                    <option value="low">🔴 {cur.low}</option>
                    <option value="medium">🟡 {cur.medium}</option>
                    <option value="high">🟢 {cur.high}</option>
                  </select>
                </div>

                {/* Micro Nutrients */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-stone-700 block">✨ {cur.micronutrients}</span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={soilValues.zincDeficient}
                        onChange={(e) => setSoilValues(prev => ({ ...prev, zincDeficient: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-crop-600 focus:ring-crop-500"
                      />
                      <span className="text-[11px] font-semibold text-stone-750">{cur.zincDef}</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={soilValues.ironDeficient}
                        onChange={(e) => setSoilValues(prev => ({ ...prev, ironDeficient: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-crop-600 focus:ring-crop-500"
                      />
                      <span className="text-[11px] font-semibold text-stone-750">{cur.ironDef}</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="image-upload-block"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {/* Crop & Acres selection first so AI knows what to recommend on */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">{cur.cropSelect}</label>
                    <select
                      value={soilValues.crop}
                      onChange={(e) => setSoilValues(prev => ({ ...prev, crop: e.target.value as any }))}
                      className="w-full px-2 py-2 border border-stone-200 rounded-lg text-xs font-bold bg-white min-h-[44px]"
                    >
                      <option value="paddy">🌾 Paddy (వరి)</option>
                      <option value="cotton">🌿 Cotton (ప్రత్తి)</option>
                      <option value="chilli">🌶️ Chilli (మిరప)</option>
                      <option value="maize">🌽 Maize (మొక్కజొన్న)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">{cur.acresLabel}</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={soilValues.acres}
                      onChange={(e) => setSoilValues(prev => ({ ...prev, acres: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono font-bold focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all min-h-[160px] flex flex-col justify-center items-center gap-3 ${
                    isDragActive 
                      ? 'border-crop-600 bg-crop-50/50 scale-[0.99]' 
                      : 'border-stone-300 hover:border-crop-500 bg-stone-50/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                  />
                  <div className="p-3 rounded-full bg-white shadow-3xs border border-stone-150 text-crop-600">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-800 leading-normal">
                      {cur.dropText}
                    </p>
                    <p className="text-[10px] text-stone-400 font-medium">
                      {cur.orText}
                    </p>
                  </div>
                </div>

                {imagePreview && (
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-150 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-stone-550 flex items-center gap-1">
                        🖼️ {cur.cardSelected} {selectedFile?.name.substring(0, 20)}...
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        {cur.removeBtn}
                      </button>
                    </div>
                    <div className="aspect-[3/2] w-full rounded-lg overflow-hidden border border-stone-200 shadow-3xs bg-black flex items-center justify-center">
                      <img 
                        src={imagePreview} 
                        alt="Soil analysis candidate" 
                        referrerPolicy="no-referrer"
                        className="max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation indicators */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-semibold text-rose-700 flex gap-1.5 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-normal">{errorMsg}</p>
            </div>
          )}

          {/* Action trigger button */}
          <button
            type="button"
            id="shc-analyze-btn"
            onClick={handleAnalyze}
            disabled={isPending || (activeTab === 'upload' && !imagePreview)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black transition-all cursor-pointer border min-h-[44px] shadow-3xs hover:-translate-y-0.5 active:translate-y-0 ${
              isPending || (activeTab === 'upload' && !imagePreview)
                ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-crop-600 hover:bg-crop-700 active:bg-crop-800 text-white border-crop-700'
            }`}
          >
            {isPending ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-crop-200" />
                <span>{cur.analyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{cur.analyzeBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Diagnostic Results Card Area */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div
                key="loading-shc-report-block"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white p-6 rounded-xl border border-stone-200 text-center min-h-[350px] flex flex-col justify-center items-center space-y-4 shadow-3xs"
              >
                {/* Simulated chemical lab progress ring */}
                <div className="relative flex justify-center items-center">
                  <div className="w-16 h-16 border-4 border-crop-110 border-t-crop-600 rounded-full animate-spin" />
                  <div className="absolute text-xl animate-bounce">🧪</div>
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-mono font-black text-crop-800 tracking-widest uppercase">
                    Analyzing Sample parameters
                  </h4>
                  <p className="text-xs font-bold text-stone-705 leading-relaxed min-h-[40px]">
                    {loadingStep}
                  </p>
                </div>
              </motion.div>
            ) : aiReport ? (
              <motion.div
                key="shc-results-report"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#fefcf6] border border-emerald-300 p-5 sm:p-6 rounded-xl text-left space-y-5 shadow-sm"
              >
                {/* Header diagnostic tags line */}
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-emerald-200 pb-3.5">
                  <div className="space-y-1">
                    <h4 className="text-sm font-sans font-black text-[#064e3b] tracking-tight uppercase flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {cur.reportTitle}
                    </h4>
                    <p className="text-[10px] font-mono text-stone-500 font-bold">
                      🧑‍🌾 Crop: {soilValues.crop.toUpperCase()} • Area: {soilValues.acres} Acre(s) • Season: {soilValues.season.toUpperCase()}
                    </p>
                  </div>
                  
                  {/* Action row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeak(aiReport.recommendationsMarkdown || '')}
                      className={`min-h-[44px] px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-3xs ${
                        isSpeaking 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 shrink-0" />
                          <span>{cur.stopBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 shrink-0" />
                          <span>{cur.listenBtn}</span>
                        </>
                      )}
                    </button>
                    {/* Clear report trigger */}
                    <button
                      onClick={handleReset}
                      className="min-h-[44px] px-3 border border-stone-250 bg-white hover:bg-stone-50 rounded-lg text-xs font-bold text-stone-700 cursor-pointer shadow-3xs shrink-0"
                    >
                      {cur.resetBtn.split(' ')[0]}
                    </button>
                  </div>
                </div>

                {/* Extracted Nutrient Badges Block */}
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2" id="extracted-nutrient-badges">
                  <div className="p-2.5 rounded-lg border border-emerald-250 bg-white shadow-3xs text-center space-y-0.5">
                    <span className="text-[9px] font-bold text-stone-500 block uppercase">Soil pH</span>
                    <span className="text-xs font-mono font-black text-[#064e3b] block">
                      {aiReport.soilPh || soilValues.pH}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-emerald-250 bg-white shadow-3xs text-center space-y-0.5">
                    <span className="text-[9px] font-bold text-stone-500 block uppercase">Carbon (OC)</span>
                    <span className="text-xs font-sans font-black text-[#064e3b] uppercase block">
                      {aiReport.organicCarbon || soilValues.organicCarbon}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-emerald-250 bg-white shadow-3xs text-center space-y-0.5">
                    <span className="text-[9px] font-bold text-stone-500 block uppercase">Nitrogen (N)</span>
                    <span className="text-xs font-sans font-black text-[#064e3b] uppercase block">
                      {aiReport.nitrogen || soilValues.nitrogen}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-emerald-250 bg-white shadow-3xs text-center space-y-0.5">
                    <span className="text-[9px] font-bold text-stone-500 block uppercase">Phosphorus (P)</span>
                    <span className="text-xs font-sans font-black text-[#064e3b] uppercase block">
                      {aiReport.phosphorus || soilValues.phosphorus}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-emerald-250 bg-white shadow-3xs text-center space-y-0.5 col-span-2 xs:col-span-1">
                    <span className="text-[9px] font-bold text-stone-500 block uppercase">Potassium (K)</span>
                    <span className="text-xs font-sans font-black text-[#064e3b] uppercase block">
                      {aiReport.potassium || soilValues.potassium}
                    </span>
                  </div>
                </div>

                {/* Display Deficiencies found */}
                {((aiReport.micronutrientDeficiencies && aiReport.micronutrientDeficiencies.length > 0) || 
                  (activeTab === 'manual' && (soilValues.zincDeficient || soilValues.ironDeficient))) && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 text-stone-850 rounded-lg flex items-start gap-2.5 text-xs font-medium">
                    <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
                    <div>
                      <strong>Deficiencies Noted: </strong>
                      {activeTab === 'manual' ? (
                        <span>
                          {soilValues.zincDeficient && "Zinc (Zn)"}
                          {soilValues.zincDeficient && soilValues.ironDeficient && " & "}
                          {soilValues.ironDeficient && "Iron (Fe)"}
                        </span>
                      ) : (
                        <span>{aiReport.micronutrientDeficiencies?.join(', ')}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Markdown recommendations output text styled with loose spatial bounds for regional readability */}
                <div className="p-3 font-sans space-y-2 max-h-[500px] overflow-y-auto border border-emerald-100 rounded-lg bg-white/60">
                  <p className={getOutputTextStyles()}>
                    {aiReport.recommendationsMarkdown}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-shc-advice-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-xl border border-stone-250/80 min-h-[350px] flex flex-col justify-center items-center space-y-4 text-center text-stone-500 shadow-3xs"
              >
                <div className="p-4 rounded-full bg-stone-50 text-stone-400">
                  <FlaskConical className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-mono font-black text-stone-405 uppercase tracking-widest">
                    No active sample diagnostics
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-sans">
                    {cur.noResults}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
