import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, CheckCircle2, ChevronRight, RefreshCw, Bookmark, Award, HelpCircle as HelpIcon, XCircle, SlidersHorizontal, Settings, Sparkles } from 'lucide-react';
import { SCHEMES } from '../data/staticData';
import { TRANSLATIONS, LanguageKey } from '../data/translations';
import { Scheme } from '../types';

interface SchemeQuizProps {
  language: LanguageKey;
  onQuizCompleted: (answers: Record<string, boolean>) => void;
}

export default function SchemeQuiz({ language, onQuizCompleted }: SchemeQuizProps) {
  const t = TRANSLATIONS[language];
  const [quizMode, setQuizMode] = useState<'form' | 'steps'>('form'); // Default to Direct Form Mode!
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Initialize answers state from localStorage
  const [answers, setAnswers] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('rythu_sethu_quiz_answers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading quiz answers:', e);
    }
    return {
      isResident: false,
      isLandowner: false,
      isSmallFarmer: false,
      hasCropLoan: false,
      needsInsurance: false,
    };
  });

  // Load completion status from localStorage
  const [isDone, setIsDone] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('rythu_sethu_quiz_completed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Automatically inform parental state about loaded answers on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem('rythu_sethu_quiz_answers');
    if (savedAnswers && isDone) {
      try {
        onQuizCompleted(JSON.parse(savedAnswers));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const questions = [
    {
      id: 'isResident',
      text: t.quizQ1,
      field: 'isResident',
    },
    {
      id: 'isLandowner',
      text: t.quizQ2,
      field: 'isLandowner',
    },
    {
      id: 'isSmallFarmer',
      text: t.quizQ3,
      field: 'isSmallFarmer',
    },
    {
      id: 'hasCropLoan',
      text: t.quizQ4,
      field: 'hasCropLoan',
    },
    {
      id: 'needsInsurance',
      text: t.quizQ5,
      field: 'needsInsurance',
    },
  ];

  // Guided step answer handler
  const handleAnswerSteps = (value: boolean) => {
    const currentField = questions[currentStep].field;
    const updatedAnswers = { ...answers, [currentField]: value };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsDone(true);
      localStorage.setItem('rythu_sethu_quiz_answers', JSON.stringify(updatedAnswers));
      localStorage.setItem('rythu_sethu_quiz_completed', 'true');
      onQuizCompleted(updatedAnswers);
    }
  };

  // One-page form submission handler (saves answers all at once!)
  const handleFormSubmit = () => {
    setIsDone(true);
    localStorage.setItem('rythu_sethu_quiz_answers', JSON.stringify(answers));
    localStorage.setItem('rythu_sethu_quiz_completed', 'true');
    onQuizCompleted(answers);
  };

  const handleReset = () => {
    const freshAnswers = {
      isResident: false,
      isLandowner: false,
      isSmallFarmer: false,
      hasCropLoan: false,
      needsInsurance: false,
    };
    setAnswers(freshAnswers);
    setCurrentStep(0);
    setIsDone(false);
    localStorage.removeItem('rythu_sethu_quiz_completed');
    localStorage.removeItem('rythu_sethu_quiz_answers');
  };

  // Determine eligible schemes based on rules
  const eligibleSchemes = SCHEMES.filter((scheme) => {
    if (scheme.criteria.residentOnly && !answers.isResident) return false;
    if (scheme.criteria.landownerOnly && !answers.isLandowner) return false;
    if (scheme.criteria.smallFarmerOnly && !answers.isSmallFarmer) return false;
    if (scheme.criteria.cropLoanOutstanding && !answers.hasCropLoan) return false;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto bg-transparent" id="scheme-quiz-root">
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div
            key="quiz-setup-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-earth-100 text-center relative overflow-hidden"
          >
            {/* Upper Mode Swapper */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 mb-6 gap-3">
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-crop-600 uppercase tracking-wider block">
                  Telangana State Welfare Analyzer
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {language === 'te' ? 'అర్హత గుర్తింపు విధానాన్ని ఎంచుకోండి' : language === 'ur' ? 'طریقہ منتخب کریں' : 'Choose input style'}
                </span>
              </div>

              <div className="inline-flex rounded-md p-0.5 bg-stone-100 border border-stone-200 shrink-0 self-start sm:self-center">
                <button
                  onClick={() => setQuizMode('form')}
                  className={`px-3 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    quizMode === 'form'
                      ? 'bg-crop-600 text-white shadow-3xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {language === 'te' ? 'ఒకటే పేజీ ఫారం' : language === 'ur' ? 'ایک صفحہ فارم' : 'One-Page Form'}
                </button>
                <button
                  onClick={() => {
                    setQuizMode('steps');
                    setCurrentStep(0);
                  }}
                  className={`px-3 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    quizMode === 'steps'
                      ? 'bg-crop-600 text-white shadow-3xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'te' ? 'స్టెప్-బై-స్టెప్ క్విజ్' : language === 'ur' ? 'سوالنامہ' : 'Guided Steps'}
                </button>
              </div>
            </div>

            {quizMode === 'form' ? (
              /* ONE-PAGE FORM INTERFACE: SAVES EVERYTHING AT ONCE */
              <div className="space-y-6">
                <div className="text-left bg-crop-50/20 border border-crop-100 rounded-lg p-3.5">
                  <p className="text-xs text-crop-900 font-medium leading-relaxed">
                    💡 <strong>{language === 'te' ? 'సూచన:' : language === 'ur' ? 'رہنمائی' : 'At-Once Form:'}</strong>{' '}
                    {language === 'te'
                      ? 'కింది నిబంధనలను ఒకేసారి సెట్ చేసి అర్హతను వెంటనే విశ్లేషించండి. మీ సమాధానాలు బ్రౌజర్ మెమరీలో భద్రపరచబడతాయి.'
                      : language === 'ur'
                      ? 'ایک ہی بار اہلیت چیک کریں اور محفوظ کریں۔ یہ ڈیٹا محفوظ رہتا ہے۔'
                      : 'Adjust these attributes on a single layout and check eligibility with one click. Your answers persist dynamically.'}
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  {questions.map((q) => {
                    const isChecked = answers[q.id];
                    return (
                      <div
                        key={q.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isChecked
                            ? 'bg-crop-50/10 border-crop-200'
                            : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex-1 pr-4">
                          <p className={`font-sans font-semibold text-stone-800 ${language === 'te' ? 'text-base font-medium' : 'text-xs md:text-sm'}`}>
                            {q.text}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setAnswers((prev) => ({ ...prev, [q.id]: !isChecked }));
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isChecked ? 'bg-crop-600' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleFormSubmit}
                  className="w-full bg-crop-600 hover:bg-crop-700 active:bg-crop-800 text-white font-sans font-bold py-4 px-6 rounded-lg text-sm transition-all shadow-sm border-b-2 border-crop-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {language === 'te' ? 'అర్హతను విశ్లేషించండి & వివరాలను సేవ్ చేయండి' : language === 'ur' ? 'اہلیت کا تجزیہ کریں اور محفوظ کریں' : 'Save Attributes & Check Eligibility'}
                </button>
              </div>
            ) : (
              /* GUIDED STEP-BY-STEP QUIZ */
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-100">
                  <div
                    className="h-full bg-crop-600 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / questions.length) * 105}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-mono font-bold text-stone-500 uppercase tracking-widest pl-1 mb-2">
                  <span className="text-crop-600">Telangana Agri Guided Steps</span>
                  <span>Question {currentStep + 1} of {questions.length}</span>
                </div>

                <div className="w-12 h-12 rounded-lg bg-crop-50 flex items-center justify-center mx-auto mb-4 text-crop-600 border border-crop-200">
                  <HelpIcon className="w-6 h-6" />
                </div>

                <h2 className={`text-xl md:text-2xl font-display font-medium text-stone-800 leading-snug tracking-tight mb-8 px-4 h-20 flex items-center justify-center ${language === 'te' ? 'text-2xl' : ''}`}>
                  {questions[currentStep].text}
                </h2>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <button
                    id="btn-quiz-yes"
                    onClick={() => handleAnswerSteps(true)}
                    className="bg-crop-600 hover:bg-crop-700 active:bg-crop-800 text-white font-sans font-bold py-4 px-6 rounded-lg text-sm transition-all shadow-sm border-b-2 border-crop-800 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t.yes}
                  </button>
                  <button
                    id="btn-quiz-no"
                    onClick={() => handleAnswerSteps(false)}
                    className="bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-sans font-bold py-4 px-6 rounded-lg text-sm transition-all border border-stone-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    {t.no}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* RESULTS SUMMARY VIEW */
          <motion.div
            key="quiz-results-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Celebration Card */}
            <div className="bg-crop-900 text-white rounded-xl p-6 md:p-8 text-center shadow-md border border-crop-950 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-crop-700/30 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-crop-700 mx-auto flex items-center justify-center border border-white/10 text-crop-200">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                  {t.results}
                </h2>
                <p className="text-xs text-stone-200 max-w-md mx-auto leading-relaxed font-sans">
                  {t.matchSuccess}
                </p>
              </div>
            </div>

            {/* Quick configuration summary banner */}
            <div className="bg-stone-100 border border-stone-200 rounded-lg p-4 flex flex-wrap gap-4 items-center justify-between text-xs text-stone-700">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-bold text-[10px] bg-stone-200 px-2 py-0.5 rounded text-stone-600 tracking-wider font-mono uppercase">
                  {language === 'te' ? 'మీ ప్రొఫైల్' : language === 'ur' ? 'آپ کا پروفائل' : 'Saved Profile'}
                </span>
                <span className={`px-2 py-0.5 rounded ${answers.isResident ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {language === 'te' ? 'తెలంగాణ వాసి: ' : 'Resident: '} {answers.isResident ? t.yes : t.no}
                </span>
                <span className={`px-2 py-0.5 rounded ${answers.isLandowner ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {language === 'te' ? 'భూయజమాని: ' : 'Landowner: '} {answers.isLandowner ? t.yes : t.no}
                </span>
                <span className={`px-2 py-0.5 rounded ${answers.isSmallFarmer ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {language === 'te' ? 'చిన్న రైతు: ' : 'Small Farmer: '} {answers.isSmallFarmer ? t.yes : t.no}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsDone(false);
                  setQuizMode('form');
                }}
                className="text-crop-800 hover:text-crop-900 font-extrabold hover:underline cursor-pointer flex items-center gap-1.5"
              >
                ⚙️ {language === 'te' ? 'ప్రొఫైల్ మార్చు' : language === 'ur' ? 'پروفائل تبدیل کریں' : 'Change Profile Values'}
              </button>
            </div>

            {/* Schemes Output Grid */}
            <div className="space-y-4">
              {eligibleSchemes.length > 0 ? (
                eligibleSchemes.map((scheme, idx) => (
                  <motion.div
                    key={scheme.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="bg-white rounded-xl border border-earth-100 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-start gap-4 hover:border-crop-600 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-crop-50 flex items-center justify-center text-crop-600 shrink-0 border border-crop-100">
                      <Bookmark className="w-5 h-5" />
                    </div>

                    <div className="space-y-3 flex-1 text-left">
                      <div>
                        <h3 className="text-base font-display font-medium text-crop-900 tracking-tight">
                          {language === 'te' ? scheme.nameTe : language === 'ur' ? scheme.nameUr : scheme.nameEn}
                        </h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {language === 'te' ? scheme.descTe : language === 'ur' ? scheme.descUr : scheme.descEn}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* Benefits Panel */}
                        <div className="p-3 rounded-lg bg-crop-50/50 border border-crop-100 text-xs text-stone-700">
                          <p className="font-bold text-crop-800 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wide">
                            🟢 {t.benefits}
                          </p>
                          <p className="leading-relaxed text-stone-650">
                            {language === 'te' ? scheme.benefitsTe : language === 'ur' ? scheme.benefitsUr : scheme.benefitsEn}
                          </p>
                        </div>

                        {/* How To Apply Panel */}
                        <div className="p-3 rounded-lg bg-earth-50 border border-earth-100 text-xs text-stone-700">
                          <p className="font-bold text-crop-900 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wide">
                            🌾 {t.applyNow}
                          </p>
                          <p className="leading-relaxed text-stone-650">
                            {language === 'te' ? scheme.howToApplyTe : language === 'ur' ? scheme.howToApplyUr : scheme.howToApplyEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white border border-earth-100 rounded-xl p-8 py-12 text-center text-stone-500">
                  <p className="text-xl">🏜️</p>
                  <p className="text-sm font-medium mt-2">{t.notEligible}</p>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex justify-center gap-4 pt-3">
              <button
                id="btn-quiz-reset"
                onClick={handleReset}
                className="flex items-center gap-2 bg-stone-150 hover:bg-stone-200 text-stone-800 font-sans font-bold py-3 px-5 rounded-lg text-xs transition-all tracking-wider shadow-sm cursor-pointer border border-stone-250"
              >
                <RefreshCw className="w-4 h-4" />
                {language === 'te' ? 'పూర్తిగా రీసెట్ చేయండి' : language === 'ur' ? 'دوبارہ شروع کریں' : 'Reset & Erasure'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
