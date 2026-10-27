import { defineConfig } from 'astro/config';

// Pages preview deploys under /<repo>/; SITE_BASE is set only in that workflow.
export default defineConfig({
  base: process.env.SITE_BASE || '/',
  // The dev toolbar sits at the bottom centre and covers the variant switcher.
  devToolbar: { enabled: false },
});
