/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { newsStore } from './newsStore';

export type Language = 'en' | 'hi';

const LANGUAGE_STORAGE_KEY = 'bnp_language_v3';

export const translations = {
  en: {
    // Top Utility & Brand
    siteName: 'News Bharat Plus',
    siteHindiName: 'न्यूज़ भारत प्लस',
    tagline: 'Independent Digital Journalism Covering Gaya, Patna & All 38 Districts of Bihar',
    aboutUs: 'About Us',
    advertiseContact: 'Advertise / Contact',
    submitSuggestion: 'Submit Suggestion / Correction',
    login: 'Sign In',
    logout: 'Logout',
    readerAccount: 'Reader Account',
    adminAccess: 'Admin Access',
    selectDistrict: 'Select District',
    allDistricts: 'All 38 Districts of Bihar',
    searchPlaceholder: 'Search news, topics, districts...',
    searchButton: 'Search',

    // Primary Nav
    navHome: 'Home',
    navBihar: 'Bihar',
    navGaya: 'Gaya',
    navNational: 'National',
    navVideos: 'Videos',
    navAllNews: 'All News & Filters',

    // Homepage Sections
    breakingNews: 'Breaking News',
    leadStory: 'Lead Story',
    topStories: 'Top Stories',
    latestNews: 'Latest Headlines',
    biharCoverage: 'Bihar Ground Coverage',
    districtNews: 'District News Desk',
    nationalNews: 'National Developments',
    videoDesk: 'Video Reports & Ground Coverage',
    videoDeskSub: 'Verified video bulletins. Zero autoplay and on-demand playback.',
    trendingNews: 'Trending & Most Read',
    loadMore: 'Load More News',
    noMoreNews: 'All recent articles loaded',
    noArticlesTitle: 'No News Published Yet',
    noArticlesSub: 'Stay tuned for live news updates, district developments, and breaking headlines from News Bharat Plus.',
    noDistrictNews: 'No recent updates published for this district yet.',
    noCategoryNews: 'No articles currently in this category.',

    // Article Detail
    byline: 'Report by',
    publishedOn: 'Published',
    updatedOn: 'Updated',
    keyPoints: 'Key Takeaways & Highlights',
    imageGallery: 'Photo Gallery',
    videoReport: 'Field Video Report',
    shareStory: 'Share this Report',
    whatsappShare: 'WhatsApp',
    facebookShare: 'Facebook',
    copyLink: 'Copy Link',
    downloadCard: 'Story Card',
    linkCopied: 'Link copied to clipboard!',
    reportCorrection: 'Report Factual Correction',
    relatedStories: 'Related Reports',
    sponsoredAd: 'Sponsored Advertisement',

    // Search & Filters
    searchTitle: 'News Search & Archive Filter',
    searchSub: 'Search verified reports across districts, topics, formats, and dates.',
    filterLocation: 'Location / District',
    filterTopic: 'Topic / Category',
    filterFormat: 'Format',
    filterDate: 'Time Period',
    filterSort: 'Sort By',
    allBihar: 'All Districts (Bihar & National)',
    allTopics: 'All Topics',
    allFormats: 'All Formats',
    formatArticle: 'Article',
    formatVideo: 'Video Report',
    formatPhoto: 'Photo Story',
    allTime: 'All Time',
    past24h: 'Past 24 Hours',
    past7d: 'Past 7 Days',
    past30d: 'Past 30 Days',
    sortLatest: 'Latest First',
    sortTrending: 'Trending & Most Read',
    resultsFound: 'articles found',
    resetFilters: 'Reset Filters',
    clearSearch: 'Clear',
    noSearchResults: 'No news articles match your current search or filters.',
    noSearchSub: 'Try adjusting your search keywords, switching districts, or clearing active filters.',

    // Static Pages
    aboutTitle: 'About News Bharat Plus',
    contactTitle: 'Advertise With Us & Bureau Contacts',
    suggestionTitle: 'Submit a Suggestion or Correction',
    policiesTitle: 'Editorial Standards & Policies',
    bureauAddress: 'Bureau Address',
    emailInquiries: 'Email Inquiries',
    editorialDesk: 'Editorial Desk',
    yourName: 'Your Full Name',
    businessName: 'Business / Brand Name',
    contactInfo: 'Email or Direct Phone',
    targetDistrict: 'Target District or Region',
    campaignDates: 'Proposed Campaign Dates',
    budgetRange: 'Budget Range (Optional)',
    campaignMessage: 'Campaign Message / Objective',
    submitInquiry: 'Submit Advertising Inquiry',
    sendNote: 'Submit Note',
    suggestionTip: 'Public Interest Suggestion / Tip',
    correctionReport: 'Report Fact Correction',
    subject: 'Subject / Title',
    detailsExplanation: 'Detailed Explanation & Sources',
    loginRequiredNotice: 'Reader sign-in required to submit (your form inputs remain preserved).',

    // SSO & Auth (Reader ONLY on public consumer modal)
    ssoTitle: 'Reader Sign In',
    ssoSub: 'Sign in with your Google account to submit suggestions, report corrections, or send advertising inquiries.',
    ssoContinueWithGoogle: 'Continue with Google',
    ssoSigningIn: 'Signing in with Google...',
    ssoAuthenticated: 'Successfully signed in as',

    // Admin & Staff Gating (Only on /admin)
    staffPortalTitle: 'Editorial & Staff Portal',
    staffPortalSub: 'This area is restricted to authorized editors and administrators of News Bharat Plus.',
    signInStaffSso: 'Sign In with Google SSO (Staff)',
    returnHome: '← Return to Public Website',
    adminAccessDenied: 'Access Denied: Your email is not authorized as an administrator. Only pre-configured admin emails can enter.',

    // Footer
    quickLinks: 'Quick Links',
    districtsHeading: 'Major Bihar Districts',
    editorialGuidelines: 'Editorial Policy',
    privacyPolicy: 'Privacy Policy',
    grievanceOfficer: 'Grievance Redressal',
    disclaimer: 'Independent digital news portal. All trademarks, logos, and brand names are property of their respective owners.',
    copyright: '© News Bharat Plus. All rights reserved.'
  },
  hi: {
    // Top Utility & Brand
    siteName: 'न्यूज़ भारत प्लस',
    siteHindiName: 'News Bharat Plus',
    tagline: 'गया, पटना और बिहार के सभी 38 जिलों का निष्पक्ष एवं विश्वसनीय डिजिटल समाचार पोर्टल',
    aboutUs: 'हमारे बारे में',
    advertiseContact: 'विज्ञापन / संपर्क',
    submitSuggestion: 'सुझाव / सुधार भेजें',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    readerAccount: 'पाठक खाता',
    adminAccess: 'एडमिन प्रवेश',
    selectDistrict: 'जिला चुनें',
    allDistricts: 'बिहार के सभी 38 जिले',
    searchPlaceholder: 'समाचार, विषय या जिला खोजें...',
    searchButton: 'खोजें',

    // Primary Nav
    navHome: 'होम',
    navBihar: 'बिहार',
    navGaya: 'गया',
    navNational: 'देश-दुनिया',
    navVideos: 'वीडियो',
    navAllNews: 'सभी समाचार व फ़िल्टर',

    // Homepage Sections
    breakingNews: 'ब्रेकिंग न्यूज़',
    leadStory: 'प्रमुख समाचार',
    topStories: 'मुख्य सुर्खियां',
    latestNews: 'ताज़ा समाचार',
    biharCoverage: 'बिहार ग्राउंड रिपोर्ट',
    districtNews: 'जिला समाचार डेस्क',
    nationalNews: 'राष्ट्रीय हलचल',
    videoDesk: 'वीडियो रिपोर्ट्स एवं ग्राउंड कवरेज',
    videoDeskSub: 'सत्यापित वीडियो बुलेटिन। कोई अनधिकृत ऑटोप्ले नहीं।',
    trendingNews: 'ट्रेंडिंग एवं सर्वाधिक पठित',
    loadMore: 'और समाचार देखें',
    noMoreNews: 'सभी ताज़ा समाचार लोड हो चुके हैं',
    noArticlesTitle: 'अभी कोई समाचार प्रकाशित नहीं हुआ',
    noArticlesSub: 'न्यूज़ भारत प्लस पर ताज़ा समाचार, जिला अपडेट और लाइव ग्राउंड कवरेज के लिए बने रहें।',
    noDistrictNews: 'इस जिले के लिए अभी कोई नया समाचार प्रकाशित नहीं हुआ है।',
    noCategoryNews: 'इस श्रेणी में अभी कोई समाचार उपलब्ध नहीं है।',

    // Article Detail
    byline: 'संवाददाता',
    publishedOn: 'प्रकाशित',
    updatedOn: 'अपडेट',
    keyPoints: 'मुख्य बिंदु एवं हाइलाइट्स',
    imageGallery: 'फोटो गैलरी',
    videoReport: 'ग्राउंड वीडियो रिपोर्ट',
    shareStory: 'यह रिपोर्ट साझा करें',
    whatsappShare: 'व्हाट्सएप',
    facebookShare: 'फेसबुक',
    copyLink: 'लिंक कॉपी करें',
    downloadCard: 'स्टोरी कार्ड',
    linkCopied: 'लिंक क्लिपबोर्ड पर कॉपी हो गया!',
    reportCorrection: 'तथ्य सुधार का अनुरोध करें',
    relatedStories: 'संबंधित ख़बरें',
    sponsoredAd: 'प्रायोजित विज्ञापन',

    // Search & Filters
    searchTitle: 'समाचार खोज एवं अभिलेखागार फ़िल्टर',
    searchSub: 'जिले, विषय, प्रारूप और तिथि के अनुसार सत्यापित समाचार खोजें।',
    filterLocation: 'स्थान / जिला',
    filterTopic: 'विषय / श्रेणी',
    filterFormat: 'प्रारूप',
    filterDate: 'समय सीमा',
    filterSort: 'क्रमबद्ध करें',
    allBihar: 'सभी जिले (बिहार व राष्ट्रीय)',
    allTopics: 'सभी विषय',
    allFormats: 'सभी प्रारूप',
    formatArticle: 'आलेख',
    formatVideo: 'वीडियो स्टोरी',
    formatPhoto: 'फोटो स्टोरी',
    allTime: 'सभी समय',
    past24h: 'पिछले 24 घंटे',
    past7d: 'पिछले 7 दिन',
    past30d: 'पिछले 30 दिन',
    sortLatest: 'ताज़ा समाचार पहले',
    sortTrending: 'ट्रेंडिंग व सर्वाधिक पठित',
    resultsFound: 'समाचार मिले',
    resetFilters: 'फ़िल्टर रीसेट करें',
    clearSearch: 'साफ करें',
    noSearchResults: 'आपकी खोज या फ़िल्टर से मेल खाता कोई समाचार नहीं मिला।',
    noSearchSub: 'कृपया अन्य कीवर्ड खोजें या फ़िल्टर साफ़ करें।',

    // Static Pages
    aboutTitle: 'न्यूज़ भारत प्लस के बारे में',
    contactTitle: 'विज्ञापन पूछताछ एवं कार्यालय संपर्क',
    suggestionTitle: 'सुझाव या तथ्य सुधार भेजें',
    policiesTitle: 'संपादकीय मानक एवं नीतियां',
    bureauAddress: 'कार्यालय पता',
    emailInquiries: 'ईमेल संपर्क',
    editorialDesk: 'संपादकीय डेस्क',
    yourName: 'आपका पूरा नाम',
    businessName: 'व्यवसाय / संस्थान का नाम',
    contactInfo: 'ईमेल अथवा फोन नंबर',
    targetDistrict: 'लक्षित जिला या क्षेत्र',
    campaignDates: 'प्रस्तावित अभियान तिथियां',
    budgetRange: 'अनुमानित बजट (वैकल्पिक)',
    campaignMessage: 'विज्ञापन का विवरण / उद्देश्य',
    submitInquiry: 'विज्ञापन पूछताछ भेजें',
    sendNote: 'संदेश भेजें',
    suggestionTip: 'जनहित सुझाव / समाचार टिप',
    correctionReport: 'तथ्य सुधार अनुरोध',
    subject: 'विषय / शीर्षक',
    detailsExplanation: 'विस्तृत विवरण एवं संदर्भ',
    loginRequiredNotice: 'सबमिट करने के लिए पाठक साइन-इन आवश्यक है (आपका लिखा विवरण सुरक्षित रहेगा)।',

    // SSO & Auth (Reader ONLY on public consumer modal)
    ssoTitle: 'पाठक लॉगिन',
    ssoSub: 'सुझाव, सुधार या विज्ञापन पूछताछ के लिए Google खाते से साइन इन करें।',
    ssoContinueWithGoogle: 'Google से आगे बढ़ें',
    ssoSigningIn: 'Google से लॉगिन हो रहा है...',
    ssoAuthenticated: 'सफलतापूर्वक लॉगिन किया:',

    // Admin & Staff Gating (Only on /admin)
    staffPortalTitle: 'संपादकीय एवं स्टाफ पोर्टल',
    staffPortalSub: 'यह क्षेत्र न्यूज़ भारत प्लस के अधिकृत संपादकों और प्रशासकों के लिए आरक्षित है।',
    signInStaffSso: 'Google SSO से स्टाफ लॉगिन करें',
    returnHome: '← मुख्य वेबसाइट पर वापस जाएं',
    adminAccessDenied: 'पहुंच अस्वीकृत: आपका ईमेल व्यवस्थापक के रूप में अधिकृत नहीं है।',

    // Footer
    quickLinks: 'त्वरित लिंक',
    districtsHeading: 'बिहार के प्रमुख जिले',
    editorialGuidelines: 'संपादकीय नीति',
    privacyPolicy: 'गोपनीयता नीति',
    grievanceOfficer: 'शिकायत निवारण',
    disclaimer: 'स्वतंत्र डिजिटल समाचार पोर्टल। सभी ट्रेडमार्क, लोगो और नाम उनके स्वामियों की संपत्ति हैं।',
    copyright: '© न्यूज़ भारत प्लस। सर्वाधिकार सुरक्षित।'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
  getDistrictName: (districtId: string) => string;
  getTopicName: (topicSlug: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') return saved;
    }
    return 'en'; // English by default
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key] || (key as string);
  };

  const getDistrictName = (districtId: string): string => {
    const dist = newsStore.getDistricts().find(d => d.id === districtId);
    if (!dist) return districtId;
    return language === 'hi' ? dist.nameHi : dist.nameEn;
  };

  const getTopicName = (topicSlug: string): string => {
    const topic = newsStore.getTopics().find(t => t.slug === topicSlug || t.id === topicSlug);
    if (!topic) return topicSlug;
    return language === 'hi' ? topic.nameHi : topic.nameEn;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getDistrictName, getTopicName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
