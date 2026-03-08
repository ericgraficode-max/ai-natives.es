import { homeRules } from './home';
import { plpRules } from './plp';
import { pdpRules } from './pdp';
import { checkoutRules } from './checkout';
import type { AuditRule } from '../../types';

export const allCroRules: AuditRule[] = [
  ...homeRules,
  ...plpRules,
  ...pdpRules,
  ...checkoutRules
];

export { homeRules, plpRules, pdpRules, checkoutRules };
