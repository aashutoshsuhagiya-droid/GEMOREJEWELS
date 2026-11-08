# Storefront typography

- **Geist** variable (100–900): modern sans for navigation, labels, buttons and body copy. Sourced unchanged from the installed Next.js 15.5.29 package's `dist/next-devtools/server/font/geist-latin.woff2`.
- **Cormorant Garamond** variable (300–700): editorial serif for headings and the wordmark. Sourced unchanged from this project's existing Google Fonts build asset, `7b89a4fd5e90ede0-s.p.woff2`.

Both Latin WOFF2 files are bundled application assets and load through `next/font/local`, with preloading, `font-display: swap` and metric-adjusted fallbacks. Builds and page visits do not need Google Fonts or Fontshare access. Their embedded font metadata identifies both as SIL Open Font License fonts; copyright notices and the license are in `OFL.txt`.

The pairing is a Cullen-inspired alternative, not the proprietary Ginto or Arizona typefaces. Geist replaces Jost's more geometric appearance. Cormorant's full variable range enables lighter 350-weight editorial headings with tighter tracking. The semantic `--font-ui` and `--font-editorial` tokens allow a future licensed font replacement in `layout.tsx` without changing components.
