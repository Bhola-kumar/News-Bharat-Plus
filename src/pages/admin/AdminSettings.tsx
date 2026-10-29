/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Save, CheckCircle2, Shield, Globe, MapPin, Users } from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { BIHAR_DISTRICTS, TOPICS } from '../../lib/constants';

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
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <h1 className="text-xl font-bold text-stone-900 font-serif">
          Portal Settings & Configuration
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Branding, contact details, grievance officer, social profiles, and default portal metadata.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6 text-xs">
        <div>
          <h2 className="text-sm font-bold text-stone-900 font-serif border-b border-stone-200 pb-2 mb-3 flex items-center gap-2">
            <Globe size={16} className="text-red-600" />
            <span>Brand & Identity</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Portal Name (Hindi)</label>
              <input
                type="text"
                value={siteNameHi}
                onChange={(e) => setSiteNameHi(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Portal Name (English)</label>
              <input
                type="text"
                value={siteNameEn}
                onChange={(e) => setSiteNameEn(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Tagline</label>
              <input
                type="text"
                value={taglineHi}
                onChange={(e) => setTaglineHi(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-stone-900 font-serif border-b border-stone-200 pb-2 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-red-600" />
            <span>Legal, Editorial & Compliance</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Chief Editor Name</label>
              <input
                type="text"
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Grievance Officer (IT Rules)</label>
              <input
                type="text"
                value={grievanceOfficer}
                onChange={(e) => setGrievanceOfficer(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Official Editorial Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Contact Phone / Helpline</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Newsroom Office Address</label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-stone-900 font-serif border-b border-stone-200 pb-2 mb-3 flex items-center gap-2">
            <Users size={16} className="text-red-600" />
            <span>Social Media Channels</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">YouTube Channel</label>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">WhatsApp Channel</label>
              <input
                type="url"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Facebook Page</label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Twitter / X Handle</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <div className="font-bold text-stone-800 flex items-center gap-1.5">
            <MapPin size={14} className="text-red-600" />
            <span>Active Taxonomies</span>
          </div>
          <div className="text-stone-600">
            Total Districts: <strong className="text-stone-900">{BIHAR_DISTRICTS.length}</strong> | Total Topic Categories: <strong className="text-stone-900">{TOPICS.length}</strong>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-200">
          {savedSuccess ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={16} />
              <span>Settings updated successfully!</span>
            </span>
          ) : <span />}

          <button
            type="submit"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Save size={15} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
