export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: 'te' | 'en' | 'ur';
  timestamp: string;
  image?: string; // base64 string for leaf diagnostics
  isSpeaking?: boolean;
}

export interface Scheme {
  id: string;
  nameEn: string;
  nameTe: string;
  nameUr: string;
  descEn: string;
  descTe: string;
  descUr: string;
  benefitsEn: string;
  benefitsTe: string;
  benefitsUr: string;
  eligibilityEn: string;
  eligibilityTe: string;
  eligibilityUr: string;
  howToApplyEn: string;
  howToApplyTe: string;
  howToApplyUr: string;
  criteria: {
    residentOnly: boolean;
    landownerOnly: boolean;
    smallFarmerOnly: boolean; // Land <= 5 acres
    cropLoanOutstanding?: boolean;
    needsInsurance?: boolean;
  };
}

export interface QuizQuestion {
  id: string;
  textEn: string;
  textTe: string;
  textUr: string;
  field: 'isResident' | 'isLandowner' | 'isSmallFarmer' | 'hasCropLoan' | 'needsInsurance';
}

export interface Center {
  id: string;
  nameEn: string;
  nameTe: string;
  nameUr: string;
  type: 'KVK' | 'Rythu Vedika';
  districtEn: string;
  districtTe: string;
  districtUr: string;
  addressEn: string;
  addressTe: string;
  addressUr: string;
  latitude: number;
  longitude: number;
  contact: string;
  officerEn: string;
  officerTe: string;
  officerUr: string;
}

export interface UploadedDoc {
  id: string;
  title: string;
  content: string;
  uploadDate: string;
  charCount: number;
}
