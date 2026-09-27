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

## Publishing

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
