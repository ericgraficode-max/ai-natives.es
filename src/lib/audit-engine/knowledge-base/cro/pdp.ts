import type { AuditRule } from '../../types';

export const pdpRules: AuditRule[] = [
  {
    id: 'pdp-general-1',
    category: 'pdp',
    title: 'Information Hierarchy',
    description: 'The product title, price, and primary image must dominate the initial viewport.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/ecommerce-product-pages/',
    checkLogic: 'Verify that price and main image are visible without initial scroll.'
  },
  {
    id: 'pdp-scroll-2',
    category: 'pdp',
    title: 'Scroll Persistence',
    description: 'If the PDP is long, critical conversion elements like the CTA should remain accessible (e.g., sticky CTA).',
    severity: 'medium',
    referenceUrl: 'https://www.nngroup.com/articles/saving-scroll-position/',
    checkLogic: 'Check if Add to Cart button or a simplified version is sticky.'
  },
  {
    id: 'pdp-hard-rule-3',
    category: 'pdp',
    title: 'The Hard Rule: CTA Prominence',
    description: 'The primary CTA must be visually dominant and surrounded by trust-building USPs and payment methods.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/ecommerce-product-pages/',
    checkLogic: 'Measure spacing between CTA and USPs (e.g., Free Shipping, Guarantee). Check for payment icons (Visa, Paypal) in proximity.'
  }
];
