import { Language } from '../types/domain';

export interface TranslationDictionary {
  appName: string;
  sdgBadge: string;
  demoModeBanner: string;
  firebaseConnectedBanner: string;
  switchIndustryLabel: string;
  workerPortal: string;
  adminCommandCenter: string;
  languageToggleLabel: string;
  emergencyDisclaimer: string;
  nav: {
    attendance: string;
    safeVoice: string;
    wageLens: string;
    workHistory: string;
    commandCenter: string;
    incidentQueue: string;
    fatigueAlerts: string;
    riskEngine: string;
    whatIfSimulator: string;
  };
  worker: {
    greeting: string;
    activeShift: string;
    noActiveShift: string;
    checkInBtn: string;
    checkOutBtn: string;
    customSimDurationLabel: string;
    breakDeductionLabel: string;
    recordedRegularHours: string;
    recordedOvertimeHours: string;
    shiftHistoryTitle: string;
    reportHazardTitle: string;
    reportHazardSubtitle: string;
    selectHazardCategory: string;
    selectSeverity: string;
    selectSite: string;
    selectDepartment: string;
    describeIssueLabel: string;
    describeIssuePlaceholder: string;
    voiceInputStart: string;
    voiceInputStop: string;
    voiceFallbackNotice: string;
    anonymousToggleLabel: string;
    anonymousHonestExplanation: string;
    submitReportBtn: string;
    lookupReportTitle: string;
    lookupPlaceholder: string;
    lookupBtn: string;
    wageLensTitle: string;
    wageLensSubtitle: string;
    wageDisclaimer: string;
    regularHoursInput: string;
    hourlyWageInput: string;
    overtimeHoursInput: string;
    overtimeMultiplierInput: string;
    deductionsInput: string;
    estimatedNetPay: string;
    arithmeticBreakdown: string;
    skillPassportTitle: string;
    skillPassportSubtitle: string;
  };
  admin: {
    title: string;
    subtitle: string;
    roleRestrictedNotice: string;
    activeWorkersCard: string;
    openIncidentsCard: string;
    highPriorityHazardsCard: string;
    overtimeHoursCard: string;
    fatigueFlagsCard: string;
    avgResolutionHoursCard: string;
    filtersTitle: string;
    allSites: string;
    allDepartments: string;
    allShifts: string;
    priorityActionQueue: string;
    assignOfficerBtn: string;
    updateStatusBtn: string;
    recordResolutionBtn: string;
    acknowledgeAlertBtn: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'FairShift Sentinel',
    sdgBadge: 'UN SDG 8: Decent Work & Economic Growth',
    demoModeBanner:
      'LOCAL DEMO MODE — Using clearly labeled seeded Construction & Manufacturing data stored locally. Not connected to production cloud credentials.',
    firebaseConnectedBanner:
      'CLOUD FIRESTORE MODE — Connected to configured Firebase backend with role-based rules.',
    switchIndustryLabel: 'Active Industry Sector',
    workerPortal: 'Worker Mobile Portal',
    adminCommandCenter: 'Employer Command Center',
    languageToggleLabel: 'தமிழ் / English',
    emergencyDisclaimer:
      'IMPORTANT SAFETY NOTICE: Digital reports in FairShift Sentinel do not guarantee immediate physical safety or replace site emergency stop/evacuation procedures. In life-threatening danger, activate emergency stop and alert your site supervisor immediately.',
    nav: {
      attendance: 'SmartShift Attendance',
      safeVoice: 'SafeVoice Hazards',
      wageLens: 'WageLens Pay Check',
      workHistory: 'Skill Passport & History',
      commandCenter: 'Command Overview',
      incidentQueue: 'Incident Resolution',
      fatigueAlerts: 'Fatigue & Hours Rules',
      riskEngine: 'Risk-to-Resolution Engine',
      whatIfSimulator: 'What-If Shift Simulator',
    },
    worker: {
      greeting: 'Worker Shift & Safety Companion',
      activeShift: 'ACTIVE SHIFT IN PROGRESS',
      noActiveShift: 'READY TO CHECK IN',
      checkInBtn: 'Start Shift Check-In',
      checkOutBtn: 'Complete Shift Check-Out',
      customSimDurationLabel: 'Shift Duration for Demo Check-Out (or real elapsed time)',
      breakDeductionLabel: 'Configurable Break Deduction (mins)',
      recordedRegularHours: 'Regular Hours',
      recordedOvertimeHours: 'Overtime Hours',
      shiftHistoryTitle: 'Verified Attendance & Overtime Log',
      reportHazardTitle: 'SafeVoice Hazard & Safety Reporting',
      reportHazardSubtitle:
        'Report unsafe conditions with one tap, voice dictation, or text. Track every step until resolved.',
      selectHazardCategory: '1. Select Hazard Category',
      selectSeverity: '2. Select Hazard Severity',
      selectSite: '3. Select Worksite / Plant',
      selectDepartment: '4. Select Department / Line',
      describeIssueLabel: '5. Describe the Unsafe Condition',
      describeIssuePlaceholder:
        'Example: East wing level-3 scaffold ledger clamp is loose near pier P-14...',
      voiceInputStart: 'Speak in Tamil / English',
      voiceInputStop: 'Stop Voice Recording',
      voiceFallbackNotice:
        'Browser speech recognition is unavailable or permission was denied. Standard text entry and quick-phrase buttons remain fully functional.',
      anonymousToggleLabel: 'Submit Anonymously (Protect My Identity)',
      anonymousHonestExplanation:
        'How Anonymity Works Here: Your name and worker ID are omitted from the saved incident record and hidden from supervisor views. You receive a random Tracking Code (e.g., ANON-XXXX) to check resolution status. Note: In Local Demo Mode, data resides in your browser storage; in production deployments, network/IP metadata should be stripped by a proxy.',
      submitReportBtn: 'Submit Safety Report Now',
      lookupReportTitle: 'Track Report Status & Resolution History',
      lookupPlaceholder: 'Enter Report ID (e.g. INC-CON-101) or Tracking Code',
      lookupBtn: 'Check Status',
      wageLensTitle: 'WageLens Transparent Pay Estimator',
      wageLensSubtitle:
        'See every step of your regular pay, overtime multiplier, and deductions in INR (₹).',
      wageDisclaimer:
        'Illustrative Estimate Only: This calculation helps workers verify recorded hours and wage arithmetic. It is not an official statutory payslip or legally binding tax document.',
      regularHoursInput: 'Regular Hours Worked',
      hourlyWageInput: 'Base Hourly Wage (₹ INR)',
      overtimeHoursInput: 'Overtime Hours Worked',
      overtimeMultiplierInput: 'Overtime Multiplier (e.g., 2.0x)',
      deductionsInput: 'Applicable Deductions (PF / ESI / Canteen in ₹)',
      estimatedNetPay: 'Estimated Net Take-Home Pay',
      arithmeticBreakdown: 'Step-by-Step Arithmetic Proof',
      skillPassportTitle: 'Portable Work History & Skill Passport',
      skillPassportSubtitle:
        'Your verified shift experience and safety certifications so you never start from zero.',
    },
    admin: {
      title: 'Employer Operations & Safety Command Center',
      subtitle:
        'Real-time visibility into shift attendance, overtime thresholds, explainable fatigue alerts, and unresolved workplace hazards.',
      roleRestrictedNotice:
        'Role-Based Access Control Active: Only Administrator and Authorized Safety Officer roles can assign incidents, transition statuses, or modify fatigue thresholds.',
      activeWorkersCard: 'Active Shift Workers',
      openIncidentsCard: 'Unresolved Hazards',
      highPriorityHazardsCard: 'Critical / High Priority',
      overtimeHoursCard: 'Total Overtime Hours',
      fatigueFlagsCard: 'Active Fatigue Flags',
      avgResolutionHoursCard: 'Avg Resolution Time',
      filtersTitle: 'Operational Filters',
      allSites: 'All Sites / Plants',
      allDepartments: 'All Departments',
      allShifts: 'All Shifts',
      priorityActionQueue: 'Prioritized Supervisor Action Queue',
      assignOfficerBtn: 'Assign Safety Officer',
      updateStatusBtn: 'Advance Status',
      recordResolutionBtn: 'Record Corrective Action & Resolve',
      acknowledgeAlertBtn: 'Acknowledge & Log Follow-Up',
    },
  },
  ta: {
    appName: 'ஃபேர்ஷிப்ட் சென்டினல் (FairShift Sentinel)',
    sdgBadge: 'ஐ.நா SDG 8: கண்ணியமான வேலை & பொருளாதார வளர்ச்சி',
    demoModeBanner:
      'டெமோ முறை (LOCAL DEMO MODE) — கட்டுமானம் மற்றும் தொழிற்சாலை மாதிரித் தரவுகள் உலாவியில் சேமிக்கப்பட்டுள்ளன.',
    firebaseConnectedBanner:
      'கிளவுட் ஃபயர்ஸ்டோர் முறை (CLOUD FIRESTORE) — பாதுகாப்பான தரவுத்தளத்துடன் இணைக்கப்பட்டுள்ளது.',
    switchIndustryLabel: 'தொழில் துறை தேர்வு',
    workerPortal: 'தொழிலாளர் செயலி (Worker)',
    adminCommandCenter: 'நிர்வாக கட்டுப்பாட்டு மையம் (Admin)',
    languageToggleLabel: 'English / தமிழ்',
    emergencyDisclaimer:
      'முக்கிய பாதுகாப்பு அறிவிப்பு: இந்த டிஜிட்டல் புகார் உடனடிப் பாதுகாப்பிற்கு உத்தரவாதம் அல்ல. உயிருக்கு ஆபத்தான நிலையில் உடனடியாக அவசர நிறுத்தப் பொத்தானை (Emergency Stop) அழுத்தி மேற்பார்வையாளரை அழைக்கவும்.',
    nav: {
      attendance: 'வருகைப் பதிவு (SmartShift)',
      safeVoice: 'பாதுகாப்பு புகார் (SafeVoice)',
      wageLens: 'ஊதியக் கணக்கீடு (WageLens)',
      workHistory: 'பணி சான்றிதழ் (Skill Passport)',
      commandCenter: 'நிர்வாகச் சுருக்கம்',
      incidentQueue: 'புகார் தீர்வு மையம்',
      fatigueAlerts: 'சோர்வு & பணிநேர விதிகள்',
      riskEngine: 'ஆபத்து-தீர்வு இயந்திரம்',
      whatIfSimulator: 'ஷிப்ட் திட்ட ஒப்பீடு (What-If)',
    },
    worker: {
      greeting: 'தொழிலாளர் பணிநேரம் & பாதுகாப்புத் தோழன்',
      activeShift: 'பணி நடைபெறுகிறது (ACTIVE SHIFT)',
      noActiveShift: 'பணி தொடங்கத் தயார்',
      checkInBtn: 'பணி வருகைப் பதிவு (Check-In)',
      checkOutBtn: 'பணி நிறைவுப் பதிவு (Check-Out)',
      customSimDurationLabel: 'டெமோ பணி நேரம் (அல்லது உண்மையான பணி நேரம்)',
      breakDeductionLabel: 'உணவு / ஓய்வு நேரக் கழிவு (நிமிடங்கள்)',
      recordedRegularHours: 'சாதாரண பணி நேரம்',
      recordedOvertimeHours: 'கூடுதல் பணி நேரம் (OT)',
      shiftHistoryTitle: 'வருகை மற்றும் கூடுதல் பணிநேர வரலாறு',
      reportHazardTitle: 'SafeVoice பாதுகாப்பு ஆபத்து புகார்',
      reportHazardSubtitle:
        'பணித்தளத்தில் உள்ள ஆபத்துகளை குரல் அல்லது எழுத்து மூலம் எளிதாகப் புகாரளிக்கவும்.',
      selectHazardCategory: '1. ஆபத்து வகையைத் தேர்ந்தெடுக்கவும்',
      selectSeverity: '2. ஆபத்தின் தீவிரம் (Severity)',
      selectSite: '3. பணித்தளம் / ஆலை',
      selectDepartment: '4. பிரிவு / துறை',
      describeIssueLabel: '5. ஆபத்து குறித்த விவரம்',
      describeIssuePlaceholder:
        'உதாரணம்: 3-வது தளத்தில் சாரம் (Scaffold) கம்பி தளர்வாக உள்ளது...',
      voiceInputStart: 'குரல் மூலம் பதிவு செய்க (Voice)',
      voiceInputStop: 'குரல் பதிவை நிறுத்துக',
      voiceFallbackNotice:
        'உங்கள் உலாவியில் குரல் பதிவு வசதி இல்லை அல்லது அனுமதி மறுக்கப்பட்டுள்ளது. கீழே உள்ள விரைவு பொத்தான்கள் அல்லது எழுத்து மூலம் புகாரளிக்கலாம்.',
      anonymousToggleLabel: 'பெயர் குறிப்பிடாமல் புகாரளி (Anonymous)',
      anonymousHonestExplanation:
        'ரகசியப் பாதுகாப்பு விளக்கம்: உங்கள் பெயர் மற்றும் தொழிலாளர் எண் புகாரில் சேமிக்கப்படாது. புகாரின் நிலையை அறிய தனிப்பட்ட குறியீடு (Tracking Code) வழங்கப்படும்.',
      submitReportBtn: 'பாதுகாப்பு புகாரை சமர்ப்பி',
      lookupReportTitle: 'புகார் நிலை மற்றும் தீர்வு விவரம் காண்க',
      lookupPlaceholder: 'புகார் எண் (எ.கா. INC-CON-101) அல்லது குறியீடு',
      lookupBtn: 'நிலையைச் சரிபார்',
      wageLensTitle: 'WageLens தெளிவான ஊதியக் கணக்கீடு',
      wageLensSubtitle:
        'சாதாரண ஊதியம், ஓவர்டைம் (OT) மற்றும் பிடித்தங்கள் எவ்வாறு கணக்கிடப்படுகின்றன என்பதைத் தெளிவாகக் காண்க (₹ INR).',
      wageDisclaimer:
        'மாதிரி மதிப்பீடு மட்டுமே: இது தொழிலாளர்கள் தங்கள் பணிநேர ஊதியத்தைச் சரிபார்க்க உதவும் கருவியாகும். இது அதிகாரப்பூர்வ சம்பளச் சீட்டு (Payslip) அல்ல.',
      regularHoursInput: 'சாதாரண பணி மணிநேரம்',
      hourlyWageInput: 'மணிநேர அடிப்படை ஊதியம் (₹ INR)',
      overtimeHoursInput: 'கூடுதல் பணி மணிநேரம் (Overtime)',
      overtimeMultiplierInput: 'ஓவர்டைம் மடங்கு (எ.கா. 2.0x)',
      deductionsInput: 'பிடித்தங்கள் (PF / ESI / உணவகம் ₹)',
      estimatedNetPay: 'மதிப்பிடப்பட்ட நிகர ஊதியம் (Net Pay)',
      arithmeticBreakdown: 'படிப்படியான கணக்கீட்டு விளக்கம்',
      skillPassportTitle: 'பணி அனுபவம் மற்றும் திறன் சான்றிதழ்',
      skillPassportSubtitle:
        'உங்கள் பணி அனுபவம் மற்றும் பாதுகாப்புப் பயிற்சிகளின் சரிபார்க்கப்பட்ட பதிவேடு.',
    },
    admin: {
      title: 'நிறுவன செயல்பாடு மற்றும் பாதுகாப்பு கட்டுப்பாட்டு மையம்',
      subtitle:
        'வருகைப் பதிவு, ஓவர்டைம், தொழிலாளர் சோர்வு எச்சரிக்கைகள் மற்றும் பாதுகாப்பு புகார்களின் நேரடி கண்காணிப்பு.',
      roleRestrictedNotice:
        'அதிகாரக் கட்டுப்பாடு: நிர்வாகி (Admin) மற்றும் பாதுகாப்பு அதிகாரி மட்டுமே புகார்களை ஒதுக்கவும் தீர்வு காணவும் முடியும்.',
      activeWorkersCard: 'பணியில் உள்ள தொழிலாளர்கள்',
      openIncidentsCard: 'தீர்க்கப்படாத புகார்கள்',
      highPriorityHazardsCard: 'தீவிர ஆபத்துகள்',
      overtimeHoursCard: 'மொத்த ஓவர்டைம் மணிநேரம்',
      fatigueFlagsCard: 'சோர்வு எச்சரிக்கைகள்',
      avgResolutionHoursCard: 'சராசரி தீர்வு நேரம்',
      filtersTitle: 'வடிகட்டிகள் (Filters)',
      allSites: 'அனைத்து தளங்கள் / ஆலைகள்',
      allDepartments: 'அனைத்து துறைகள்',
      allShifts: 'அனைத்து ஷிப்ட்கள்',
      priorityActionQueue: 'முன்னுரிமை நடவடிக்கை பட்டியல்',
      assignOfficerBtn: 'அதிகாரியை நியமி',
      updateStatusBtn: 'நிலையை மாற்று',
      recordResolutionBtn: 'தீர்வைப் பதிவு செய்',
      acknowledgeAlertBtn: 'சரிபார்த்துக் குறிப்பு எழுது',
    },
  },
};
