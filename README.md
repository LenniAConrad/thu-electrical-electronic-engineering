# THU Electrical & Electronic Engineering

Independent course-practice website for Electrical and Electronic Engineering homework 1 and 2, course 10220074 (section 0), instructor Luo Haiyun. Instructor information comes from the introductory lecture slides; Wang Peng is listed separately as the experiments supervisor.

[Live website](https://LenniAConrad.github.io/thu-electrical-electronic-engineering/) · [GitHub repository](https://github.com/LenniAConrad/thu-electrical-electronic-engineering)

Open `index.html` directly in a browser, or run `./start.sh` and visit http://localhost:8765. No package installation or internet connection is needed. Progress is stored in the browser; use the same URL/browser to retain it. `Try again` clears the current attempt, while `Reset` clears all progress after confirmation.

## Coverage

**Official homework** keeps the official values. **Random practice** creates repeatable variations with tidy component values and the same solving procedure; **New numbers** starts another variation. Each mode saves its own progress and drafts. Random exercise links include the seed so the same numbers can be revisited.

**Step by step** adds intermediate calculations, source conversions, source-deactivation diagrams, and equivalent circuits. **Just the answer** checks the final results directly. Answer inputs beside or below each diagram stay synchronized with the answer form. Focusing an input highlights its circuit location without covering labels or symbols. **Given circuit** shows the starting circuit during an intermediate step. Diagrams use the full content width, can be enlarged, and scroll within their card on narrow screens so labels remain legible.

25 cards cover all 19 original questions. The four subparts of 1.5 and 1.6 are separate cards. Source conversions check magnitude, polarity/direction, resistance, and the reason an ideal source cannot be converted. 1.18 checks five independent branch equations. 2.1 draws the phasors from the entered RMS values and angles. 2.2 builds the three sine-form instantaneous expressions.

Source sheets: `HW01_EET.pdf` and `HW02_EET_luo.docx` (not included in this repository). Homework 1 answers were checked against `HW_01_Solutions (1)--71569e098d.pdf`. Homework 2 numerical answers were independently derived using KCL and Thévenin equivalents. `verify_math.py` records the independent checks.

**Source issue, HW2 1.21:** the prompt asks for current I but repeats 1.18's symbolic diagram (captioned P1.19), provides no component values, and has no single I label. The app preserves that network and explicitly labels the source issue. It checks the two node equations and expressions for all five labelled branch currents. A unique numerical answer cannot be supplied without a corrected question.

The random version of 1.21 explicitly supplies numerical values and checks both node potentials and all five branch currents.

The source wording is retained with mathematical symbols restored from embedded equation images and obvious punctuation/unit rendering defects cleaned up. Diagrams are redrawn as SVG with the same connectivity, values, source polarities, and current directions. For 1.18/1.21 the added A/B/reference labels identify the equation inputs. Crossing wires in 1.25 have no connection.

**Formulas** opens a compact reference for the current exercise. **All formulas** lists the 22 basic formula groups used across both homeworks. It contains formulas and short conditions, without worked numerical answers.

Random prompts retain the homework wording with substituted values. The bridge remains multiple choice, graph matching shuffles the curve positions, and 1.18 remains an equation-only task.

## Checking

Numerical inputs support fractions, arithmetic, pi, sqrt(...), scientific notation, decimal commas, and optional compatible units (e.g. `0.001 A` in an mA field). Numeric tolerance is 0.2%, phase tolerance is 0.1°, and equivalent phase angles modulo 360° are accepted. Zero answers use an absolute tolerance of 1e-8. The declared waveform convention is sine with RMS phasors.

The expression parser never uses eval. Symbolic equations are checked at twelve deterministic assignments; reordered expressions and constant multiples of a requested equation are accepted. This is a lightweight equivalence check for the specified equation rows, not a general symbolic proof engine or checker for arbitrary alternative systems of equations.

Viewing a solution marks the current attempt as assisted. Use `Try again` and solve it without revealing to record completion. There is no account or data upload.

Run `node test-checker.cjs` for checker and coverage checks, and `node test-models.cjs` for 3,000 seeded variants, original-answer parity, circuit equations, and 8,280 rendered visual steps. Browser QA uses Python with Playwright (`pip install playwright`, then `python -m playwright install chromium`); run `python test-browser.py` while the local server is running. Set `BASE_URL` to test another URL. It covers all guided steps in both modes, diagram input synchronization, wrong-answer feedback, progress, reloads, assisted attempts, mobile layouts, and offline use.

`node test-review.cjs` independently audits all 25 official cards and 100 seeds per card (2,525 models). It solves the drawn circuits by modified nodal analysis, checks source equivalents under external loads, reconstructs the complex phasors, and verifies diagram values and formula coverage. See `REVIEW.md` for the exercise-by-exercise review.

## Circuit playground

**Circuit playground** opens a separate editor for linear DC circuits. Start with a voltage divider, parallel resistors, a bridge, a current-source example, or a blank canvas. Add junctions, choose a component, then click its two terminals. Select a component to edit its value/units or switch state; choose **Apply** to recalculate. **Select / move** lets you drag junctions. A wire can be split by clicking it with the **Junction** tool. Crossings are not electrical connections unless endpoints share a junction.

Resistors, independent ideal voltage/current sources, wires and open/closed switches are supported. The first junction on a blank canvas is the ground reference; **Ground** changes it. Current is positive from the first terminal to the second; voltage-source positive polarity is at the first terminal. Results include every node voltage, branch voltage/current, and absorbed/supplied power. Click a junction to see KCL, its rearrangement and numerical substitution; click a component for Ohm's law, source constraints and power calculations. The complete coupled equations are available below the results. The solver uses [modified nodal analysis](https://qucs.sourceforge.net/tech/node14.html), with equilibrated elimination and residual checks.

**Current flow** overlays moving amber dots in the calculated conventional-current direction, including through wires and sources. Speed is proportional to current magnitude within the current circuit and is illustrative rather than physical drift speed. Negative branch currents move opposite their green reference arrows. Open/zero-current branches and invalid circuits do not animate; scaled round-off is suppressed. Pause/play, hide/show and a speed slider control the overlay. Reduced-motion preferences start it paused, and hidden tabs stop animating. Junction inspection lists incoming and outgoing currents and their totals; component inspection names the actual flow direction.

This is a DC tool, without AC/transient or semiconductor models. Floating networks, contradictory ideal sources and indeterminate ideal-source/wire loops are reported instead of displaying a solution. Up to 24 junctions and 48 components are supported. Resistors range from 1 µΩ to 1 GΩ; source limits are ±1 MV and ±1 kA. Extremely ill-conditioned networks may be rejected. Display values are rounded; calculations retain full floating-point precision.

The editor autosaves separately from homework progress. **Save circuit / Open circuit** exports and imports JSON circuit files; **Undo / Redo** also reverses example loads and deletions. It runs offline without sending the circuit anywhere.

Run `node test-circuit-solver.cjs` for independent prescribed-voltage networks, source polarity, supernodes, bridge balance, switches, wires, grounding, extreme resistances, KCL/power conservation and invalid networks. Run `python test-circuit-lab.py` with the local server to verify building/editing, equations, dragging, wire splitting, undo/redo, saving/loading, persistence, readable labels, mobile layouts and offline use. The solver test also runs before deployment.

`node test-circuit-flow.cjs` checks current direction, reference reversals, relative speed, junction balance and zero/open/invalid circuits. `python test-current-flow.py` verifies actual animation movement and speed ratios, controls, source changes, current splitting, reduced motion, mobile layout and offline use. The flow-model test also runs before deployment.

## Publishing

**Print / PDF** opens a worksheet preview for the selected homework and mode. Choose **New numbers** for another complete practice set, or reuse its sheet number to reproduce it. The current random exercise keeps its values when opening the preview; other exercises use that same sheet number. Each exercise gets an A4 page with a full-width circuit and blank answer/working space. **Include answer key** adds separate pages at the end; answers are excluded by default. Use **Print / Save PDF** and select the browser's PDF destination, with browser headers and footers turned off. Printing does not change saved progress and also works offline.

Run `python test-print.py` with Playwright and Poppler installed to check the worksheet controls, original/generated values, answer keys, reproducible sets, mobile/offline access and actual A4 PDF pagination for both homeworks and modes. Review PDFs and preview images are written to `.build/print-review`.

The site runs without a backend or build dependencies. GitHub Actions checks the question bank and builds a runtime-only artifact with `node build-site.cjs`, then publishes it to GitHub Pages on every push to `main`. The publishing source is **GitHub Actions**.

Progress is saved locally in the browser. The public website and localhost have separate browser storage; there is no account or cross-device sync. The browser key retains its original name to preserve existing local progress.

## Adding homework

The overview and homework selector come from `Course.sets()` in `course.js`. Homework 3 and 4 are placeholders until exercises are added; later homework numbers are discovered from the question bank automatically.

1. Add questions to `questions.js` using IDs such as `h3-1`. The homework number is derived from the ID.
2. Add the corresponding circuit SVG in `circuits.js`.
3. Add the random family and guided steps in `practice-models.js`; use `step-visuals.js` for intermediate circuits.
4. Add each exercise's formula references in `formulas.js` and a topic in `course.js`.
5. Extend the independent answer and model tests, review the source wording and diagrams, and run the browser checks before pushing.

The fixed coverage counts in the current tests intentionally require updating when a reviewed homework set is added. The independent review must explicitly cover every new exercise family.

The homework material belongs to its respective authors. This is an independent study tool, not an official Tsinghua University website.

`python test-visuals.py` checks 938 official/random diagram states for overlapping labels, arrowheads, and clipped text. It also checks six viewport widths, focus highlights, the enlarged mobile diagram, and coincident phasors. Diagram text stays at its native readable size; narrow screens scroll the drawing while keeping answer inputs visible.

## Exercise playgrounds

Every exercise has **Open in playground**, carrying its official values or exact random seed into an editable diagram. The DC editor supports all circuit exercises, including all four characteristic subcircuits, test loads for open terminals, and the homework switch. Click a component to change its value, or a junction for KCL and current flow. **Reset exercise values** restores the imported model. Exercise copies leave saved custom circuits and homework answers unchanged; use **Save circuit** to keep an edited copy.

Adaptations are stated above the drawing: boundary current sources close the fragment in HW1 question 1; illustrative component values realize the current-only KCL problem; symbolic networks receive example values; the black box uses its derived Thévenin equivalent; and unknown/open loads receive labeled test values. No internal black-box topology is asserted. The two AC exercises open a phasor/waveform playground with editable givens, phase comparison, and a time slider. They are not modeled as DC circuits.

`node test-exercise-playgrounds.cjs` checks 2,828 official/seeded exercise and subcircuit models against homework quantities, loaded equivalents, switch states, and AC reconstruction. `python test-exercise-playgrounds.py` checks every link in both modes, diagram labels/arrows, editing/reset, saved circuit isolation, AC controls, offline use, and narrow layouts. New exercises also need an adapter in `exercise-playgrounds.js` and matching tests.
