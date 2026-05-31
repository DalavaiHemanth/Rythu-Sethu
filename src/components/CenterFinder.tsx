import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Phone, User, Landmark, Building2, CheckCircle, Navigation } from 'lucide-react';
import { CENTERS, TELANGANA_DISTRICTS_EN } from '../data/staticData';
import { TRANSLATIONS, LanguageKey } from '../data/translations';
import { Center } from '../types';

interface CenterFinderProps {
  language: LanguageKey;
}

export default function CenterFinder({ language }: CenterFinderProps) {
  const t = TRANSLATIONS[language];
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCenter, setActiveCenter] = useState<Center | null>(CENTERS[0]);
  
  // Geolocation states
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Haversine formula to compute distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        language === 'te' 
          ? 'మీ బ్రౌజర్ జియోలొకేషన్‌కు మద్దతు ఇవ్వడం లేదు.' 
          : language === 'ur'
          ? 'آپ کا براؤزر جغرافیائی پوزیشن کی حمایت نہیں کرتا ہے۔'
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        setLocationError(
          language === 'te'
            ? 'స్థానాన్ని పొందడం సాధ్యం కాలేదు. గమ్యస్థాన ఆథరైజేషన్ అనుమతించబడిందని నిర్ధారించుకోండి.'
            : language === 'ur'
            ? 'مقام تلاش کرنے میں ناکامی۔ مقام کی اجازت چیک کریں۔'
            : 'Unable to retrieve your location. Please check GPS permission.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle filtering and proximity sorting
  const filteredCenters = useMemo(() => {
    let result = CENTERS.map((c) => {
      let distanceKm: number | null = null;
      if (userLocation) {
        distanceKm = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          c.latitude,
          c.longitude
        );
      }
      return { ...c, distanceKm };
    });

    result = result.filter((c) => {
      const matchDistrict = selectedDistrict ? c.districtEn === selectedDistrict : true;
      const matchType = selectedType === 'all' ? true : c.type === selectedType;
      
      const textToSearch = `${c.nameEn} ${c.nameTe} ${c.districtEn} ${c.addressEn} ${c.officerEn}`.toLowerCase();
      const matchSearch = textToSearch.includes(searchQuery.toLowerCase());
      
      return matchDistrict && matchType && matchSearch;
    });

    if (userLocation) {
      result.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return result;
  }, [selectedDistrict, selectedType, searchQuery, userLocation]);

  // Sync nearest active center automatically upon sorting
  useEffect(() => {
    if (userLocation && filteredCenters.length > 0) {
      const nearest = filteredCenters[0];
      if (!activeCenter || !filteredCenters.some(c => c.id === activeCenter.id)) {
        setActiveCenter(nearest);
      }
    }
  }, [userLocation, filteredCenters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-transparent" id="center-finder-root">
      
      {/* Search and Filters Hub */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-earth-100">
          <h2 className="text-xl font-display font-bold text-crop-900 tracking-tight mb-2 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-crop-600" />
            {t.nearestTitle}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            {t.nearestDesc}
          </p>

          {/* Quick-Action Precise GPS Locator Banner */}
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 to-crop-50/40 border border-crop-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1 text-left">
              <h3 className="text-xs font-bold text-crop-950 flex items-center gap-1.5 font-sans">
                <MapPin className="w-4 h-4 text-emerald-600 animate-pulse" />
                {language === 'te' ? 'జీపీఎస్ ద్వారా సమీప రైతు వేదికను కనుగొనండి' : language === 'ur' ? 'جی پی ایس کے ذریعے قریب ترین مرکز تلاش کریں' : 'Find closest Rythu Vedika via GPS'}
              </h3>
              <p className="text-[10px] text-stone-630 leading-normal font-sans">
                {language === 'te' 
                  ? 'మీ మొబైల్ జీపీఎస్ లోకేషన్ ఆధారంగా సమీప కేంద్రాలు స్వయంచాలకంగా కిలోమీటర్ల దూరంతో సహా అమర్చబడతాయి.' 
                  : language === 'ur'
                  ? 'آپ کے فون کے جی پی ایس مقام کی بنیاد پر قریبی مراکز خود کار طریقے سے دوری کے حساب سے ترتیب دیئے جائیں گے۔'
                  : 'Allows sorting centers dynamically in ascending order based on physical Kilometers distance to your present coordinates.'}
              </p>
              {userLocation && (
                <div className="text-[10px] font-mono text-emerald-800 font-bold bg-white/80 px-2 py-0.5 rounded border border-emerald-250 inline-block mt-1">
                  📍 Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)}
                </div>
              )}
              {locationError && (
                <p className="text-[10px] font-semibold text-rose-600 mt-1">
                  ⚠️ {locationError}
                </p>
              )}
            </div>

            <button
              id="gps-sort-btn"
              onClick={handleGetLocation}
              disabled={locationLoading}
              className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer border min-h-[44px] ${
                userLocation
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                  : 'bg-crop-600 hover:bg-crop-700 text-white border-crop-700'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
              {locationLoading ? (
                language === 'te' ? 'గుర్తిస్తోంది...' : language === 'ur' ? 'مقام تلاش ہو رہا ہے...' : 'Locating...'
              ) : userLocation ? (
                language === 'te' ? 'స్థానం అప్‌డేట్ చేయండి 🔄' : language === 'ur' ? 'اپ ڈیٹ مقام 🔄' : 'Update Location 🔄'
              ) : (
                language === 'te' ? 'నా స్థానాన్ని ఉపయోగించండి' : language === 'ur' ? 'میرا مقام استعمال کریں' : 'Use My Location'
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-stone-400" />
              </span>
              <input
                id="search-input"
                type="text"
                className="w-full bg-stone-50 border border-crop-200 rounded-lg py-2.5 pl-9 pr-4 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-crop-600 placeholder-stone-400"
                placeholder="Search center, town, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* District Selector */}
            <select
              id="district-filter"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                const matches = CENTERS.filter(c => !e.target.value || c.districtEn === e.target.value);
                if (matches.length > 0) setActiveCenter(matches[0]);
              }}
              className="w-full bg-stone-50 border border-crop-200 rounded-lg py-2.5 px-3 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-crop-600"
            >
              <option value="">{t.filterDistrict} ({TELANGANA_DISTRICTS_EN.length})</option>
              {TELANGANA_DISTRICTS_EN.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>

            {/* Type Selector */}
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-stone-50 border border-crop-200 rounded-lg py-2.5 px-3 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-crop-600"
            >
              <option value="all">{t.typeAll}</option>
              <option value="KVK">{t.kvkOnly}</option>
              <option value="Rythu Vedika">{t.vedikaOnly}</option>
            </select>
          </div>
        </div>

        {/* Center List Grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-mono font-medium text-stone-550 uppercase tracking-wider">
              Matches Found: {filteredCenters.length} Centers {userLocation && '• Sorted by Shortest GPS Distance'}
            </span>
            {(selectedDistrict || searchQuery || selectedType !== 'all' || userLocation) && (
              <button
                onClick={() => { setSelectedDistrict(''); setSelectedType('all'); setSearchQuery(''); setUserLocation(null); setLocationError(null); }}
                className="text-[11px] font-sans text-crop-600 hover:underline font-medium cursor-pointer"
              >
                Clear Filters & GPS
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            <AnimatePresence mode="popLayout">
              {filteredCenters.map((center, index) => {
                const isActive = activeCenter?.id === center.id;
                return (
                  <motion.div
                    key={center.id}
                    layoutId={`center-card-${center.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
                    id={`center-${center.id}`}
                    onClick={() => setActiveCenter(center)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-crop-50 border-crop-600 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border-earth-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[9px] font-mono font-medium uppercase tracking-wider mb-2 border border-stone-250/20">
                        {center.type === 'KVK' ? (
                          <Building2 className="w-3 h-3 text-crop-700" />
                        ) : (
                          <Landmark className="w-3 h-3 text-crop-700" />
                        )}
                        {center.type}
                      </div>

                      {/* Display computed distance if GPS is available */}
                      {center.distanceKm !== undefined && center.distanceKm !== null && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-950 text-[10px] font-mono font-black border border-emerald-300 animate-pulse shrink-0">
                          📍 {center.distanceKm.toFixed(1)} km
                        </span>
                      )}

                      <span className="text-[11px] font-sans font-semibold text-crop-800">
                        {language === 'te' ? center.districtTe : language === 'ur' ? center.districtUr : center.districtEn}
                      </span>
                    </div>

                    <h3 className="text-sm font-display font-medium text-stone-850 leading-tight mb-2 line-clamp-1">
                      {language === 'te' ? center.nameTe : language === 'ur' ? center.nameUr : center.nameEn}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                      <span className="truncate text-[11px] text-stone-550">
                        {language === 'te' ? center.addressTe : language === 'ur' ? center.addressUr : center.addressEn}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-dashed border-stone-150 flex items-center justify-between text-xs font-sans text-stone-700 font-medium">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span className="text-[11px] text-stone-600 truncate max-w-[125px]">
                          {language === 'te' ? center.officerTe : language === 'ur' ? center.officerUr : center.officerEn}
                        </span>
                      </div>
                      <span className="text-[10px] text-crop-700 font-mono flex items-center gap-0.5">
                        <Phone className="w-3 h-3 text-crop-600" /> Contacts &gt;
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {filteredCenters.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white border border-earth-100 rounded-xl p-6">
                  <span className="inline-block text-stone-400 text-4xl mb-2">🌾</span>
                  <p className="text-xs font-sans text-stone-550 font-medium">{t.notEligible}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Map Coordination and Contact Dashboard */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-crop-900 text-white rounded-xl p-6 shadow-md border border-crop-950 relative overflow-hidden h-full flex flex-col justify-between min-h-[480px]">
          {/* Subtle asset patterns */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-crop-700/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <span className="text-[10px] font-mono tracking-widest text-crop-200 uppercase bg-crop-950/45 px-3 py-1 rounded-full border border-crop-700/35 inline-block">
              🗺️ Interactive Coordinator
            </span>

            {activeCenter ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-medium text-crop-200 tracking-wider uppercase mb-1">
                    {activeCenter.type} STATION
                  </h3>
                  <h2 className="text-xl font-display font-medium text-white tracking-tight leading-snug">
                    {language === 'te' ? activeCenter.nameTe : language === 'ur' ? activeCenter.nameUr : activeCenter.nameEn}
                  </h2>
                </div>

                <div className="p-3.5 rounded-lg bg-crop-750/30 text-xs border border-white/5 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-crop-200" />
                    <div>
                      <p className="font-semibold text-white/90">{t.address}</p>
                      <p className="text-stone-300 text-[11px] leading-relaxed mt-0.5">
                        {language === 'te' ? activeCenter.addressTe : language === 'ur' ? activeCenter.addressUr : activeCenter.addressEn}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-crop-50/10 border border-crop-200/15 flex items-center justify-center text-crop-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-crop-200 uppercase tracking-wide">{t.officer}</p>
                      <p className="text-sm font-sans text-white">
                        {language === 'te' ? activeCenter.officerTe : language === 'ur' ? activeCenter.officerUr : activeCenter.officerEn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-crop-50/10 border border-crop-200/15 flex items-center justify-center text-crop-200">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-crop-200 uppercase tracking-wide">Helpline</p>
                      <p className="text-sm font-mono text-white">
                        {activeCenter.contact}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-crop-950/20 p-2.5 rounded-lg border border-white/5 text-[11px] font-mono text-stone-300">
                    <span className="text-stone-400">Coords:</span>
                    <span>Lat: {activeCenter.latitude.toFixed(4)}</span>
                    <span className="text-crop-600">|</span>
                    <span>Lng: {activeCenter.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-center text-stone-400 text-xs">
                Select a center to see map parameters
              </div>
            )}
          </div>

          {activeCenter && (
            <div className="relative z-10 grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-crop-800">
              <a
                href={`tel:${activeCenter.contact}`}
                className="flex items-center justify-center gap-2 bg-crop-510 hover:bg-crop-510/90 text-crop-900 py-3 px-4 rounded-lg text-xs font-sans font-bold transition-all text-center cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                {t.contactFarmer}
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeCenter.latitude},${activeCenter.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-crop-800 hover:bg-crop-700 text-white py-3 px-4 rounded-lg text-xs font-sans font-bold transition-all text-center border border-white/10 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-crop-200 animate-pulse" />
                {t.getDirections}
              </a>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
