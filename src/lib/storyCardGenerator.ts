/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Article } from '../types/news';

export async function generateStoryCardDataUrl(article: Article): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Background - Dark Charcoal gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.7, '#1e293b');
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Top Accent Bar - Crimson Red
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, 1080, 24);

  // Brand Header
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(80, 80, 16, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NEWS BHARAT PLUS', 120, 136);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DIGITAL EXCLUSIVE • JOURNALISM WITH INTEGRITY', 120, 172);

  // District / Category Tag
  const districtName = article.location || 'Bihar';
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(80, 220, 220, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(districtName.toUpperCase(), 100, 250);

  // Draw Article Image
  const imgY = 290;
  const imgH = 680;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = article.coverImageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    if (img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(80, imgY, 920, imgH, 24);
      ctx.clip();
      ctx.drawImage(img, 80, imgY, 920, imgH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#334155';
      ctx.fillRect(80, imgY, 920, imgH);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('News Bharat Plus Reporting', 320, imgY + 340);
    }
  } catch {
    ctx.fillStyle = '#334155';
    ctx.fillRect(80, imgY, 920, imgH);
  }

  // Article Headline
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 44px "Plus Jakarta Sans", Georgia, serif';
  
  const words = article.headline.split(' ');
  let line = '';
  let y = 1040;
  const maxWidth = 920;
  const lineHeight = 62;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 80, y);
      line = words[n] + ' ';
      y += lineHeight;
      if (y > 1240) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 80, y);

  // Summary
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 26px "Plus Jakarta Sans", sans-serif';
  const summarySnippet = article.summary ? article.summary.substring(0, 140) + '...' : '';
  const sumWords = summarySnippet.split(' ');
  let sumLine = '';
  let sumY = y + 70;

  for (let n = 0; n < sumWords.length; n++) {
    const testLine = sumLine + sumWords[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(sumLine, 80, sumY);
      sumLine = sumWords[n] + ' ';
      sumY += 44;
      if (sumY > 1500) break;
    } else {
      sumLine = testLine;
    }
  }
  ctx.fillText(sumLine, 80, sumY);

  // Author & Date
  const pubDate = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  ctx.fillStyle = '#334155';
  ctx.fillRect(80, 1600, 920, 2);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Reporter: ${article.authorName}`, 80, 1660);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Published: ${pubDate} (IST)`, 80, 1705);

  // Footer Button
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(80, 1760, 920, 90, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Read full report on newsbharatplus.in', 540, 1816);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}
