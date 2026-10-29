/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Article, AdCampaign, MediaAsset, ReaderSubmission } from '../types/news';

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-gaya-heritage-1',
    slug: 'gaya-bodhgaya-corridor-expansion-project-approved-2026',
    headline: 'Gaya-Bodhgaya Heritage & Metro Bus Corridor Master Plan Approved by Bihar Cabinet',
    summary: 'Comprehensive ₹1,250 crore development package launched to enhance pilgrim infrastructure, electric rapid transport, and international visitor facilities across Gaya district.',
    body: `<p>GAYA — The Bihar Cabinet led by Chief Minister Nitish Kumar has officially approved a flagship ₹1,250 crore infrastructure and heritage master plan dedicated to Gaya and Bodhgaya. The initiative aims to modernize public transport, expand the Falgu River Vishnupad promenade, and establish seamless electric bus rapid transit connecting Gaya Junction, Gaya Airport, Mahabodhi Temple, and Mahavir Temple.</p><p>District Magistrate Gaya confirmed that land acquisition for the multi-lane ring road bypass is progressing rapidly. Over 45 lakh international and domestic pilgrims visit Gaya annually for Pitru Paksha Mela and Buddhist pilgrimage circuits.</p><p>Key components include 24x7 solar lighting along Vishnupad Ghats, automated multi-level parking plazas, and digital information kiosks in eight international languages.</p>`,
    keyPoints: [
      '₹1,250 crore total capital outlay allocated for Gaya & Bodhgaya urban development.',
      'Falgu River waterfront promenade and Vishnupad Ghat expansion near completion.',
      'Electric rapid transit connecting Gaya Junction, Airport, and Mahabodhi Shrine.',
      'Digital multilanguage kiosks and smart security CCTV grid deployed.'
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1200',
    coverImageCaption: 'Falgu River Rubber Dam and Vishnupad Temple Corridor in Gaya district.',
    coverImageCredit: 'News Bharat Plus Bureau / Gaya Desk',
    coverage: 'Regional',
    state: 'Bihar',
    district: 'gaya',
    topics: ['governance', 'infrastructure'],
    format: 'Article',
    status: 'published',
    isFeatured: true,
    isBreaking: true,
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    authorName: 'Raju Kumar',
    authorRole: 'Senior Correspondent (Gaya Bureau)',
    location: 'Gaya (गया)',
    viewCount: 1420,
    shareCount: 88,
    trendingScore: 92
  },
  {
    id: 'art-patna-metro-2',
    slug: 'patna-metro-phase-1-tunneling-completed-commercial-runs',
    headline: 'Patna Metro Tunneling Completed Between Patna Junction and ISBT Terminal',
    summary: 'Underground Tunnel Boring Machines complete final breakthrough under Fraser Road. Priority corridor set for commercial trials.',
    body: `<p>PATNA — In a milestone achievement for urban infrastructure in Bihar, the Patna Metro Rail Corporation (PMRC) successfully achieved the final underground tunnel breakthrough connecting Patna Railway Junction to the New ISBT Interstate Bus Terminal.</p><p>Engineers utilized twin high-capacity Tunnel Boring Machines (TBMs) to excavate 8.2 kilometers of underground tunnels beneath high-density urban corridors without disturbing surface traffic on Fraser Road and Exhibition Road.</p><p>Urban Development Minister noted that trial runs on the elevated priority section will commence shortly following safety clearance from the Commissioner of Metro Rail Safety (CMRS).</p>`,
    keyPoints: [
      'Final TBM breakthrough achieved on 8.2 km underground corridor in Patna.',
      'Seamless transit connection established between Patna Junction and ISBT.',
      'Commercial safety trials scheduled for safety certification.'
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=1200',
    coverImageCaption: 'Patna Metro underground station construction and track laying work.',
    coverImageCredit: 'PMRC Media Cell',
    coverage: 'Regional',
    state: 'Bihar',
    district: 'patna',
    topics: ['infrastructure', 'economy'],
    format: 'Article',
    status: 'published',
    isFeatured: true,
    isBreaking: false,
    publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    authorName: 'Sanjay Sinha',
    authorRole: 'Chief Reporter (Patna HQ)',
    location: 'Patna (पटना)',
    viewCount: 1180,
    shareCount: 64,
    trendingScore: 84
  },
  {
    id: 'art-bpsc-exam-3',
    slug: 'bpsc-civil-services-examination-results-declared-bihar-merit-list',
    headline: 'BPSC Combined Competitive Exam Results Announced: Record Candidates Qualify',
    summary: 'Bihar Public Service Commission releases final merit list. Transparent digital valuation system implemented for speedy declaration.',
    body: `<p>PATNA — The Bihar Public Service Commission (BPSC) has officially announced the final results for the Combined Competitive Examination. Candidates across all 38 districts of Bihar can access their scorecards and category-wise cut-off marks on the official portal.</p><p>Commission Officials highlighted that the recruitment drive fills key vacancies across State Civil Services, Revenue Officers, Police Sub-Inspectors, and Block Development Officers.</p>`,
    keyPoints: [
      'BPSC declares final results within record timeframe.',
      'Digital OMR verification ensured zero discrepancies.',
      'Over 1,800 successful candidates assigned administrative cadres.'
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
    coverImageCaption: 'BPSC examination evaluation hall in Patna.',
    coverImageCredit: 'BPSC Press Bureau',
    coverage: 'Regional',
    state: 'Bihar',
    district: 'patna',
    topics: ['education', 'politics'],
    format: 'Article',
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    authorName: 'Anil Prakash',
    authorRole: 'Education Editor',
    location: 'Patna (पटना)',
    viewCount: 950,
    shareCount: 42,
    trendingScore: 78
  },
  {
    id: 'art-muzaffarpur-smart-4',
    slug: 'muzaffarpur-smart-city-it-hub-and-litchi-cluster-export-center',
    headline: 'Muzaffarpur Smart City Project Commissioned: IT Park and Cold Storage Hub',
    summary: 'North Bihar commercial capital inaugurates state-of-the-art agro-export cold storage and digital governance command center.',
    body: `<p>MUZAFFARPUR — Muzaffarpur district has inaugurated its new Integrated Command and Control Center (ICCC) alongside an advanced multi-temperature cold chain facility for Shahi Litchi exports. The project strengthens agricultural logistics across North Bihar districts including Vaishali, Sitamarhi, and East Champaran.</p>`,
    keyPoints: [
      'Multi-temperature cold chain established for Shahi Litchi exporters.',
      'ICCC smart traffic management active across 42 city intersections.',
      'IT Park initiative to generate local technical employment.'
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    coverImageCaption: 'Smart City control center and agro logistics hub in Muzaffarpur.',
    coverImageCredit: 'Muzaffarpur Smart City Ltd.',
    coverage: 'Regional',
    state: 'Bihar',
    district: 'muzaffarpur',
    topics: ['economy', 'agriculture'],
    format: 'Article',
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    authorName: 'Vivek Sharma',
    authorRole: 'Muzaffarpur Bureau Chief',
    location: 'Muzaffarpur (मुजफ्फरपुर)',
    viewCount: 640,
    shareCount: 29,
    trendingScore: 65
  },
  {
    id: 'art-bhagalpur-silk-5',
    slug: 'bhagalpur-tussar-silk-textile-park-and-export-promotion',
    headline: 'Bhagalpur Silk City Modernization: Handloom Textile Park to Boost Artisans',
    summary: '₹350 crore investment sanctioned for Bhagalpuri Tussar Silk handloom clusters with direct international trade linkages.',
    body: `<p>BHAGALPUR — Known globally as the Silk City of Bihar, Bhagalpur has secured a major textile modernization boost. The Union and State Textile Ministries have jointly allocated funds for setting up an eco-friendly dyeing center and automated testing laboratory for Bhagalpuri Silk weavers.</p>`,
    keyPoints: [
      'Modern eco-dyeing units and silk testing lab approved.',
      'Direct artisan registration on government e-Marketplace (GeM).',
      'Over 25,000 local weaver families to benefit from interest subvention.'
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&q=80&w=1200',
    coverImageCaption: 'Traditional Bhagalpuri Tussar silk weaving in Nathanagar.',
    coverImageCredit: 'Textile Bureau Bhagalpur',
    coverage: 'Regional',
    state: 'Bihar',
    district: 'bhagalpur',
    topics: ['economy', 'culture'],
    format: 'Article',
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    authorName: 'Rahul Verma',
    authorRole: 'Eastern Bihar Correspondent',
    location: 'Bhagalpur (भागलपुर)',
    viewCount: 510,
    shareCount: 21,
    trendingScore: 58
  }
];

export const INITIAL_ADS: AdCampaign[] = [
  {
    id: 'ad-bihar-tourism-1',
    title: 'Explore Spiritual Bihar Tour 2026',
    advertiserName: 'Bihar Tourism Development Corporation',
    desktopBannerUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1200',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=600',
    destinationUrl: 'https://tourism.bihar.gov.in',
    placements: ['below_header', 'between_sections', 'desktop_sidebar'],
    targetDistricts: ['gaya', 'patna', 'nalanda'],
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 25).toISOString(),
    isActive: true,
    priority: 2,
    impressions: 4820,
    clicks: 342
  }
];

export const INITIAL_MEDIA: MediaAsset[] = [
  {
    id: 'med-gaya-1',
    filename: 'gaya_falgu_dam.jpg',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1200',
    fileSizeBytes: 420000,
    dimensions: { width: 1200, height: 675 },
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    uploadedBy: 'Raju Kumar',
    isProtected: true,
    articleReferencesCount: 1,
    adReferencesCount: 1,
    cleanupEligible: false,
    cleanupReason: 'Active in lead article and tourism campaign'
  }
];

export const INITIAL_SUBMISSIONS: ReaderSubmission[] = [
  {
    id: 'sub-1',
    type: 'suggestion',
    userName: 'Bholakumar',
    userEmail: 'bholak993@gmail.com',
    userPhone: '+91 98352 14780',
    subject: 'Request for detailed reporting on Gaya bypass traffic updates',
    message: 'Please cover the newly opened bypass section in Gaya near Bodhgaya road as traffic signals are currently under installation.',
    targetDistrict: 'gaya',
    status: 'new',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isConsumerLoggedIn: true
  }
];
