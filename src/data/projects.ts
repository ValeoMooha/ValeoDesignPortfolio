import type { ImageMetadata } from 'astro';

import zencastr from '../assets/zencastr_prev.webp';
import arrivals from '../assets/arrivals_prev.webp';
import vsColor from '../assets/VsColor_prev.webp';
import telegram from '../assets/telegram_prev.webp';
import spotter from '../assets/spotter_prev.webp';
import chipotto from '../assets/chipotto_prev.webp';
import dieter from '../assets/dieter_prev.webp';
import smartTools from '../assets/SmartTools_prev.webp';
import assam from '../assets/Assam_prev.webp';
import active from '../assets/active_prev.webp';
import smartHome from '../assets/smartHome_prev.webp';
import tedx from '../assets/TedX_prev.webp';
import iwatch from '../assets/iWatch_prev.webp';
import mindojo from '../assets/mindojo_prev.webp';
import princess from '../assets/princess.webp';
import serials from '../assets/serials_prev.webp';
import webbper from '../assets/webbper_prev.webp';

export interface Project {
  title: string;
  image: ImageMetadata;
  href: string;
}

const work = (slug: string) => `https://mvaleo.com/works/${slug}/`;

export const bigProjects: Project[] = [
  { title: 'Zencastr', image: zencastr, href: work('zencastr') },
  { title: 'Arrivals', image: arrivals, href: work('arrivals') },
];

export const smallProjects: Project[] = [
  { title: 'VS Color', image: vsColor, href: work('vs-color') },
  { title: 'Telegram', image: telegram, href: work('telegram') },
  { title: 'Spotter', image: spotter, href: work('spotter') },
  { title: 'Chipotto', image: chipotto, href: work('chipotto') },
  { title: 'Dieter', image: dieter, href: work('dieter') },
  { title: 'Smart Tools', image: smartTools, href: work('smart-tools') },
  { title: 'Assam', image: assam, href: work('assam') },
  { title: 'Active', image: active, href: work('active') },
  { title: 'Smart Home', image: smartHome, href: work('smart-home') },
  { title: 'TEDx', image: tedx, href: work('ted') },
  { title: 'iWatch', image: iwatch, href: work('iwatch') },
  { title: 'Mindojo', image: mindojo, href: work('mindojo') },
  { title: 'Princess', image: princess, href: work('princess') },
  { title: 'Serials', image: serials, href: work('serials') },
  { title: 'Webbper', image: webbper, href: work('webbper') },
];
