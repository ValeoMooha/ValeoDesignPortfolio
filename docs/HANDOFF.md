# Handoff: where the site stands

Portfolio of Valeo (mvaleo.com), moving from WordPress to Astro.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Pages

| Page | Status |
| --- | --- |
| `/` Home | Done: Figma design, tilt cards, Big Dipper constellation on Contact, star background |
| `/tools/` | Done: "shelf" layout, content from mvaleo.com/tools |
| `/about/` | One-to-one copy of mvaleo.com/about with lighter secondary text; skill illustrations not animated yet |
| `/about/v1/` … `/about/v10/` | Earlier About concepts, not used, kept for reference |
| Case studies | Not migrated: cards link to the live WordPress pages |

## Decisions so far

- Plain Astro + CSS in components, no Tailwind or UI kits. Tokens in `src/styles/tokens.css`.
- Font: Google Sans Flex everywhere (the live site uses Mont; switching About to Mont is still an open question).
- Star background (`src/scripts/bg/`, WebGL): fades out over the first screen of scrolling. A colour glow appears behind hovered project cards.
- Motion is subtle, honours `prefers-reduced-motion`.
- Skill illustration animation: waiting for Valeo's SVGs with named layers plus keyframes, or Lottie JSON.

## Versions

- Tag `v1.0`: first static homepage.
- Branch `v1.1`: homepage with motion.
- `main`: current work.

## Next steps

1. Deploy to Cloudflare Pages (free): connect this GitHub repo, build command `npm run build`, output `dist`.
2. Test on a subdomain first (e.g. test.mvaleo.com), then switch mvaleo.com from WordPress. DNS is at Hostinger today; decide whether to keep it there or move it to Cloudflare.
3. Migrate case study pages and the Contact page.
