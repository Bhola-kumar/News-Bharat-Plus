/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Save, CheckCircle2, Globe, Shield } from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';

export const AdminSettings: React.FC = () => {
  const store = useNewsStore();
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
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

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg">
        <h1 className="text-xl font-bold text-white font-serif">
          Portal Settings & Configuration
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Branding, contact details, grievance officer, social profiles, and default portal metadata.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-lg space-y-6 text-xs text-stone-200">
        <div>
          <h2 className="text-sm font-bold text-white font-serif border-b border-stone-800 pb-2 mb-3 flex items-center gap-2">
            <Globe size={16} className="text-red-500" />
            <span>Brand & Identity</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Portal Name (Hindi)</label>
              <input
                type="text"
                value={siteNameHi}
                onChange={(e) => setSiteNameHi(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg font-bold text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Portal Name (English)</label>
              <input
                type="text"
                value={siteNameEn}
                onChange={(e) => setSiteNameEn(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg font-bold text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-300 mb-1">Tagline</label>
              <input
                type="text"
                value={taglineHi}
                onChange={(e) => setTaglineHi(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white font-serif border-b border-stone-800 pb-2 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-red-500" />
            <span>Editorial & Grievance Governance</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Editor-in-Chief Name</label>
              <input
                type="text"
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Grievance Redressal Officer</label>
              <input
                type="text"
                value={grievanceOfficer}
                onChange={(e) => setGrievanceOfficer(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Official Desk Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Bureau Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-300 mb-1">Bureau Address</label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white font-serif border-b border-stone-800 pb-2 mb-3">
            Social & Distribution Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Facebook Page URL</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">X (Twitter) Profile URL</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">YouTube Channel URL</label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">WhatsApp Channel Link</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Configuration saved!
            </span>
          ) : <span />}

          <button
            type="submit"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Save size={15} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
