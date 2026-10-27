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
      ta: 'கட்டுமானம் மற்றும் உள்கட்டமைப்பு',
    },
    tagline: {
      en: 'Active structural sites, contractor crews, scaffolding & electrical safety monitoring',
      ta: 'கட்டுமான தளங்கள், ஒப்பந்தத் தொழிலாளர்கள், சாரம் மற்றும் மின் பாதுகாப்பு கண்காணிப்பு',
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
          ta: 'சென்னை மெட்ரோ கட்டம்-II வழித்தடம் 4 தளம்',
        },
        location: {
          en: 'Porur Junction, Chennai',
          ta: 'போரூர் சந்திப்பு, சென்னை',
        },
      },
      {
        id: 'site-con-tidco-park',
        name: {
          en: 'TIDCO Industrial Park Tower B',
          ta: 'டிட்கோ தொழிற்பூங்கா கோபுரம் B',
        },
        location: {
          en: 'Sriperumbudur, Kanchipuram',
          ta: 'ஸ்ரீபெரும்புதூர், காஞ்சிபுரம்',
        },
      },
    ],
    departments: [
      {
        id: 'dept-con-scaffolding',
        name: {
          en: 'Scaffolding & High-Elevation Rigging',
          ta: 'சாரம் அமைத்தல் மற்றும் உயரப் பணிகள்',
        },
        siteId: 'site-con-chennai-metro',
      },
      {
        id: 'dept-con-structural',
        name: {
          en: 'Structural Concrete & Formwork',
          ta: 'கான்கிரீட் மற்றும் கட்டமைப்புப் பிரிவு',
        },
        siteId: 'site-con-chennai-metro',
      },
      {
        id: 'dept-con-electrical',
        name: {
          en: 'Site Temporary Electrical & Cranes',
          ta: 'தள மின்சாரம் மற்றும் கிரேன் பிரிவு',
        },
        siteId: 'site-con-tidco-park',
      },
    ],
    shifts: [
      {
        id: 'shift-con-morning',
        name: {
          en: 'Day Shift (07:00 – 15:30)',
          ta: 'பகல் பணி (07:00 – 15:30)',
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
          ta: 'மாலை பணி (15:00 – 23:30)',
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
        },
        description: {
          en: 'Loose base plates, missing guardrails, overloaded planks, or unpinned couplers',
          ta: 'தளர்வான அடித்தளம், தடுப்புக் கம்பிகள் இல்லாமை அல்லது ஆபத்தான சாரம்',
        },
        defaultSeverity: 'CRITICAL',
        iconName: 'AlertTriangle',
      },
      {
        id: 'haz-con-ppe',
        name: {
          en: 'Missing PPE / Harness',
          ta: 'பாதுகாப்பு உபகரணங்கள் (PPE) பற்றாக்குறை',
        },
        description: {
          en: 'Unissued safety harnesses, damaged helmets, missing high-visibility vests or boots',
          ta: 'பாதுகாப்பு பெல்ட், தலைக்கவசம் அல்லது காலணிகள் வழங்கப்படாமை',
        },
        defaultSeverity: 'HIGH',
        iconName: 'HardHat',
      },
      {
        id: 'haz-con-electrical',
        name: {
          en: 'Electrical Hazards',
          ta: 'மின்சார ஆபத்துகள்',
        },
        description: {
          en: 'Exposed live cables near wet concrete, ungrounded generator panels, faulty ELCB',
          ta: 'திறந்த மின்கம்பிகள், ஈரப்பதமான இடத்தில் மின் கசிவு ஆபத்து',
        },
        defaultSeverity: 'CRITICAL',
        iconName: 'Zap',
      },
      {
        id: 'haz-con-equipment',
        name: {
          en: 'Unsafe Equipment & Working Conditions',
          ta: 'பாதுகாப்பற்ற இயந்திரங்கள் & பணிச்சூழல்',
        },
        description: {
          en: 'Crane load limit alarm malfunction, unbarricaded excavation trench, heat stress',
          ta: 'கிரேன் பழுது, தடுப்பு இல்லாத பள்ளம் அல்லது குடிநீர் வசதியின்மை',
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
      ta: 'உற்பத்தி மற்றும் தொழிற்சாலை செயல்பாடுகள்',
    },
    tagline: {
      en: 'High-volume assembly lines, press shops, machine guarding & shift overtime tracking',
      ta: 'உற்பத்திப் பிரிவுகள், இயந்திர பாதுகாப்பு கவசங்கள் மற்றும் கூடுதல் பணிநேர கண்காணிப்பு',
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
          ta: 'ஒரகடம் துல்லிய உற்பத்தி மற்றும் அசெம்பிளி ஆலை',
        },
        location: {
          en: 'SIPCOT Oragadam, Chennai',
          ta: 'சிப்காட் ஒரகடம், சென்னை',
        },
      },
      {
        id: 'site-mfg-hosur',
        name: {
          en: 'Hosur EV Powertrain & Battery Enclosure Unit',
          ta: 'ஓசூர் மின்வாகன உதிரிபாக உற்பத்தி ஆலை',
        },
        location: {
          en: 'SIPCOT Phase II, Hosur',
          ta: 'சிப்காட் கட்டம் II, ஓசூர்',
        },
      },
    ],
    departments: [
      {
        id: 'dept-mfg-press',
        name: {
          en: 'Heavy Hydraulic Press Line 3',
          ta: 'ஹைட்ராலிக் பிரஸ் பிரிவு 3',
        },
        siteId: 'site-mfg-oragadam',
      },
      {
        id: 'dept-mfg-surface',
        name: {
          en: 'Chemical Surface Treatment & Paint Shop',
          ta: 'ரசாயன பூச்சு மற்றும் பெயிண்ட் பிரிவு',
        },
        siteId: 'site-mfg-oragadam',
      },
      {
        id: 'dept-mfg-assembly',
        name: {
          en: 'Final Chassis & Torque Assembly Line',
          ta: 'இறுதி அசெம்பிளி பிரிவு',
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
          ta: 'இயந்திர பாதுகாப்பு கவசம் (Guard) இன்மை',
        },
        description: {
          en: 'Bypassed light curtains, removed interlocks, or unshielded rotating press shafts',
          ta: 'பிரஸ் இயந்திரத்தில் பாதுகாப்பு தடுப்பு அல்லது சென்சார் அகற்றப்பட்டிருத்தல்',
        },
        defaultSeverity: 'CRITICAL',
        iconName: 'ShieldAlert',
      },
      {
        id: 'haz-mfg-chemical',
        name: {
          en: 'Chemical Spills & Fumes',
          ta: 'ரசாயன கசிவு மற்றும் நச்சுப் புகை',
        },
        description: {
          en: 'Solvent or acid floor leaks, blocked exhaust scrubbers, missing eyewash station water',
          ta: 'அமிலம்/ரசாயன கசிவு அல்லது காற்றோட்டப் பிரிவு பழுது',
        },
        defaultSeverity: 'HIGH',
        iconName: 'FlaskConical',
      },
      {
        id: 'haz-mfg-equipment',
        name: {
          en: 'Equipment & LOTO Hazards',
          ta: 'இயந்திர பழுது மற்றும் LOTO ஆபத்து',
        },
        description: {
          en: 'Missing Lockout/Tagout padlock, overheating conveyor motor, hydraulic hose leak',
          ta: 'லாக்-அவுட் (LOTO) இல்லாமல் பராமரிப்பு, கன்வேயர் சூடேறுதல்',
        },
        defaultSeverity: 'HIGH',
        iconName: 'Cog',
      },
      {
        id: 'haz-mfg-ergonomic',
        name: {
          en: 'Floor Slip & Ergonomic Overload',
          ta: 'வழுக்கும் தரை மற்றும் அதிக பணிச்சுமை',
        },
        description: {
          en: 'Oil slick on walkway aisle, repetitive heavy manual lifting without hoist assist',
          ta: 'நடைபாதையில் எண்ணெய் கசிவு அல்லது அதிக எடை தூக்கும் ஆபத்து',
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
