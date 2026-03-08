import type { AuditRule } from '../types';

export const plpRules: AuditRule[] = [
  {
    id: 'plp-search-1',
    category: 'plp',
    title: 'Prominent Search Interface',
    description: 'Search should be highly visible and support auto-suggestions or contextual filters.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/search-visible-and-simple/',
    checkLogic: 'Detect presence of input[type="search"] and verify visibility in header.'
  },
  {
    id: 'plp-media-2',
    category: 'plp',
    title: 'Media Quality Consistency',
    description: 'Product photos must be of high resolution and consistent in aspect ratio across the listing grid.',
    severity: 'medium',
    referenceUrl: 'https://www.nngroup.com/articles/product-photos-listing-pages/',
    checkLogic: 'Analyze the aspect ratios of image elements in the grid for uniformity.'
  },
  {
    id: 'plp-category-3',
    category: 'plp',
    title: 'Category Hierarchy',
    description: 'Category pages must have clear breadcrumbs and faceted filtering to allow users to refine their search.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/category-pages/',
    checkLogic: 'Look for nav elements containing "breadcrumbs" or "filters".'
  },
  {
    id: 'plp-guidelines-4',
    category: 'plp',
    title: 'Listing Flow Usability',
    description: 'Avoid excessive clutter and ensure essential information (Price, Title, Rating) is scannable.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/ecommerce-homepages-listing-pages/',
    checkLogic: 'Calculate information density and scanability of product cards.'
  }
];
