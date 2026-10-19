# Native lecture reader

The nine chapters and 60 topics are based on the supplied circuit-theory, DC-method, sinusoidal-AC, harmonic, resonance/filter and laboratory decks. Explanations, equations and worked examples are reflowed into HTML. `lecture-visuals.js` authors circuit symbols and schematics in SVG and calculates graphs from formulas. Teaching diagrams must not use slide screenshots, cropped slide images, traced image paths or SVG `<image>` elements. The instructor portrait is the explicit exception requested by the user; its source is recorded in `assets/ATTRIBUTIONS.json`.

`lectures.json` holds prose, equations, worked sections, source references and checks. Repeated material is consolidated. `source-coverage.json` records the 554 source pages and their topic mapping or context-only classification, plus original file hashes. Parallel source versions map to the corresponding topic. **This inventory is provenance, not a mechanical proof that every detail is correct or that a future examination is covered.** Titles, contacts, reading lists, attendance and grading administration are omitted; lab procedures and report requirements remain.

Source corrections are stated in red WARNING blocks: nonlinear static versus differential resistance; KVL wording; absorbed-power signs; a nodal self-conductance; a controlled-source node voltage; the pulse-wave Fourier coefficient; and the distinction between zero-phase and maximum-impedance resonance for a lossy coil. Newly expanded examples are checked against the local rendered sources and independent circuit calculations. Recheck both topology and reference directions when editing a numerical example.

## Editing

Edit the topic JSON and the authored visual functions, then run `node scripts/build-lecture-content.cjs`. `--check` detects a stale bundle. Update the source mapping when new material arrives. The original PPTX/PDF files remain in the parent course's `docs` directory; local extraction/rendering output belongs under ignored `.build/source-audit`. No slide-image export pipeline is used for publication.

`node build-site.cjs` creates a fresh output directory and publishes only runtime files and assets. Cleaning the output first prevents obsolete slide images from surviving an incremental build.

## Verification

`npm run test:interface` checks all 60 topic routes, typesetting, native material, search, session-only state, malformed state recovery, quizzes, the existing foundation/homework interfaces, whole-lecture print restoration and instructor attribution. It rejects embedded slide images in topic content. `test-lecture-numerics.cjs` independently solves the source-transformation, bridge, source-polarity, superposition, nodal, mesh, controlled-source, ladder, laboratory, AC-power, frequency-selection and phase-shift examples. Existing tests cover the homework solvers and experiment models.

The native SVGs were rendered with Inkscape and visually inspected; text bounds and label overlap were checked at the native drawing size. This is diagram verification, not browser-layout verification. No connected browser was available during this pass, so desktop/mobile browser layout and print pagination have not been visually verified in a browser.
