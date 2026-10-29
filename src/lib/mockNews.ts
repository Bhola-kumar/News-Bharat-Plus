/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Article, AdCampaign, MediaAsset, ReaderSubmission } from '../types/news';

// Clean initial state: No hardcoded news.
// News articles, ad campaigns, and reader submissions are created dynamically via the /admin portal.
export const INITIAL_ARTICLES: Article[] = [];
export const INITIAL_ADS: AdCampaign[] = [];
export const INITIAL_MEDIA: MediaAsset[] = [];
export const INITIAL_SUBMISSIONS: ReaderSubmission[] = [];
