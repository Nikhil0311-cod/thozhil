import {
  AttendanceStatus,
  IncidentSeverity,
  IncidentStatus,
  Language,
} from '../types/domain';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  sdgBadge: string;
  demoModeBanner: string;
  firebaseConnectedBanner: string;
  resetSeedBtn: string;
  switchIndustryLabel: string;
  constructionLabel: string;
  manufacturingLabel: string;
  workerPortal: string;
  adminCommandCenter: string;
  languageLabel: string;
  footerLeft: string;
  footerRight: string;
  emergencyDisclaimer: string;
  statuses: Record<IncidentStatus, string>;
  severities: Record<IncidentSeverity, string>;
  attendanceStatuses: Record<AttendanceStatus, string>;
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
    switchProfileLabel: string;
    baseRateLabel: string;
    standardShiftInfo: string;
    overtimeRateInfo: string;
    activeShift: string;
    noActiveShift: string;
    worksiteLabel: string;
    departmentLabel: string;
    shiftScheduleLabel: string;
    checkInBtn: string;
    checkOutBtn: string;
    customSimDurationLabel: string;
    simDuration8h: string;
    simDuration10_5h: string;
    simDuration11_5h: string;
    simDuration0h: string;
    breakDeductionLabel: string;
    recordedRegularHours: string;
    recordedOvertimeHours: string;
    shiftHistoryTitle: string;
    totalLoggedSummary: string;
    inTimeLabel: string;
    outTimeLabel: string;
    missingOrActiveLabel: string;
    breakShortLabel: string;
    personalFatigueTitle: string;
    noPersonalFatigue: string;
    reportHazardTitle: string;
    reportHazardSubtitle: string;
    selectHazardCategory: string;
    selectSeverity: string;
    selectSite: string;
    selectDepartment: string;
    describeIssueLabel: string;
    describeIssuePlaceholder: string;
    quickTemplatesLabel: string;
    voiceInputStart: string;
    voiceInputStop: string;
    voiceFallbackNotice: string;
    anonymousToggleLabel: string;
    anonymousHonestExplanation: string;
    submitReportBtn: string;
    reportSubmittedTitle: string;
    trackingCodeLabel: string;
    identityModeLabel: string;
    anonymousModeValue: string;
    namedModeValue: string;
    lookupReportTitle: string;
    lookupPlaceholder: string;
    reporterLabel: string;
    anonymousReporterValue: string;
    assignedOfficerLabel: string;
    pendingAssignmentValue: string;
    correctiveActionLabel: string;
    resolutionVerifiedLabel: string;
    wageLensTitle: string;
    wageLensSubtitle: string;
    wageDisclaimer: string;
    regularHoursInput: string;
    hourlyWageInput: string;
    overtimeHoursInput: string;
    overtimeMultiplierInput: string;
    deductionsInput: string;
    estimatedNetPay: string;
    regularPayShort: string;
    overtimePayShort: string;
    grossPayShort: string;
    arithmeticBreakdown: string;
    payrollVerificationTitle: string;
    recordedGrossLabel: string;
    payrollSheetLabel: string;
    skillPassportTitle: string;
    skillPassportSubtitle: string;
    verifiedBadge: string;
    verifiedShiftsLabel: string;
    joinedDateLabel: string;
    primaryTradeLabel: string;
    certificationsHeading: string;
    issuedLabel: string;
    verifiedByLabel: string;
  };
  admin: {
    title: string;
    subtitle: string;
    operationalRecordsBadge: string;
    activeRoleLabel: string;
    roleAdminOption: string;
    roleSafetyOfficerOption: string;
    roleWorkerOption: string;
    actingOfficerLabel: string;
    roleRestrictedNotice: string;
    dismissBtn: string;
    activeWorkersCard: string;
    regularLoggedSub: string;
    openIncidentsCard: string;
    totalReportsSub: string;
    highPriorityHazardsCard: string;
    criticalHighSub: string;
    overtimeHoursCard: string;
    shiftRecordsSub: string;
    fatigueFlagsCard: string;
    totalRuleFlagsSub: string;
    avgResolutionHoursCard: string;
    verifiedClosedSub: string;
    filtersTitle: string;
    allSites: string;
    allDepartments: string;
    allShifts: string;
    dateWindowLabel: string;
    dateAll: string;
    dateLast3Days: string;
    dateToday: string;
    priorityActionQueue: string;
    priorityActionSubtitle: string;
    actionItemsCount: string;
    noActionItemsEmpty: string;
    whyTriggeredLabel: string;
    recommendedActionLabel: string;
    attendanceChartTitle: string;
    attendanceChartSubtitle: string;
    noAttendanceEmpty: string;
    lifecyclePipelineTitle: string;
    workforceAttendanceTableTitle: string;
    incidentQueueHeading: string;
    incidentQueueSubtitle: string;
    noIncidentsEmpty: string;
    step1AssignLabel: string;
    assignOfficerBtn: string;
    step2CorrectiveLabel: string;
    correctivePlaceholder: string;
    logCorrectiveBtn: string;
    step3ResolutionLabel: string;
    resolutionPlaceholder: string;
    recordResolutionBtn: string;
    auditHistoryLabel: string;
    fatigueThresholdsTitle: string;
    fatigueThresholdsSubtitle: string;
    maxShiftHoursLabel: string;
    minRestHoursLabel: string;
    repeatedOtThresholdLabel: string;
    maxConsecutiveDaysLabel: string;
    applyPolicyBtn: string;
    noFatigueAlertsEmpty: string;
    observedLabel: string;
    limitLabel: string;
    relevantRecordsLabel: string;
    acknowledgedByLabel: string;
    followUpPlaceholder: string;
    acknowledgeAlertBtn: string;
    riskEngineHeading: string;
    riskEngineSubtitle: string;
    formulaLabel: string;
    payrollAuditHeading: string;
    reconcilePlaceholder: string;
    approveReconcileBtn: string;
    whatIfHeading: string;
    whatIfSubtitle: string;
    recommendedBadge: string;
    adjustDailyHoursLabel: string;
    totalViolationsLabel: string;
    projectedOvertimeLabel: string;
    restViolationsLabel: string;
    consecutiveFlagsLabel: string;
    zeroViolationsMsg: string;
    recommendationHeading: string;
  };
  quickPhrases: Record<'construction' | 'manufacturing', string[]>;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'THOZHIL',
    tagline: 'Work with dignity.',
    sdgBadge: 'UN SDG 8 • Decent Work',
    demoModeBanner:
      'Local Demo Mode — Displaying sample Construction & Manufacturing records stored in this browser.',
    firebaseConnectedBanner:
      'Cloud Firestore Connected — Enforcing role-based access rules.',
    resetSeedBtn: 'Reset Sample Data',
    switchIndustryLabel: 'Industry Sector',
    constructionLabel: 'Construction',
    manufacturingLabel: 'Manufacturing',
    workerPortal: 'Worker View',
    adminCommandCenter: 'Admin View',
    languageLabel: 'Language',
    footerLeft: 'THOZHIL — Work with dignity.',
    footerRight: 'Workplace Safety, Attendance & Wage Transparency (UN SDG 8)',
    emergencyDisclaimer:
      'Safety Notice: Submitting a digital report does not guarantee immediate physical safety or replace site emergency stop procedures. In urgent danger, stop work and alert your supervisor immediately.',
    statuses: {
      OPEN: 'Open',
      ASSIGNED: 'Assigned',
      IN_PROGRESS: 'In progress',
      RESOLVED: 'Resolved',
    },
    severities: {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      CRITICAL: 'Critical',
    },
    attendanceStatuses: {
      ACTIVE: 'On Shift',
      COMPLETED: 'Completed',
      FLAGGED_MISSING_CHECKOUT: 'Missing Check-Out',
      FLAGGED_ZERO_DURATION: 'Zero Duration',
      FLAGGED_OVERTIME_REVIEW: 'Overtime Review',
    },
    nav: {
      attendance: 'Attendance',
      safeVoice: 'Safety Reports',
      wageLens: 'Wage Insights',
      workHistory: 'Skills Passport',
      commandCenter: 'Operations Overview',
      incidentQueue: 'Safety Incidents',
      fatigueAlerts: 'Fatigue & Hours',
      riskEngine: 'Risk & Payroll Audit',
      whatIfSimulator: 'Shift Simulator',
    },
    worker: {
      greeting: 'Worker Operations Portal',
      switchProfileLabel: 'Active Worker Profile (Demo)',
      baseRateLabel: 'Base Wage',
      standardShiftInfo: 'Standard Shift',
      overtimeRateInfo: 'Overtime Rate',
      activeShift: 'On Shift',
      noActiveShift: 'Off Shift',
      worksiteLabel: 'Worksite / Plant',
      departmentLabel: 'Department / Crew',
      shiftScheduleLabel: 'Shift Schedule',
      checkInBtn: 'Start Shift Check-In',
      checkOutBtn: 'Complete Shift Check-Out',
      customSimDurationLabel: 'Shift Duration for Check-Out (Demo)',
      simDuration8h: '8.0 Net Hours (Standard 8h Shift, 0h OT)',
      simDuration10_5h: '10.5 Net Hours (8h Regular + 2.5h Overtime)',
      simDuration11_5h: '11.5 Net Hours (8h Regular + 3.5h OT — Fatigue Flag)',
      simDuration0h: '0.0 Net Hours (Zero-Duration Flag Test)',
      breakDeductionLabel: 'Break Deduction (mins)',
      recordedRegularHours: 'Regular',
      recordedOvertimeHours: 'Overtime',
      shiftHistoryTitle: 'Attendance & Overtime Log',
      totalLoggedSummary: 'Total Logged',
      inTimeLabel: 'In',
      outTimeLabel: 'Out',
      missingOrActiveLabel: 'Active / No Check-Out',
      breakShortLabel: 'Break',
      personalFatigueTitle: 'Rest & Hours Advisory Flags',
      noPersonalFatigue: 'No active rest or overtime flags for your profile.',
      reportHazardTitle: 'Report a Workplace Hazard',
      reportHazardSubtitle:
        'Report unsafe equipment or site conditions by voice or text and track resolution status.',
      selectHazardCategory: '1. Hazard Category',
      selectSeverity: '2. Severity Level',
      selectSite: '3. Worksite / Plant',
      selectDepartment: '4. Department / Line',
      describeIssueLabel: '5. Hazard Details',
      describeIssuePlaceholder:
        'Describe the location and hazard (e.g., loose scaffold clamp on East Wing Pier 14)...',
      quickTemplatesLabel: 'Quick One-Tap Descriptions:',
      voiceInputStart: 'Voice Input',
      voiceInputStop: 'Stop Recording',
      voiceFallbackNotice:
        'Voice input is unavailable in this browser. Please use the quick buttons or type below.',
      anonymousToggleLabel: 'Report Anonymously (Hide My Name & ID)',
      anonymousHonestExplanation:
        'Privacy note: When enabled, your name and worker ID are removed from the report and hidden from supervisors. Use your Tracking Code (ANON-XXXX) to check progress.',
      submitReportBtn: 'Submit Safety Report Now',
      reportSubmittedTitle: 'Safety Report Submitted! ID:',
      trackingCodeLabel: 'Tracking Code:',
      identityModeLabel: 'Reporter Mode:',
      anonymousModeValue: 'Anonymous (Name & ID omitted)',
      namedModeValue: 'Named Report',
      lookupReportTitle: 'Track Safety Reports & Resolutions',
      lookupPlaceholder: 'Search by Report ID (INC-CON-101) or Tracking Code',
      reporterLabel: 'Reporter',
      anonymousReporterValue: 'Anonymous Worker',
      assignedOfficerLabel: 'Assigned Officer',
      pendingAssignmentValue: 'Unassigned',
      correctiveActionLabel: 'Corrective Action',
      resolutionVerifiedLabel: 'Resolution Note',
      wageLensTitle: 'Wage & Overtime Calculator',
      wageLensSubtitle:
        'Check your estimated regular pay, overtime rate, and deductions in ₹ INR.',
      wageDisclaimer:
        'Note: This is an illustrative pay estimate to help verify recorded hours. It is not an official statutory payslip.',
      regularHoursInput: 'Regular Hours',
      hourlyWageInput: 'Hourly Wage (₹ INR)',
      overtimeHoursInput: 'Overtime Hours',
      overtimeMultiplierInput: 'Overtime Multiplier (e.g. 2.0x)',
      deductionsInput: 'Deductions (PF / ESI / Canteen ₹)',
      estimatedNetPay: 'Estimated Net Pay',
      regularPayShort: 'Regular Pay',
      overtimePayShort: 'Overtime Pay',
      grossPayShort: 'Gross Pay',
      arithmeticBreakdown: 'Calculation Breakdown',
      payrollVerificationTitle: 'Attendance vs. Payroll Sheet Check',
      recordedGrossLabel: 'Recorded Attendance Gross',
      payrollSheetLabel: 'Payroll Register Gross',
      skillPassportTitle: 'Skills Passport & Work History',
      skillPassportSubtitle:
        'Verified shift experience and trade safety certifications.',
      verifiedBadge: 'Verified Profile',
      verifiedShiftsLabel: 'Completed Shifts',
      joinedDateLabel: 'Joined Date',
      primaryTradeLabel: 'Trade / Role',
      certificationsHeading: 'Safety & Trade Certifications',
      issuedLabel: 'Issued',
      verifiedByLabel: 'Verified by',
    },
    admin: {
      title: 'Workforce & Safety Operations Center',
      subtitle:
        'Monitor shift attendance, overtime exposure, fatigue alerts, and hazard resolution.',
      operationalRecordsBadge: 'Live & Sample Operational Records',
      activeRoleLabel: 'Session Role (Access Control)',
      roleAdminOption: 'Administrator (Full Access)',
      roleSafetyOfficerOption: 'Safety Officer (HSE Access)',
      roleWorkerOption: 'Worker Role (Read-Only in Admin)',
      actingOfficerLabel: 'Acting Officer Name',
      roleRestrictedNotice:
        'Access Restricted: Current role is set to Worker. Assigning incidents, resolving hazards, or changing policy rules requires Administrator or Safety Officer role.',
      dismissBtn: 'Close',
      activeWorkersCard: 'Active Workers',
      regularLoggedSub: 'regular hours logged',
      openIncidentsCard: 'Open Hazards',
      totalReportsSub: 'total reports',
      highPriorityHazardsCard: 'Critical / High',
      criticalHighSub: 'unresolved high-risk',
      overtimeHoursCard: 'Overtime Hours',
      shiftRecordsSub: 'shift records',
      fatigueFlagsCard: 'Fatigue Alerts',
      totalRuleFlagsSub: 'total rule flags',
      avgResolutionHoursCard: 'Avg Resolution',
      verifiedClosedSub: 'closed reports',
      filtersTitle: 'Filters',
      allSites: 'All Sites / Plants',
      allDepartments: 'All Departments',
      allShifts: 'All Shifts',
      dateWindowLabel: 'Date Range',
      dateAll: 'All Dates',
      dateLast3Days: 'Last 3 Days',
      dateToday: 'Last 24 Hours',
      priorityActionQueue: 'Priority Supervisor Action Queue',
      priorityActionSubtitle:
        'Ranked by hazard severity, time open, fatigue rules, and payroll variance',
      actionItemsCount: 'Items',
      noActionItemsEmpty: 'No pending action items for the selected filters.',
      whyTriggeredLabel: 'Reason',
      recommendedActionLabel: 'Next Action',
      attendanceChartTitle: 'Shift & Overtime Hours by Worker',
      attendanceChartSubtitle: 'Compared against single-shift hour limit',
      noAttendanceEmpty: 'No attendance records match the current filters.',
      lifecyclePipelineTitle: 'Safety Report Status Summary',
      workforceAttendanceTableTitle: 'Workforce Attendance & Overtime Register',
      incidentQueueHeading: 'Safety Incident Resolution Queue',
      incidentQueueSubtitle:
        'Status flow: OPEN → ASSIGNED → IN_PROGRESS → RESOLVED. Anonymous reports hide worker identity.',
      noIncidentsEmpty: 'No safety incidents match the selected filters.',
      step1AssignLabel: 'Step 1: Assign Safety Officer',
      assignOfficerBtn: 'Assign Safety Officer',
      step2CorrectiveLabel: 'Step 2: Record Corrective Action',
      correctivePlaceholder:
        'Describe physical fix (e.g., replaced clamp and installed guardrail)...',
      logCorrectiveBtn: 'Log Corrective Action',
      step3ResolutionLabel: 'Step 3: Final Verification & Resolution Notes',
      resolutionPlaceholder:
        'Record inspection sign-off before closing incident...',
      recordResolutionBtn: 'Record Corrective Action & Resolve',
      auditHistoryLabel: 'Status Audit Log',
      fatigueThresholdsTitle: 'Fatigue & Shift Policy Rules',
      fatigueThresholdsSubtitle:
        'Configure thresholds for supervisor welfare review. Flags never penalize workers.',
      maxShiftHoursLabel: 'Max Single-Shift Hours',
      minRestHoursLabel: 'Min Rest Between Shifts (hrs)',
      repeatedOtThresholdLabel: 'Repeated Overtime Shifts Limit',
      maxConsecutiveDaysLabel: 'Max Consecutive Work Days',
      applyPolicyBtn: 'Save Rules & Recalculate',
      noFatigueAlertsEmpty: 'No fatigue alerts triggered under current rules.',
      observedLabel: 'Recorded',
      limitLabel: 'Limit',
      relevantRecordsLabel: 'Attendance IDs',
      acknowledgedByLabel: 'Reviewed by',
      followUpPlaceholder:
        'Enter supervisor follow-up note (e.g., scheduled 14h rest before next shift)...',
      acknowledgeAlertBtn: 'Acknowledge & Save Note',
      riskEngineHeading: 'Risk & Compliance Correlation Queue',
      riskEngineSubtitle:
        'Deterministic correlation of safety hazards, recurring department clusters, fatigue flags, and wage discrepancies.',
      formulaLabel: 'Score',
      payrollAuditHeading: 'Attendance vs. Payroll Discrepancy Audit',
      reconcilePlaceholder:
        'Enter reconciliation note (e.g., approved supplementary overtime payout)...',
      approveReconcileBtn: 'Reconcile Overtime',
      whatIfHeading: 'Shift Schedule Simulator (What-If Comparison)',
      whatIfSubtitle:
        'Compare two proposed weekly rosters for overtime exposure, rest violations, and daily staffing coverage.',
      recommendedBadge: 'Recommended',
      adjustDailyHoursLabel: 'Adjust Daily Shift Hours',
      totalViolationsLabel: 'Rule Violations',
      projectedOvertimeLabel: 'Projected Overtime',
      restViolationsLabel: 'Rest Violations',
      consecutiveFlagsLabel: 'Consecutive-Day Flags',
      zeroViolationsMsg: 'No rest, overtime ceiling, or staffing violations.',
      recommendationHeading: 'Comparison Summary',
    },
    quickPhrases: {
      construction: [
        'East wing level-3 scaffold ledger clamp is loose and missing outer guardrail.',
        'Exposed 415V temporary power cable lying near wet concrete curing bay.',
        'Safety harness lanyard webbing is frayed at Pier P-12 rigging station.',
      ],
      manufacturing: [
        'Side protective interlock guard removed on 250T Hydraulic Press Line 3.',
        'Chemical degreaser leak on walkway grating beside Tank B.',
        'Lockout/Tagout (LOTO) padlock clasp missing on conveyor maintenance hatch.',
      ],
    },
  },
  ta: {
    appName: 'THOZHIL',
    tagline: 'கண்ணியமான உழைப்பு.',
    sdgBadge: 'ஐ.நா SDG 8 • கண்ணியமான வேலை',
    demoModeBanner:
      'டெமோ முறை — மாதிரி கட்டுமானம் மற்றும் தொழிற்சாலை தரவுகள் இங்கே காட்டப்படுகின்றன.',
    firebaseConnectedBanner:
      'கிளவுட் தரவுத்தளம் இணைக்கப்பட்டுள்ளது — பாதுகாப்பு விதிகள் செயலில் உள்ளன.',
    resetSeedBtn: 'மாதிரி தரவை மீட்டமை',
    switchIndustryLabel: 'துறை',
    constructionLabel: 'கட்டுமானம்',
    manufacturingLabel: 'உற்பத்தி',
    workerPortal: 'தொழிலாளர் பகுதி',
    adminCommandCenter: 'நிர்வாகப் பகுதி',
    languageLabel: 'மொழி',
    footerLeft: 'THOZHIL — கண்ணியமான உழைப்பு.',
    footerRight: 'பணிப் பாதுகாப்பு, வருகை மற்றும் சம்பள வெளிப்படைத்தன்மை (SDG 8)',
    emergencyDisclaimer:
      'பாதுகாப்பு குறிப்பு: ஆப் மூலம் புகார் அளிப்பது அவசர நிறுத்தத்திற்கு மாற்றாகாது. உடனடி ஆபத்து எனில் வேலையை நிறுத்திவிட்டு மேற்பார்வையாளரிடம் தெரிவிக்கவும்.',
    statuses: {
      OPEN: 'நிலுவை',
      ASSIGNED: 'ஒதுக்கப்பட்டது',
      IN_PROGRESS: 'நடக்கிறது',
      RESOLVED: 'தீர்ந்தது',
    },
    severities: {
      LOW: 'குறைவு',
      MEDIUM: 'நடுத்தரம்',
      HIGH: 'அதிகம்',
      CRITICAL: 'மிகத் தீவிரம்',
    },
    attendanceStatuses: {
      ACTIVE: 'பணியில்',
      COMPLETED: 'முடிந்தது',
      FLAGGED_MISSING_CHECKOUT: 'செக்-அவுட் இல்லை',
      FLAGGED_ZERO_DURATION: 'நேரம் பதிவாகவில்லை',
      FLAGGED_OVERTIME_REVIEW: 'ஓவர்டைம் ஆய்வு',
    },
    nav: {
      attendance: 'வருகை',
      safeVoice: 'பாதுகாப்புப் புகார்',
      wageLens: 'சம்பள விவரம்',
      workHistory: 'திறன் சான்று',
      commandCenter: 'சுருக்கம்',
      incidentQueue: 'புகார்கள்',
      fatigueAlerts: 'பணிச்சோர்வு & நேரம்',
      riskEngine: 'ஆபத்து & சம்பள ஆய்வு',
      whatIfSimulator: 'ஷிப்ட் ஒப்பீடு',
    },
    worker: {
      greeting: 'தொழிலாளர் பக்கம்',
      switchProfileLabel: 'தொழிலாளர் தேர்வு (டெமோ)',
      baseRateLabel: 'அடிப்படை சம்பளம்',
      standardShiftInfo: 'சாதாரண ஷிப்ட்',
      overtimeRateInfo: 'ஓவர்டைம் விகிதம்',
      activeShift: 'பணியில் உள்ளீர்',
      noActiveShift: 'பணி தொடங்கவில்லை',
      worksiteLabel: 'பணித்தளம் / ஆலை',
      departmentLabel: 'பிரிவு / துறை',
      shiftScheduleLabel: 'ஷிப்ட் நேரம்',
      checkInBtn: 'பணி தொடங்கு (Check-In)',
      checkOutBtn: 'பணி முடி (Check-Out)',
      customSimDurationLabel: 'டெமோ பணி நேரம்',
      simDuration8h: '8.0 மணிநேரம் (சாதாரண ஷிப்ட், 0h OT)',
      simDuration10_5h: '10.5 மணிநேரம் (8h சாதாரண + 2.5h ஓவர்டைம்)',
      simDuration11_5h: '11.5 மணிநேரம் (8h + 3.5h OT — அதிக பணிநேரம்)',
      simDuration0h: '0.0 மணிநேரம் (பூஜ்ய நேர சோதனை)',
      breakDeductionLabel: 'உணவு / ஓய்வு இடைவேளை (நிமிடம்)',
      recordedRegularHours: 'சாதாரண நேரம்',
      recordedOvertimeHours: 'ஓவர்டைம் (OT)',
      shiftHistoryTitle: 'வருகை மற்றும் ஓவர்டைம் விவரம்',
      totalLoggedSummary: 'மொத்த நேரம்',
      inTimeLabel: 'வரவு',
      outTimeLabel: 'முடிவு',
      missingOrActiveLabel: 'பணியில் / முடிவு இல்லை',
      breakShortLabel: 'இடைவேளை',
      personalFatigueTitle: 'பணிநேரம் மற்றும் ஓய்வு அறிவிப்புகள்',
      noPersonalFatigue: 'உங்களுக்கு பணிச்சோர்வு எச்சரிக்கை எதுவும் இல்லை.',
      reportHazardTitle: 'ஆபத்தைப் புகாரளி',
      reportHazardSubtitle:
        'பணித்தளத்தில் உள்ள ஆபத்தை குரல் அல்லது எழுத்து மூலம் உடனே தெரிவிக்கவும்.',
      selectHazardCategory: '1. ஆபத்து வகை',
      selectSeverity: '2. ஆபத்தின் அளவு',
      selectSite: '3. பணித்தளம் / ஆலை',
      selectDepartment: '4. பிரிவு',
      describeIssueLabel: '5. ஆபத்து விவரம்',
      describeIssuePlaceholder:
        'ஆபத்து உள்ள இடத்தையும் விவரத்தையும் எழுதவும் (எ.கா. 3-வது தளத்தில் சாரக் கம்பி தளர்வு)...',
      quickTemplatesLabel: 'விரைவுத் தேர்வு வாக்கியங்கள்:',
      voiceInputStart: 'குரல் பதிவு',
      voiceInputStop: 'பதிவை நிறுத்து',
      voiceFallbackNotice:
        'இந்த உலாவியில் குரல் பதிவு வசதி இல்லை. கீழே உள்ள வாக்கியங்களைத் தேர்வு செய்யவும் அல்லது தட்டச்சு செய்யவும்.',
      anonymousToggleLabel: 'பெயர் காட்டாமல் புகாரளி (Anonymous)',
      anonymousHonestExplanation:
        'ரகசியக் காப்பு: உங்கள் பெயரும் எண்ணும் புகாரில் சேமிக்கப்படாது. புகாரின் நிலையை அறிய தனி குறியீடு (ANON-XXXX) தரப்படும்.',
      submitReportBtn: 'புகாரை அனுப்பு',
      reportSubmittedTitle: 'புகார் அனுப்பப்பட்டது! எண்:',
      trackingCodeLabel: 'கண்காணிப்பு குறியீடு:',
      identityModeLabel: 'புகார் முறை:',
      anonymousModeValue: 'பெயர் இல்லாதது (Anonymous)',
      namedModeValue: 'பெயருடன்',
      lookupReportTitle: 'புகார் நிலை மற்றும் தீர்வு விவரம்',
      lookupPlaceholder: 'புகார் எண் (INC-CON-101) அல்லது குறியீட்டை உள்ளிடவும்',
      reporterLabel: 'புகாரளித்தவர்',
      anonymousReporterValue: 'பெயர் மறைக்கப்பட்டது',
      assignedOfficerLabel: 'பொறுப்பு அதிகாரி',
      pendingAssignmentValue: 'இன்னும் ஒதுக்கப்படவில்லை',
      correctiveActionLabel: 'எடுக்கப்பட்ட நடவடிக்கை',
      resolutionVerifiedLabel: 'தீர்வுக் குறிப்பு',
      wageLensTitle: 'சம்பளம் மற்றும் ஓவர்டைம் கணக்கீடு',
      wageLensSubtitle:
        'சாதாரண சம்பளம், ஓவர்டைம் மற்றும் பிடித்தங்களைத் தெளிவாகச் சரிபார்க்கவும் (₹ INR).',
      wageDisclaimer:
        'குறிப்பு: இது உங்கள் பணிநேர சம்பளத்தைச் சரிபார்க்க உதவும் உத்தேசக் கணக்கீடு மட்டுமே; அதிகாரப்பூர்வ சம்பளச் சீட்டு அல்ல.',
      regularHoursInput: 'சாதாரண பணி மணிநேரம்',
      hourlyWageInput: 'மணிநேர சம்பளம் (₹)',
      overtimeHoursInput: 'ஓவர்டைம் மணிநேரம் (OT)',
      overtimeMultiplierInput: 'ஓவர்டைம் மடங்கு (எ.கா. 2.0x)',
      deductionsInput: 'பிடித்தங்கள் (PF / ESI / உணவகம் ₹)',
      estimatedNetPay: 'கைக்கு வரும் நிகர சம்பளம்',
      regularPayShort: 'சாதாரண சம்பளம்',
      overtimePayShort: 'ஓவர்டைம் சம்பளம்',
      grossPayShort: 'மொத்த சம்பளம்',
      arithmeticBreakdown: 'கணக்கீட்டு விவரம்',
      payrollVerificationTitle: 'வருகைப் பதிவு மற்றும் சம்பளப் பட்டியல் ஒப்பீடு',
      recordedGrossLabel: 'வருகைப் பதிவின்படி சம்பளம்',
      payrollSheetLabel: 'சம்பளப் பட்டியல் தொகை',
      skillPassportTitle: 'திறன் சான்று மற்றும் பணி வரலாறு',
      skillPassportSubtitle:
        'உங்கள் பணி அனுபவம் மற்றும் பாதுகாப்புப் பயிற்சி சான்றிதழ்கள்.',
      verifiedBadge: 'சரிபார்க்கப்பட்டது',
      verifiedShiftsLabel: 'முடித்த ஷிப்ட்கள்',
      joinedDateLabel: 'சேர்ந்த தேதி',
      primaryTradeLabel: 'பணிப் பிரிவு',
      certificationsHeading: 'பாதுகாப்பு மற்றும் தொழில் சான்றிதழ்கள்',
      issuedLabel: 'வழங்கிய தேதி',
      verifiedByLabel: 'சான்றளித்தவர்',
    },
    admin: {
      title: 'பணித்தள பாதுகாப்பு மற்றும் நிர்வாக மையம்',
      subtitle:
        'வருகை, ஓவர்டைம், பணிச்சோர்வு எச்சரிக்கைகள் மற்றும் பாதுகாப்புப் புகார்களின் நேரடி விவரம்.',
      operationalRecordsBadge: 'நடைமுறை மற்றும் மாதிரிப் பதிவுகள்',
      activeRoleLabel: 'பயனர் பொறுப்பு (அதிகார சோதனை)',
      roleAdminOption: 'நிர்வாகி (முழு அதிகாரம்)',
      roleSafetyOfficerOption: 'பாதுகாப்பு அதிகாரி (HSE)',
      roleWorkerOption: 'தொழிலாளர் (பார்க்க மட்டும்)',
      actingOfficerLabel: 'அதிகாரி பெயர்',
      roleRestrictedNotice:
        'அதிகாரக் கட்டுப்பாடு: தற்போது தொழிலாளர் பொறுப்பில் உள்ளீர்கள். புகாரை ஒதுக்கவோ தீர்க்கவோ நிர்வாகி அல்லது பாதுகாப்பு அதிகாரி பொறுப்பைத் தேர்ந்தெடுக்கவும்.',
      dismissBtn: 'மூடு',
      activeWorkersCard: 'தொழிலாளர்கள்',
      regularLoggedSub: 'சாதாரண மணிநேரம்',
      openIncidentsCard: 'நிலுவைப் புகார்கள்',
      totalReportsSub: 'மொத்தப் புகார்கள்',
      highPriorityHazardsCard: 'தீவிர ஆபத்துகள்',
      criticalHighSub: 'உடனடி கவனம் தேவை',
      overtimeHoursCard: 'ஓவர்டைம் நேரம்',
      shiftRecordsSub: 'ஷிப்ட் பதிவுகள்',
      fatigueFlagsCard: 'சோர்வு எச்சரிக்கை',
      totalRuleFlagsSub: 'மொத்த எச்சரிக்கைகள்',
      avgResolutionHoursCard: 'சராசரி தீர்வு நேரம்',
      verifiedClosedSub: 'தீர்க்கப்பட்டவை',
      filtersTitle: 'வடிகட்டிகள்',
      allSites: 'அனைத்து தளங்கள்',
      allDepartments: 'அனைத்துப் பிரிவுகள்',
      allShifts: 'அனைத்து ஷிப்ட்கள்',
      dateWindowLabel: 'தேதி வரம்பு',
      dateAll: 'அனைத்து தேதிகள்',
      dateLast3Days: 'கடந்த 3 நாட்கள்',
      dateToday: 'கடந்த 24 மணிநேரம்',
      priorityActionQueue: 'முன்னுரிமை நடவடிக்கை பட்டியல்',
      priorityActionSubtitle:
        'ஆபத்தின் தீவிரம், நிலுவை நேரம், பணிச்சோர்வு மற்றும் சம்பள வித்தியாசத்தின் அடிப்படையில் வரிசைப்படுத்தப்பட்டது',
      actionItemsCount: 'செயல்கள்',
      noActionItemsEmpty: 'தேர்ந்தெடுத்த வடிகட்டிகளுக்கு நிலுவைச் செயல்கள் இல்லை.',
      whyTriggeredLabel: 'காரணம்',
      recommendedActionLabel: 'செய்ய வேண்டியது',
      attendanceChartTitle: 'தொழிலாளர் பணிநேரம் & ஓவர்டைம்',
      attendanceChartSubtitle: 'ஒரு ஷிப்ட் அதிகபட்ச நேர வரம்புடன் ஒப்பீடு',
      noAttendanceEmpty: 'வருகைப் பதிவுகள் எதுவும் இல்லை.',
      lifecyclePipelineTitle: 'புகார் நிலைச் சுருக்கம்',
      workforceAttendanceTableTitle: 'தொழிலாளர் வருகை மற்றும் ஓவர்டைம் பதிவேடு',
      incidentQueueHeading: 'பாதுகாப்புப் புகார் தீர்வுப் பட்டியல்',
      incidentQueueSubtitle:
        'நிலை மாற்றம்: நிலுவை → ஒதுக்கப்பட்டது → நடக்கிறது → தீர்ந்தது.',
      noIncidentsEmpty: 'பாதுகாப்புப் புகார்கள் எதுவும் இல்லை.',
      step1AssignLabel: 'படி 1: பாதுகாப்பு அதிகாரியை நியமி',
      assignOfficerBtn: 'அதிகாரியை நியமி',
      step2CorrectiveLabel: 'படி 2: எடுத்த நடவடிக்கையைப் பதிவு செய்',
      correctivePlaceholder:
        'சரிசெய்த விவரத்தை எழுதவும் (எ.கா. சாரக் கம்பி மாற்றப்பட்டு தடுப்பு அமைக்கப்பட்டது)...',
      logCorrectiveBtn: 'நடவடிக்கையைப் பதிவு செய்',
      step3ResolutionLabel: 'படி 3: இறுதி ஆய்வு மற்றும் தீர்வுக் குறிப்பு',
      resolutionPlaceholder: 'பாதுகாப்பு உறுதி செய்யப்பட்ட விவரத்தை எழுதவும்...',
      recordResolutionBtn: 'தீர்வைப் பதிவு செய்',
      auditHistoryLabel: 'நடவடிக்கை வரலாறு',
      fatigueThresholdsTitle: 'பணிச்சோர்வு மற்றும் நேர விதிகள்',
      fatigueThresholdsSubtitle:
        'தொழிலாளர் நல ஆய்வுக்கான நேர வரம்புகள். இவை தொழிலாளர்களைத் தண்டிக்க அல்ல.',
      maxShiftHoursLabel: 'ஒரு ஷிப்ட் அதிகபட்ச மணிநேரம்',
      minRestHoursLabel: 'ஷிப்ட்களுக்கு இடையே குறைந்தபட்ச ஓய்வு (மணி)',
      repeatedOtThresholdLabel: 'தொடர் ஓவர்டைம் ஷிப்ட் வரம்பு',
      maxConsecutiveDaysLabel: 'விடுப்பின்றி தொடர் பணி நாட்கள் வரம்பு',
      applyPolicyBtn: 'விதிகளைச் சேமி',
      noFatigueAlertsEmpty: 'தற்போதைய விதிகளின்படி சோர்வு எச்சரிக்கை எதுவும் இல்லை.',
      observedLabel: 'பதிவானது',
      limitLabel: 'வரம்பு',
      relevantRecordsLabel: 'வருகை எண்கள்',
      acknowledgedByLabel: 'சரிபார்த்தவர்',
      followUpPlaceholder:
        'மேற்பார்வையாளர் குறிப்பு (எ.கா. அடுத்த ஷிப்டிற்கு முன் 14 மணிநேர ஓய்வு வழங்கப்பட்டது)...',
      acknowledgeAlertBtn: 'சரிபார்த்துச் சேமி',
      riskEngineHeading: 'ஆபத்து மற்றும் விதிமுறை ஆய்வுப் பட்டியல்',
      riskEngineSubtitle:
        'பாதுகாப்பு ஆபத்துகள், தொடர் புகார்கள், பணிச்சோர்வு மற்றும் சம்பள வித்தியாசங்களின் ஒருங்கிணைந்த பட்டியல்.',
      formulaLabel: 'மதிப்பெண்',
      payrollAuditHeading: 'வருகை மற்றும் சம்பளப் பட்டியல் தணிக்கை',
      reconcilePlaceholder:
        'சம்பளத் திருத்தக் குறிப்பு (எ.கா. விடுபட்ட ஓவர்டைம் தொகை சேர்க்கப்பட்டது)...',
      approveReconcileBtn: 'ஓவர்டைம் கணக்கைச் சரிசெய்',
      whatIfHeading: 'ஷிப்ட் திட்ட ஒப்பீடு (What-If)',
      whatIfSubtitle:
        'இரண்டு ஷிப்ட் அட்டவணைகளை ஒப்பிட்டு ஓவர்டைம் மற்றும் ஓய்வு நேர விதிமீறல்களைக் கண்டறியவும்.',
      recommendedBadge: 'பரிந்துரைக்கப்படுவது',
      adjustDailyHoursLabel: 'தினசரி ஷிப்ட் நேர மாற்றம்',
      totalViolationsLabel: 'விதிமீறல்கள்',
      projectedOvertimeLabel: 'மொத்த ஓவர்டைம்',
      restViolationsLabel: 'ஓய்வு நேரக் குறைவு',
      consecutiveFlagsLabel: 'தொடர் பணி நாட்கள்',
      zeroViolationsMsg: 'விதிமீறல்கள் எதுவும் இல்லை.',
      recommendationHeading: 'ஒப்பீட்டு முடிவு',
    },
    quickPhrases: {
      construction: [
        'கிழக்குப் பிரிவு 3-வது தளத்தில் சாரக் கம்பி தளர்வாக உள்ளது, தடுப்புக் கம்பி இல்லை.',
        'ஈரமான கான்கிரீட் பகுதி அருகே 415V மின்கம்பி திறந்த நிலையில் உள்ளது.',
        'பில்லர் P-12 அருகே பாதுகாப்பு பெல்ட் கயிறு சேதமடைந்துள்ளது.',
      ],
      manufacturing: [
        '250T ஹைட்ராலிக் பிரஸ் இயந்திரத்தில் பாதுகாப்பு கவசம் அகற்றப்பட்டுள்ளது.',
        'டேங்க் B அருகே நடைபாதையில் ரசாயனக் கசிவு ஏற்பட்டுள்ளது.',
        'கன்வேயர் பராமரிப்புப் பகுதியில் LOTO பாதுகாப்புப் பூட்டு இல்லை.',
      ],
    },
  },
  hi: {
    appName: 'THOZHIL',
    tagline: 'सम्मान के साथ काम।',
    sdgBadge: 'संयुक्त राष्ट्र SDG 8 • सम्मानजनक काम',
    demoModeBanner:
      'डेमो मोड — ब्राउज़र में सहेजे गए निर्माण और फैक्ट्री के नमूना रिकॉर्ड दिखाए जा रहे हैं।',
    firebaseConnectedBanner:
      'क्लाउड डेटाबेस कनेक्टेड — सुरक्षा और अधिकार नियम लागू हैं।',
    resetSeedBtn: 'डेटा रीसेट करें',
    switchIndustryLabel: 'उद्योग क्षेत्र',
    constructionLabel: 'निर्माण (Construction)',
    manufacturingLabel: 'उत्पादन (Manufacturing)',
    workerPortal: 'कर्मचारी पोर्टल',
    adminCommandCenter: 'प्रबंधन केंद्र',
    languageLabel: 'भाषा',
    footerLeft: 'THOZHIL — सम्मान के साथ काम।',
    footerRight: 'कार्यस्थल सुरक्षा, हाज़िरी और वेतन पारदर्शिता (UN SDG 8)',
    emergencyDisclaimer:
      'सुरक्षा सूचना: ऐप पर रिपोर्ट करना आपातकालीन स्टॉप या निकासी प्रक्रिया का विकल्प नहीं है। गंभीर खतरे की स्थिति में तुरंत काम रोकें और सुपरवाइज़र को सूचित करें।',
    statuses: {
      OPEN: 'खुला (Open)',
      ASSIGNED: 'सौंपा गया',
      IN_PROGRESS: 'काम जारी है',
      RESOLVED: 'हल हो गया',
    },
    severities: {
      LOW: 'कम',
      MEDIUM: 'मध्यम',
      HIGH: 'उच्च',
      CRITICAL: 'अति गंभीर',
    },
    attendanceStatuses: {
      ACTIVE: 'शिफ्ट चालू',
      COMPLETED: 'पूरा हुआ',
      FLAGGED_MISSING_CHECKOUT: 'चेक-आउट बाकी',
      FLAGGED_ZERO_DURATION: 'शून्य समय',
      FLAGGED_OVERTIME_REVIEW: 'ओवरटाइम जाँच',
    },
    nav: {
      attendance: 'हाज़िरी',
      safeVoice: 'सुरक्षा रिपोर्ट',
      wageLens: 'वेतन जानकारी',
      workHistory: 'कौशल पासपोर्ट',
      commandCenter: 'संचालन सारांश',
      incidentQueue: 'सुरक्षा घटनाएँ',
      fatigueAlerts: 'थकान और कार्य घंटे',
      riskEngine: 'जोखिम और वेतन जाँच',
      whatIfSimulator: 'शिफ्ट सिम्युलेटर',
    },
    worker: {
      greeting: 'कर्मचारी कार्य पोर्टल',
      switchProfileLabel: 'कर्मचारी प्रोफ़ाइल चुनें (डेमो)',
      baseRateLabel: 'मूल वेतन दर',
      standardShiftInfo: 'सामान्य शिफ्ट',
      overtimeRateInfo: 'ओवरटाइम दर',
      activeShift: 'शिफ्ट चालू है',
      noActiveShift: 'शिफ्ट शुरू नहीं हुई',
      worksiteLabel: 'कार्यस्थल / प्लांट',
      departmentLabel: 'विभाग / लाइन',
      shiftScheduleLabel: 'शिफ्ट समय',
      checkInBtn: 'शिफ्ट शुरू करें (Check-In)',
      checkOutBtn: 'शिफ्ट समाप्त करें (Check-Out)',
      customSimDurationLabel: 'डेमो चेक-आउट अवधि',
      simDuration8h: '8.0 घंटे (सामान्य 8h शिफ्ट, 0h ओवरटाइम)',
      simDuration10_5h: '10.5 घंटे (8h सामान्य + 2.5h ओवरटाइम)',
      simDuration11_5h: '11.5 घंटे (8h सामान्य + 3.5h OT — थकान अलर्ट)',
      simDuration0h: '0.0 घंटे (शून्य अवधि परीक्षण)',
      breakDeductionLabel: 'भोजन / विश्राम कटौती (मिनट)',
      recordedRegularHours: 'सामान्य घंटे',
      recordedOvertimeHours: 'ओवरटाइम (OT)',
      shiftHistoryTitle: 'हाज़िरी और ओवरटाइम रिकॉर्ड',
      totalLoggedSummary: 'कुल दर्ज समय',
      inTimeLabel: 'आगमन',
      outTimeLabel: 'प्रस्थान',
      missingOrActiveLabel: 'चालू / चेक-आउट नहीं',
      breakShortLabel: 'ब्रेक',
      personalFatigueTitle: 'आराम और कार्य-घंटे सूचनाएँ',
      noPersonalFatigue: 'आपकी प्रोफ़ाइल पर कोई थकान या ओवरटाइम अलर्ट नहीं है।',
      reportHazardTitle: 'खतरे की रिपोर्ट करें',
      reportHazardSubtitle:
        'कार्यस्थल पर किसी भी खतरे की जानकारी आवाज़ या लिखकर दें और समाधान की स्थिति देखें।',
      selectHazardCategory: '1. खतरे की श्रेणी चुनें',
      selectSeverity: '2. गंभीरता का स्तर',
      selectSite: '3. कार्यस्थल / प्लांट',
      selectDepartment: '4. विभाग / लाइन',
      describeIssueLabel: '5. समस्या का विवरण',
      describeIssuePlaceholder:
        'खतरे और स्थान का विवरण लिखें (जैसे: पिलर 14 के पास मचान का क्लैंप ढीला है)...',
      quickTemplatesLabel: 'त्वरित संदेश चुनें:',
      voiceInputStart: 'बोलकर लिखें',
      voiceInputStop: 'रिकॉर्डिंग रोकें',
      voiceFallbackNotice:
        'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया नीचे दिए गए बटन चुनें या टाइप करें।',
      anonymousToggleLabel: 'गुमनाम रिपोर्ट करें (मेरा नाम और ID छुपाएँ)',
      anonymousHonestExplanation:
        'गोपनीयता नियम: यह विकल्प चुनने पर आपका नाम और कर्मचारी ID रिकॉर्ड में सहेजे नहीं जाते। स्थिति जानने के लिए आपको एक ट्रैकिंग कोड (ANON-XXXX) मिलेगा।',
      submitReportBtn: 'सुरक्षा रिपोर्ट भेजें',
      reportSubmittedTitle: 'रिपोर्ट दर्ज हो गई! ID:',
      trackingCodeLabel: 'ट्रैकिंग कोड:',
      identityModeLabel: 'रिपोर्ट प्रकार:',
      anonymousModeValue: 'गुमनाम (नाम और ID हटाए गए)',
      namedModeValue: 'नाम सहित रिपोर्ट',
      lookupReportTitle: 'रिपोर्ट की स्थिति और समाधान देखें',
      lookupPlaceholder: 'रिपोर्ट ID (INC-CON-101) या ट्रैकिंग कोड खोजें',
      reporterLabel: 'रिपोर्टर',
      anonymousReporterValue: 'गुमनाम कर्मचारी',
      assignedOfficerLabel: 'नियुक्त अधिकारी',
      pendingAssignmentValue: 'अभी नियुक्त नहीं',
      correctiveActionLabel: 'सुधारात्मक कार्रवाई',
      resolutionVerifiedLabel: 'समाधान विवरण',
      wageLensTitle: 'वेतन और ओवरटाइम कैलकुलेटर',
      wageLensSubtitle:
        'अपना सामान्य वेतन, ओवरटाइम दर और कटौती का पूरा हिसाब ₹ INR में देखें।',
      wageDisclaimer:
        'सूचना: यह गणना केवल आपके काम के घंटों और वेतन की जाँच के लिए एक अनुमान है। यह आधिकारिक पे-स्लिप नहीं है।',
      regularHoursInput: 'सामान्य कार्य घंटे',
      hourlyWageInput: 'प्रति घंटा वेतन (₹ INR)',
      overtimeHoursInput: 'ओवरटाइम घंटे (OT)',
      overtimeMultiplierInput: 'ओवरटाइम गुना (जैसे 2.0x)',
      deductionsInput: 'कटौती (PF / ESI / कैंटीन ₹)',
      estimatedNetPay: 'अनुमानित कुल वेतन (Net Pay)',
      regularPayShort: 'सामान्य वेतन',
      overtimePayShort: 'ओवरटाइम वेतन',
      grossPayShort: 'कुल आय (Gross)',
      arithmeticBreakdown: 'गणना का पूरा विवरण',
      payrollVerificationTitle: 'हाज़िरी बनाम वेतन रजिस्टर मिलान',
      recordedGrossLabel: 'दर्ज हाज़िरी के अनुसार वेतन',
      payrollSheetLabel: 'वेतन रजिस्टर में दर्ज राशि',
      skillPassportTitle: 'कौशल पासपोर्ट और कार्य अनुभव',
      skillPassportSubtitle:
        'आपका सत्यापित शिफ्ट अनुभव और सुरक्षा प्रशिक्षण प्रमाणपत्र।',
      verifiedBadge: 'सत्यापित रिकॉर्ड',
      verifiedShiftsLabel: 'पूरी की गई शिफ्ट',
      joinedDateLabel: 'कार्य प्रारंभ तिथि',
      primaryTradeLabel: 'मुख्य कार्य / पद',
      certificationsHeading: 'सुरक्षा और कौशल प्रमाणपत्र',
      issuedLabel: 'जारी तिथि',
      verifiedByLabel: 'सत्यापनकर्ता',
    },
    admin: {
      title: 'कार्यस्थल सुरक्षा और संचालन केंद्र',
      subtitle:
        'शिफ्ट हाज़िरी, ओवरटाइम, थकान अलर्ट और सुरक्षा शिकायतों के समाधान की निगरानी।',
      operationalRecordsBadge: 'लाइव और नमूना संचालन रिकॉर्ड',
      activeRoleLabel: 'वर्तमान भूमिका (अधिकार जाँच)',
      roleAdminOption: 'प्रशासक (Administrator - पूर्ण अधिकार)',
      roleSafetyOfficerOption: 'सुरक्षा अधिकारी (Safety Officer)',
      roleWorkerOption: 'कर्मचारी (Worker - केवल देखने का अधिकार)',
      actingOfficerLabel: 'अधिकारी / प्रबंधक का नाम',
      roleRestrictedNotice:
        'अधिकार प्रतिबंधित: अभी कर्मचारी (Worker) भूमिका चुनी गई है। शिकायत सौंपने, हल करने या नियम बदलने के लिए प्रशासक या सुरक्षा अधिकारी चुनें।',
      dismissBtn: 'बंद करें',
      activeWorkersCard: 'सक्रिय कर्मचारी',
      regularLoggedSub: 'सामान्य घंटे दर्ज',
      openIncidentsCard: 'खुली शिकायतें',
      totalReportsSub: 'कुल रिपोर्ट में से',
      highPriorityHazardsCard: 'गंभीर खतरे',
      criticalHighSub: 'तुरंत कार्रवाई आवश्यक',
      overtimeHoursCard: 'ओवरटाइम घंटे',
      shiftRecordsSub: 'शिफ्ट रिकॉर्ड में',
      fatigueFlagsCard: 'थकान अलर्ट',
      totalRuleFlagsSub: 'कुल नियम अलर्ट',
      avgResolutionHoursCard: 'औसत समाधान समय',
      verifiedClosedSub: 'हल की गई रिपोर्ट',
      filtersTitle: 'फ़िल्टर',
      allSites: 'सभी कार्यस्थल / प्लांट',
      allDepartments: 'सभी विभाग',
      allShifts: 'सभी शिफ्ट',
      dateWindowLabel: 'तारीख सीमा',
      dateAll: 'सभी तारीखें',
      dateLast3Days: 'पिछले 3 दिन',
      dateToday: 'पिछले 24 घंटे',
      priorityActionQueue: 'प्राथमिकता कार्य सूची',
      priorityActionSubtitle:
        'खतरे की गंभीरता, लंबित समय, थकान नियम और वेतन अंतर के आधार पर क्रमबद्ध',
      actionItemsCount: 'कार्य',
      noActionItemsEmpty: 'चुने गए फ़िल्टर के लिए कोई लंबित कार्य नहीं है।',
      whyTriggeredLabel: 'कारण',
      recommendedActionLabel: 'सुझाई गई कार्रवाई',
      attendanceChartTitle: 'कर्मचारी कार्य घंटे और ओवरटाइम',
      attendanceChartSubtitle: 'अधिकतम शिफ्ट सीमा के साथ तुलना',
      noAttendanceEmpty: 'कोई हाज़िरी रिकॉर्ड नहीं मिला।',
      lifecyclePipelineTitle: 'सुरक्षा रिपोर्ट स्थिति सारांश',
      workforceAttendanceTableTitle: 'कर्मचारी हाज़िरी और ओवरटाइम रजिस्टर',
      incidentQueueHeading: 'सुरक्षा शिकायत समाधान सूची',
      incidentQueueSubtitle:
        'स्थिति क्रम: खुला → सौंपा गया → काम जारी है → हल हो गया। गुमनाम रिपोर्ट में नाम गोपनीय रहता है।',
      noIncidentsEmpty: 'चुने गए फ़िल्टर के लिए कोई सुरक्षा शिकायत नहीं है।',
      step1AssignLabel: 'चरण 1: सुरक्षा अधिकारी नियुक्त करें',
      assignOfficerBtn: 'अधिकारी नियुक्त करें',
      step2CorrectiveLabel: 'चरण 2: सुधारात्मक कार्रवाई दर्ज करें',
      correctivePlaceholder:
        'किए गए सुधार का विवरण लिखें (जैसे: क्लैंप बदला गया और रेलिंग लगाई गई)...',
      logCorrectiveBtn: 'कार्रवाई दर्ज करें',
      step3ResolutionLabel: 'चरण 3: अंतिम जाँच और समाधान नोट',
      resolutionPlaceholder: 'जाँच पूरी होने का विवरण लिखें...',
      recordResolutionBtn: 'समाधान दर्ज करें',
      auditHistoryLabel: 'कार्रवाई इतिहास (Audit Log)',
      fatigueThresholdsTitle: 'थकान और कार्य-घंटे नियम',
      fatigueThresholdsSubtitle:
        'कर्मचारी स्वास्थ्य और सुरक्षा समीक्षा के लिए सीमाएँ निर्धारित करें।',
      maxShiftHoursLabel: 'अधिकतम एकल-शिफ्ट घंटे',
      minRestHoursLabel: 'दो शिफ्ट के बीच न्यूनतम आराम (घंटे)',
      repeatedOtThresholdLabel: 'लगातार ओवरटाइम शिफ्ट सीमा',
      maxConsecutiveDaysLabel: 'बिना छुट्टी लगातार कार्य दिवस सीमा',
      applyPolicyBtn: 'नियम सहेजें और लागू करें',
      noFatigueAlertsEmpty: 'वर्तमान नियमों के तहत कोई थकान अलर्ट नहीं है।',
      observedLabel: 'दर्ज मान',
      limitLabel: 'सीमा',
      relevantRecordsLabel: 'संबंधित रिकॉर्ड ID',
      acknowledgedByLabel: 'समीक्षाकर्ता',
      followUpPlaceholder:
        'सुपरवाइज़र नोट लिखें (जैसे: अगली शिफ्ट से पहले 14 घंटे का आराम दिया गया)...',
      acknowledgeAlertBtn: 'समीक्षा नोट सहेजें',
      riskEngineHeading: 'जोखिम और अनुपालन विश्लेषण सूची',
      riskEngineSubtitle:
        'असुरक्षित खतरों, बार-बार होने वाली घटनाओं, थकान अलर्ट और वेतन अंतर का पारदर्शी विश्लेषण।',
      formulaLabel: 'स्कोर सूत्र',
      payrollAuditHeading: 'हाज़िरी बनाम वेतन रजिस्टर ऑडिट',
      reconcilePlaceholder:
        'वेतन सुधार नोट लिखें (जैसे: छूटे हुए ओवरटाइम घंटों का भुगतान स्वीकृत)...',
      approveReconcileBtn: 'ओवरटाइम मिलान स्वीकृत करें',
      whatIfHeading: 'शिफ्ट शेड्यूल सिम्युलेटर (What-If तुलना)',
      whatIfSubtitle:
        'दो प्रस्तावित शिफ्ट योजनाओं की तुलना करें और ओवरटाइम व आराम नियमों के उल्लंघन देखें।',
      recommendedBadge: 'अनुशंसित योजना',
      adjustDailyHoursLabel: 'दैनिक शिफ्ट घंटे समायोजित करें',
      totalViolationsLabel: 'कुल नियम उल्लंघन',
      projectedOvertimeLabel: 'अनुमानित ओवरटाइम',
      restViolationsLabel: 'आराम नियम उल्लंघन',
      consecutiveFlagsLabel: 'लगातार कार्य दिवस अलर्ट',
      zeroViolationsMsg: 'कोई आराम, ओवरटाइम या स्टाफिंग नियम उल्लंघन नहीं।',
      recommendationHeading: 'तुलना सारांश',
    },
    quickPhrases: {
      construction: [
        'पूर्वी विंग लेवल-3 पर मचान (Scaffold) का क्लैंप ढीला है और बाहरी रेलिंग नहीं है।',
        'गीले कंक्रीट क्षेत्र के पास 415V बिजली की केबल खुली पड़ी है।',
        'पिलर P-12 स्टेशन पर सेफ्टी हार्नेस की रस्सी घिस गई है।',
      ],
      manufacturing: [
        '250T हाइड्रोलिक प्रेस लाइन 3 पर साइड सुरक्षा गार्ड हटा हुआ है।',
        'टैंक B के पास चलने के रास्ते पर केमिकल का रिसाव हो रहा है।',
        'कन्वेयर मेंटेनेंस हैच पर LOTO सुरक्षा लॉक लगाने की कुंडी नहीं है।',
      ],
    },
  },
};

export const LANGUAGE_OPTIONS: { code: Language; nativeLabel: string }[] = [
  { code: 'en', nativeLabel: 'English' },
  { code: 'ta', nativeLabel: 'தமிழ்' },
  { code: 'hi', nativeLabel: 'हिन्दी' },
];

export function getWorkerDisplayName(
  worker: { name: string; nameTa: string; nameHi?: string },
  language: Language
): string {
  if (language === 'ta') return worker.nameTa || worker.name;
  if (language === 'hi') return worker.nameHi || worker.name;
  return worker.name;
}
