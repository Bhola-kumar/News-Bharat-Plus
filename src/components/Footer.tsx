/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Youtube,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { BIHAR_DISTRICTS, TOPICS } from '../lib/constants';
import { useLanguage } from '../lib/i18n';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const store = useNewsStore();
  const settings = store.getSettings();
  const { language, t, getDistrictName } = useLanguage();

  return (
    <footer className="w-full bg-stone-900 text-stone-300 mt-auto border-t-4 border-red-600">
      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & Editorial Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-500 tracking-tight font-serif">
              {language === 'hi' ? 'न्यूज़ भारत प्लस' : 'News Bharat Plus'}
            </span>
            <span className="text-xs font-bold text-stone-400 tracking-widest uppercase">
              {language === 'hi' ? 'NEWS BHARAT PLUS' : 'न्यूज़ भारत प्लस'}
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed max-w-md">
            {language === 'hi'
              ? 'राजधानी पटना, बिहार के सभी 38 जिलों और राष्ट्रीय मुद्दों पर स्वतंत्र, सटीक और निष्पक्ष पत्रकारिता को समर्पित प्रमुख डिजिटल समाचार पोर्टल।'
              : 'Leading digital publication dedicated to independent, accurate, and grassroots reporting across Patna, all 38 districts of Bihar, and national affairs.'}
          </p>

          <div className="space-y-1.5 text-xs text-stone-400 pt-2">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-red-500 shrink-0" />
              <span>{settings.officeAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-red-500 shrink-0" />
              <span>{settings.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-red-500 shrink-0" />
              <span>{settings.contactPhone}</span>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="flex items-center gap-3 pt-3">
            <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors">
              <Youtube size={15} />
            </a>
            <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors">
              <Facebook size={15} />
            </a>
            <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 hover:bg-sky-500 text-white flex items-center justify-center transition-colors">
              <Twitter size={15} />
            </a>
            <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 hover:bg-pink-600 text-white flex items-center justify-center transition-colors">
              <Instagram size={15} />
            </a>
          </div>
        </div>

        {/* Primary Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-stone-800 pb-2 mb-3">
            {language === 'hi' ? 'श्रेणियां' : 'Categories'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/category/bihar')} className="hover:text-white transition-colors cursor-pointer">
                {t('navBihar')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/district/gaya')} className="hover:text-white transition-colors cursor-pointer">
                {t('navGaya')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/category/national')} className="hover:text-white transition-colors cursor-pointer">
                {t('navNational')}
              </button>
            </li>
            {TOPICS.slice(0, 5).map(t => (
              <li key={t.id}>
                <button onClick={() => onNavigate(`/topic/${t.slug}`)} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'hi' ? t.nameHi : t.nameEn}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Districts */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-stone-800 pb-2 mb-3">
            {t('districtsHeading')}
          </h4>
          <ul className="space-y-2 text-xs">
            {BIHAR_DISTRICTS.filter(d => d.isPopular).map(dist => (
              <li key={dist.id}>
                <button 
                  onClick={() => {
                    store.setSelectedDistrict(dist.id);
                    onNavigate(`/district/${dist.id}`);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {getDistrictName(dist.id)}
                </button>
              </li>
            ))}
            <li>
              <button 
                onClick={() => onNavigate('/all-news')}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'सभी 38 जिले देखें →' : 'View all 38 districts →'}
              </button>
            </li>
          </ul>
        </div>

        {/* Policies, Editorial & Grievance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-stone-800 pb-2 mb-3">
            {language === 'hi' ? 'संपादकीय एवं नीतियां' : 'Editorial & Policies'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/editorial-policy')} className="hover:text-white transition-colors cursor-pointer">
                {t('editorialGuidelines')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors cursor-pointer">
                {t('privacyPolicy')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/grievance')} className="hover:text-white transition-colors cursor-pointer">
                {t('grievanceOfficer')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/suggestion')} className="hover:text-white transition-colors cursor-pointer text-amber-300 font-medium">
                {t('submitSuggestion')}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                {t('advertiseContact')}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT STRIP */}
      <div className="bg-stone-950 py-4 px-4 sm:px-6 border-t border-stone-800 text-[11px] text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {language === 'hi' ? 'न्यूज़ भारत प्लस' : 'News Bharat Plus'}. {language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </p>
          <p>
            {settings.editorName} | {settings.grievanceOfficer}
          </p>
        </div>
      </div>
    </footer>
  );
};
