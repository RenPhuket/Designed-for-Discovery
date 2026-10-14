# Designed for Discovery

A mobile-first, continuous-scroll digital design booklet for Renaissance Phuket Resort & Spa. Static React + Vite + TypeScript. All photography, drawings and story copy come from the October 8, 2026 **HKTBR - Design book.pdf**. No backend, tracking, external image services or remote font dependencies.

**Source status: latest located booklet, final approval unconfirmed.** This is an editorial review edition, not a claim of approved final copy. See `docs/EDITORIAL-REVIEW.md` before release. No site has been published. The included deployment workflow runs only when manually requested.

## Run locally

Install Node.js 22.12 or newer and pnpm 10.17.1. Then, from this folder:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address printed by Vite. To validate and build:

```sh
pnpm check:content
pnpm build
pnpm preview
```

The deployable site is generated in `dist/`. The supplied `dist/` is a tested snapshot; rebuild it after editing. Do not open `index.html` directly as a local file: serve it with the preview command or a static web server.

## Publish to GitHub Pages — when authorized

1. Create a GitHub repository, for example `Designed-for-Discovery`.
2. Upload this project’s **contents** to the repository root, including `.github/workflows/deploy.yml`, `package.json`, `pnpm-lock.yaml`, `src/` and `public/`. Include dotfiles. Do not upload `node_modules/` or the generated `dist/` folder. GitHub’s browser uploader may hide dotfolders; using Git or GitHub Desktop preserves them.
3. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build source. Pages availability depends on your GitHub plan and repository visibility.
4. Resolve the editorial notes, verify the source’s final approval, and set `source.status` in `src/content.json` to `approved-final` only after that approval. This removes the review-edition footer.
5. When publication is authorized, open **Actions → Deploy booklet to GitHub Pages → Run workflow**, choose the branch and run it.
6. Open the URL reported by the deployment. For the example repository owned by `renphuket`, it would normally be `https://renphuket.github.io/Designed-for-Discovery/`.
7. Check the cover, chapter links, Deluxe/Villa captions, enlarged map and hotel-guide return link on a phone. Add the new URL to the existing guidebook or a QR code separately.

`base: './'` makes built asset paths work under a repository subdirectory or at a domain root. Navigation uses hash anchors, so GitHub Pages needs no SPA rewrite or router fallback. After future edits, run the manual workflow again; pushes alone do not deploy.

## Edit content

- `src/content.json`: story paragraphs, LOOK CLOSER notes, timeline, room attribution, map descriptions, image alt text, captions, source approval and guidebook URL. Paragraphs are plain strings, not HTML.
- `public/assets/`: extracted PDF photographs and rendered illustration regions, with smaller responsive variants. Preserve filenames or update the corresponding JSON fields.
- `src/styles.css`: editorial layout and responsive behavior. System Georgia and Arial approximate the printed Miller Text and Maple/Swiss typography; proprietary PDF fonts have not been extracted or redistributed. If licensed webfonts become available, add them locally and update the font declarations.
- `docs/asset-manifest.json`: source spread and extraction/crop details for every asset. PDF spread numbers are 1-based file pages, not the booklet’s printed folios.
- `docs/source-transcription.txt`: source text retained for auditing. Some glyph artifacts remain here intentionally; the display copy normalizes those artifacts.
- `docs/EDITORIAL-REVIEW.md`: source status, known source issues and digital adaptation decisions.

The room section deliberately retains the source distinction: **Deluxe Rooms → fishermen’s rope knots; Pool Villas → fishing tools, ceramic dishes and wicker lanterns**. Do not transfer one room category’s attribution to the other. Other shared decorative references remain unassigned unless the booklet states an attribution.

## Accessibility and implementation

Semantic landmarks and heading order; skip link; keyboard-operated chapter menu; Escape to close; native modal dialog with focus containment and return; map zoom controls and keyboard-scrollable map; complete text equivalent of the ten discovery stops; responsive image dimensions and lazy loading; reduced-motion support; no auto-playing effects or scroll interception. The source map labels 1–9; stop 10 is the return-to-your-room activity, retained in text without inventing a location pin.

The text mark in the header is a typographic identifier, not a reconstructed official logo. This project does not include licensed font files. All supplied resort content/assets retain their owners’ rights.

## Files

`src/` application and editable content; `public/` assets; `docs/` provenance and editorial review; `scripts/` content checks; `.github/workflows/` manual Pages deployment; `dist/` production build snapshot; `pnpm-lock.yaml` reproducible dependencies.
