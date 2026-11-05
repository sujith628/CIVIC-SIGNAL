import { Language, ComplaintCategory, ComplaintStatus, SeverityLevel, UserRole } from '../types';

export const TRANSLATIONS = {
  en: {
    // Brand & Header
    brandName: 'CivicSignal',
    brandTagline: 'GVMC Municipal Intelligence',
    gvmcFullName: 'Greater Visakhapatnam Municipal Corporation',
    slogan: 'A Better City Begins With Being Heard',
    sloganSub: 'Turning everyday civic concerns into actionable municipal intelligence. Connecting citizens, authorities, and urban infrastructure to build responsive cities.',
    
    // Top Navigation
    navHome: 'Home',
    navHowItWorks: 'How It Works',
    navCityIntelligence: 'City Intelligence',
    navTransparency: 'Transparency',
    navAbout: 'About GVMC',
    navCitizenPortal: 'Citizen Portal',
    navAuthorityPortal: 'Authority Portal',
    exploreCivicSignal: 'Explore CivicSignal',
    viewCityIntelligence: 'View City Intelligence',
    
    // Action CTAs
    reportProblem: 'Report a Problem',
    reportProblemSub: 'Submit a new civic complaint with photo, GPS or voice',
    voiceAssistant: 'Voice Assistant',
    voiceAssistantDesc: 'Speak in Telugu or English. CivicSignal parses, locates, and formats your grievance automatically.',
    myComplaints: 'My Complaints',
    nearbyIssues: 'Nearby Civic Issues',
    hotspots: 'Recurring Hotspots',
    complaintDna: 'Complaint DNA',
    notifications: 'Notifications',
    civicPoints: 'CivicPoints',
    privacySettings: 'Privacy Settings',
    logout: 'Exit Session',
    
    // Categories
    cat_garbage_solid_waste: 'Garbage & Solid Waste',
    cat_drainage_sewerage: 'Drainage & Sewerage',
    cat_water_supply: 'Drinking Water Supply',
    cat_roads_potholes: 'Roads & Potholes',
    cat_streetlights: 'Streetlights & Lighting',
    cat_sanitation: 'Public Sanitation',
    cat_stormwater_flooding: 'Stormwater & Waterlogging',
    cat_stray_animals: 'Stray Animals & Cattle',
    cat_infrastructure: 'Public Infrastructure',
    cat_parks: 'Parks & Urban Greenery',
    cat_encroachment: 'Footpath & Road Encroachment',
    cat_other: 'Other Civic Grievance',
    
    // Statuses
    status_Draft: 'Draft',
    status_Submitted: 'Submitted',
    status_Received: 'Received',
    status_UnderReview: 'Under Review',
    status_NeedsClarification: 'Needs Clarification',
    status_Validated: 'Validated',
    status_Assigned: 'Assigned',
    status_Accepted: 'Accepted',
    status_InProgress: 'In Progress',
    status_AwaitingEvidence: 'Awaiting Evidence',
    status_PendingVerification: 'Pending Verification',
    status_Resolved: 'Resolved',
    status_Closed: 'Closed',
    status_Reopened: 'Reopened',
    status_Rejected: 'Rejected',

    // Severities
    sev_Low: 'Low',
    sev_Medium: 'Medium',
    sev_High: 'High',
    sev_Critical: 'Critical',

    // Roles
    role_citizen: 'Citizen',
    role_field_officer: 'Field Officer',
    role_verification_officer: 'Verification Officer',
    role_department_officer: 'Department Officer',
    role_department_head: 'Department Head',
    role_super_admin: 'Super Admin',
    role_platform_owner: 'Platform Owner',

    // Sections & Headers
    howItWorksTitle: 'How CivicSignal Works',
    howItWorksSub: 'From voice report to verified field resolution in four transparent steps',
    step1Title: '01. Effortless Multimodal Reporting',
    step1Desc: 'Report via voice in Telugu or English, or submit photos with automatic GPS tagging.',
    step2Title: '02. Complaint DNA & AI Synthesis',
    step2Desc: 'Semantic and geospatial algorithms cluster multiple reports into root municipal issues.',
    step3Title: '03. Direct Field Routing & SLA',
    step3Desc: 'Tasks route directly to ward officers with enforced deadlines and automated escalation.',
    step4Title: '04. Evidence-Based Verification',
    step4Desc: 'Mandatory before-and-after photographic evidence and citizen confirmation.',

    // Stats
    statTotalComplaints: 'Total Complaints',
    statResolved: 'Resolved & Verified',
    statActiveHotspots: 'Complaint DNA Clusters',
    statAvgResolutionTime: 'Avg Resolution Time',
    statSlaAdherence: 'SLA Adherence Rate',
    
    // Voice Assistant
    voiceTitle: 'Bilingual AI Voice Grievance Assistant',
    voiceSub: 'Speak in Telugu or English. Our bilingual engine transcribes, extracts locations, and auto-categorizes.',
    micReady: 'Tap microphone to speak',
    micListening: 'Listening to your voice...',
    micProcessing: 'Synthesizing grievance & extracting location...',
    micSpeaking: 'CivicSignal is reading back your grievance...',
    trySpeakingPrompt: 'Try saying: "Sector 4, MVP Colony లో చెత్త కుప్పలు చాలా రోజులుగా పేరుకుపోయాయి. వెంటనే తీయించండి."',
    audioReplay: 'Listen to Audio Summary',
    confirmAndSubmit: 'Confirm & Submit Grievance',
    cancelVoice: 'Cancel',

    // Complaint Form
    formTitle: 'Submit Civic Grievance',
    fieldTitle: 'Grievance Title',
    fieldTitlePlaceholder: 'e.g. Broken water pipeline leaking on main road',
    fieldCategory: 'Civic Category',
    fieldDescription: 'Detailed Description',
    fieldDescPlaceholder: 'Describe the issue, landmarks, severity and how long it has persisted...',
    fieldLocality: 'GVMC Locality',
    fieldWard: 'Ward Number',
    fieldAddress: 'Street / Landmark Address',
    fieldAddressPlaceholder: 'e.g. Near Sector 4 Community Hall, Road 6',
    fieldEvidence: 'Upload Photographic Evidence',
    fieldAnonymous: 'Submit Anonymously (Hide identity on public transparency feeds)',
    submitting: 'Analyzing with AI & Submitting...',
    submitSuccessTitle: 'Complaint Submitted Successfully',
    submitSuccessDesc: 'Your unique Complaint ID is generated. Track real-time progress below.',
    
    // Complaint DNA section
    dnaTitle: 'Complaint DNA Engine',
    dnaBadge: 'Underlying Municipal Issue Linkage',
    dnaExplanation: 'CivicSignal connects independent complaints to uncover recurring infrastructure breakdowns rather than treating them as isolated tickets.',
    dnaRecurrence: 'Recurrence Intensity',
    dnaFirstReported: 'First Reported',
    dnaLatestReport: 'Latest Report',
    dnaLinkedCount: 'Linked Citizen Reports',
    dnaConfidence: 'DNA Confidence Match',
    dnaPriorityScore: 'Calculated Priority Score',

    // GIS Map
    mapTitle: 'Visakhapatnam Civic Intelligence Map',
    mapSub: 'Real-time geographic distribution of active complaints, verified resolutions, and recurring hotspots across 17 GVMC localities.',
    filterAll: 'All Categories',
    filterCriticalOnly: 'Critical / High Only',
    filterHotspotsOnly: 'Hotspots Only',
    filterUnresolved: 'Active Unresolved',
    mapLegendComplaint: 'Individual Complaint',
    mapLegendHotspot: 'Complaint DNA Hotspot',
    mapLegendResolved: 'Resolved & Verified',
    
    // Authority
    authPortalTitle: 'GVMC Municipal Operations Command Centre',
    switchRole: 'Switch Role (Demonstration & Audit)',
    slaBreachAlert: 'SLA Breaches Requiring Immediate Escalation',
    assignOfficer: 'Assign Field Officer',
    updateStatus: 'Update Lifecycle Status',
    verifyResolution: 'Inspect Before/After Evidence',
    confirmResolution: 'Approve & Close Issue',
    disputeResolution: 'Dispute Resolution',
    disputeReason: 'Please state why the work is incomplete',
    reopenIssue: 'Reopen for Rectification',
    
    // Common buttons & states
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    viewDetails: 'View Details',
    back: 'Back',
    searchPlaceholder: 'Search complaints by ID, locality, keywords...',
    noResults: 'No complaints matching your criteria',
    loading: 'Loading municipal data...',
  },
  
  te: {
    // Brand & Header
    brandName: 'సివిక్‌సిగ్నల్',
    brandTagline: 'జివిఎంసి మున్సిపల్ ఇంటెలిజెన్స్',
    gvmcFullName: 'మహా విశాఖ నగర పాలక సంస్థ',
    slogan: 'ప్రజా గళంతోనే నగర ప్రగతి ఆరంభం',
    sloganSub: 'పౌరుల రోజువారీ సమస్యలను విశ్లేషించి, పరిష్కార యోగ్యమైన నగర సమాచారంగా మార్చుతుంది. పౌరులను, అధికారులను మరియు మౌలిక వసతులను సమన్వయపరుస్తుంది.',
    
    // Top Navigation
    navHome: 'హోమ్',
    navHowItWorks: 'ఎలా పనిచేస్తుంది',
    navCityIntelligence: 'నగర ఇంటెలిజెన్స్',
    navTransparency: 'పారదర్శకత',
    navAbout: 'జివిఎంసి గురించి',
    navCitizenPortal: 'పౌర పోర్టల్',
    navAuthorityPortal: 'అధికార పోర్టల్',
    exploreCivicSignal: 'సివిక్‌సిగ్నల్ అన్వేషించండి',
    viewCityIntelligence: 'నగర సమాచారం చూడండి',
    
    // Action CTAs
    reportProblem: 'సమస్యను నివేదించండి',
    reportProblemSub: 'ఫోటో, లొకేషన్ లేదా వాయిస్ ద్వారా కొత్త ఫిర్యాదు చేయండి',
    voiceAssistant: 'వాయిస్ అసిస్టెంట్',
    voiceAssistantDesc: 'తెలుగు లేదా ఇంగ్లీషులో మాట్లాడండి. సివిక్‌సిగ్నల్ స్వయంచాలకంగా మీ ఫిర్యాదును నమోదు చేస్తుంది.',
    myComplaints: 'నా ఫిర్యాదులు',
    nearbyIssues: 'సమీప పౌర సమస్యలు',
    hotspots: 'పునరావృత సమస్య కేంద్రాలు',
    complaintDna: 'కంప్లైంట్ డిఎన్ఎ',
    notifications: 'నోటిఫికేషన్లు',
    civicPoints: 'సివిక్ పాయింట్లు',
    privacySettings: 'గోప్యతా సెట్టింగ్‌లు',
    logout: 'లాగౌట్',
    
    // Categories
    cat_garbage_solid_waste: 'చెత్త & ఘన వ్యర్థాలు',
    cat_drainage_sewerage: 'డ్రైనేజీ & మురుగునీటి సమస్య',
    cat_water_supply: 'తాగునీటి సరఫరా',
    cat_roads_potholes: 'రోడ్లు & గుంతలు',
    cat_streetlights: 'వీధి దీపాలు & లైటింగ్',
    cat_sanitation: 'పారిశుధ్య సమస్యలు',
    cat_stormwater_flooding: 'వర్షపు నీరు & ముంపు',
    cat_stray_animals: 'వీధి జంతువులు & పశువులు',
    cat_infrastructure: 'ప్రజా మౌలిక సదుపాయాలు',
    cat_parks: 'పార్కులు & పచ్చదనం',
    cat_encroachment: 'ఫుట్‌పాత్ & రహదారి ఆక్రమణలు',
    cat_other: 'ఇతర పౌర సమస్యలు',
    
    // Statuses
    status_Draft: 'చిత్తుప్రతి (డ్రాఫ్ట్)',
    status_Submitted: 'సమర్పించబడింది',
    status_Received: 'స్వీకరించబడింది',
    status_UnderReview: 'పరిశీలనలో ఉంది',
    status_NeedsClarification: 'వివరణ అవసరం',
    status_Validated: 'ధృవీకరించబడింది',
    status_Assigned: 'అధికారికి కేటాయించబడింది',
    status_Accepted: 'అంగీకరించబడింది',
    status_InProgress: 'పని పురోగతిలో ఉంది',
    status_AwaitingEvidence: 'రుజువు కోసం వేచిచూస్తున్నారు',
    status_PendingVerification: 'ధృవీకరణ పెండింగ్‌లో ఉంది',
    status_Resolved: 'పరిష్కరించబడింది',
    status_Closed: 'మూసివేయబడింది',
    status_Reopened: 'తిరిగి తెరవబడింది',
    status_Rejected: 'తిరస్కరించబడింది',

    // Severities
    sev_Low: 'తక్కువ',
    sev_Medium: 'మధ్యస్థం',
    sev_High: 'తీవ్రమైనది',
    sev_Critical: 'అత్యవసరం (క్రిటికల్)',

    // Roles
    role_citizen: 'పౌరుడు',
    role_field_officer: 'క్షేత్ర స్థాయి అధికారి',
    role_verification_officer: 'ధృవీకరణ అధికారి',
    role_department_officer: 'శాఖా అధికారి',
    role_department_head: 'శాఖాధిపతి',
    role_super_admin: 'సూపర్ అడ్మిన్',
    role_platform_owner: 'ప్లాట్‌ఫారమ్ ఓనర్',

    // Sections & Headers
    howItWorksTitle: 'సివిక్‌సిగ్నల్ ఎలా పనిచేస్తుంది',
    howItWorksSub: 'వాయిస్ ఫిర్యాదు నుండి క్షేత్రస్థాయి ధృవీకరించిన పరిష్కారం వరకు నాలుగు దశలు',
    step1Title: '01. సులభమైన ద్విభాషా నివేదన',
    step1Desc: 'తెలుగు లేదా ఇంగ్లీషులో మాట్లాడి లేదా ఫోటో తీసి జీపీఎస్ లొకేషన్‌తో తక్షణమే ఫిర్యాదు చేయండి.',
    step2Title: '02. కంప్లైంట్ డిఎన్ఎ & ఏఐ విశ్లేషణ',
    step2Desc: 'ఒకే ప్రాంతంలో వచ్చే పలు ఫిర్యాదులను ఏఐ విశ్లేషించి ప్రధాన మూల సమస్యను గుర్తిస్తుంది.',
    step3Title: '03. ఆటోమేటిక్ రూటింగ్ & సమయపాలన (SLA)',
    step3Desc: 'సంబంధిత వార్డు అధికారులకు తక్షణమే కేటాయించబడి, నిర్ణీత గడువులోగా పరిష్కరించబడుతుంది.',
    step4Title: '04. ఫోటో సాక్ష్యంతో నిజమైన ధృవీకరణ',
    step4Desc: 'పని జరగకముందు మరియు జరిగిన తర్వాత ఫోటో సాక్ష్యాలను పౌరులే స్వయంగా పరిశీలించవచ్చు.',

    // Stats
    statTotalComplaints: 'మొత్తం ఫిర్యాదులు',
    statResolved: 'పరిష్కరించినవి',
    statActiveHotspots: 'డిఎన్ఎ సమస్య క్లస్టర్లు',
    statAvgResolutionTime: 'సగటు పరిష్కార సమయం',
    statSlaAdherence: 'సమయపాలన శాతం',
    
    // Voice Assistant
    voiceTitle: 'ద్విభాషా ఏఐ వాయిస్ ఫిర్యాదు అసిస్టెంట్',
    voiceSub: 'తెలుగు లేదా ఇంగ్లీషులో మాట్లాడండి. మా ఏఐ మీ స్వరాన్ని గ్రహించి, లొకేషన్ మరియు వర్గాన్ని స్వయంచాలకంగా గుర్తిస్తుంది.',
    micReady: 'మాట్లాడటానికి మైక్ నొక్కండి',
    micListening: 'మీ స్వరాన్ని వింటున్నాం...',
    micProcessing: 'ఫిర్యాదు మరియు లొకేషన్ నమోదు చేస్తున్నాం...',
    micSpeaking: 'నమోదైన వివరాలు చదివి వినిపిస్తున్నాం...',
    trySpeakingPrompt: 'ఇలా చెప్పండి: "MVP కాలనీ సెక్టార్ 4 లో చాలా రోజులుగా డ్రైనేజీ లీక్ అవుతోంది, దయచేసి పరిశీలించండి."',
    audioReplay: 'ఆడియో సారాంశం వినండి',
    confirmAndSubmit: 'వివరాలు సరిచూసి సమర్పించండి',
    cancelVoice: 'రద్దు చేయండి',

    // Complaint Form
    formTitle: 'పౌర సమస్య ఫిర్యాదు సమర్పణ',
    fieldTitle: 'సమస్య శీర్షిక',
    fieldTitlePlaceholder: 'ఉదా: ప్రధాన రహదారిపై నీటి పైపులైను లీకేజ్',
    fieldCategory: 'సమస్య వర్గం',
    fieldDescription: 'వివరణాత్మక వివరాలు',
    fieldDescPlaceholder: 'సమస్య ఎక్కడ ఉంది, ఎంత కాలం నుండి ఉంది, ఎంత తీవ్రంగా ఉందో వివరించండి...',
    fieldLocality: 'జివిఎంసి ప్రాంతం (లొకాలిటీ)',
    fieldWard: 'వార్డు నెంబర్',
    fieldAddress: 'వీధి / ల్యాండ్‌మార్క్ చిరునామా',
    fieldAddressPlaceholder: 'ఉదా: సెక్టార్ 4 కమ్యూనిటీ హాల్ దగ్గర, రోడ్ నెం 6',
    fieldEvidence: 'ఫోటో లేదా వీడియో రుజువు అప్‌లోడ్ చేయండి',
    fieldAnonymous: 'అనామకంగా సమర్పించండి (పబ్లిక్ ఫీడ్‌లలో మీ పేరు దాచబడుతుంది)',
    submitting: 'ఏఐ తో విశ్లేషించి సమర్పిస్తున్నాము...',
    submitSuccessTitle: 'ఫిర్యాదు విజయవంతంగా నమోదైంది',
    submitSuccessDesc: 'మీ ప్రత్యేక ఫిర్యాదు ఐడి సిద్ధమైంది. పురోగతిని కింద ట్రాక్ చేయవచ్చు.',
    
    // Complaint DNA section
    dnaTitle: 'కంప్లైంట్ డిఎన్ఎ ఇంజిన్',
    dnaBadge: 'పునరావృత మూల సమస్యల లింకేజ్',
    dnaExplanation: 'విడివిడిగా వచ్చే ఫిర్యాదులను కేవలం వేర్వేరు టిక్కెట్లుగా కాకుండా, ఒకే ప్రాంతంలోని మూల సమస్యతో అనుసంధానిస్తుంది.',
    dnaRecurrence: 'పునరావృత తీవ్రత',
    dnaFirstReported: 'మొదట నమోదైన తేదీ',
    dnaLatestReport: 'తాజా ఫిర్యాదు తేదీ',
    dnaLinkedCount: 'కలిసి ఉన్న పౌరుల ఫిర్యాదులు',
    dnaConfidence: 'డిఎన్ఎ మ్యాచ్ ఖచ్చితత్వం',
    dnaPriorityScore: 'గణించిన ప్రాధాన్యత స్కోరు',

    // GIS Map
    mapTitle: 'విశాఖపట్నం పౌర ఇంటెలిజెన్స్ మ్యాప్',
    mapSub: '17 జివిఎంసి లొకాలిటీలలో క్రియాశీల సమస్యలు, పరిష్కరించబడినవి మరియు పునరావృత కేంద్రాల ప్రత్యక్ష భౌగోళిక సమాచారం.',
    filterAll: 'అన్ని వర్గాలు',
    filterCriticalOnly: 'అత్యవసర సమస్యలు మాత్రమే',
    filterHotspotsOnly: 'పునరావృత కేంద్రాలు మాత్రమే',
    filterUnresolved: 'పరిష్కారం కానివి',
    mapLegendComplaint: 'వ్యక్తిగత ఫిర్యాదు',
    mapLegendHotspot: 'డిఎన్ఎ పునరావృత కేంద్రం',
    mapLegendResolved: 'పరిష్కరించిన సమస్య',
    
    // Authority
    authPortalTitle: 'జివిఎంసి మున్సిపల్ కమాండ్ సెంటర్',
    switchRole: 'పాత్రను మార్చండి (డెమో & ఆడిట్)',
    slaBreachAlert: 'గడువు దాటిన అత్యవసర సమస్యలు (SLA బ్రీచ్)',
    assignOfficer: 'ఫీల్డ్ అధికారికి కేటాయించండి',
    updateStatus: 'పురోగతి స్థితిని మార్చండి',
    verifyResolution: 'ఫోటోల సాక్ష్యాలను పరిశీలించండి',
    confirmResolution: 'పరిష్కారాన్ని ఆమోదించి మూసివేయండి',
    disputeResolution: 'పరిష్కారంపై అభ్యంతరం తెలపండి',
    disputeReason: 'పని ఎందుకు అసంపూర్తిగా ఉందో తెలపండి',
    reopenIssue: 'సవరణ కోసం తిరిగి తెరవండి',
    
    // Common buttons & states
    save: 'భద్రపరచండి',
    cancel: 'రద్దు చేయండి',
    close: 'మూసివేయండి',
    viewDetails: 'పూర్తి వివరాలు చూడండి',
    back: 'వెనుకకు',
    searchPlaceholder: 'ఐడి, ప్రాంతం లేదా పదాల ద్వారా వెతకండి...',
    noResults: 'ఎటువంటి ఫిర్యాదులు కనుగొనబడలేదు',
    loading: 'డేటా లోడ్ అవుతోంది...',
  }
};

export function t(lang: Language, key: keyof typeof TRANSLATIONS['en']): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
}

export function translateCategory(lang: Language, category: ComplaintCategory): string {
  const key = `cat_${category}` as keyof typeof TRANSLATIONS['en'];
  return t(lang, key);
}

export function translateStatus(lang: Language, status: ComplaintStatus): string {
  const key = `status_${status.replace(/\s+/g, '')}` as keyof typeof TRANSLATIONS['en'];
  return t(lang, key) || status;
}

export function translateSeverity(lang: Language, severity: SeverityLevel): string {
  const key = `sev_${severity}` as keyof typeof TRANSLATIONS['en'];
  return t(lang, key);
}

export function translateRole(lang: Language, role: UserRole): string {
  const key = `role_${role}` as keyof typeof TRANSLATIONS['en'];
  return t(lang, key);
}
