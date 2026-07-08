// All venue types ComfortMap supports
// Add new venue types here — they appear automatically on the home screen

export const VENUES = [
  {
    key: 'restaurant',
    emoji: '🍽️',
    label: { en: 'Restaurant', es: 'Restaurante', fr: 'Restaurant', de: 'Restaurant', pt: 'Restaurante', ar: 'مطعم', zh: '餐厅', ja: 'レストラン', hi: 'रेस्टोरेंट', ko: '레스토랑' },
    defaultNoise: 'medium',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. Italian place on Main St, going for a birthday dinner Saturday night',
  },
  {
    key: 'bus',
    emoji: '🚌',
    label: { en: 'Bus / Transit', es: 'Autobús', fr: 'Bus', de: 'Bus', pt: 'Ônibus', ar: 'حافلة', zh: '公交车', ja: 'バス', hi: 'बस', ko: '버스' },
    defaultNoise: 'medium',
    defaultCrowd: 'high',
    placeholderHint: 'e.g. Bus route 42 downtown, first time riding it alone',
  },
  {
    key: 'gym',
    emoji: '🏋️',
    label: { en: 'Gym', es: 'Gimnasio', fr: 'Salle de sport', de: 'Fitnessstudio', pt: 'Academia', ar: 'نادي رياضي', zh: '健身房', ja: 'ジム', hi: 'जिम', ko: '헬스장' },
    defaultNoise: 'high',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. LA Fitness on 5th Ave, never been to a gym before',
  },
  {
    key: 'mall',
    emoji: '🛍️',
    label: { en: 'Mall', es: 'Centro comercial', fr: 'Centre commercial', de: 'Einkaufszentrum', pt: 'Shopping', ar: 'مركز تجاري', zh: '购物中心', ja: 'ショッピングモール', hi: 'मॉल', ko: '쇼핑몰' },
    defaultNoise: 'high',
    defaultCrowd: 'high',
    placeholderHint: 'e.g. Westfield Mall this Saturday with my son who has sensory sensitivities',
  },
  {
    key: 'airport',
    emoji: '✈️',
    label: { en: 'Airport', es: 'Aeropuerto', fr: 'Aéroport', de: 'Flughafen', pt: 'Aeroporto', ar: 'مطار', zh: '机场', ja: '空港', hi: 'हवाई अड्डा', ko: '공항' },
    defaultNoise: 'high',
    defaultCrowd: 'high',
    placeholderHint: 'e.g. JFK Terminal 4, first time flying, anxious about security',
  },
  {
    key: 'hospital',
    emoji: '🏥',
    label: { en: 'Hospital / Clinic', es: 'Hospital', fr: 'Hôpital', de: 'Krankenhaus', pt: 'Hospital', ar: 'مستشفى', zh: '医院', ja: '病院', hi: 'अस्पताल', ko: '병원' },
    defaultNoise: 'low',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. New dentist on Oak Ave, I have severe dental anxiety',
  },
  {
    key: 'school',
    emoji: '🏫',
    label: { en: 'School / University', es: 'Escuela', fr: 'École', de: 'Schule', pt: 'Escola', ar: 'مدرسة', zh: '学校', ja: '学校', hi: 'स्कूल', ko: '학교' },
    defaultNoise: 'medium',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. First day at new school, my child has autism',
  },
  {
    key: 'park',
    emoji: '🏖️',
    label: { en: 'Park / Beach', es: 'Parque / Playa', fr: 'Parc / Plage', de: 'Park / Strand', pt: 'Parque / Praia', ar: 'حديقة / شاطئ', zh: '公园 / 海滩', ja: '公園 / ビーチ', hi: 'पार्क / समुद्र तट', ko: '공원 / 해변' },
    defaultNoise: 'low',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. Centennial Park on a Sunday afternoon',
  },
  {
    key: 'cinema',
    emoji: '🎬',
    label: { en: 'Cinema / Theater', es: 'Cine', fr: 'Cinéma', de: 'Kino', pt: 'Cinema', ar: 'سينما', zh: '电影院', ja: '映画館', hi: 'सिनेमा', ko: '영화관' },
    defaultNoise: 'high',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. AMC downtown, going to a Marvel movie opening weekend',
  },
  {
    key: 'office',
    emoji: '🏢',
    label: { en: 'Office / Workplace', es: 'Oficina', fr: 'Bureau', de: 'Büro', pt: 'Escritório', ar: 'مكتب', zh: '办公室', ja: 'オフィス', hi: 'कार्यालय', ko: '사무실' },
    defaultNoise: 'low',
    defaultCrowd: 'low',
    placeholderHint: 'e.g. New job starting Monday, open plan office, nervous about meeting everyone',
  },
  {
    key: 'hotel',
    emoji: '🏨',
    label: { en: 'Hotel', es: 'Hotel', fr: 'Hôtel', de: 'Hotel', pt: 'Hotel', ar: 'فندق', zh: '酒店', ja: 'ホテル', hi: 'होटल', ko: '호텔' },
    defaultNoise: 'low',
    defaultCrowd: 'low',
    placeholderHint: 'e.g. Marriott downtown, checking in alone for the first time',
  },
  {
    key: 'worship',
    emoji: '⛪',
    label: { en: 'Place of Worship', es: 'Lugar de culto', fr: 'Lieu de culte', de: 'Gotteshaus', pt: 'Local de culto', ar: 'دار عبادة', zh: '礼拜场所', ja: '礼拝所', hi: 'पूजा स्थल', ko: '예배 장소' },
    defaultNoise: 'low',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. First time attending a mosque / church / temple, not sure what to expect',
  },
  {
    key: 'stadium',
    emoji: '🏟️',
    label: { en: 'Stadium / Arena', es: 'Estadio', fr: 'Stade', de: 'Stadion', pt: 'Estádio', ar: 'ملعب', zh: '体育场', ja: 'スタジアム', hi: 'स्टेडियम', ko: '경기장' },
    defaultNoise: 'high',
    defaultCrowd: 'high',
    placeholderHint: 'e.g. Going to my first NFL game, don\'t know what to expect at all',
  },
  {
    key: 'transit',
    emoji: '🚉',
    label: { en: 'Train / Metro', es: 'Tren / Metro', fr: 'Train / Métro', de: 'Zug / Metro', pt: 'Trem / Metrô', ar: 'قطار / مترو', zh: '地铁 / 火车', ja: '電車 / 地下鉄', hi: 'ट्रेन / मेट्रो', ko: '기차 / 지하철' },
    defaultNoise: 'medium',
    defaultCrowd: 'high',
    placeholderHint: 'e.g. NYC subway for the first time, not sure which line to take',
  },
  {
    key: 'grocery',
    emoji: '🛒',
    label: { en: 'Grocery Store', es: 'Supermercado', fr: 'Supermarché', de: 'Supermarkt', pt: 'Supermercado', ar: 'بقالة', zh: '超市', ja: 'スーパー', hi: 'किराना स्टोर', ko: '마트' },
    defaultNoise: 'medium',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. Whole Foods on a Saturday — looking for a quiet time to shop',
  },
  {
    key: 'bank',
    emoji: '🏦',
    label: { en: 'Bank / DMV / Gov Office', es: 'Banco / Oficina gubernamental', fr: 'Banque / Préfecture', de: 'Bank / Behörde', pt: 'Banco / Repartição', ar: 'بنك / مكتب حكومي', zh: '银行 / 政府机构', ja: '銀行 / 役所', hi: 'बैंक / सरकारी कार्यालय', ko: '은행 / 관공서' },
    defaultNoise: 'low',
    defaultCrowd: 'medium',
    placeholderHint: 'e.g. DMV appointment, nervous about waiting and not knowing the process',
  },
]

export const getVenueLabel = (venue, langCode) =>
  venue.label[langCode] || venue.label['en']

export const getVenueByKey = (key) =>
  VENUES.find(v => v.key === key)
