import type { AuditRule } from '../types';

export const homeRules: AuditRule[] = [
  {
    id: 'h-personalization-1',
    category: 'home',
    title: 'Behavioral Personalization',
    description: 'The homepage should offer unique content or promotions based on the user\'s behavior or session context.',
    severity: 'high',
    referenceUrl: 'https://vwo.com/de/website-personalisierung/',
    checkLogic: 'Search for location-based banners or context-aware offers (e.g., "Welcome back" or "Near [Location]").'
  },
  {
    id: 'h-monetization-2',
    category: 'home',
    title: 'Brand Monetization & Synergy',
    description: 'Strategically include brand partnerships or media owner collaborations to maximize audience value.',
    severity: 'medium',
    referenceUrl: 'https://www.criteo.com/business/media-owners/',
    checkLogic: 'Check for high-quality external brand banners or sponsored sections that align with site aesthetic.'
  },
  {
    id: 'h-top-funnel-3',
    category: 'home',
    title: 'Top Funnel Introduction',
    description: 'A clear value proposition above-the-fold is critical for orienting users and reducing bounce rates.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/',
    checkLogic: 'Check for presence of H1 containing clear USP and visible search/navigation in the initial viewport.'
  },
  {
    id: 'h-cta-logic-4',
    category: 'home',
    title: 'Call-to-Action Focus',
    description: 'Homepage CTAs must be singular in purpose and visually prominent to drive the user down the funnel.',
    severity: 'high',
    referenceUrl: 'https://www.shopify.com/blog/17156160-7-inspiring-ecommerce-call-to-action-examples-and-why-they-work',
    checkLogic: 'Measure CTA contrast ratio and distance from competing interactive elements.'
  }
];
