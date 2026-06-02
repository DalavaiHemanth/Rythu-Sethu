import { LanguageKey } from '../data/translations';

export interface NPKAdvice {
  urea: number;
  dap: number;
  mop: number;
}

export function getNPKAdvice(
  crop: 'paddy' | 'cotton' | 'chilli' | 'maize',
  acres: number,
  season: 'kharif' | 'rabi'
): NPKAdvice {
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
  } else {
    // maize
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
}

export interface WeatherDetails {
  temp: number;
  humidity: number;
  rainProb: number;
  windSpeed: number;
  soilMoisture: number;
  icon: string;
  themeColor: string;
  conditionEn: string;
  conditionTe: string;
  conditionUr: string;
  advisoryEn: string;
  advisoryTe: string;
  advisoryUr: string;
  forecast: Array<{
    day: string;
    temp: string;
    rain: string;
    icon: string;
    desc: string;
  }>;
}

export function getWeatherDetails(
  district: string,
  language: LanguageKey
): WeatherDetails {
  let seed = 0;
  for (let i = 0; i < district.length; i++) {
    seed += district.charCodeAt(i);
  }

  const temp = 28 + (seed % 14); // 28 - 41 °C
  const humidity = 42 + ((seed * 3) % 49); // 42% - 90%
  const rainProb = (seed * 7) % 101; // 0% - 100%
  const windSpeed = 7 + (seed % 16); // 7 - 22 km/h
  const soilMoisture = 15 + ((seed + 19) % 66); // 15% - 80%

  let conditionEn = 'Partly Cloudy';
  let conditionTe = 'పాక్షికంగా మేఘావృతం';
  let conditionUr = 'جزوی طور پر ابر آلود';
  let icon = '⛅';
  let themeColor = 'amber';

  if (rainProb > 72) {
    conditionEn = 'Thunderstorms Likely';
    conditionTe = 'ఉరుములతో కూడిన భారీ వర్షం';
    conditionUr = 'گرج چمک کے ساتھ تیز بارش';
    icon = '⛈️';
    themeColor = 'blue';
  } else if (rainProb > 42) {
    conditionEn = 'Light Showers';
    conditionTe = 'తేలికపాటి జల్లులు';
    conditionUr = 'ہلکی پھلکی بونداباندی';
    icon = '🌧️';
    themeColor = 'sky';
  } else if (temp > 37) {
    conditionEn = 'Severe Sunny Spell';
    conditionTe = 'తీవ్రమైన ఎండపొడలు';
    conditionUr = 'شدید لو اور دھوپ';
    icon = '☀️';
    themeColor = 'orange';
  } else if (humidity > 78) {
    conditionEn = 'Humid & Overcast';
    conditionTe = 'ఉక్కపోతతో కూడిన మేఘావృతం';
    conditionUr = 'حبس اور ابر آلود';
    icon = '☁️';
    themeColor = 'zinc';
  }

  // Dynamic PJTSAU agro-advisory guidelines
  let advisoryEn =
    'Excellent weather for pesticide/fertilizer spraying & field scouting. Maintain normal 4-day irrigation loops.';
  let advisoryTe =
    'మందులు పిచికారీ చేయడానికి మరియు క్షేత్ర పరిశీలనకు అనుకూల సమయం. ప్రతి 4 రోజులకు ఒకసారి సాధారణ తడులు అందించండి.';
  let advisoryUr =
    'دوا چھڑکنے اور کھیت کے معائنے کے لیے بہترین وقت۔ ہر 4 دن بعد معمول کے مطابق پانی دیں۔';

  if (rainProb > 55) {
    advisoryEn =
      '⚠️ Wet Weather Alert: Avoid spraying any pesticides/herbicides today to prevent heavy wash-off. Postpone harvesting. Clear weed drainage canals to prevent root rotting.';
    advisoryTe =
      '⚠️ వర్ష సూచిక హెచ్చరిక: రసాయన మందులు లేదా కలుపు నివారణ ద్రావణాలు చల్లడం వాయిదా వేయండి. వర్షపు నీరు నిలవకుండా కాలువలు శుభ్రం చేయండి.';
    advisoryUr =
      '⚠️ بارانی الرٹ: کھاد یا سپرے کا کام روک دیں۔ کٹائی کے کام کو فی الحال ملتوی رکھیں۔ نالیوں کی صفائی کریں۔';
  } else if (temp > 38) {
    advisoryEn =
      '🔥 High Thermal Evaporation: Heavy soil moisture reduction. Irrigate paddy/cotton in the evening hours first to prevent thermal cracking in clay soils.';
    advisoryTe =
      '🔥 తీవ్ర ఉష్ణోగ్రత హెచ్చరిక: అధిక భాష్పీభవనం వల్ల తేమ వేగంగా తగ్గుతుంది. ఆవిరి నష్ట నివారణకు సాయంత్రం వేళల్లో పొలాలకు నీటి తడులు పెట్టండి.';
    advisoryUr =
      '🔥 لو کا خطرہ: مٹی کی نمی تیزی سے ختم ہو رہی ہے۔ شام کے وقت فصل کو پانی دیں تاکہ پودے مرجھانے سے محفوظ رہیں۔';
  } else if (humidity > 78 && temp < 35) {
    advisoryEn =
      '🦠 Epidemic Pest Alert: High dampness increases risks for fungal stem rot or Leaf Blast in Paddy & Chilli. Spot spray organic Neem cake oil extract if white lesions appear.';
    advisoryTe =
      '🦠 చీడపీడల హెచ్చరిక: గాలిలో అధిక తేమ శాతము వల్ల అగ్గి తెగులు లేదా ఆకుమచ్చ తెగులు ఆశించే ప్రమాదం కలదు. వేప నూనె లేదా తగిన మందును పిచికారీ చేయండి.';
    advisoryUr =
      '🦠 کیڑوں کا حملہ: زیادہ نمی کی وجہ سے پتے جھلسنے کا خطرہ بڑھ جاتا ہے۔ ہلکی کیڑے مار دوا کا استعمال کریں۔';
  } else if (windSpeed > 16) {
    advisoryEn =
      '🌬️ High Wind Speed Warning: Wind drift will waste spray droplets and can damage tall maize/sugarcanes. Postpone chemical spray till wind speed settles below 12 km/h.';
    advisoryTe =
      '🌬️ వేగవంతమైన గాలులు: బలమైన గాలుల వల్ల మందులు చల్లడం నిష్ప్రయోజనం. గాలి వడి 12 కిమీ లోపు తగ్గే వరకు మందు పిచికారీని వాయిదా వేసుకోండి.';
    advisoryUr =
      '🌬️ تیز ہوا کا الرٹ: تیز ہوا کے دوران سپرے کرنے سے گریز کریں کیونکہ دوا ضائع ہو سکتی ہے۔ ہوا کم ہونے کا انتظار کریں۔';
  }

  // 3-Day progression forecast
  const forecast = [
    {
      day: language === 'te' ? 'నేడు' : language === 'ur' ? 'آج' : 'Today',
      temp: `${temp}°C`,
      rain: `${rainProb}%`,
      icon,
      desc:
        language === 'te'
          ? conditionTe
          : language === 'ur'
            ? conditionUr
            : conditionEn,
    },
    {
      day: language === 'te' ? 'రేపు' : language === 'ur' ? 'کل' : 'Tomorrow',
      temp: `${temp - 1 + ((seed * 2) % 4)}°C`,
      rain: `${Math.min(100, Math.max(0, rainProb - 20 + ((seed * 5) % 40)))}%`,
      icon: rainProb > 50 ? '⛅' : '☀️',
      desc:
        rainProb > 50
          ? language === 'te'
            ? 'పాక్షికంగా మేఘావృతం'
            : language === 'ur'
              ? 'جزوی ابر الود'
              : 'Partly Cloudy'
          : language === 'te'
            ? 'స్పష్టమైన ఎండ'
            : language === 'ur'
              ? 'صاف دھوپ'
              : 'Clear Sky',
    },
    {
      day:
        language === 'te'
          ? 'ఎల్లుండి'
          : language === 'ur'
            ? 'پرسوں'
            : 'Day After',
      temp: `${temp + 1 - ((seed * 3) % 4)}°C`,
      rain: `${Math.min(100, Math.max(0, rainProb + 10 - ((seed * 3) % 30)))}%`,
      icon: (rainProb + 10) % 100 > 60 ? '⛈️' : '⛅',
      desc:
        (rainProb + 10) % 100 > 60
          ? language === 'te'
            ? 'వర్ష సూచన'
            : language === 'ur'
              ? 'بارش کا امکان'
              : 'Light Rain'
          : language === 'te'
            ? 'సాధారణ వాతావరణం'
            : language === 'ur'
              ? 'معتدل موسم'
              : 'Mild Breezy',
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
}
