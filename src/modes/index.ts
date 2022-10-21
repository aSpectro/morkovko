import { configService } from "src/config/config.service";
import defaultLocale from './default';
import halloweenLocale from './halloween';
import newyearLocale from './new_year';

const locales = {
  default: defaultLocale,
  halloween: halloweenLocale,
  new_year: newyearLocale,
}
let mode = 'default';

if (configService.getEvent() === 'HALLOWEEN') {
  mode = 'halloween';
}
if (configService.getEvent() === 'NEWYEAR') {
  mode = 'new_year';
}

const locale = locales[mode];
export default locale;