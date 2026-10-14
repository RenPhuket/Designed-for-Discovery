# Validation

Validated locally on 14 October 2026. Nothing was deployed.

- Pinned pnpm 10.17.1: clean `install --frozen-lockfile` succeeded, including esbuild setup.
- TypeScript strict check and Vite production build passed.
- Content check passed: unique chapter IDs; ten map entries; valid map-to-chapter links; all referenced image files exist with alternative text and dimensions; explicit Deluxe/Villa attribution; EggWong credit; no unresolved `/f_` PDF glyph markers.
- Compared every source text block longer than 170 characters with the content model after whitespace/ligature normalization: no unmatched blocks. This is a completeness check, not proof of source accuracy. Pending source errors remain listed in EDITORIAL-REVIEW.md.
- Browser inspected the production build served from a nested subdirectory, confirming relative asset paths.
- Desktop viewport: 1280 × 720. Mobile: 390 × 844 and narrow 320 × 740. No document horizontal overflow at those widths; 320px check found no overflowing main-content elements.
- Cover, mobile story, chapter menu, Hydra composition and enlarged map visually reviewed.
- Chapter navigation lands on the chosen section, closes the menu and transfers focus.
- Menu Escape closes and returns focus to Chapters.
- Map opens in a native modal dialog; zoom changes from 100% to 150%; background scrolling is locked while open. Escape closes and returns focus to Enlarge map.
- DOM inspection: one h1, no broken internal anchors, no broken loaded images, no browser error/warning logs in the tested session.
- Full manual screen-reader testing and a live GitHub Actions run have not been performed. The workflow is manual-only and publication awaits user authorization.
