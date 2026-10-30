/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Send, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { SubmissionType } from '../types/news';
import { useLanguage } from '../lib/i18n';

interface StaticPagesProps {
  type: 'about' | 'contact' | 'suggestion' | 'editorial' | 'privacy' | 'grievance';
  onOpenAuth: (message?: string, onSuccess?: () => void) => void;
  preselectedArticle?: { id: string; headline: string };
}

export const StaticPages: React.FC<StaticPagesProps> = ({ 
  type, 
  onOpenAuth,
  preselectedArticle 
}) => {
  const store = useNewsStore();
  const settings = store.getSettings();
  const districts = store.getDistricts();
  const currentUser = store.getCurrentUser();
  const { language, t, getDistrictName } = useLanguage();

  // --- PERSISTENT DRAFT FORM STATES ---
  // Suggestions / Corrections Form
  const [subType, setSubType] = useState<SubmissionType>(preselectedArticle ? 'correction' : 'suggestion');
  const [subject, setSubject] = useState(
    preselectedArticle 
      ? (language === 'hi' ? `तथ्य सुधार: ${preselectedArticle.headline.substring(0, 40)}...` : `Correction Request: ${preselectedArticle.headline.substring(0, 40)}...`)
      : ''
  );
  const [message, setMessage] = useState('');
  const [subDistrict, setSubDistrict] = useState(store.getSelectedDistrict());
  const [subSuccess, setSubSuccess] = useState(false);

  // Advertising Form
  const [advName, setAdvName] = useState('');
  const [advBusiness, setAdvBusiness] = useState('');
  const [advContact, setAdvContact] = useState('');
  const [advDistrict, setAdvDistrict] = useState(districts[0]?.id || '');
  const [advDates, setAdvDates] = useState('');
  const [advBudget, setAdvBudget] = useState('');
  const [advMessage, setAdvMessage] = useState('');
  const [advSuccess, setAdvSuccess] = useState(false);

  // Auto-fill user contact if logged in
  useEffect(() => {
    if (currentUser) {
      if (!advName) setAdvName(currentUser.name);
      if (!advContact) setAdvContact(currentUser.email);
    }
  }, [currentUser]);

  // Handle Suggestion/Correction submission
  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth(
        language === 'hi' 
          ? 'सुझाव या सुधार सबमिट करने के लिए कृपया Google SSO से लॉगिन करें (आपका विवरण सुरक्षित रहेगा)।'
          : 'Please sign in with Google SSO to submit a suggestion or correction. Your drafted message will be preserved.',
        () => {}
      );
      return;
    }

    const saved = await store.addSubmission({
      type: subType,
      userName: currentUser.name,
      userEmail: currentUser.email,
      subject: subject.trim(),
      message: message.trim(),
      relatedArticleId: preselectedArticle?.id,
      relatedArticleTitle: preselectedArticle?.headline,
      targetDistrict: subDistrict
    });

    if (!saved) return;
    setSubSuccess(true);
    setMessage('');
    setSubject('');
  };

  // Handle Advertising inquiry submission
  const handleAdInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth(
        language === 'hi'
          ? 'विज्ञापन पूछताछ सबमिट करने के लिए कृपया Google SSO से साइन-इन करें (फॉर्म सुरक्षित रहेगा)।'
          : 'Please sign in with Google SSO to submit an advertising inquiry. Your form content will be saved.',
        () => {}
      );
      return;
    }

    const saved = await store.addSubmission({
      type: 'advertising_inquiry',
      userName: advName.trim() || currentUser.name,
      userEmail: currentUser.email,
      userPhone: advContact,
      businessName: advBusiness.trim(),
      subject: `${language === 'hi' ? 'विज्ञापन पूछताछ:' : 'Advertising Inquiry:'} ${advBusiness}`,
      message: advMessage.trim(),
      targetDistrict: advDistrict,
      preferredDates: advDates,
      budget: advBudget
    });

    if (!saved) return;
    setAdvSuccess(true);
    setAdvMessage('');
    setAdvDates('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* 1. ABOUT US */}
      {type === 'about' && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b-2 border-red-600 pb-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              {language === 'hi' ? 'हमारा परिचय' : 'About Us'}
            </span>
            <h1 className="text-3xl font-extrabold text-stone-900 font-serif">
              {language === 'hi' ? 'न्यूज़ भारत प्लस' : 'News Bharat Plus'}
            </h1>
          </div>

          <div className="prose text-stone-700 leading-relaxed text-sm sm:text-base space-y-4">
            {language === 'hi' ? (
              <>
                <p>
                  <strong>न्यूज़ भारत प्लस</strong> बिहार राज्य का एक निष्पक्ष, स्वतंत्र और आधुनिक डिजिटल समाचार मंच है। हमारा संकल्प राजधानी पटना से लेकर राज्य के सभी 38 जिलों के जन-सरोकारों, विकास, शिक्षा, रोज़गार, ग्रामीण अर्थव्यवस्था और संस्कृति को अग्रिम पंक्ति में लाना है।
                </p>
                <p>
                  हम सनसनीखेज पत्रकारिता और अनसत्यापित सूचनाओं के सख्त विरुद्ध हैं। हमारी प्रत्येक रिपोर्ट दोहरे तथ्य-सत्यापन और संबंधित पक्षों के आधिकारिक वक्तव्य के साथ ही प्रकाशित की जाती है।
                </p>
                <h3 className="text-lg font-bold text-stone-900 font-serif pt-2">हमारे संपादकीय सिद्धांत:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
                  <li><strong>सटीकता व निष्पक्षता:</strong> किसी भी राजनीतिक या व्यावसायिक पूर्वाग्रह से मुक्त पत्रकारिता।</li>
                  <li><strong>जमीनी कवरेज:</strong> केवल बड़े शहरों तक सीमित न रहकर सुदूर प्रखंडों व गांवों की समस्याओं को मंच देना।</li>
                  <li><strong>पारदर्शिता:</strong> यदि किसी लेख में त्रुटि हो, तो उसे स्पष्ट संपादन नोट के साथ शीघ्र संशोधित करना।</li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  <strong>News Bharat Plus</strong> is an independent, non-partisan digital news publication dedicated to delivering reliable, in-depth, and verified news covering Bihar, its 38 districts, and pivotal national developments.
                </p>
                <p>
                  Headquartered in Patna, our editorial team reports on governance, infrastructure, education, employment, agriculture, crime, health, and cultural developments. We strictly reject sensationalism and clickbait in favor of verified ground journalism.
                </p>
                <h3 className="text-lg font-bold text-stone-900 font-serif pt-2">Our Core Editorial Standards:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
                  <li><strong>Accuracy & Verification:</strong> Every article is vetted using official documentation and on-the-record statements.</li>
                  <li><strong>Hyperlocal Ground Coverage:</strong> Genuine focus on grassroots issues from Patna to the state borders, including Gaya, Muzaffarpur, and Bhagalpur.</li>
                  <li><strong>Correction Transparency:</strong> Corrections are promptly published with clear editorial timestamps.</li>
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      {/* 2. CONTACT & ADVERTISE WITH US */}
      {type === 'contact' && (
        <section className="space-y-8">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="border-b-2 border-red-600 pb-3 mb-6">
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                {language === 'hi' ? 'बिजनेस एवं संपर्क' : 'Commercial & Outreach'}
              </span>
              <h1 className="text-3xl font-extrabold text-stone-900 font-serif">
                {t('contactTitle')}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'hi'
                  ? 'बिहार के लाखों जागरूक पाठकों, छात्रों और व्यापारियों तक अपने ब्रांड का सीधा संदेश पहुंचाएं।'
                  : 'Reach thousands of engaged readers, students, entrepreneurs, and professionals across Bihar and beyond.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs text-stone-700">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <MapPin size={18} className="text-red-600 mb-2" />
                <div className="font-bold text-stone-900">{t('bureauAddress')}</div>
                <div className="mt-1 text-stone-600">{settings.officeAddress}</div>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <Mail size={18} className="text-red-600 mb-2" />
                <div className="font-bold text-stone-900">{t('emailInquiries')}</div>
                <div className="mt-1 text-stone-600">{settings.contactEmail}</div>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <Phone size={18} className="text-red-600 mb-2" />
                <div className="font-bold text-stone-900">{t('editorialDesk')}</div>
                <div className="mt-1 text-stone-600">{settings.contactPhone}</div>
              </div>
            </div>

            {/* Advertising Inquiry Form */}
            <div className="border-t border-stone-200 pt-6">
              <h2 className="text-lg font-bold text-stone-900 font-serif mb-2">
                {language === 'hi' ? 'विज्ञापन पूछताछ फॉर्म' : 'Advertising Inquiry Form'}
              </h2>
              <p className="text-xs text-stone-500 mb-4">
                {t('loginRequiredNotice')}
              </p>

              {advSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                  <h3 className="font-bold text-emerald-900">
                    {language === 'hi' ? 'आपकी पूछताछ सफलतापूर्वक प्राप्त हुई!' : 'Inquiry Received Successfully!'}
                  </h3>
                  <p className="text-xs text-emerald-700">
                    {language === 'hi' ? 'हमारी टीम 24 कार्य घंटों में आपसे संपर्क करेगी।' : 'Our sales team will get in touch with you within 24 business hours.'}
                  </p>
                  <button 
                    onClick={() => setAdvSuccess(false)}
                    className="mt-2 text-xs text-emerald-800 underline font-semibold cursor-pointer"
                  >
                    {language === 'hi' ? 'नया फॉर्म भरें' : 'Submit Another Inquiry'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAdInquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('yourName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={advName}
                        onChange={(e) => setAdvName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('businessName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={advBusiness}
                        onChange={(e) => setAdvBusiness(e.target.value)}
                        placeholder="e.g. Super 50 Academy, Patna"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('contactInfo')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={advContact}
                        onChange={(e) => setAdvContact(e.target.value)}
                        placeholder="name@company.com or 9876543210"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('targetDistrict')}
                      </label>
                      <select
                        value={advDistrict}
                        onChange={(e) => setAdvDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                      >
                        <option value="all">{t('allBihar')}</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{getDistrictName(d.id)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('campaignDates')}
                      </label>
                      <input
                        type="text"
                        value={advDates}
                        onChange={(e) => setAdvDates(e.target.value)}
                        placeholder="e.g. Nov 15 to Nov 30"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('budgetRange')}
                      </label>
                      <select
                        value={advBudget}
                        onChange={(e) => setAdvBudget(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                      >
                        <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                        <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                        <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                        <option value="₹1,00,000+">₹1,00,000+ (Annual or Multi-District)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('campaignMessage')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={advMessage}
                      onChange={(e) => setAdvMessage(e.target.value)}
                      placeholder="Outline what products or services you wish to promote..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {!currentUser && (
                      <span className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                        <Lock size={12} />
                        {language === 'hi' 
                          ? 'सबमिट करते समय Google SSO पूछा जाएगा (ड्राफ्ट सुरक्षित रहेगा)।'
                          : 'Google SSO required upon submit (your text is preserved).'}
                      </span>
                    )}
                    <button
                      type="submit"
                      className="ml-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Send size={14} />
                      <span>{t('submitInquiry')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. SUGGESTION OR CORRECTION FORM */}
      {type === 'suggestion' && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b-2 border-red-600 pb-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              {language === 'hi' ? 'पाठक सहभागिता' : 'Reader Participation'}
            </span>
            <h1 className="text-3xl font-extrabold text-stone-900 font-serif">
              {t('suggestionTitle')}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {language === 'hi'
                ? 'यदि आपने किसी ख़बर में कोई तथ्यात्मक त्रुटि देखी है अथवा जनहित का कोई मुद्दा उठाना चाहते हैं, तो कृपया हमें बताएं।'
                : 'Notice a factual error, or want to share a public interest news tip? Send it directly to our editorial team.'}
            </p>
          </div>

          {subSuccess ? (
            <div className="p-8 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-3">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
              <h3 className="font-bold text-base text-emerald-900">
                {language === 'hi' ? 'धन्यवाद! आपका संदेश प्राप्त हो गया है।' : 'Thank you! Your message has been received.'}
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                {language === 'hi'
                  ? 'हमारी संपादकीय टीम आपके सुझाव/सुधार की समीक्षा करेगी।'
                  : 'Our editorial desk reviews every submission.'}
              </p>
              <button 
                onClick={() => setSubSuccess(false)}
                className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
              >
                {language === 'hi' ? 'अन्य संदेश भेजें' : 'Send Another Note'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmissionSubmit} className="space-y-4">
              {/* Submission Type */}
              <div className="flex gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="subType"
                    checked={subType === 'suggestion'}
                    onChange={() => setSubType('suggestion')}
                    className="accent-red-600"
                  />
                  <span>{t('suggestionTip')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="subType"
                    checked={subType === 'correction'}
                    onChange={() => setSubType('correction')}
                    className="accent-red-600"
                  />
                  <span>{t('correctionReport')}</span>
                </label>
              </div>

              {preselectedArticle && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <strong>{language === 'hi' ? 'संबंधित समाचार:' : 'Related Article:'}</strong> {preselectedArticle.headline}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('subject')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief subject..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('targetDistrict')}
                  </label>
                  <select
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{getDistrictName(d.id)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('detailsExplanation')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain clearly what fact needs correcting or provide context for your suggestion..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {!currentUser ? (
                  <span className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                    <Lock size={12} />
                    {language === 'hi' ? 'सबमिट करने के लिए त्वरित Google SSO आवश्यक है।' : 'Reader Google SSO required to submit (your draft is preserved).'}
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-500">
                    {language === 'hi' ? 'सक्रिय खाता:' : 'Signed in as:'} {currentUser.name} ({currentUser.email})
                  </span>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Send size={14} />
                  <span>{t('sendNote')}</span>
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* 4. EDITORIAL & PRIVACY POLICIES */}
      {(type === 'editorial' || type === 'privacy' || type === 'grievance') && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b-2 border-stone-900 pb-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              {language === 'hi' ? 'आचार संहिता एवं नियम' : 'Standards & Governance'}
            </span>
            <h1 className="text-3xl font-extrabold text-stone-900 font-serif">
              {type === 'editorial' && (language === 'hi' ? 'संपादकीय नीति एवं सुधार आचार संहिता' : 'Editorial Policy & Correction Guidelines')}
              {type === 'privacy' && (language === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy')}
              {type === 'grievance' && (language === 'hi' ? 'शिकायत निवारण अधिकारी एवं प्रक्रिया' : 'Grievance Redressal Mechanism')}
            </h1>
          </div>

          <div className="prose text-stone-700 leading-relaxed text-sm space-y-4">
            {type === 'editorial' && (
              <>
                <p>
                  <strong>News Bharat Plus</strong> operates in strict conformity with journalistic integrity principles, adhering to standards set forth by the Press Council of India and Digital News Publishers guidelines.
                </p>
                <h3 className="font-bold text-stone-900">1. Fact-Checking Standards:</h3>
                <p>Every story published on News Bharat Plus is verified through primary documents, authorized press briefings, or on-the-record statements. Unverified viral social media claims are never treated as facts.</p>
                <h3 className="font-bold text-stone-900">2. Correction Policy:</h3>
                <p>If a substantive error of fact is identified, we correct it within 24 hours. A clear note explaining the correction is appended at the top of the article.</p>
              </>
            )}

            {type === 'privacy' && (
              <>
                <p>
                  We deeply value reader privacy. Browsing, searching, watching videos, and reading articles on <strong>News Bharat Plus</strong> does not require creating an account or providing personal information.
                </p>
                <h3 className="font-bold text-stone-900">Data Collection:</h3>
                <p>Personal details (name, email address, optional phone) are only requested when a reader submits a suggestion, correction, or advertising inquiry via Google SSO. This information is utilized solely to follow up on your submission and is never sold to third parties.</p>
              </>
            )}

            {type === 'grievance' && (
              <>
                <p>
                  In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, readers may reach our Grievance Officer:
                </p>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-900">{settings.grievanceOfficer}</div>
                  <div className="text-stone-600 mt-1">Email: grievance@newsbharatplus.in</div>
                  <div className="text-stone-600">Address: {settings.officeAddress}</div>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
