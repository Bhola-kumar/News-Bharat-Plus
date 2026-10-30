/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { AdPlacementSlot } from '../types/news';

interface AdBannerProps {
  placement: AdPlacementSlot;
  district?: string;
  topic?: string;
  isAdminPreview?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  placement, 
  district, 
  topic, 
  isAdminPreview = false 
}) => {
  const store = useNewsStore();
  const currentDistrict = district || store.getSelectedDistrict();
  const activeAds = store.getActiveAdsForPlacement(placement, currentDistrict, topic);
  const recordedImpressionRef = useRef(false);

  const ad = activeAds.length > 0 ? activeAds[0] : null;

  useEffect(() => {
    if (ad && !isAdminPreview && !recordedImpressionRef.current) {
      store.recordAdImpression(ad.id);
      recordedImpressionRef.current = true;
    }
  }, [ad?.id, isAdminPreview]);

  if (!ad) {
    return null;
  }

  const handleAdClick = () => {
    if (!isAdminPreview) {
      store.recordAdClick(ad.id);
    }
    window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  let containerClasses = 'w-full my-4 text-center';
  let aspectDesktop = 'max-h-[140px]';
  
  if (placement === 'desktop_sidebar') {
    containerClasses = 'w-full my-4';
    aspectDesktop = 'max-w-[320px] mx-auto';
  } else if (placement === 'below_header') {
    containerClasses = 'w-full my-3';
  }

  return (
    <div className={`ad-placement-slot ${containerClasses}`}>
      <div className="inline-block w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium px-2 py-0.5 border-b border-stone-200 mb-1">
          <span>ADVERTISEMENT</span>
          <span className="text-[10px] text-stone-400">{ad.advertiserName}</span>
        </div>

        <button
          onClick={handleAdClick}
          className="relative block w-full bg-stone-100 border border-stone-200 rounded overflow-hidden group cursor-pointer transition-shadow hover:shadow-md focus:outline-hidden"
          title={`${ad.advertiserName} - Open in new tab`}
        >
          <picture className="w-full">
            {ad.mobileBannerUrl ? <source media="(max-width: 640px)" srcSet={ad.mobileBannerUrl} /> : null}
            <img 
              src={ad.desktopBannerUrl || ad.mobileBannerUrl || undefined} 
              alt={ad.title} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`w-full object-cover ${aspectDesktop} rounded`}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </picture>

          <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <span>Visit Website</span>
            <ExternalLink size={10} />
          </div>
        </button>
      </div>
    </div>
  );
};
