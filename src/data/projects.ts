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
  category: string;
  image: ImageMetadata;
  href: string;
}

const work = (slug: string) => `https://mvaleo.com/works/${slug}/`;
// Case studies already moved to this site
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const moved = (slug: string) => `${base}/works/${slug}/`;

export const bigProjects: Project[] = [
  { title: 'Zencastr', category: 'Podcast Recording App', image: zencastr, href: moved('zencastr') },
  { title: 'Arrivals', category: 'Travel Documentary Vlog', image: arrivals, href: work('arrivals') },
];

export const smallProjects: Project[] = [
  { title: 'VS Color', category: 'VS Code Color Picker', image: vsColor, href: work('vs-color') },
  { title: 'Telegram', category: 'Messenger Redesign Concept', image: telegram, href: work('telegram') },
  { title: 'Spotter', category: 'Travel Spots App', image: spotter, href: work('spotter') },
  { title: 'Chipotto', category: 'Cafe Menu App', image: chipotto, href: work('chipotto') },
  { title: 'Dieter', category: 'Finance App', image: dieter, href: work('dieter') },
  { title: 'Smart Tools', category: 'Online Store', image: smartTools, href: work('smart-tools') },
  { title: 'Assam', category: 'SaaS Software Aggregator', image: assam, href: work('assam') },
  { title: 'Active', category: 'Activity Tracker App', image: active, href: work('active') },
  { title: 'Smart Home', category: 'Smart Home App', image: smartHome, href: work('smart-home') },
  { title: 'TEDx', category: 'TED Recommends Concept', image: tedx, href: work('ted') },
  { title: 'iWatch', category: 'Apple Watch Screens Concept', image: iwatch, href: work('iwatch') },
  { title: 'Mindojo', category: 'Educational Platform', image: mindojo, href: work('mindojo') },
  { title: 'Princess', category: 'Rhythmic Gymnastics School', image: princess, href: work('princess') },
  { title: 'Serials', category: 'TV Series App', image: serials, href: work('serials') },
  { title: 'Webbper', category: 'Fitness CRM System', image: webbper, href: work('webbper') },
];
