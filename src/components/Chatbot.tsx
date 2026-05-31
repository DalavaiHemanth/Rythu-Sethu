import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Volume2, VolumeX, Image, RefreshCw, Sparkles, User, AlertCircle, Trash2, Camera, Compass, Copy, Check } from 'lucide-react';
import { TRANSLATIONS, LanguageKey } from '../data/translations';
import { Message } from '../types';

interface ChatbotProps {
  language: LanguageKey;
  quizAnswers: Record<string, boolean> | null;
  selectedDistrict: string;
}

export default function Chatbot({ language, quizAnswers, selectedDistrict }: ChatbotProps) {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(language),
      language: language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Accessibility state for elder farmers reading intricate scripts
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadedDocsCount, setLoadedDocsCount] = useState<number>(2);

  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLoadedDocsCount(data.length);
        }
      })
      .catch((err) => console.error('Error fetching docs count for sidebar:', err));
  }, []);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const getMessageTextClass = (isTe: boolean, size: 'sm' | 'md' | 'lg' | 'xl') => {
    if (isTe) {
      switch (size) {
        case 'sm': return 'text-[13px] leading-relaxed font-telugu font-semibold text-stone-850';
        case 'md': return 'text-[16px] leading-relaxed font-telugu font-semibold text-stone-900';
        case 'lg': return 'text-[19px] leading-relaxed font-telugu font-bold text-stone-950 border-l-2 border-crop-200 pl-3 bg-crop-50/10 py-0.5';
        case 'xl': return 'text-[22px] leading-relaxed font-telugu font-black text-stone-950 border-l-2 border-crop-600 pl-3 bg-crop-50/20 py-1';
      }
    } else {
      switch (size) {
        case 'sm': return 'text-[11px] leading-relaxed font-sans font-medium text-stone-700';
        case 'md': return 'text-xs md:text-sm leading-relaxed font-sans font-semibold text-stone-850';
        case 'lg': return 'text-sm md:text-base leading-relaxed font-sans font-bold text-stone-900';
        case 'xl': return 'text-base md:text-lg leading-relaxed font-sans font-bold text-stone-950';
      }
    }
  };

  // Dynamic welcome message loader
  function getWelcomeMessage(lang: LanguageKey): string {
    const texts = {
      en: "Namaste! I am Rythu Sethu, your personal agri-expert chatbot. Ask me crop issues, Telangana schemes (like Rythu Bharosa or Rythu Bima), or attach crop leaves photos for analysis!",
      te: "నమస్తే రైతు సోదరులకు! నేను మీ రైతు సేతు వ్యవసాయ సలహాదారును. మీ పంటల సమస్యలు, తెలంగాణ పథకాల అర్హత గురించి అడగండి లేదా తెగుళ్ళు గుర్తించడానికి ఆకుల ఫోటోలను పంపించండి!",
      ur: "نمستے! زرعی ماہر چیٹ بوٹ ریتھو سیتھو میں خوش آمدید۔ مجھ سے اپنی فصلوں، کھادوں، تلنگانہ حکومت کی اسکیموں جیسے ریتھو بھروسہ کے بارے میں کچھ بھی پوچھیں۔"
    };
    return texts[lang];
  }

  // Handle auto-scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Read Aloud Text (Speech Synthesis)
  const speakText = (text: string, msgLanguage?: LanguageKey, isAutoPlay: boolean = false) => {
    if (!window.speechSynthesis) return;
    if (isAutoPlay && !isSoundOn) return;

    // Clear previous audio
    window.speechSynthesis.cancel();

    // Clean text from markdown characters for better pronunciation
    const cleanText = text
      .replace(/[*#_~`\[\]()]/g, '')
      .replace(/&nbsp;/g, ' ')
      .substring(0, 350); // Truncate read lengths for farmer safety

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose voice locales based on the appropriate language
    const speechLang = msgLanguage || language;
    if (speechLang === 'te') {
      utterance.lang = 'te-IN';
    } else if (speechLang === 'ur') {
      utterance.lang = 'ur-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // Attempt to match system voices accurately if available
    if (window.speechSynthesis.getVoices) {
      const voices = window.speechSynthesis.getVoices();
      const prefix = speechLang === 'te' ? 'te' : speechLang === 'ur' ? 'ur' : 'en';
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.rate = 0.95; // Slightly slower for elderly farmer comfort

    // Timeout delay resolves the typical Chrome/Webkit TTS lock Bug after cancel()
    setTimeout(() => {
      if (window.speechSynthesis) {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      }
    }, 50);
  };

  // Sound toggler
  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
    if (isSoundOn && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setErrorMessage(t.voiceMuteAlert);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  // Native Web Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Target appropriate recognition locale
      if (language === 'te') rec.lang = 'te-IN';
      else if (language === 'ur') rec.lang = 'ur-IN';
      else rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setErrorMessage('Speech input could not be processed. Please check mic permissions or type manually.');
        setIsListening(false);
        setTimeout(() => setErrorMessage(null), 4000);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const handleMicPress = () => {
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not fully supported on this device/browser. Please type your query.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Photo uploads
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Photo size exceeds 10MB limit. Please select a compressed image file.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachedImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit chat message to the Express server API holding secure Gemini
  const handleSendMessage = async (customText?: string) => {
    const finalContent = customText || input;
    if (!finalContent.trim() && !image) return;

    // Reset input states
    setInput('');
    const attachedImage = image;
    setImage(null);

    const userMessage: Message = {
      id: `m_${Date.now()}`,
      role: 'user',
      content: finalContent,
      language: language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: attachedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const messageHistory = [...messages, userMessage];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageHistory,
          quizAnswers: quizAnswers || undefined,
          locationInfo: selectedDistrict ? { district: selectedDistrict } : undefined,
          language: language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Server returned an error answering your advice request.');
      }

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: `m_${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply,
        language: language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Auto speak aloud if audio is on
      speakText(data.reply, language, true);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Connecting to backend agri-server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send Preset sample queries instantly
  const handlePresetClick = (text: string) => {
    handleSendMessage(text);
  };

  // Clear Chats
  const clearChatLogs = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(language),
        language: language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-transparent h-full min-h-[580px]" id="chatbot-component">
      
      {/* Sample presets panel */}
      <div className="lg:col-span-3 space-y-4 text-left hidden lg:block">
        <div className="bg-white p-5 rounded-xl border border-earth-100 shadow-xs">
          <h3 className="text-xs font-mono font-bold text-stone-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-crop-600" />
            {t.sampleQTitle}
          </h3>
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {[t.sampleQ1, t.sampleQ2, t.sampleQ3, t.sampleQ4, (t as any).sampleQ5, (t as any).sampleQ6, (t as any).sampleQ7]
              .filter(Boolean)
              .map((qText, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(qText)}
                  className={`w-full text-left bg-stone-50 hover:bg-crop-50 hover:text-crop-900 hover:border-crop-200 p-2.5 rounded-lg border border-earth-100 transition-all leading-snug font-medium cursor-pointer ${
                    language === 'te' ? 'text-[12.5px] font-telugu' : 'text-[11px] font-sans'
                  }`}
                >
                  {qText}
                </button>
              ))}
          </div>
        </div>

        {/* Farmer Dashboard Side Panel info */}
        <div className="bg-crop-900 text-white p-5 rounded-xl border border-crop-950 shadow-xs text-xs space-y-2">
          <p className="font-mono text-crop-200 uppercase text-[9px] tracking-wider">🌾 Active Farm Profile</p>
          <div className="space-y-1.5 text-[11px] text-stone-200">
            <p>• District Context: <span className="font-bold text-white uppercase">{selectedDistrict || "Not Selected"}</span></p>
            <p>• Eligibility Card: <span className="font-bold text-white uppercase">{quizAnswers ? "Filled" : "Not Done"}</span></p>
            <p>• Speech Read Aloud: <span className="font-bold text-white uppercase">{isSoundOn ? "Active" : "Silent"}</span></p>
            <p>• Gov Orders (RAG): <span className="font-bold text-white uppercase">{loadedDocsCount} loaded</span></p>
          </div>
        </div>
      </div>

      {/* Main chat center */}
      <div className="lg:col-span-9 flex flex-col justify-between bg-white rounded-xl border border-earth-100 overflow-hidden shadow-xs h-full min-h-[540px]">
        
        {/* Header Controls */}
        <div className="px-5 py-4 border-b border-earth-100 bg-earth-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crop-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-crop-600"></span>
            </span>
            <div>
              <h2 className="text-sm font-display font-medium text-crop-900">{t.chatTab}</h2>
              <p className="text-[10px] text-stone-500 font-mono">Model: Gemini Flash v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Button */}
            <button
              onClick={clearChatLogs}
              className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-colors"
              title="Clear conversation logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                isSoundOn
                  ? 'bg-crop-50 border-crop-200 text-crop-700 hover:bg-crop-100'
                  : 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
              }`}
              title={isSoundOn ? t.audioOn : t.audioOff}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Typography & Accessibility Settings Dashboard */}
        <div className="px-5 py-2.5 bg-stone-50/95 border-b border-earth-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium text-stone-600 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <span>🌾</span>
              <span>
                {language === 'te' ? 'అక్షరాల సైజు' : language === 'ur' ? 'حروف کا سائز' : 'Text Size'}:
              </span>
            </span>
            <div className="inline-flex rounded-md p-0.5 bg-stone-200 border border-stone-300/35">
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setTextSize(sz)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all tracking-wider cursor-pointer ${
                    textSize === sz
                      ? 'bg-crop-600 text-white shadow-3xs font-extrabold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/30'
                  }`}
                >
                  {sz === 'sm' ? (language === 'te' ? 'చిన్నది' : 'S') :
                   sz === 'md' ? (language === 'te' ? 'సాధారణ' : 'M') :
                   sz === 'lg' ? (language === 'te' ? 'పెద్దది' : 'L') :
                   (language === 'te' ? 'అతి పెద్దది' : 'XL')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-crop-800 font-sans font-medium px-2 py-0.5 rounded-md bg-crop-50 border border-crop-150/40 leading-normal">
              💡 {language === 'te' ? 'తెలుగు అక్షరాలు స్పష్టంగా చదవడానికి సహాయపడుతుంది' : language === 'ur' ? 'اردو پڑھنے میں آسان رہنمائی' : 'Optimized for senior farmer reading clarity'}
            </span>
          </div>
        </div>

        {/* Scrolling Chat log area */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 max-h-[380px] custom-scrollbar bg-earth-50/10">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Role Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs shrink-0 ${
                      isUser
                        ? 'bg-crop-900 border-crop-950 text-white'
                        : 'bg-crop-600 border-crop-800 text-white'
                    }`}>
                      {isUser ? <User className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5 animate-pulse" />}
                    </div>

                    {/* Chat Bubble Body */}
                    <div className="space-y-1.5 flex-1 max-w-[88%]">
                      <div className={`p-4 rounded-xl relative group/bubble transition-all ${
                        isUser
                          ? 'bg-crop-600 text-white rounded-tr-none text-right shadow-xs'
                          : 'bg-white text-stone-800 border border-earth-100 rounded-tl-none pr-8 text-left shadow-2xs hover:border-earth-200'
                      }`}>
                        
                        {/* Copy and Speak out visual actions */}
                        {!isUser && (
                          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/bubble:opacity-100 transition-all">
                            <button
                              onClick={() => speakText(msg.content, msg.language)}
                              className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 hover:text-emerald-800 transition-all cursor-pointer shadow-3xs"
                              title="Speak advice aloud"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopyText(msg.content, msg.id)}
                              className="p-1.5 rounded-md bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-400 hover:text-crop-800 transition-all cursor-pointer shadow-3xs"
                              title="Copy advice text"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Attached Image insidebubble */}
                        {msg.image && (
                          <div className="mb-3 rounded-lg overflow-hidden border border-earth-100 bg-stone-100 max-w-sm">
                            <img
                              src={msg.image}
                              alt="Crop leaves diagnostics thumbnail"
                              className="object-cover w-full max-h-48"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <RichText 
                          content={msg.content} 
                          language={msg.language} 
                          textSize={textSize}
                          isUser={isUser}
                        />
                      </div>
                      
                      <div className={`text-[9px] font-mono text-stone-500 uppercase px-2 flex gap-2 items-center ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.timestamp}</span>
                        <span>•</span>
                        <span>{msg.language === 'te' ? 'Telugu' : msg.language === 'ur' ? 'Urdu' : 'English'}</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}

            {/* AI Assistant Loading state indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start w-full"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-crop-50/50 border border-crop-200/50 text-crop-600 shrink-0">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white text-stone-400 text-xs font-mono py-3 px-5 rounded-lg rounded-tl-none border border-earth-100 animate-pulse text-left">
                    Rythu Sethu is formulating crop plan & subsidy advice...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dummy bottom node */}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Area Form & Logs overlays */}
        <div className="p-4 border-t border-earth-100 bg-earth-50/20 space-y-3">
          
          {/* Diagnostic upload strip preview */}
          {image && (
            <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-earth-100 text-xs text-stone-700 w-fit max-w-[280px]">
              <div className="w-10 h-10 rounded-md overflow-hidden border border-earth-100 shrink-0 bg-stone-50">
                <img src={image} alt="crop-attached-preview" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              </div>
              <div className="truncate flex-1">
                <p className="font-semibold text-stone-800 tracking-tight text-[11px]">{t.photoTip}</p>
                <button onClick={removeAttachedImage} className="text-[10px] text-red-500 hover:underline font-bold mt-0.5 pointer-events-auto">Remove Photo</button>
              </div>
            </div>
          )}

          {/* Voice status banner or Custom Alerts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2.5 bg-crop-50 border border-crop-100 rounded-lg text-xs flex items-center gap-2 text-stone-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-crop-600 animate-bounce" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}

            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-crop-900 text-white rounded-lg text-xs flex items-center justify-between gap-4 border border-crop-950 font-medium"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {t.listening}
                </span>
                <button onClick={() => recognitionRef.current?.stop()} className="text-[10px] uppercase font-mono px-2 py-1 tracking-wider text-crop-200 border border-crop-700 bg-crop-950 rounded hover:text-white cursor-pointer">
                  Stop Recording
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            {/* Mic voice button */}
            <button
              id="btn-voice-mic"
              onClick={handleMicPress}
              className={`p-3 relative rounded-lg flex items-center justify-center transition-all border shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-red-550 text-white border-red-600 shadow-md scale-115'
                  : 'bg-stone-100 hover:bg-stone-250 border-stone-200 text-stone-700'
              }`}
              title={t.speakBtn}
            >
              <Mic className="w-5 h-5" />
              {isListening && (
                <span className="absolute -inset-1 rounded-lg border-2 border-red-400 blur-xs animate-ping pointer-events-none" />
              )}
            </button>

            {/* Leaf/Image Camera Upload */}
            <button
              id="btn-upload-leaf-photo"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-stone-100 hover:bg-stone-150 border border-stone-200 rounded-lg flex items-center justify-center shrink-0 transition-transform cursor-pointer"
              title="Upload leaf photo for visual diagnostic"
            >
              <Camera className="w-5 h-5 text-stone-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {/* Text InputBox */}
            <input
              id="chat-text-input"
              type="text"
              className="flex-1 bg-white border border-earth-100 rounded-lg py-3 px-4 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-crop-600 focus:border-crop-700 shadow-2xs leading-relaxed"
              placeholder={t.typePlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={isLoading || isListening}
            />

            {/* Send Button */}
            <button
              id="btn-send-message"
              onClick={() => handleSendMessage()}
              disabled={isLoading || isListening || (!input.trim() && !image)}
              className="p-3 bg-crop-600 hover:bg-crop-700 active:bg-crop-800 disabled:bg-stone-100 disabled:text-stone-400 text-white rounded-lg transition-all shadow-sm shrink-0 font-bold border-b-2 border-crop-800 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

interface RichTextProps {
  content: string;
  language: LanguageKey;
  textSize: 'sm' | 'md' | 'lg' | 'xl';
  isUser: boolean;
}

function RichText({ content, language, textSize, isUser }: RichTextProps) {
  const isUr = language === 'ur';
  const isTe = language === 'te';
  const isSpecial = isTe || isUr;

  // Custom typography styles for Telugu/Urdu vs English
  // We apply increased line-height (leading-[1.95] or [1.9]) and larger character/letter spacing (tracking-[0.03em]) for better legibility on low-resolution mobile devices
  const baseClasses = isTe 
    ? "font-telugu tracking-[0.035em] leading-[1.95] text-left" 
    : isUr 
    ? "font-sans tracking-[0.04em] leading-[1.95] text-left" 
    : "font-sans tracking-normal leading-relaxed text-left";

  const textColorClass = isUser 
    ? "text-white" 
    : "text-stone-850";

  let sizeClass = "";
  if (isSpecial) {
    switch (textSize) {
      case 'sm': sizeClass = "text-[14px]"; break;
      case 'md': sizeClass = "text-[16px]"; break;
      case 'lg': sizeClass = "text-[18.5px] font-medium"; break;
      case 'xl': sizeClass = "text-[21.5px] font-semibold"; break;
    }
  } else {
    switch (textSize) {
      case 'sm': sizeClass = "text-[11.5px]"; break;
      case 'md': sizeClass = "text-xs md:text-sm"; break;
      case 'lg': sizeClass = "text-sm md:text-base"; break;
      case 'xl': sizeClass = "text-base md:text-lg"; break;
    }
  }

  // Parse markdown lines
  const lines = content.split('\n');

  // Inline formatting renderer helper
  const renderInlineStyles = (txt: string) => {
    if (!txt) return null;

    // This regex splits on bold (**text**), links ([text](url)), or code (`code`)
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|`.*?`)/g;
    const parts = txt.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong 
            key={index} 
            className={`font-black ${isUser ? 'text-white underline decoration-white/35 decoration-2' : 'text-crop-950 font-extrabold bg-crop-50/40 px-0.5 rounded'}`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      
      if (part.startsWith('[') && part.includes('](')) {
        // Match link format [Label](URL)
        const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const label = match[1];
          const url = match[2];
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline font-bold transition-all ${
                isUser 
                  ? 'text-white hover:text-stone-100 decoration-white/50' 
                  : 'text-crop-700 hover:text-crop-900 decoration-crop-300'
              }`}
            >
              {label} 🔗
            </a>
          );
        }
      }

      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={index} 
            className={`font-mono text-[0.85em] px-1.5 py-0.5 rounded border transition-colors ${
              isUser
                ? 'bg-crop-800/60 border-crop-500 text-white'
                : 'bg-stone-100 border-stone-200 text-crop-800'
            }`}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
  };

  return (
    <div className={`space-y-3 ${baseClasses} ${sizeClass} ${textColorClass}`} id="rich-text-container">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed === '') {
          return <div key={idx} className="h-1" />;
        }

        // 1. Headers (### Heading, etc.)
        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          
          let hClass = "font-black tracking-tight my-2 block";
          if (level === 1) hClass += " text-base md:text-lg border-b pb-1";
          else if (level === 2) hClass += " text-sm md:text-base border-b pb-0.5";
          else hClass += " text-xs md:text-sm";

          const headerColor = isUser 
            ? "text-white border-white/10" 
            : "text-crop-900 border-stone-100";

          return (
            <span key={idx} className={`${hClass} ${headerColor}`}>
              {renderInlineStyles(text)}
            </span>
          );
        }

        // 2. Blockquotes (> blockquote)
        if (trimmed.startsWith('>')) {
          const text = trimmed.substring(1).trim();
          const quoteBg = isUser 
            ? "bg-crop-850/30 border-white/20 select-none" 
            : "bg-stone-50 border-crop-300";
          return (
            <blockquote key={idx} className={`border-l-3 pl-3 py-1 my-2 rounded-r-md ${quoteBg} italic`}>
              {renderInlineStyles(text)}
            </blockquote>
          );
        }

        // 3. Unordered Lists (- list, * list, • list)
        if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
          const cleanText = trimmed.replace(/^[-*•]\s+/, '').trim();
          const bulletColor = isUser ? "text-white" : "text-crop-600";
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
              <span className={`text-[1.1em] leading-none select-none font-black ${bulletColor}`}>
                •
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInlineStyles(cleanText)}
              </div>
            </div>
          );
        }

        // 4. Ordered Lists (1. item, etc.)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const cleanText = numberedMatch[2];
          const numBg = isUser 
            ? "bg-crop-800 text-white border-crop-700" 
            : "bg-crop-50 text-crop-800 border-crop-150";
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border select-none shrink-0 mt-0.5 ${numBg}`}>
                {num}
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInlineStyles(cleanText)}
              </div>
            </div>
          );
        }

        // 5. Default paragraph
        return (
          <p key={idx} className="leading-relaxed whitespace-pre-wrap">
            {renderInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}
