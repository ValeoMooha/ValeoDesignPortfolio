import type { ImageMetadata } from 'astro';

// Content copied from https://mvaleo.com/about/

const photoFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/about/grade-*.jpg', { eager: true });
const byName = (n: number) => photoFiles[`../assets/about/grade-${n}.jpg`].default;

// Same order as the gallery on the live site.
export const photos: ImageMetadata[] = [
  21, 9, 13, 24, 34, 16, 22, 33, 29, 27, 37, 26, 19, 38, 23, 36, 17, 5, 20, 39, 6, 7, 3, 40, 1, 2,
].map(byName);

// Portraits of Valeo among the photos.
export const portraits = {
  main: byName(37),
  alt: byName(38),
  outdoor: byName(39),
  camera: byName(40),
};

export const intro = {
  greeting: 'Hi! I’m Valeo.',
  role: 'Product Designer',
  location: 'living in Spain',
  status: 'Looking for full-time remote position',
  resume: {
    label: 'Download resume',
    href: 'https://mvaleo.com/wp-content/uploads/2026/06/Valeo_Mooha_Lead_Product_Designer.docx',
  },
  photosCaption: 'All photos shot by me while traveling across 14 countries',
};

export const philosophy =
  'My philosophy: design is not decoration — it’s a strategic tool for shaping human perception and achieving measurable business outcomes.';

export const bio =
  'I’m a multidisciplinary product designer with 10+ years of experience in cross-platform UI/UX, branding, and marketing. I specialize in building complete digital ecosystems — from early-stage product research to large-scale design systems, rebranding, and post-launch visual strategies.';

export const stats = [
  { value: '10+', label: 'years in product design' },
  { value: '14', label: 'countries photographed' },
  { value: '6', label: 'disciplines' },
];

export interface Skill {
  title: string;
  description: string;
  short: string; // one or two words for tight spaces
  icon: string; // short glyph used as a mark
}

export const skills: Skill[] = [
  {
    title: 'Design System Development',
    short: 'Design Systems',
    description: 'Cross-platform atomic design systems that ensure visual consistency and scalability across all digital products.',
    icon: '◇',
  },
  {
    title: 'Cross-platform User Interface (UI)',
    short: 'UI',
    description: 'Web, mobile, desktop, watch, TV — or any other device (even a teapot if needed).',
    icon: '▢',
  },
  {
    title: 'User Experience Research (UX)',
    short: 'UX Research',
    description: 'User research, interviews, analytics, user-flow diagrams, prototypes and testing',
    icon: '◎',
  },
  {
    title: 'Branding and Identity',
    short: 'Branding',
    description: 'From a simple LogoType to full brand identity, custom Font, brand story and strategy',
    icon: '✦',
  },
  {
    title: 'Video production',
    short: 'Video',
    description: 'Full cycle video production from prep to shooting, editing and pro color grading.',
    icon: '▷',
  },
  {
    title: 'Marketing & Sales',
    short: 'Marketing',
    description: 'Market research, target audience analysis, sales funnels, marketing strategy',
    icon: '↗',
  },
];

export interface Job {
  company: string;
  role: string;
  period: string;
}

export const experience: Job[] = [
  { company: 'Independent / Contract', role: 'UI/UX, Branding, Research', period: '2024 – Now' },
  { company: 'Zencastr', role: 'Head of Design Department', period: '2018 – 2024' },
  { company: 'Princess', role: 'Head of Design, Marketer', period: '2017 – 2018' },
  { company: 'MOOHA', role: 'CEO, Head of Design, Marketer', period: '2014 – 2017' },
  { company: 'Freelance', role: 'UI/UX, Brand & Graphic Designer', period: '2005 – 2014' },
  { company: 'Drukmarket', role: 'Graphic Design Specialist', period: '2004 – 2005' },
  { company: 'Volyn Advertisement', role: 'Graphic Design Specialist', period: '2003 – 2004' },
  { company: 'Visnuk', role: 'Graphic Design Specialist', period: '2002 – 2003' },
  { company: 'UKR-Business', role: 'Web Designer', period: '2001 – 2002' },
];
