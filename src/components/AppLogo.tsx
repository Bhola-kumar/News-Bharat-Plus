/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNewsStore } from '../lib/newsStore';

export const DARK_LOGO_IMAGE = '/assets/aistudio/IMG-20261031-WA0000_81e47904.jpg';
export const LIGHT_LOGO_IMAGE = '/assets/logo_light.png';

export interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
  forceTheme?: 'light' | 'dark';
  onClick?: () => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  animated = true,
  className = '',
  forceTheme,
  onClick
}) => {
  const store = useNewsStore();
  const activeTheme = store.getTheme();
  const isDark = forceTheme ? forceTheme === 'dark' : activeTheme === 'dark';

  const logoSrc = isDark ? DARK_LOGO_IMAGE : LIGHT_LOGO_IMAGE;

  const containerSizes = {
    xs: 'w-7 h-7 sm:w-8 sm:h-8',
    sm: 'w-9 h-9 sm:w-11 sm:h-11',
    md: 'w-12 h-12 sm:w-15 sm:h-15',
    lg: 'w-18 h-18 sm:w-22 sm:h-22',
    xl: 'w-24 h-24 sm:w-32 sm:h-32'
  };

  const textSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Motion Aura Ring & 3D Logo Emblem Container */}
      <div
        className={`relative ${containerSizes[size]} shrink-0 rounded-2xl overflow-hidden flex items-center justify-center transition-colors duration-200 ${
          isDark
            ? 'bg-stone-950 border border-stone-800/90 shadow-xl'
            : 'bg-white border border-stone-200 shadow-sm ring-1 ring-stone-200/50'
        }`}
      >
        {/* Animated Tricolor Glowing Gradient Aura */}
        {animated && (
          <div
            className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity ${
              isDark
                ? 'bg-gradient-to-tr from-amber-500/20 via-white/10 to-emerald-500/20 animate-pulse'
                : 'bg-gradient-to-tr from-amber-500/10 via-transparent to-emerald-500/10 opacity-70'
            }`}
          />
        )}

        {/* 3D Motion Emblem Image */}
        <img
          key={logoSrc}
          src={logoSrc}
          alt="News Bharat Plus Official Logo"
          className={`w-full h-full object-contain p-0.5 transition-all duration-300 ${
            animated ? 'group-hover:scale-108 group-hover:rotate-1' : ''
          }`}
        />

        {/* Glossy Motion Sheen Overlay */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-baseline gap-2 font-black font-serif tracking-tight leading-none">
            <span className={`${textSizes[size]} ${isDark ? 'text-red-500' : 'text-red-600'}`}>
              News Bharat{' '}
              <span className="text-amber-500 font-sans font-extrabold text-sm sm:text-base">PLUS</span>
            </span>
          </div>
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            न्यूज़ भारत प्लस
          </span>
        </div>
      )}
    </div>
  );
};
