/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DistrictInfo, TopicInfo, SiteSettings } from '../types/news';

export const BIHAR_DISTRICTS: DistrictInfo[] = [
  { id: 'patna', nameEn: 'Patna', nameHi: 'पटना', division: 'Patna', isPopular: true },
  { id: 'gaya', nameEn: 'Gaya', nameHi: 'गया', division: 'Magadh', isPopular: true },
  { id: 'muzaffarpur', nameEn: 'Muzaffarpur', nameHi: 'मुजफ्फरपुर', division: 'Tirhut', isPopular: true },
  { id: 'bhagalpur', nameEn: 'Bhagalpur', nameHi: 'भागलपुर', division: 'Bhagalpur', isPopular: true },
  { id: 'nalanda', nameEn: 'Nalanda (Bihar Sharif)', nameHi: 'नालंदा (बिहारशरीफ)', division: 'Patna', isPopular: true },
  { id: 'darbhanga', nameEn: 'Darbhanga', nameHi: 'दरभंगा', division: 'Darbhanga', isPopular: true },
  { id: 'begusarai', nameEn: 'Begusarai', nameHi: 'बेगूसराय', division: 'Munger', isPopular: true },
  { id: 'purnia', nameEn: 'Purnia', nameHi: 'पूर्णिया', division: 'Purnia', isPopular: true },
  { id: 'vaishali', nameEn: 'Vaishali (Hajipur)', nameHi: 'वैशाली (हाजीपुर)', division: 'Tirhut' },
  { id: 'saran', nameEn: 'Saran (Chhapra)', nameHi: 'सारण (छपरा)', division: 'Saran' },
  { id: 'siwan', nameEn: 'Siwan', nameHi: 'सीवान', division: 'Saran' },
  { id: 'gopalganj', nameEn: 'Gopalganj', nameHi: 'गोपालगंज', division: 'Saran' },
  { id: 'motihari', nameEn: 'East Champaran (Motihari)', nameHi: 'पूर्वी चंपारण (मोतिहारी)', division: 'Tirhut' },
  { id: 'bettiah', nameEn: 'West Champaran (Bettiah)', nameHi: 'पश्चिम चंपारण (बेतिया)', division: 'Tirhut' },
  { id: 'sitamarhi', nameEn: 'Sitamarhi', nameHi: 'सीतामढ़ी', division: 'Tirhut' },
  { id: 'madhubani', nameEn: 'Madhubani', nameHi: 'मधुबनी', division: 'Darbhanga' },
  { id: 'samastipur', nameEn: 'Samastipur', nameHi: 'समस्तीपुर', division: 'Darbhanga' },
  { id: 'saharsa', nameEn: 'Saharsa', nameHi: 'सहरसा', division: 'Kosi' },
  { id: 'supaul', nameEn: 'Supaul', nameHi: 'सुपौल', division: 'Kosi' },
  { id: 'madhepura', nameEn: 'Madhepura', nameHi: 'मधेपुरा', division: 'Kosi' },
  { id: 'katihar', nameEn: 'Katihar', nameHi: 'कटिहार', division: 'Purnia' },
  { id: 'kishanganj', nameEn: 'Kishanganj', nameHi: 'किशनगंज', division: 'Purnia' },
  { id: 'araria', nameEn: 'Araria', nameHi: 'अररिया', division: 'Purnia' },
  { id: 'munger', nameEn: 'Munger', nameHi: 'मुंगेर', division: 'Munger' },
  { id: 'khagaria', nameEn: 'Khagaria', nameHi: 'खगड़िया', division: 'Munger' },
  { id: 'jamui', nameEn: 'Jamui', nameHi: 'जमुई', division: 'Munger' },
  { id: 'lakhisarai', nameEn: 'Lakhisarai', nameHi: 'लखीसराय', division: 'Munger' },
  { id: 'sheikhpura', nameEn: 'Sheikhpura', nameHi: 'शेखपुरा', division: 'Munger' },
  { id: 'rohtas', nameEn: 'Rohtas (Sasaram)', nameHi: 'रोहतास (सासाराम)', division: 'Patna' },
  { id: 'bhojpur', nameEn: 'Bhojpur (Ara)', nameHi: 'भोजपुर (आरा)', division: 'Patna' },
  { id: 'buxar', nameEn: 'Buxar', nameHi: 'बक्सर', division: 'Patna' },
  { id: 'kaimur', nameEn: 'Kaimur (Bhabua)', nameHi: 'कैमूर (भभुआ)', division: 'Patna' },
  { id: 'nawada', nameEn: 'Nawada', nameHi: 'नवादा', division: 'Magadh' },
  { id: 'aurangabad', nameEn: 'Aurangabad', nameHi: 'औरंगाबाद', division: 'Magadh' },
  { id: 'jehanabad', nameEn: 'Jehanabad', nameHi: 'जहानाबाद', division: 'Magadh' },
  { id: 'arwal', nameEn: 'Arwal', nameHi: 'अरवल', division: 'Magadh' },
  { id: 'banka', nameEn: 'Banka', nameHi: 'बांका', division: 'Bhagalpur' },
  { id: 'sheohar', nameEn: 'Sheohar', nameHi: 'शिवहर', division: 'Tirhut' }
];

export const TOPICS: TopicInfo[] = [
  { id: 'politics', slug: 'politics', nameEn: 'Politics', nameHi: 'राजनीति', description: 'Bihar & National Political Updates' },
  { id: 'education', slug: 'education', nameEn: 'Education', nameHi: 'शिक्षा', description: 'Schools, Colleges, Universities & BPSC/UPSC' },
  { id: 'jobs', slug: 'jobs', nameEn: 'Jobs & Careers', nameHi: 'रोज़गार', description: 'Government recruitment, job alerts & exams' },
  { id: 'crime', slug: 'crime', nameEn: 'Crime & Law', nameHi: 'अपराध व कानून', description: 'Law, order, policing & judiciary' },
  { id: 'business', slug: 'business', nameEn: 'Business & Economy', nameHi: 'व्यापार', description: 'Industries, markets, start-ups & commerce' },
  { id: 'sports', slug: 'sports', nameEn: 'Sports', nameHi: 'खेल', description: 'Cricket, tournaments & athletic achievements' },
  { id: 'entertainment', slug: 'entertainment', nameEn: 'Entertainment & Culture', nameHi: 'मनोरंजन', description: 'Cinema, regional arts, heritage & lifestyle' },
  { id: 'health', slug: 'health', nameEn: 'Health & Wellness', nameHi: 'स्वास्थ्य', description: 'Hospitals, public wellness & medical updates' }
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteNameEn: 'News Bharat Plus',
  siteNameHi: 'न्यूज़ भारत प्लस',
  taglineHi: 'Unbiased, Accurate and Trusted Journalism',
  contactEmail: 'contact@newsbharatplus.in',
  contactPhone: '+91 612 220 8911',
  officeAddress: 'Press Enclave, Fraser Road, Near Dak Bungalow Crossing, Patna - 800001, Bihar',
  editorName: 'Rajiv Ranjan Verma (Editor-in-Chief)',
  grievanceOfficer: 'Amit Kumar Singh (Grievance Officer - IT Rules 2021)',
  socialLinks: {
    facebook: 'https://facebook.com/newsbharatplus',
    twitter: 'https://twitter.com/newsbharatplus',
    youtube: 'https://youtube.com/@newsbharatplus',
    whatsapp: 'https://whatsapp.com/channel/newsbharatplus',
    instagram: 'https://instagram.com/newsbharatplus'
  },
  supportedDistricts: BIHAR_DISTRICTS,
  supportedTopics: TOPICS
};
