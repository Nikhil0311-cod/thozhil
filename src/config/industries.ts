import { FatiguePolicyConfig, IndustryConfig, IndustryId } from '../types/domain';

export const DEFAULT_FATIGUE_POLICY: FatiguePolicyConfig = {
  standardShiftHours: 8,
  maxShiftHours: 10,
  maxWeeklyHours: 48,
  minRestHoursBetweenShifts: 11,
  maxConsecutiveShifts: 6,
  repeatedOvertimeCountThreshold: 3,
  defaultBreakMinutes: 30,
  defaultOvertimeMultiplier: 2.0,
};

export const INDUSTRY_CONFIGS: Record<IndustryId, IndustryConfig> = {
  construction: {
    id: 'construction',
    name: {
      en: 'Construction & Infrastructure',
      ta: 'கட்டுமானத் துறை',
      hi: 'निर्माण और इंफ्रास्ट्रक्चर',
    },
    tagline: {
      en: 'Site crews, scaffolding, electrical safety, and shift attendance',
      ta: 'கட்டுமானத் தளம், சாரம், மின் பாதுகாப்பு மற்றும் வருகை',
      hi: 'साइट कर्मचारी, मचान, बिजली सुरक्षा और शिफ्ट हाज़िरी',
    },
    badgeColor: 'amber',
    defaultHourlyWageInr: 125,
    defaultOvertimeMultiplier: 2.0,
    defaultPfEsiDeductionPercent: 8,
    sites: [
      {
        id: 'site-con-chennai-metro',
        name: {
          en: 'Chennai Metro Phase-II Corridor 4 Site',
          ta: 'சென்னை மெட்ரோ வழித்தடம் 4 தளம்',
          hi: 'चेन्नई मेट्रो फेज-II कॉरिडोर 4 साइट',
        },
        location: {
          en: 'Porur Junction, Chennai',
          ta: 'போரூர், சென்னை',
          hi: 'पोरुर जंक्शन, चेन्नई',
        },
      },
      {
        id: 'site-con-tidco-park',
        name: {
          en: 'TIDCO Industrial Park Tower B',
          ta: 'டிட்கோ தொழிற்பூங்கா கோபுரம் B',
          hi: 'टिडको इंडस्ट्रियल पार्क टॉवर B',
        },
        location: {
          en: 'Sriperumbudur, Kanchipuram',
          ta: 'ஸ்ரீபெரும்புதூர், காஞ்சிபுரம்',
          hi: 'श्रीपेरुम्बुदूर, कांचीपुरम',
        },
      },
    ],
    departments: [
      {
        id: 'dept-con-scaffolding',
        name: {
          en: 'Scaffolding & High-Elevation Rigging',
          ta: 'சாரம் மற்றும் உயரப் பணி',
          hi: 'मचान (Scaffolding) और ऊँचाई कार्य',
        },
        siteId: 'site-con-chennai-metro',
      },
      {
        id: 'dept-con-structural',
        name: {
          en: 'Structural Concrete & Formwork',
          ta: 'கான்கிரீட் மற்றும் கம்பிப் பணி',
          hi: 'कंक्रीट और शटरिंग विभाग',
        },
        siteId: 'site-con-chennai-metro',
      },
      {
        id: 'dept-con-electrical',
        name: {
          en: 'Site Temporary Electrical & Cranes',
          ta: 'தள மின்சாரம் மற்றும் கிரேன் பிரிவு',
          hi: 'साइट विद्युत और क्रेन विभाग',
        },
        siteId: 'site-con-tidco-park',
      },
    ],
    shifts: [
      {
        id: 'shift-con-morning',
        name: {
          en: 'Day Shift (07:00 – 15:30)',
          ta: 'பகல் ஷிப்ட் (07:00 – 15:30)',
          hi: 'दिन की शिफ्ट (07:00 – 15:30)',
        },
        startTime: '07:00',
        endTime: '15:30',
        standardHours: 8,
        defaultBreakMinutes: 30,
      },
      {
        id: 'shift-con-evening',
        name: {
          en: 'Swing Shift (15:00 – 23:30)',
          ta: 'மாலை ஷிப்ட் (15:00 – 23:30)',
          hi: 'शाम की शिफ्ट (15:00 – 23:30)',
        },
        startTime: '15:00',
        endTime: '23:30',
        standardHours: 8,
        defaultBreakMinutes: 30,
      },
    ],
    hazardCategories: [
      {
        id: 'haz-con-scaffold',
        name: {
          en: 'Scaffold Instability',
          ta: 'உறுதியற்ற சாரம் (Scaffold)',
          hi: 'असुरक्षित मचान (Scaffold)',
        },
        description: {
          en: 'Loose base plates, missing guardrails, overloaded planks, or unpinned couplers',
          ta: 'தளர்வான சாரக் கம்பிகள், தடுப்பு இல்லாமை அல்லது பலகை பழுது',
          hi: 'ढीले क्लैंप, रेलिंग न होना या असंतुलित पाड़',
        },
        defaultSeverity: 'CRITICAL',
        iconName: 'AlertTriangle',
      },
      {
        id: 'haz-con-ppe',
        name: {
          en: 'Missing PPE / Harness',
          ta: 'பாதுகாப்பு உபகரணம் (PPE) இல்லை',
          hi: 'PPE / सुरक्षा बेल्ट की कमी',
        },
        description: {
          en: 'Unissued safety harnesses, damaged helmets, missing high-visibility vests or boots',
          ta: 'சேதமடைந்த பெல்ட், ஹெல்மெட் அல்லது பாதுகாப்புக் காலணி இன்மை',
          hi: 'टूटी सेफ्टी बेल्ट, हेलमेट या सुरक्षा जूते न मिलना',
        },
        defaultSeverity: 'HIGH',
        iconName: 'HardHat',
      },
      {
        id: 'haz-con-electrical',
        name: {
          en: 'Electrical Hazards',
          ta: 'மின்சார ஆபத்து',
          hi: 'बिजली का खतरा',
        },
        description: {
          en: 'Exposed live cables near wet concrete, ungrounded generator panels, faulty ELCB',
          ta: 'திறந்த மின்கம்பி, ஈரப்பதத்தில் மின்கசிவு அல்லது ELCB பழுது',
          hi: 'गीले फर्श पर खुले तार, अर्थिंग न होना या खराब ELCB',
        },
        defaultSeverity: 'CRITICAL',
        iconName: 'Zap',
      },
      {
        id: 'haz-con-equipment',
        name: {
          en: 'Unsafe Equipment & Site Conditions',
          ta: 'இயந்திரப் பழுது & பணிச்சூழல்',
          hi: 'असुरक्षित मशीनें और कार्यस्थल',
        },
        description: {
          en: 'Crane load limit alarm malfunction, unbarricaded excavation trench, heat stress',
          ta: 'கிரேன் அலாரம் பழுது, தடுப்பு இல்லாத பள்ளம் அல்லது குடிநீர் இன்மை',
          hi: 'क्रेन अलार्म खराबी, बिना घेराबंदी का गड्ढा या गर्मी',
        },
        defaultSeverity: 'HIGH',
        iconName: 'Wrench',
      },
    ],
    safetyOfficers: [
      {
        id: 'so-con-1',
        name: 'Er. Karthikeyan Subramanian',
        roleTitle: 'Lead Site HSE Officer (Construction)',
        siteId: 'site-con-chennai-metro',
      },
      {
        id: 'so-con-2',
        name: 'Er. Divya Ramachandran',
        roleTitle: 'Structural Safety Inspector',
        siteId: 'site-con-tidco-park',
      },
    ],
  },
  manufacturing: {
    id: 'manufacturing',
    name: {
      en: 'Manufacturing & Factory Operations',
      ta: 'உற்பத்தி மற்றும் தொழிற்சாலை',
      hi: 'मैन्युफैक्चरिंग और फैक्ट्री संचालन',
    },
    tagline: {
      en: 'Press lines, machine guarding, chemical safety, and shift overtime',
      ta: 'பிரஸ் இயந்திரம், பாதுகாப்பு கவசம், ரசாயனப் பாதுகாப்பு மற்றும் ஓவர்டைம்',
      hi: 'प्रेस लाइन, मशीन गार्ड, केमिकल सुरक्षा और ओवरटाइम',
    },
    badgeColor: 'blue',
    defaultHourlyWageInr: 135,
    defaultOvertimeMultiplier: 2.0,
    defaultPfEsiDeductionPercent: 10,
    sites: [
      {
        id: 'site-mfg-oragadam',
        name: {
          en: 'Oragadam Precision Stamping & Assembly Plant',
          ta: 'ஒரகடம் உற்பத்தி மற்றும் அசெம்பிளி ஆலை',
          hi: 'ओरागडम स्टैम्पिंग और असेंबली प्लांट',
        },
        location: {
          en: 'SIPCOT Oragadam, Chennai',
          ta: 'சிப்காட் ஒரகடம், சென்னை',
          hi: 'सिपकॉट ओरागडम, चेन्नई',
        },
      },
      {
        id: 'site-mfg-hosur',
        name: {
          en: 'Hosur EV Powertrain & Battery Enclosure Unit',
          ta: 'ஓசூர் மின்வாகன உதிரிபாக ஆலை',
          hi: 'होसुर ईवी पावरट्रेन और बैटरी यूनिट',
        },
        location: {
          en: 'SIPCOT Phase II, Hosur',
          ta: 'சிப்காட் கட்டம் II, ஓசூர்',
          hi: 'सिपकॉट फेज II, होसुर',
        },
      },
    ],
    departments: [
      {
        id: 'dept-mfg-press',
        name: {
          en: 'Heavy Hydraulic Press Line 3',
          ta: 'ஹைட்ராலிக் பிரஸ் பிரிவு 3',
          hi: 'हाइड्रोलिक प्रेस लाइन 3',
        },
        siteId: 'site-mfg-oragadam',
      },
      {
        id: 'dept-mfg-surface',
        name: {
          en: 'Chemical Surface Treatment & Paint Shop',
          ta: 'ரசாயனப் பூச்சு மற்றும் பெயிண்ட் பிரிவு',
          hi: 'केमिकल ट्रीटमेंट और पेंट शॉप',
        },
        siteId: 'site-mfg-oragadam',
      },
      {
        id: 'dept-mfg-assembly',
        name: {
          en: 'Final Chassis & Torque Assembly Line',
          ta: 'இறுதி அசெம்பிளி பிரிவு',
          hi: 'फाइनल चेसिस असेंबली लाइन',
        },
        siteId: 'site-mfg-hosur',
      },
    ],
    shifts: [
      {
        id: 'shift-mfg-a',
        name: {
          en: 'Shift A (06:00 – 14:30)',
          ta: 'ஷிப்ட் A (06:00 – 14:30)',
          hi: 'शिफ्ट A (06:00 – 14:30)',
        },
        startTime: '06:00',
        endTime: '14:30',
        standardHours: 8,
        defaultBreakMinutes: 30,
      },
      {
        id: 'shift-mfg-b',
        name: {
          en: 'Shift B (14:00 – 22:30)',
          ta: 'ஷிப்ட் B (14:00 – 22:30)',
          hi: 'शिफ्ट B (14:00 – 22:30)',
        },
        startTime: '14:00',
        endTime: '22:30',
        standardHours: 8,
        defaultBreakMinutes: 30,
      },
      {
        id: 'shift-mfg-night',
        name: {
          en: 'Night Shift C (22:00 – 06:30)',
          ta: 'இரவு ஷிப்ட் C (22:00 – 06:30)',
          hi: 'नाइट शिफ्ट C (22:00 – 06:30)',
        },
        startTime: '22:00',
        endTime: '06:30',
        standardHours: 8,
        defaultBreakMinutes: 30,
      },
    ],
    hazardCategories: [
      {
        id: 'haz-mfg-guard',
        name: {
          en: 'Missing Machine Guards',
          ta: 'இயந்திரக் கவசம் (Guard) இல்லை',
          hi: 'मशीन गार्ड गायब है',
        },
        description: {
          en: 'Bypassed light curtains, removed interlocks, or unshielded rotating press shafts',
          ta: 'பிரஸ் இயந்திரத்தில் பாதுகாப்பு தடுப்பு அல்லது சென்சார் அகற்றப்பட்டுள்ளது',
          hi: 'प्रेस मशीन का सुरक्षा गार्ड या सेंसर हटा हुआ है',
        },
        defaultSeverity: 'CRITICAL',
        iconName: 'ShieldAlert',
      },
      {
        id: 'haz-mfg-chemical',
        name: {
          en: 'Chemical Spills & Fumes',
          ta: 'ரசாயனக் கசிவு மற்றும் புகை',
          hi: 'केमिकल रिसाव और धुआँ',
        },
        description: {
          en: 'Solvent or acid floor leaks, blocked exhaust scrubbers, missing eyewash station water',
          ta: 'அமிலம்/ரசாயனக் கசிவு அல்லது காற்றோட்டப் பழுது',
          hi: 'फर्श पर केमिकल रिसाव या एग्जॉस्ट फैन बंद होना',
        },
        defaultSeverity: 'HIGH',
        iconName: 'FlaskConical',
      },
      {
        id: 'haz-mfg-equipment',
        name: {
          en: 'Equipment & LOTO Hazards',
          ta: 'இயந்திரப் பழுது & LOTO ஆபத்து',
          hi: 'मशीन खराबी और LOTO खतरा',
        },
        description: {
          en: 'Missing Lockout/Tagout padlock, overheating conveyor motor, hydraulic hose leak',
          ta: 'LOTO பூட்டு இல்லாமல் பராமரிப்பு, மோட்டார் சூடேறுதல்',
          hi: 'बिना LOTO लॉक के रिपेयर कार्य, कन्वेयर ओवरहीटिंग',
        },
        defaultSeverity: 'HIGH',
        iconName: 'Cog',
      },
      {
        id: 'haz-mfg-ergonomic',
        name: {
          en: 'Floor Slip & Ergonomic Overload',
          ta: 'வழுக்கும் தரை & அதிக எடை',
          hi: 'फिसलन भरा फर्श और भारी भार',
        },
        description: {
          en: 'Oil slick on walkway aisle, repetitive heavy manual lifting without hoist assist',
          ta: 'நடைபாதையில் எண்ணெய் கசிவு அல்லது அதிக பாரம் தூக்குதல்',
          hi: 'रास्ते में तेल गिरना या बिना क्रेन भारी सामान उठाना',
        },
        defaultSeverity: 'MEDIUM',
        iconName: 'AlertCircle',
      },
    ],
    safetyOfficers: [
      {
        id: 'so-mfg-1',
        name: 'Er. Senthil Nathan V.',
        roleTitle: 'Plant EHS Manager (Manufacturing)',
        siteId: 'site-mfg-oragadam',
      },
      {
        id: 'so-mfg-2',
        name: 'Er. Meenakshi Sundaram',
        roleTitle: 'Machine Safety & LOTO Auditor',
        siteId: 'site-mfg-hosur',
      },
    ],
  },
};

export function getIndustryConfig(industry: IndustryId): IndustryConfig {
  return INDUSTRY_CONFIGS[industry];
}
