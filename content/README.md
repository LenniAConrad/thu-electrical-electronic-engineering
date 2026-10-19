# Lecture reader and source coverage

The reader follows the user's October 19 request to retain the complete academic content of the uploaded lecture slides, while applying their earlier Introduction to AI design requests: a white, centered reading layout; purple navigation and teal experiments; restrained navigation; no completion dashboard; session-only reading state; readable diagrams; explicit follow-up actions; and stable, user-started experiments.

`lectures.json` contains nine chapters and 60 topic sections. Each section has edited English prose, typeset equations, and references to the complete detailed lecture material. Figures preserve original diagrams, algebra, examples and questions, including overlapping versions under **Other lecture versions**. They are not all reconstructed interactive diagrams. The main topic text corrects identified source errors explicitly; the original figures remain intact for comparison.

`source-coverage.json` accounts for all 554 pages/slides in the 11 supplied PPTX/PDF files, with file hashes. It distinguishes 330 preferred academic pages, 186 retained parallel-version pages, and 38 context-only pages. The latter are titles, outlines, closing pages, course contacts, reading lists and assessment/attendance administration. Lab measurement instructions and report-content requirements are included. This is coverage of the available files, not a claim about future uploads or the contents of a future examination.

The large theory omissions in the earlier nine-foundation reader included reference signs, source transformations, graph topology, loop/mesh methods, controlled sources, nodal matrices and supernodes, superposition, Norton equivalents, star–delta transformations, equivalent-resistance measurements, harmonic analysis, compensation, resonance and filters. These now have their own sections. All older foundation/exercise URLs remain available.

The confirmed source corrections include nonlinear static vs differential resistance, KVL wording, the meaning of negative absorbed power, and the factor-of-four error in the illustrated pulse-wave Fourier coefficient. Numerical examples are independently checked in `test-lectures.cjs`.

## Editing and rebuilding

Edit `lectures.json`, then run `node scripts/build-lecture-content.cjs`. It combines the content with `lecture-figures.json` into the browser bundle. `build-site.cjs` publishes runtime files and assets only; this directory and source originals are not published.

To regenerate figures, keep the originals in `../docs`. Convert the PPTX files to PDF in `.build/source-audit` with LibreOffice, preserving basenames, then run `python scripts/rebuild-lecture-assets.py`. It requires PyMuPDF and Pillow. Delete the affected generated WebP assets before regenerating changed source pages; the script reuses existing assets. If a source changes, review all affected text, source hashes, mappings and tests before publishing. Do not infer completeness merely from equal page counts.

## Verification limits

JSDOM checks navigation, quizzes, state, source-image loading attributes, typeset math, playback controls and print restoration. Numerical tests independently reconstruct selected examples and every existing homework model. Source PDFs were rendered and inspected for image-only pages and identified errors. A connected browser was unavailable in this session, so these checks do not establish desktop/mobile browser rendering or printed pagination.
