/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, Globe, Shield } from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { useLanguage } from '../../lib/i18n';

export const AdminSettings: React.FC = () => {
  const store = useNewsStore();
  const { t } = useLanguage();
  const currentSettings = store.getSettings();

  const [siteNameHi, setSiteNameHi] = useState(currentSettings.siteNameHi);
  const [siteNameEn, setSiteNameEn] = useState(currentSettings.siteNameEn);
  const [taglineHi, setTaglineHi] = useState(currentSettings.taglineHi);
  const [contactEmail, setContactEmail] = useState(currentSettings.contactEmail);
  const [contactPhone, setContactPhone] = useState(currentSettings.contactPhone);
  const [officeAddress, setOfficeAddress] = useState(currentSettings.officeAddress);
  const [editorName, setEditorName] = useState(currentSettings.editorName);
  const [grievanceOfficer, setGrievanceOfficer] = useState(currentSettings.grievanceOfficer);

  const [facebook, setFacebook] = useState(currentSettings.socialLinks.facebook);
  const [twitter, setTwitter] = useState(currentSettings.socialLinks.twitter);
  const [youtube, setYoutube] = useState(currentSettings.socialLinks.youtube);
  const [whatsapp, setWhatsapp] = useState(currentSettings.socialLinks.whatsapp);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setSiteNameHi(currentSettings.siteNameHi);
    setSiteNameEn(currentSettings.siteNameEn);
    setTaglineHi(currentSettings.taglineHi);
    setContactEmail(currentSettings.contactEmail);
    setContactPhone(currentSettings.contactPhone);
    setOfficeAddress(currentSettings.officeAddress);
    setEditorName(currentSettings.editorName);
    setGrievanceOfficer(currentSettings.grievanceOfficer);
    setFacebook(currentSettings.socialLinks.facebook);
    setTwitter(currentSettings.socialLinks.twitter);
    setYoutube(currentSettings.socialLinks.youtube);
    setWhatsapp(currentSettings.socialLinks.whatsapp);
  }, [currentSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSavedSuccess(false);
    try {
      const saved = await store.updateSettings({
        siteNameHi,
        siteNameEn,
        taglineHi,
        contactEmail,
        contactPhone,
        officeAddress,
        editorName,
        grievanceOfficer,
        socialLinks: {
          facebook,
          twitter,
          youtube,
          whatsapp,
          instagram: currentSettings.socialLinks.instagram
        }
      });

      if (!saved) {
        setSaveError(store.getDatabaseError() || 'Unable to save settings. Please try again.');
        return;
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5 shadow-lg sm:p-6">
        <h1 className="font-serif text-xl font-bold text-white sm:text-2xl">
          Portal Settings & Configuration
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Branding, contact details, grievance officer, social profiles, and default portal metadata.
        </p>
        <p className="mt-2 text-[11px] text-stone-500">
          Saved values are loaded from Supabase. Empty fields show the current site value as a placeholder; enter a value and save to customize it.
        </p>
      </div>

      <form onSubmit={handleSave} className="w-full space-y-8 rounded-2xl border border-stone-800 bg-stone-900 p-5 text-xs text-stone-200 shadow-lg sm:p-8">
        <div>
          <h2 className="mb-4 flex items-center gap-2 border-b border-stone-800 pb-3 font-serif text-base font-bold text-white">
            <Globe size={16} className="text-red-500" />
            <span>Brand & Identity</span>
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Portal Name (Hindi)</label>
              <input
                type="text"
                value={siteNameHi}
                onChange={(e) => setSiteNameHi(e.target.value)}
                placeholder={t('siteHindiName')}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 font-bold text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Portal Name (English)</label>
              <input
                type="text"
                value={siteNameEn}
                onChange={(e) => setSiteNameEn(e.target.value)}
                placeholder={t('siteName')}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 font-bold text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-300 mb-1">Tagline</label>
              <input
                type="text"
                value={taglineHi}
                onChange={(e) => setTaglineHi(e.target.value)}
                placeholder={t('tagline')}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 flex items-center gap-2 border-b border-stone-800 pb-3 font-serif text-base font-bold text-white">
            <Shield size={16} className="text-red-500" />
            <span>Editorial & Grievance Governance</span>
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Editor-in-Chief Name</label>
              <input
                type="text"
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                placeholder="Editor-in-Chief name"
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Grievance Redressal Officer</label>
              <input
                type="text"
                value={grievanceOfficer}
                onChange={(e) => setGrievanceOfficer(e.target.value)}
                placeholder="Grievance officer name"
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Official Desk Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="newsdesk@example.com"
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Bureau Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 phone number"
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-300 mb-1">Bureau Address</label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="Bureau address"
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 border-b border-stone-800 pb-3 font-serif text-base font-bold text-white">
            Social & Distribution Links
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Facebook Page URL</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">X (Twitter) Profile URL</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/..."
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">YouTube Channel URL</label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">WhatsApp Channel Link</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="https://whatsapp.com/channel/..."
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-stone-800 pt-5 sm:flex-row sm:items-center">
          {savedSuccess ? (
            <span role="status" className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 size={16} /> Configuration saved!
            </span>
          ) : saveError
            ? <span role="alert" className="text-xs font-semibold text-red-400">{saveError}</span>
            : <span />}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60 sm:min-w-48"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving…' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
