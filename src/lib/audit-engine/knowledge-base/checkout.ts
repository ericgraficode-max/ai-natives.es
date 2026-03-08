import type { AuditRule } from '../types';

export const checkoutRules: AuditRule[] = [
  {
    id: 'chk-mobile-1',
    category: 'checkout',
    title: 'Mobile-First Form Layout',
    description: 'Forms should use single-column layouts on mobile with input sizes large enough for touch targets.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/mobile-checkout-ux/',
    checkLogic: 'Measure input heights (min 44px) and verify column stacking on mobile viewports.'
  },
  {
    id: 'chk-registration-2',
    category: 'checkout',
    title: 'Guest Checkout & Registration',
    description: 'Registration should be optional. Compulsory login or account creation creates a massive friction point.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/optional-registration/',
    checkLogic: 'Search for "Guest Checkout" or "Checkout as Guest" options on the login/checkout entry page.'
  },
  {
    id: 'chk-focus-3',
    category: 'checkout',
    title: 'Enclosed Checkout (Funnel Focus)',
    description: 'Remove header/footer navigation to prevent funnel leakage during checkout.',
    severity: 'medium',
    referenceUrl: 'https://www.nngroup.com/articles/does-user-annoyance-matter/',
    checkLogic: 'Check if standard navigation elements (Menu, Full Footer) are hidden during checkout.'
  },
  {
    id: 'chk-form-design-4',
    category: 'checkout',
    title: 'Simple Form Design',
    description: 'Forms must be logically grouped and minimal in field count to reduce cognitive load.',
    severity: 'high',
    referenceUrl: 'https://www.nngroup.com/articles/web-form-design/',
    checkLogic: 'Count total input fields and identify logical groupings (fieldset/labels).'
  }
];
