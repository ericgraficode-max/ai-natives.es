import type { AuditRule } from '../../types';

export const accessibilityRules: AuditRule[] = [
  {
    id: 'acc-contrast-1',
    category: 'accessibility',
    title: 'Color Contrast (Minimum)',
    description: 'Text and images of text must have a contrast ratio of at least 4.5:1 to ensure readability for users with visual impairments.',
    severity: 'high',
    referenceUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/general/G18'
  },
  {
    id: 'acc-alt-text-2',
    category: 'accessibility',
    title: 'Non-text Content (Alt Text)',
    description: 'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
    severity: 'high',
    referenceUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/general/G94'
  },
  {
    id: 'acc-labels-3',
    category: 'accessibility',
    title: 'Labels or Instructions',
    description: 'Labels or instructions are provided when content requires user input, ensuring form accessibility.',
    severity: 'high',
    referenceUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/general/G131'
  },
  {
    id: 'acc-keyboard-4',
    category: 'accessibility',
    title: 'Keyboard Accessibility',
    description: 'All functionality of the content is operable through a keyboard interface without requiring specific timings.',
    severity: 'high',
    referenceUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/general/G202'
  }
];

export const allAccessibilityRules = [...accessibilityRules];
