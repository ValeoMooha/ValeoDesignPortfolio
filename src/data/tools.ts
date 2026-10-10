import type { ImageMetadata } from 'astro';

import colo from '../assets/tools/ColoPhotoEditor-1.png';
import coloIcon from '../assets/tools/Colo_icon2x.png';
import frameTree from '../assets/tools/FrameTreeNavigatorBanner.png';
import frameTreeIcon from '../assets/tools/FrameTreeNavigator_icon2x.png';
import organic from '../assets/tools/OrganicFilmColors.png';
import kaizen from '../assets/tools/KaizenFlow.jpg';
import grid from '../assets/tools/GridLayouts.png';
import figmaAvatar from '../assets/tools/FigmaAva.png';

export interface Tool {
  title: string;
  /** Optional emoji shown after the title (kept apart so gradients do not clip it). */
  emoji?: string;
  type: string;
  description: string;
  href: string;
  cover: ImageMetadata;
  icon?: ImageMetadata;
  /** Main colour of the cover, used for glows and backgrounds. */
  accent: string;
  /** Second colour for gradients. */
  accent2: string;
}

// Content copied from https://mvaleo.com/tools/
export const toolsIntro = {
  title: 'Tools',
  subtitle: 'Plugins and useful templates that I built',
  profile: {
    label: 'Figma community profile',
    href: 'https://www.figma.com/@valeo',
    avatar: figmaAvatar,
  },
};

export const tools: Tool[] = [
  {
    title: 'Colo Photo Editor for Figma',
    type: 'Plugin',
    description: 'Edit photos fast with drag-and-tweak controls.',
    href: 'https://www.figma.com/community/plugin/1651661308382603676/colo-photo-editor',
    cover: colo,
    icon: coloIcon,
    accent: '#9b6bd8',
    accent2: '#f39a4b',
  },
  {
    title: 'FrameTree Navigator for Figma',
    type: 'Plugin',
    description: 'Transform frame names into a nested tree view.',
    href: 'https://www.figma.com/community/plugin/1648368596251846938/frametree-navigator',
    cover: frameTree,
    icon: frameTreeIcon,
    accent: '#f5b04a',
    accent2: '#2fa3e6',
  },
  {
    title: 'Organic Film Colors',
    type: 'Color system',
    description: 'Color swatch creator and 11 palettes included.',
    href: 'https://www.figma.com/community/file/1649897165349849120/organic-film-colors',
    cover: organic,
    accent: '#e0457b',
    accent2: '#21b39a',
  },
  {
    title: 'Kaizen Flow',
    emoji: '🌊',
    type: 'Template',
    description: 'User-Flow Diagram creator',
    href: 'https://www.figma.com/community/file/1666933135728185721/kaizen-flow',
    cover: kaizen,
    accent: '#3d8bff',
    accent2: '#7fd3ff',
  },
  {
    title: '8pt Grid Layouts',
    type: 'Grid Presets',
    description: '25 Grid presets and layouts',
    href: 'https://www.figma.com/community/file/1648836062645737610/grid-layouts-8pt',
    cover: grid,
    accent: '#1690e0',
    accent2: '#5be1ff',
  },
];
