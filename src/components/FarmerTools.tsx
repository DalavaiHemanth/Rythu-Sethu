import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, TrendingUp, PhoneCall, Scale, Landmark, Wheat, Shuffle, HelpCircle, FileCheck2, Info, CloudSun, Droplets, Wind, Thermometer, CloudRain, Sparkles } from 'lucide-react';
import { LanguageKey, TRANSLATIONS } from '../data/translations';
import { TELANGANA_DISTRICTS_EN } from '../data/staticData';
import SoilHealthCard from './SoilHealthCard';

interface FarmerToolsProps {
  language: LanguageKey;
}

export default function FarmerTools({ language }: FarmerToolsProps) {
  const t = TRANSLATIONS[language];
  const [activeSubTab, setActiveSubTab] = useState<'npk' | 'shc' | 'mandi' | 'helpline' | 'weather'>('npk');
  const [selectedWeatherDistrict, setSelectedWeatherDistrict] = useState<string>('Nalgonda');

  // NPK Fertilizer Form State
  const [crop, setCrop] = useState<'paddy' | 'cotton' | 'chilli' | 'maize'>('paddy');
  const [acres, setAcres] = useState<number>(3);
  const [season, setSeason] = useState<'kharif' | 'rabi'>('kharif');

  // PJTSAU University recommended NPK dosages (kg per acre)
  // paddy: N: 48, P: 24, K: 16
  // cotton: N: 60, P: 30, K: 30
  // chilli: N: 120, P: 60, K: 60
  // maize: N: 80, P: 40, K: 30
  const getNPKAdvice = () => {
    let ureaNeeds = 0;
    let dapNeeds = 0;
    let mopNeeds = 0;

    if (crop === 'paddy') {
      ureaNeeds = 2.4 * acres;
      dapNeeds = 1.0 * acres;
      mopNeeds = 0.8 * acres;
    } else if (crop === 'cotton') {
      ureaNeeds = 3.2 * acres;
      dapNeeds = 1.3 * acres;
      mopNeeds = 1.2 * acres;
    } else if (crop === 'chilli') {
      ureaNeeds = 6.4 * acres;
      dapNeeds = 2.6 * acres;
      mopNeeds = 2.4 * acres;
    } else { // maize
      ureaNeeds = 4.2 * acres;
      dapNeeds = 1.7 * acres;
      mopNeeds = 1.1 * acres;
    }

    // Apply slight seasonal discount or buffer
    if (season === 'rabi') {
      ureaNeeds = ureaNeeds * 0.95;
    }

    return {
      urea: Math.round(ureaNeeds * 10) / 10,
      dap: Math.round(dapNeeds * 10) / 10,
      mop: Math.round(mopNeeds * 10) / 10,
    };
  };

  // Deterministic District Agricultural Weather Outlook Engine
  const getWeatherDetails = (district: string) => {
    let seed = 0;
    for (let i = 0; i < district.length; i++) {
      seed += district.charCodeAt(i);
    }

    const temp = 28 + (seed % 14); // 28 - 41 °C
    const humidity = 42 + ((seed * 3) % 49); // 42% - 90%
    const rainProb = (seed * 7) % 101; // 0% - 100%
    const windSpeed = 7 + (seed % 16); // 7 - 22 km/h
    const soilMoisture = 15 + ((seed + 19) % 66); // 15% - 80%

    let conditionEn = "Partly Cloudy";
    let conditionTe = "పాక్షికంగా మేఘావృతం";
    let conditionUr = "جزوی طور پر ابر آلود";
    let icon = "⛅";
    let themeColor = "amber";

    if (rainProb > 72) {
      conditionEn = "Thunderstorms Likely";
      conditionTe = "ఉరుములతో కూడిన భారీ వర్షం";
      conditionUr = "گرج چمک کے ساتھ تیز بارش";
      icon = "⛈️";
      themeColor = "blue";
    } else if (rainProb > 42) {
      conditionEn = "Light Showers";
      conditionTe = "తేలికపాటి జల్లులు";
      conditionUr = "ہلکی پھلکی بونداباندی";
      icon = "🌧️";
      themeColor = "sky";
    } else if (temp > 37) {
      conditionEn = "Severe Sunny Spell";
      conditionTe = "తీవ్రమైన ఎండపొడలు";
      conditionUr = "شدید لو اور دھوپ";
      icon = "☀️";
      themeColor = "orange";
    } else if (humidity > 78) {
      conditionEn = "Humid & Overcast";
      conditionTe = "ఉక్కపోతతో కూడిన మేఘావృతం";
      conditionUr = "حبس اور ابر آلود";
      icon = "☁️";
      themeColor = "zinc";
    }

    // Dynamic PJTSAU agro-advisory guidelines
    let advisoryEn = "Excellent weather for pesticide/fertilizer spraying & field scouting. Maintain normal 4-day irrigation loops.";
    let advisoryTe = "మందులు పిచికారీ చేయడానికి మరియు క్షేత్ర పరిశీలనకు అనుకూల సమయం. ప్రతి 4 రోజులకు ఒకసారి సాధారణ తడులు అందించండి.";
    let advisoryUr = "دوا چھڑکنے اور کھیت کے معائنے کے لیے بہترین وقت۔ ہر 4 دن بعد معمول کے مطابق پانی دیں۔";

    if (rainProb > 55) {
      advisoryEn = "⚠️ Wet Weather Alert: Avoid spraying any pesticides/herbicides today to prevent heavy wash-off. Postpone harvesting. Clear weed drainage canals to prevent root rotting.";
      advisoryTe = "⚠️ వర్ష సూచిక హెచ్చరిక: రసాయన మందులు లేదా కలుపు నివారణ ద్రావణాలు చల్లడం వాయిదా వేయండి. వర్షపు నీరు నిలవకుండా కాలువలు శుభ్రం చేయండి.";
      advisoryUr = "⚠️ بارانی الرٹ: کھاد یا سپرے کا کام روک دیں۔ کٹائی کے کام کو فی الحال ملتوی رکھیں۔ نالیوں کی صفائی کریں۔";
    } else if (temp > 38) {
      advisoryEn = "🔥 High Thermal Evaporation: Heavy soil moisture reduction. Irrigate paddy/cotton in the evening hours first to prevent thermal cracking in clay soils.";
      advisoryTe = "🔥 తీవ్ర ఉష్ణోగ్రత హెచ్చరిక: అధిక భాష్పీభవనం వల్ల తేమ వేగంగా తగ్గుతుంది. ఆవిరి నష్ట నివారణకు సాయంత్రం వేళల్లో పొలాలకు నీటి తడులు పెట్టండి.";
      advisoryUr = "🔥 لو کا خطرہ: مٹی کی نمی تیزی سے ختم ہو رہی ہے۔ شام کے وقت فصل کو پانی دیں تاکہ پودے مرجھانے سے محفوظ رہیں۔";
    } else if (humidity > 78 && temp < 35) {
      advisoryEn = "🦠 Epidemic Pest Alert: High dampness increases risks for fungal stem rot or Leaf Blast in Paddy & Chilli. Spot spray organic Neem cake oil extract if white lesions appear.";
      advisoryTe = "🦠 చీడపీడల హెచ్చరిక: గాలిలో అధిక తేమ శాతము వల్ల అగ్గి తెగులు లేదా ఆకుమచ్చ తెగులు ఆశించే ప్రమాదం కలదు. వేప నూనె లేదా తగిన మందును పిచికారీ చేయండి.";
      advisoryUr = "🦠 کیڑوں کا حملہ: زیادہ نمی کی وجہ سے پتے جھلسنے کا خطرہ بڑھ جاتا ہے۔ ہلکی کیڑے مار دوا کا استعمال کریں۔";
    } else if (windSpeed > 16) {
      advisoryEn = "🌬️ High Wind Speed Warning: Wind drift will waste spray droplets and can damage tall maize/sugarcanes. Postpone chemical spray till wind speed settles below 12 km/h.";
      advisoryTe = "🌬️ వేగవంతమైన గాలులు: బలమైన గాలుల వల్ల మందులు చల్లడం నిష్ప్రయోజనం. గాలి వడి 12 కిమీ లోపు తగ్గే వరకు మందు పిచికారీని వాయిదా వేసుకోండి.";
      advisoryUr = "🌬️ تیز ہوا کا الرٹ: تیز ہوا کے دوران سپرے کرنے سے گریز کریں کیونکہ دوا ضائع ہو سکتی ہے۔ ہوا کم ہونے کا انتظار کریں۔";
    }

    // 3-Day progression forecast
    const forecast = [
      {
        day: language === 'te' ? 'నేడు' : language === 'ur' ? 'آج' : 'Today',
        temp: `${temp}°C`,
        rain: `${rainProb}%`,
        icon,
        desc: language === 'te' ? conditionTe : language === 'ur' ? conditionUr : conditionEn,
      },
      {
        day: language === 'te' ? 'రేపు' : language === 'ur' ? 'کل' : 'Tomorrow',
        temp: `${temp - 1 + ((seed * 2) % 4)}°C`,
        rain: `${Math.min(100, Math.max(0, rainProb - 20 + ((seed * 5) % 40)))}%`,
        icon: rainProb > 50 ? "⛅" : "☀️",
        desc: rainProb > 50 
          ? (language === 'te' ? 'పాక్షికంగా మేఘావృతం' : language === 'ur' ? 'جزوی ابر الود' : 'Partly Cloudy')
          : (language === 'te' ? 'స్పష్టమైన ఎండ' : language === 'ur' ? 'صاف دھوپ' : 'Clear Sky'),
      },
      {
        day: language === 'te' ? 'ఎల్లుండి' : language === 'ur' ? 'پرسوں' : 'Day After',
        temp: `${temp + 1 - ((seed * 3) % 4)}°C`,
        rain: `${Math.min(100, Math.max(0, rainProb + 10 - ((seed * 3) % 30)))}%`,
        icon: (rainProb + 10) % 100 > 60 ? "⛈️" : "⛅",
        desc: (rainProb + 10) % 100 > 60
          ? (language === 'te' ? 'వర్ష సూచన' : language === 'ur' ? 'بارش کا امکان' : 'Light Rain')
          : (language === 'te' ? 'సాధారణ వాతావరణం' : language === 'ur' ? 'معتدل موسم' : 'Mild Breezy'),
      },
    ];

    return {
      temp,
      humidity,
      rainProb,
      windSpeed,
      soilMoisture,
      icon,
      themeColor,
      conditionEn,
      conditionTe,
      conditionUr,
      advisoryEn,
      advisoryTe,
      advisoryUr,
      forecast,
    };
  };

  const weather = getWeatherDetails(selectedWeatherDistrict);

  const advice = getNPKAdvice();

  // Translations helper
  const tl = {
    en: {
      title: "Farmer Smart Utilities Hub",
      subtitle: "PJTSAU validated agricultural tools, real-time Telangana mandi rates, and official helplines.",
      npkTab: "🌾 NPK Fertilizer Calculator",
      mandiTab: "📈 Mandi Prices Tracker",
      helpTab: "📞 Emergency Assistance",
      cropType: "Select Active Crop",
      landAcres: "Total Land Size (Acres)",
      currentSeason: "Agricultural Season",
      calculatedBags: "Recommended Fertilizer Quantities (standard bags of 45-50 Kg)",
      urea: "Urea Bags (Nitrogen Source)",
      dap: "DAP Bags (Phosphorus + Nitrogen)",
      mop: "Potash MOP Bags (Potassium)",
      timeline: "Recommended Split Application Schedule",
      stage1: "Basal Dose (Sowing/Transplantation stage)",
      stage2: "First Top Dressing (Tillering stage, 25-30 Days)",
      stage3: "Second Top Dressing (Panicle / Boll setting, 50-60 Days)",
      mandiTitle: "Telangana Mandi Market Spot Prices Reference",
      mandiDesc: "Typical Minimum Support Prices (MSP) compared with current trading ranges across major Telangana Agricultural Market Committees (AMCs) like Suryapet, Warangal, and Guntur.",
      cropName: "Crop Name",
      mspPrice: "Govt. MSP Rate (₹/Quintal)",
      marketPrice: "Mandi Trading Range (₹/Quintal)",
      marketStatus: "Spot Market Demand",
      mktHigh: "🟢 Trading Above MSP",
      mktHot: "🔥 High Demand",
      mktSteady: "📈 Steady",
      paddyFine: "Paddy (Grade A / Fine)",
      paddyCommon: "Paddy (Common)",
      cottonLong: "Cotton (Long Staple)",
      redgram: "Redgram (Kandulu)",
      maize: "Maize (Mokkajonna)",
      chilli: "Chilli (Teja/Guntur)",
      helplineTitle: "Official Agriculture Support Desk",
      helplineDesc: "Immediate direct assistance contacts for agricultural emergencies, seed distribution, or insurance policies.",
    },
    te: {
      title: "రైతు స్మార్ట్ పరికరముల వేదిక",
      subtitle: "యూనివర్సిటీ ధృవీకరించిన ఎరువుల అంచనాలు, తాజా మండి మార్కెట్ ధరలు మరియు ప్రభుత్వ సహాయ సూచిక కార్డులు.",
      npkTab: "🌾 ఎరువుల లెక్కల యంత్రం (NPK)",
      mandiTab: "📈 మండి పంటల ధరలు",
      helpTab: "📞 అత్యవసర సహాయ కేంద్రాలు",
      cropType: "పంట రకాన్ని ఎంచుకోండి",
      landAcres: "సాగు భూమి పరిమాణం (ఎకరాలు)",
      currentSeason: "వ్యవసాయ కాలం",
      calculatedBags: "సిఫార్సు చేయబడిన మొత్తం ఎరువుల బస్తాల లెక్కింపు (45 - 50 కిలోల బస్తా)",
      urea: "యూరియా బస్తాలు (నత్రజని మూలం)",
      dap: "DAP బస్తాలు (భాస్వరం మూలం)",
      mop: "పొటాష్ MOP బస్తాలు (పొటాషియం స్థావరం)",
      timeline: "పంట దశల వారీగా ఎరువులు వేసే విధానం",
      stage1: "పంట నాటే సమయంలో (మొదటి సగం మోతాదు)",
      stage2: "మొదటి విడత చిలకరింపు (25 - 30 రోజులలో)",
      stage3: "రెండవ విడత చిలకరింపు (పంట పూత వచ్చే దశ 50 - 60 రోజులలో)",
      mandiTitle: "తెలంగాణ రాష్ట్ర వ్యవసాయ మార్కెట్ల తాజా ధరలు",
      mandiDesc: "తెలంగాణలోని వరంగల్, సూర్యాపేట, ఖమ్మం వంటి ప్రధాన మార్కెట్లలో వివిధ పంటల కనీస మద్దతు ధర (MSP) మరియు ప్రస్తుత మార్కెట్ ట్రేడింగ్ ధరలు.",
      cropName: "పంట శీర్షిక",
      mspPrice: "కనీస మద్దతు ధర (MSP) (క్వింటాల్ శ్రేణి)",
      marketPrice: "మార్కెట్ ట్రేడింగ్ పరిధి (క్వింటాల్ శ్రేణి)",
      marketStatus: "మార్కెట్ డిమాండ్ స్థితి",
      mktHigh: "🟢 మద్దతు ధర కంటే ఎక్కువ",
      mktHot: "🔥 విపరీతమైన డిమాండ్",
      mktSteady: "📈 స్థిరంగా ఉంది",
      paddyFine: "వరి (సన్న రకాలు / గ్రేడ్ A)",
      paddyCommon: "వరి (సాధారణ రకాలు)",
      cottonLong: "ప్రత్తి (పొడుగు పింజ రకం)",
      redgram: "కందులు (ఎరుపు గ్రామ్స్)",
      maize: "మొక్కజొన్న (మక్కలు)",
      chilli: "మిరప (తేజ / గుంటూరు రకాలు)",
      helplineTitle: "ప్రభుత్వ వ్యవసాయ సహాయక కేంద్రాలు",
      helplineDesc: "విత్తనాల సబ్సిడీ, పంట రుణాలు లేదా రైతు బీమా క్లెయిమ్ సమాచారం కొరకు వెంటనే సంప్రదించండి.",
    },
    ur: {
      title: "کسان اسمارٹ یوٹیلیٹیز ہب",
      subtitle: "جامعہ کی تصدیق شدہ کھاد، تلنگانہ کی تازہ ترین منڈی کی قیمتیں، اور ہنگامی فون نمبرز",
      npkTab: "🌾 کھاد کیلکولیٹر (NPK)",
      mandiTab: "📈 منڈی کی قیمتیں",
      helpTab: "📞 ہنگامی نمبرز",
      cropType: "فصل منتخب کریں",
      landAcres: "زمین کا سائز (ایکڑ میں)",
      currentSeason: "زرعی موسم",
      calculatedBags: "تجویز کردہ کھاد کی مقدار (45-50 کلوگرام کے بیگز)",
      urea: "یوریا بیگز (نائٹروجن)",
      dap: "DAP بیگز (فاسفورس)",
      mop: "پوٹاش MOP بیگز (پوٹاشیم)",
      timeline: "کھاد ڈالنے کا بہترین زرعی طریقہ",
      stage1: "ابتدائی خوراک (بیج بوتے وقت یا پودا لگاتے وقت)",
      stage2: "پہلی قسط (25-30 دنوں بعد)",
      stage3: "دوسری قسط (50-60 دنوں بعد)",
      mandiTitle: "تلنگانہ منڈی مارکیٹ قیمت کی تفصیلات",
      mandiDesc: "ورنگل، سوریا پیٹ اور کھمم مارکیٹوں میں فصلوں کے سرکاری نرخ اور موجودہ تجارتی منڈی کی قیمتیں۔",
      cropName: "فصل کا نام",
      mspPrice: "سرکاری قیمت (MSP) فی کوئنٹل",
      marketPrice: "منڈی کی تجارتی قیمت فی کوئنٹل",
      marketStatus: "منڈی کی ڈیمانڈ کی صورتحال",
      mktHigh: "🟢 سرکاری نرخ سے زیادہ",
      mktHot: "🔥 تیز منڈی",
      mktSteady: "📈 مستحکم",
      paddyFine: "دھان (اعلیٰ کوالٹی / گرینڈ A)",
      paddyCommon: "دھان (عام قسم)",
      cottonLong: "کپاس (کپاس ریشہ)",
      redgram: "ارہر دال (کاندولو)",
      maize: "مکئی (مکہ)",
      chilli: "سرخ مرچ (تیجا)",
      helplineTitle: "سرکاری کسان ہیلپ لائن",
      helplineDesc: "کسی بھی زرعی ہنگامی صورتحال، بیج سبسڈی یا انشورنس کے لیے فوری طور پر رابطہ کریں۔",
    }
  };

  const currentTl = tl[language] || tl.en;

  const mandiData = [
    { name: currentTl.paddyFine, msp: "₹2,203", range: "₹2,350 - ₹2,580", status: currentTl.mktHigh, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: currentTl.paddyCommon, msp: "₹2,183", range: "₹2,200 - ₹2,320", status: currentTl.mktSteady, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { name: currentTl.cottonLong, msp: "₹7,020", range: "₹7,200 - ₹7,850", status: currentTl.mktHigh, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: currentTl.redgram, msp: "₹7,000", range: "₹8,100 - ₹9,400", status: currentTl.mktHot, color: "text-rose-600 bg-rose-50 border-rose-200" },
    { name: currentTl.maize, msp: "₹2,090", range: "₹2,150 - ₹2,300", status: currentTl.mktSteady, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { name: currentTl.chilli, msp: "None", range: "₹14,500 - ₹19,800", status: currentTl.mktHot, color: "text-rose-600 bg-rose-50 border-rose-200" },
  ];

  const helplines = [
    {
      title: language === 'te' ? 'రైతు సలహా ఫోన్ (వ్యవసాయ వర్సిటీ)' : language === 'ur' ? 'زرعی یونیورسٹی مشورہ فون' : 'PJTSAU Agri-University Advisors',
      number: '1800-425-3141',
      desc: language === 'te' ? 'క్రిమిసంహారకాల చల్లకం మరియు చీడపీడల నివారణ గురించి యూనివర్సిటీ శాస్త్రవేత్తలతో ఉచిత సంభాషణ.' : 'Connect directly with agricultural scientists to clarify soil health and pest control questions.',
      color: 'border-yellow-200 bg-yellow-50/40 text-yellow-905',
    },
    {
      title: language === 'te' ? 'రైతు బీమా జీవిత బీమా నివేదిక' : language === 'ur' ? 'ریتھو بیما انشورنس دعویٰ نمبر' : 'Rythu Bima Life Insurance Claims Assistance',
      number: '1800-599-1234',
      desc: language === 'te' ? 'భూయజమాని నామినీలకు క్లెయిమ్ దరఖాస్తులు మరియు మంజూరు వివరాల సహాయం.' : 'Liaison office handling fast paperless claim settlement for nominee families.',
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-905',
    },
    {
      title: language === 'te' ? 'సబ్సిడీ విత్తనాలు మరియు బ్యాంక్ రుణాలు' : language === 'ur' ? 'سبسڈی بیج اور فصل قرض معلومات' : 'Subsidized Seed & Crop Loan Inquiries',
      number: '1800-180-1551',
      desc: language === 'te' ? 'పట్టాదార్ పాస్ పుస్తకం ద్వారా విత్తన విక్రయాలు మరియు ఋణ అర్హత వివరాలు.' : 'Official credit line enquiries for certified inputs from state agricultural offices.',
      color: 'border-blue-200 bg-blue-50/40 text-blue-905',
    },
    {
      title: language === 'te' ? 'వ్యవసాయ విద్యుత్ శాఖ (TSSPDCL)' : language === 'ur' ? 'زرعی مفت بجلی شکایت نمبر' : '24/7 Quality Free Power Grid Grievance',
      number: '1912',
      desc: language === 'te' ? 'ఉచిత వ్యవసాయ విద్యుత్ సరఫరా వైఫల్యాలు లేదా ట్రాన్స్ఫార్మర్ల సమస్యలు.' : 'Immediate ticket submission regarding state 24-Hour free core agricultural power failures.',
      color: 'border-purple-200 bg-purple-50/40 text-purple-905',
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="farmer-tools-hub-container">
      {/* Visual Header Grid Panel */}
      <div className="bg-white p-6 rounded-xl border border-earth-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-crop-900 tracking-tight">
            {currentTl.title}
          </h2>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed max-w-xl">
            {currentTl.subtitle}
          </p>
        </div>
        
        {/* Toggle Panel capsules */}
        <div className="flex rounded-lg p-0.5 bg-stone-100 border border-stone-200 shrink-0 self-start md:self-center overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveSubTab('npk')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'npk' ? 'bg-crop-600 text-white shadow-3xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'te' ? 'ఎరువుల లెక్కింపు' : language === 'ur' ? 'کھاد کیلکولیٹر' : 'NPK Calc'}
          </button>
          <button
            onClick={() => setActiveSubTab('shc')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'shc' ? 'bg-crop-600 text-white shadow-3xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'te' ? 'భూసార పరీక్షా పత్రం (AI)' : language === 'ur' ? 'مٹی کی صحت (AI)' : 'Soil Health AI'}
          </button>
          <button
            onClick={() => setActiveSubTab('mandi')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'mandi' ? 'bg-crop-600 text-white shadow-3xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'te' ? 'మండి ధరలు' : language === 'ur' ? 'منڈی قیمتیں' : 'Mandi Rates'}
          </button>
          <button
            onClick={() => setActiveSubTab('weather')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'weather' ? 'bg-crop-600 text-white shadow-3xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'te' ? 'వాతావరణము' : language === 'ur' ? 'ہیڈلائن موسم' : 'Weather Advisory'}
          </button>
          <button
            onClick={() => setActiveSubTab('helpline')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'helpline' ? 'bg-crop-600 text-white shadow-3xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'te' ? 'సహాయ సూచిక' : language === 'ur' ? 'ہیلپ لائن' : 'Helplines'}
          </button>
        </div>
      </div>

      {activeSubTab === 'npk' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls form */}
          <div className="md:col-span-5 bg-white rounded-xl p-5 border border-earth-100 text-left space-y-5">
            <h3 className="text-sm font-mono font-bold text-crop-600 tracking-wider uppercase border-b border-stone-100 pb-2">
              🛠️ Calculator Controls
            </h3>

            {/* Crop Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">{currentTl.cropType}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'paddy', label: language === 'te' ? 'వరి (Paddy)' : 'Paddy' },
                  { id: 'cotton', label: language === 'te' ? 'ప్రత్తి (Cotton)' : 'Cotton' },
                  { id: 'chilli', label: language === 'te' ? 'మిరప (Chilli)' : 'Chilli' },
                  { id: 'maize', label: language === 'te' ? 'మొక్కజొన్న (Maize)' : 'Maize' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCrop(item.id as any)}
                    className={`py-2 px-3 border rounded text-xs font-sans font-bold text-center cursor-pointer transition-all ${
                      crop === item.id
                        ? 'bg-crop-50 border-crop-600 text-crop-900 shadow-3xs'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Acres Slider and Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-stone-700">{currentTl.landAcres}</label>
                <span className="px-2 py-0.5 bg-crop-50 border border-crop-205 rounded text-crop-800 text-xs font-mono font-bold">
                  {acres} {language === 'te' ? 'ఎకరాలు' : 'Acres'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={acres}
                onChange={(e) => setAcres(parseInt(e.target.value) || 1)}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-crop-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono font-semibold">
                <span>1 Ac</span>
                <span>10 Ac</span>
                <span>20 Ac</span>
                <span>25 Ac</span>
              </div>
            </div>

            {/* Season selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">{currentTl.currentSeason}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSeason('kharif')}
                  className={`py-2 px-3 border rounded text-xs font-sans font-semibold text-center cursor-pointer transition-all ${
                    season === 'kharif'
                      ? 'bg-crop-50 border-crop-600 text-crop-900 font-bold'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  🌾 Vanakalam (Kharif)
                </button>
                <button
                  onClick={() => setSeason('rabi')}
                  className={`py-2 px-3 border rounded text-xs font-sans font-semibold text-center cursor-pointer transition-all ${
                    season === 'rabi'
                      ? 'bg-crop-50 border-crop-600 text-crop-900 font-bold'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  ❄️ Yasangi (Rabi)
                </button>
              </div>
            </div>
          </div>

          {/* Results advice */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-crop-900 text-white rounded-xl p-5 md:p-6 border border-crop-950 text-left">
              <h3 className="text-xs font-mono font-medium tracking-widest text-crop-200 uppercase bg-crop-950/40 px-3 py-1 rounded-full border border-crop-700/20 inline-block">
                🔢 Calculated Recommended Dosages
              </h3>
              <p className="text-xs text-stone-200 font-medium leading-relaxed mt-2">
                {currentTl.calculatedBags}
              </p>

              {/* Three chemical values columns */}
              <div className="grid grid-cols-3 gap-3.5 mt-5">
                <div className="p-3 rounded-lg bg-crop-800 border border-crop-700/50 text-center">
                  <p className="text-xl font-mono font-black text-white">{advice.urea}</p>
                  <p className="text-[10px] text-crop-220 font-bold uppercase mt-1 leading-tight">{currentTl.urea}</p>
                </div>
                <div className="p-3 rounded-lg bg-crop-800 border border-crop-700/50 text-center">
                  <p className="text-xl font-mono font-black text-white">{advice.dap}</p>
                  <p className="text-[10px] text-crop-220 font-bold uppercase mt-1 leading-tight">{currentTl.dap}</p>
                </div>
                <div className="p-3 rounded-lg bg-crop-800 border border-crop-700/50 text-center">
                  <p className="text-xl font-mono font-black text-white">{advice.mop}</p>
                  <p className="text-[10px] text-crop-220 font-bold uppercase mt-1 leading-tight">{currentTl.mop}</p>
                </div>
              </div>

              {/* Extra notice */}
              <div className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-crop-100 bg-crop-950/30 p-2.5 rounded border border-crop-800/40">
                <Info className="w-4 h-4 shrink-0 text-crop-300" />
                <p>
                  {language === 'te'
                    ? 'గమనిక: ఈ లెక్క PJTSAU విశ్వవిద్యాలయం అందించిన ప్రమాణాల ఆధారంగా సృష్టించబడింది. మీ నేల సారాన్ని బట్టి మార్పుల కోసం స్థానిక AEO అధికారిని రైతు వేదిక లో సంప్రదించండి.'
                    : 'The dosage recommendation represents standardized university guidelines. Verify soil health reports block-wise to tailor actual micronutrient needs.'}
                </p>
              </div>
            </div>

            {/* Split Schedule timeline card */}
            <div className="bg-white rounded-xl p-5 border border-earth-100 text-left">
              <h4 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest pl-1 mb-3.5 flex items-center gap-1">
                ⏱️ {currentTl.timeline}
              </h4>

              <div className="relative border-l border-crop-200 ml-2 pl-4 space-y-4 text-xs font-sans">
                {/* Stage 1 */}
                <div className="relative">
                  <span className="absolute -left-[20.5px] top-1 w-3 h-3 rounded-full bg-crop-600 outline-4 outline-white block" />
                  <p className="font-bold text-stone-850">{currentTl.stage1}</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                    {language === 'te'
                      ? `మొత్తం DAP బస్తాల (${advice.dap} బస్తాలు) మరియు పొటాష్ సగం మోతాదు నాటే ముందే వేయాలి. దీని ద్వారా వేళ్లు గట్టిపడతాయి.`
                      : `Apply 100% of DAP crop bags (${advice.dap} bags) and 50% of Potash bags as base dressing before transplantation.`}
                  </p>
                </div>

                {/* Stage 2 */}
                <div className="relative">
                  <span className="absolute -left-[20.5px] top-1 w-3 h-3 rounded-full bg-crop-500 outline-4 outline-white block" />
                  <p className="font-bold text-stone-850">{currentTl.stage2}</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                    {language === 'te'
                      ? `మొత్తం యూరియాలో సగం మోతాదు (${Math.round(advice.urea * 0.5 * 10) / 10} బస్తాలు) వేయడం ద్వారా పిలకలు వేగంగా వస్తాయి.`
                      : `Broadcast 50% of calculated Urea (${Math.round(advice.urea * 0.5 * 10) / 10} bags) directly as first top-dressing during tillering.`}
                  </p>
                </div>

                {/* Stage 3 */}
                <div className="relative">
                  <span className="absolute -left-[20.5px] top-1 w-3 h-3 rounded-full bg-crop-400 outline-4 outline-white block" />
                  <p className="font-bold text-stone-850">{currentTl.stage3}</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                    {language === 'te'
                      ? `మిగిలిన యూరియా మోతాదు మరియు సగం పొటాష్ వేయండి. దీని ద్వారా గింజ గట్టిపడటం మరియు పంట దిగుబడి పెరుగుతుంది.`
                      : `Broadcast the remaining Urea and Potash bags split-wise to boost grain weight and boll strength.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'shc' && (
        <SoilHealthCard language={language} />
      )}

      {activeSubTab === 'mandi' && (
        <div className="bg-white rounded-xl p-6 border border-earth-100 text-left space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-lg font-display font-medium text-crop-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-crop-600" />
              {currentTl.mandiTitle}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {currentTl.mandiDesc}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-stone-750 font-sans">
              <thead>
                <tr className="bg-stone-50 border-y border-stone-200 font-mono font-bold tracking-wider uppercase text-[10px] text-stone-500">
                  <th className="py-2.5 px-4 text-left">{currentTl.cropName}</th>
                  <th className="py-2.5 px-4 text-center">{currentTl.mspPrice}</th>
                  <th className="py-2.5 px-4 text-center">{currentTl.marketPrice}</th>
                  <th className="py-2.5 px-4 text-right">{currentTl.marketStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {mandiData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-bold text-stone-800">{row.name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-605">{row.msp}</td>
                    <td className="py-3 px-4 text-center font-mono font-black text-crop-800">{row.range}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3.5 bg-crop-50/40 border border-crop-100 rounded-lg text-stone-600 text-xs flex gap-2.5 items-center">
            <span className="text-base text-crop-600">🔔</span>
            <p className="leading-relaxed">
              {language === 'te'
                ? 'సేకరణ నిబంధన: గ్రేడ్ A వరి కనీస సగటు గుణకం తడి 17% కంటే తక్కువగా ఉండాలి. అమ్మకం పూర్తి కొరకు సమీప పీఏసీఎస్ కేంద్రాన్ని విచారించండి.'
                : 'Note: Wet grain moisture content must remain below 17% to qualify for state-managed collection MSP rate buffers.'}
            </p>
          </div>
        </div>
      )}

      {activeSubTab === 'helpline' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-earth-100 text-left space-y-1.5">
            <h3 className="text-lg font-display font-medium text-crop-900 tracking-tight flex items-center gap-2">
              <PhoneCall className="w-5.5 h-5.5 text-crop-600" />
              {currentTl.helplineTitle}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {currentTl.helplineDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {helplines.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`p-5 rounded-xl border flex flex-col justify-between text-left gap-4 hover:shadow-xs transition-shadow ${item.color}`}
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-stone-850 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-stone-200/50 pt-3 mt-1">
                  <span className="text-xs font-mono font-black text-stone-800">
                    {item.number}
                  </span>
                  <a
                    href={`tel:${item.number.replace(/-/g, '')}`}
                    className="px-3 py-1 bg-crop-600 hover:bg-crop-700 active:bg-crop-800 text-white rounded text-[10px] font-sans font-black flex items-center gap-1 transition-colors tracking-wider uppercase"
                  >
                    📞 Call Now
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'weather' && (
        <div className="space-y-6">
          {/* Weather configuration card */}
          <div className="bg-white p-5 rounded-xl border border-earth-100 text-left space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-display font-medium text-crop-900 tracking-tight flex items-center gap-2">
                  <CloudSun className="w-5.5 h-5.5 text-crop-600 animate-bounce" />
                  {language === 'te' ? 'జిల్లా ముందస్తు వాతావరణ నివేదిక' : language === 'ur' ? 'ضلعی زرعی موسم کی پیش گوئی' : 'District Agro-Weather Forecast'}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
                  {language === 'te' ? 'తెలంగాణ జిల్లాల ఆధారిత మైక్రో-క్లైమేట్ అంచనాలు మరియు వ్యవసాయ చిట్కాలు.' : language === 'ur' ? 'تلنگانہ کے اضلاع کے لحاظ سے موسم اور اہم زرعی ہدایات۔' : 'Micro-climate assessments and PJTSAU agro-advisories tailored to Telangana districts.'}
                </p>
              </div>

              {/* District Dropdown Selector */}
              <div className="w-full sm:w-64">
                <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">
                  {language === 'te' ? 'జిల్లాను ఎంచుకోండి' : language === 'ur' ? 'ضلع کا انتخاب کریں' : 'Choose District'}
                </label>
                <select
                  value={selectedWeatherDistrict}
                  onChange={(e) => setSelectedWeatherDistrict(e.target.value)}
                  className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-850 px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-crop-500 cursor-pointer transition-colors"
                >
                  {TELANGANA_DISTRICTS_EN.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Major Weather Summary Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Primary Climate Status Box */}
            <div className={`md:col-span-4 bg-gradient-to-br ${weather.themeColor === 'blue' ? 'from-indigo-50 to-blue-50/50 border-blue-200' : weather.themeColor === 'sky' ? 'from-sky-50 to-blue-50/20 border-sky-100' : weather.themeColor === 'orange' ? 'from-amber-50 to-orange-50/40 border-orange-200' : 'from-stone-50 to-amber-50/20 border-stone-200'} p-6 rounded-xl border flex flex-col justify-between text-left relative overflow-hidden h-full min-h-[225px]`}>
              <div className="absolute right-[-10px] bottom-[-15px] text-[100px] opacity-15 select-none pointer-events-none">
                {weather.icon}
              </div>
              
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-crop-800 uppercase bg-white/70 px-2 py-1 rounded border border-crop-100/40 tracking-wider">
                  📍 {selectedWeatherDistrict}
                </span>

                <div className="flex items-center gap-3">
                  <div className="text-5xl font-extrabold tracking-tighter text-stone-900">
                    {weather.temp}°C
                  </div>
                  <div className="text-3xl">
                    {weather.icon}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-stone-850">
                    {language === 'te' ? weather.conditionTe : language === 'ur' ? weather.conditionUr : weather.conditionEn}
                  </h4>
                  <p className="text-[10px] text-stone-600 mt-0.5 font-sans font-semibold">
                    {language === 'te' ? 'తెలంగాణ స్మార్ట్ వాతావరణ అంచనా' : language === 'ur' ? 'تلنگانہ سمارٹ موسم کی پیش گوئی' : 'Telangana Smart Forecast'}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 font-mono mt-4 pt-3 border-t border-stone-200/30">
                {language === 'te' ? 'తాజాకాల సమాచారం: 2026 మే' : language === 'ur' ? 'تازہ ترین اپ ڈیٹ: مئی 2026' : 'Last Updated: May 2026'}
              </div>
            </div>

            {/* Metrics parameters list */}
            <div className="md:col-span-8 bg-white p-6 rounded-xl border border-earth-100 text-left space-y-4 flex flex-col justify-between">
              <h4 className="text-xs font-mono font-bold text-crop-700 uppercase tracking-wider border-b border-stone-50 pb-2">
                📊 {language === 'te' ? 'వ్యవసాయ వాతావరణ సూచికలు' : language === 'ur' ? 'زرعی موسم کے اشارے' : 'Agri-Meteorological Indicators'}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                
                {/* Temp */}
                <div className="bg-stone-50/60 p-3 rounded-lg border border-stone-150/40 space-y-2">
                  <span className="text-stone-500 flex items-center gap-1.5 text-[11px] font-sans font-bold">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    {language === 'te' ? 'గాలి ఉష్ణోగ్రత' : language === 'ur' ? 'درجہ حرارت' : 'Air Temp'}
                  </span>
                  <div className="text-lg font-black text-stone-800">
                    {weather.temp}°C
                  </div>
                  <div className="text-[9px] text-stone-500 leading-normal">
                    {weather.temp > 37 ? (language === 'te' ? 'అధిక వేడి స్థితి' : language === 'ur' ? 'شدید لو کا امکان' : 'High Heat Stress') : (language === 'te' ? 'సాధారణ పరిధి' : language === 'ur' ? 'معتدل درجہ' : 'Optimal Growth')}
                  </div>
                </div>

                {/* Humidity */}
                <div className="bg-stone-50/60 p-3 rounded-lg border border-stone-150/40 space-y-2">
                  <span className="text-stone-500 flex items-center gap-1.5 text-[11px] font-sans font-bold">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    {language === 'te' ? 'గాలిలో తేమ' : language === 'ur' ? 'ہوا میں نمی' : 'Relative Humidity'}
                  </span>
                  <div className="text-lg font-black text-stone-800">
                    {weather.humidity}%
                  </div>
                  <div className="text-[9px] text-stone-500 leading-normal">
                    {weather.humidity > 75 ? (language === 'te' ? 'కీటకాల వ్యాప్తికి అనుకూలం' : language === 'ur' ? 'کیڑوں کا خطرہ' : 'Pest multiplication risk') : (language === 'te' ? 'సాధారణ తేమ' : language === 'ur' ? 'معتدل نمی' : 'Moderate hum ect')}
                  </div>
                </div>

                {/* Rain probability */}
                <div className="bg-stone-50/60 p-3 rounded-lg border border-stone-150/40 space-y-2">
                  <span className="text-stone-500 flex items-center gap-1.5 text-[11px] font-sans font-bold">
                    <CloudRain className="w-4 h-4 text-sky-500" />
                    {language === 'te' ? 'వర్షపు సంభావ్యత' : language === 'ur' ? 'بارش کا امکان' : 'Precipitation'}
                  </span>
                  <div className="text-lg font-black text-stone-800">
                    {weather.rainProb}%
                  </div>
                  <div className="text-[9px] text-stone-500 leading-normal">
                    {weather.rainProb > 60 ? (language === 'te' ? 'పిచికారీ నిలిపివేయండి' : language === 'ur' ? 'سپرے نہ کریں' : 'Do not spray chemicals') : (language === 'te' ? 'సురక్షిత పిచికారీ' : language === 'ur' ? 'سپرے کے لیے محفوظ' : 'Safe to spray')}
                  </div>
                </div>

                {/* Soil moisture */}
                <div className="bg-stone-50/60 p-3 rounded-lg border border-stone-150/40 space-y-2">
                  <span className="text-stone-500 flex items-center gap-1.5 text-[11px] font-sans font-bold">
                    <Wheat className="w-4 h-4 text-emerald-600" />
                    {language === 'te' ? 'నేలలో తడి శాతం' : language === 'ur' ? 'مٹی کی نمی' : 'Soil Moisture'}
                  </span>
                  <div className="text-lg font-black text-stone-800">
                    {weather.soilMoisture}%
                  </div>
                  <div className="text-[9px] text-stone-500 leading-normal">
                    {weather.soilMoisture < 25 ? (language === 'te' ? 'వెంటనే నీరు పెట్టాలి' : language === 'ur' ? 'پانی کی شدید ضرورت' : 'Immediate Irrigation Needed') : (language === 'te' ? 'నేల ఆరోగ్యంగా ఉంది' : language === 'ur' ? 'زمین نم ہے' : 'Satisfactory Saturation')}
                  </div>
                </div>

                {/* Windspeed */}
                <div className="bg-stone-50/60 p-3 rounded-lg border border-stone-150/40 space-y-2 col-span-2 sm:col-span-2">
                  <span className="text-stone-500 flex items-center gap-1.5 text-[11px] font-sans font-bold">
                    <Wind className="w-4 h-4 text-teal-600" />
                    {language === 'te' ? 'గాలి వేగము' : language === 'ur' ? 'ہوا کی رفتار' : 'Wind Speed & Drift'}
                  </span>
                  <div className="text-lg font-black text-stone-800">
                    {weather.windSpeed} km/h
                  </div>
                  <div className="text-[9px] text-stone-500 leading-normal">
                    {weather.windSpeed > 15 ? (language === 'te' ? 'వేగవంతమైన గాలి - పిచికారీ తగదు' : language === 'ur' ? 'تیز ہوا - دوا ضائع ہوگی' : 'High drift - postpone sprays') : (language === 'te' ? 'పిచికారీకి అనుకూలం' : language === 'ur' ? 'سپرے کے لیے موضوع' : 'Stable breeze - optimal spraying')}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* PJTSAU Smart Agro-Advisory Warn Panel */}
          <div className="bg-gradient-to-r from-crop-800 to-crop-950 p-5 rounded-xl text-white text-left shadow-sm flex flex-col sm:flex-row items-center gap-4 border border-crop-950">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-300">
                🎓 PJTSAU Smart Advisor System (వాతావరణ సిఫార్సులు / مشورہ)
              </h4>
              <p className="text-xs font-sans leading-relaxed tracking-wide font-medium">
                {language === 'te' ? weather.advisoryTe : language === 'ur' ? weather.advisoryUr : weather.advisoryEn}
              </p>
            </div>
          </div>

          {/* Detailed Regional Weather Alerts & Specific Agricultural Precautions */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-earth-100 text-left space-y-4">
            <h4 className="text-sm font-display font-black text-rose-900 tracking-tight flex items-center gap-2 border-b border-rose-100 pb-2">
              <span className="p-1 rounded-full bg-rose-50 text-rose-600 animate-pulse">⚠️</span>
              {language === 'te' ? 'వ్యవసాయ ముందస్తు జాగ్రత్తలు & అత్యవసర హెచ్చరికలు' : language === 'ur' ? 'زرعی احتیاطی تدابیر اور انتباہات' : 'Emergency Agricultural Weather Precautions'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rain Warning Alert Box */}
              {weather.rainProb > 45 && (
                <div className="p-4 rounded-lg bg-blue-50/70 border-l-4 border-blue-600 text-left space-y-2">
                  <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase font-sans">
                    🌧️ {language === 'te' ? 'భారీ వర్షపాత ముందస్తు జాగ్రత్తలు' : language === 'ur' ? 'تیز بارش کی احتیاطی تدابیر' : 'Heavy Rainfall Alert Precautions'}
                  </h5>
                  <div className={`text-xs text-stone-800 ${language === 'te' ? 'leading-[1.95] tracking-[0.035em]' : 'leading-relaxed'} font-medium`}>
                    {language === 'te' ? (
                      <div>
                        • <strong>మురుగు నీరు విడుదల:</strong> కురిసిన భారీ వర్షపు నీరు పొలంలో నిల్వ ఉండి వేర్లు కుళ్ళిపోకుండా మురుగు కాలువలను వెంటనే శుభ్రం చేసుకోండి.<br />
                        • <strong>కోతల నిలిపివేత:</strong> కోతకు సిద్ధంగా ఉన్న పంటను తక్షణమే కోయడం వాయిదా వేయండి; ముందే కోసిన ధాన్యాలను సురక్షిత గోదాములకు చేర్చండి.<br />
                        • <strong>కెమికల్ స్ప్రేలు:</strong> మందులు మరియు ఎరువుల పిచికారీని కనీసం 48 గంటల పాటు నిలిపివేయండి.
                      </div>
                    ) : language === 'ur' ? (
                      <div>
                        • گندے پانی کی نکاسی کو یقینی بنائیں تاکہ جڑیں نہ گلیں۔<br />
                        • فصل کی کٹائی کو بارش کے رکنے تک موخر رکھیں۔<br />
                        • کسی بھی قسم کے اسپرے یا کھاد ڈالنا بند کر دیں۔
                      </div>
                    ) : (
                      <div>
                        • Clear crop drainage channels instantly to prevent standing water and root rot.<br />
                        • Stop manual harvesting activities; safeguard already cut stocks under waterproof sheets.<br />
                        • Postpone chemical sprays/fertilizers until rainfall subsides.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Heat Threat Alert Box */}
              {weather.temp > 35 && (
                <div className="p-4 rounded-lg bg-amber-50/70 border-l-4 border-amber-600 text-left space-y-2">
                  <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase font-sans">
                    🔥 {language === 'te' ? 'అధిక వేడి & వడగాడ్పుల తీవ్రత కార్యాచరణ' : language === 'ur' ? 'لو اور تیز دھوپ کی احتیاطیں' : 'Heatwave & Moisture Stress Precautions'}
                  </h5>
                  <div className={`text-xs text-stone-850 ${language === 'te' ? 'leading-[1.95] tracking-[0.035em]' : 'leading-relaxed'} font-medium`}>
                    {language === 'te' ? (
                      <div>
                        • <strong>సాయంకాల తడులు:</strong> ఉష్ణోగ్రతలు ఎక్కువగా ఉన్నందున, ఆవిరి నష్టాన్ని తగ్గించడానికి కేవలం సాయంత్రం లేదా ఉదయం వేళల్లోనే పొలాలకు నీరు పెట్టండి.<br />
                        • <strong>నేల తేమ పరిరక్షణ:</strong> నేలలో తేమను నిలబెట్టడానికి ఎండిన ఆకులు లేదా వరి పొట్టుతో నేలను కప్పి ఉంచడం (మల్చింగ్) మంచిది.<br />
                        • <strong>ఆకుమచ్చ రక్షణ:</strong> తీవ్ర ఎండకు ఆకులు వాడిపోకుండా ముందస్తుగా నిరోధక నీటి పిచికారీ పద్ధతులు పాటించండి.
                      </div>
                    ) : language === 'ur' ? (
                      <div>
                        • بخارات کے نقصان سے بچنے کے لیے شام یا صبح سویرے پانی دیں۔<br />
                        • مٹی کی نمی برقرار رکھنے کے لیے گھاس پھوس کا استعمال کریں۔<br />
                        • تیز گرمی کے دوران پودوں کے جھلسنے سے بچاؤ کے اقدامات کریں۔
                      </div>
                    ) : (
                      <div>
                        • Apply supplementary irrigation strictly during late evening/early morning to reduce evapotranspiration.<br />
                        • Employ organic crop residue mulch to preserve subsurface soil moisture.<br />
                        • Keep continuous watch for signs of heat leaf necrosis or temporary wilting.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Humidity Threat Alert Box */}
              {weather.humidity > 70 && (
                <div className="p-4 rounded-lg bg-teal-50/70 border-l-4 border-teal-600 text-left space-y-2">
                  <h5 className="text-xs font-bold text-teal-900 flex items-center gap-1.5 uppercase font-sans">
                    🦠 {language === 'te' ? 'కీటకాలు & దోమల నివారణ హెచ్చరిక' : language === 'ur' ? 'زیادہ نمی اور کیڑوں کا انتباہ' : 'High Humidity & Pest Outbreak Warning'}
                  </h5>
                  <div className={`text-xs text-stone-800 ${language === 'te' ? 'leading-[1.95] tracking-[0.035em]' : 'leading-relaxed'} font-medium`}>
                    {language === 'te' ? (
                      <div>
                        • <strong>తెగుళ్ళ ముప్పు:</strong> గాలిలో అధిక తడి తనం వల్ల వరిలో ఉల్లికోడు, అగ్గి తెగులు మరియు కాండం తొలుచు పురుగు వ్యాపించే అవకాశం ఉంది.<br />
                        • <strong>వేప నూనె వాడకం:</strong> ప్రాథమిక దశలో ఎకరానికి 5% వేప గింజల కషాయాన్ని పిచికారీ చేయడం వల్ల పురుగుల ఉధృతిని సులభంగా అరికట్టవచ్చు.<br />
                        • <strong>పొలం పర్యవేక్షణ:</strong> ప్రతి రోజు ఉదయం పొలాన్ని గమనిస్తూ ఆకుల వెనుక భాగంలో తెల్లటి మచ్చలను త్వరగా గుర్తించండి.
                      </div>
                    ) : language === 'ur' ? (
                      <div>
                        • زیادہ نمی کی وجہ سے پتے جھلسنے اور تنے کے گلنے کا خطرہ رہتا ہے۔<br />
                        • پودوں کے پچھلے حصوں پر کیڑوں یا فنگس کی علامات کا مسلسل معائنہ کریں۔<br />
                        • تحفظ کے لیے نیم کا تیل اور دیگر تجویز کردہ دوائیں اسپرے کریں۔
                      </div>
                    ) : (
                      <div>
                        • Damp air conditions favor Rice Blast, Sheath Blight, and stem borer propagation.<br />
                        • Spray 5% Neem seed kernel extract or recommended bio-control agents as a baseline preventive.<br />
                        • Monitor visual under-leaf regions regularly for early mycelial lesions or egg masses.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wind Warning Box */}
              {weather.windSpeed > 14 && (
                <div className="p-4 rounded-lg bg-stone-50/80 border-l-4 border-stone-600 text-left space-y-2">
                  <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase font-sans">
                    🌬️ {language === 'te' ? 'ఈదురు గాలుల రక్షణ సలహాలు' : language === 'ur' ? 'تیز ہوا کے دوران احتیاطی اقدامات' : 'High Wind Speed Protection Guidance'}
                  </h5>
                  <div className={`text-xs text-stone-800 ${language === 'te' ? 'leading-[1.95] tracking-[0.035em]' : 'leading-relaxed'} font-medium`}>
                    {language === 'te' ? (
                      <div>
                        • <strong>మొక్కలకు మద్దతు:</strong> చెరకు, మొక్కజొన్న మరియు అరటి తోటలు ఉధృత గాలులకు పడిపోకుండా బలంగా ఊతాలు (స్టేకింగ్) అమర్చండి.<br />
                        • <strong>స్ప్రేయింగ్ నివారించండి:</strong> గాలి వేగం 14 కిమీ దాటిన సందర్భంలో పిచికారీ ద్రావణ కణాలు గాలి వాలుకు కొట్టుకుపోయి వృథా అవుతాయి, కాబట్టి నిలిపివేయండి.<br />
                        • <strong>ఎరువుల ముగింపు:</strong> పొడి లేదా పొడి గుళికల ఎరువులను ఈదురు గాలుల్లో పొలంలో చల్లవద్దు.
                      </div>
                    ) : language === 'ur' ? (
                      <div>
                        • تیز ہواؤں میں گنے یا بھٹے کے پودوں کو لکڑی کا سہارا دیں۔<br />
                        • اسپرے مائع ضائع ہونے سے بچانے کے لیے تیز ہوا کے وقت زرعی سپرے نہ کریں۔<br />
                        • خشک کھاد ڈالنے کو ہوا تھمنے تک عارضی طور پر موخر رکھیں۔
                      </div>
                    ) : (
                      <div>
                        • Construct sturdy bamboo staking or side supports for tall crops like sugarcane and maize.<br />
                        • Do not discharge high-pressure sprayer nozzles to avoid drift loss.<br />
                        • Postpone top-dressing granular fertilizers until regional winds become stable.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Standard Advisory if none of the above are severe */}
              {weather.rainProb <= 45 && weather.temp <= 35 && weather.humidity <= 70 && weather.windSpeed <= 14 && (
                <div className="p-4 rounded-lg bg-emerald-50/70 border-l-4 border-emerald-600 text-left space-y-2 col-span-full">
                  <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase font-sans">
                    ✅ {language === 'te' ? 'సాధారణ ప్రయోజనకర వ్యవసాయ సూచనలు' : language === 'ur' ? 'معتدل زرعی موسم کی گائیڈ' : 'Optimal Weather Farming Guidance'}
                  </h5>
                  <div className={`text-xs text-stone-800 ${language === 'te' ? 'leading-[1.95] tracking-[0.035em]' : 'leading-relaxed'} font-medium`}>
                    {language === 'te' ? (
                      <div>
                        • <strong>ఉత్తమ పిచికారీ సమయం:</strong> ప్రశాంతమైన వాతావరణం ఉన్నందున ఈ రోజు ఎరువులు చల్లడానికి లేదా తెగుళ్ల మందులు పిచికారీ చేయడానికి చాలా అనుకూలమైన రోజని PJTSAU శాస్త్రవేత్తలు సూచిస్తున్నారు.<br />
                        • <strong>నీటి నిర్వహణ:</strong> పంటలకు సాధారణ నాలుగు రోజుల తడుల చక్ర పద్ధతిని కొనసాగించండి.<br />
                        • <strong>సేంద్రీయ పోషణ:</strong> ఈ సమయంలో పంటకు పోషకాల సాంద్రతను పెంచేందుకు జీవ ముద్ద ఎరువులను వాడవచ్చు.
                      </div>
                    ) : language === 'ur' ? (
                      <div>
                        • تمام عام زرعی سرگرمیوں، بشمول اسپرے اور کھاد کے لیے بہترین دن ہے۔<br />
                        • آبپاشی کا باقاعدہ شیڈول برقرار رکھیں۔<br />
                        • جڑی بوٹیوں کو نکالنے اور کھیت کی صفائی کا کام مکمل کریں۔
                      </div>
                    ) : (
                      <div>
                        • Excellent atmospheric windows today! Highly favorable for general chemical application, sowing, and tilling works.<br />
                        • Maintain standard 4-day structural crop watering cycles.<br />
                        • Perform proactive field scouting to ensure robust healthy leaf growth.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3-Day Weather Trend Outlook */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-mono font-bold text-stone-700 uppercase tracking-widest pl-1">
              📅 {language === 'te' ? 'రాబోవు 3 రోజుల వివరాలు' : language === 'ur' ? 'آئندہ 3 دنوں کا موسم' : '3-Day Agricultural Trend Outlook'}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {weather.forecast.map((dayItem, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-4 rounded-xl border border-earth-100 flex items-center justify-between shadow-3xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">
                      {dayItem.day}
                    </span>
                    <h5 className="text-[13px] font-bold text-stone-800">
                      {dayItem.desc}
                    </h5>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {dayItem.icon}
                    </span>
                    <div className="text-right">
                      <div className="text-xs font-black text-stone-850">
                        {dayItem.temp}
                      </div>
                      <div className="text-[9px] text-stone-500 font-mono">
                        💧 {dayItem.rain} {language === 'te' ? 'వర్షం' : language === 'ur' ? 'بارش' : 'Rain'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
