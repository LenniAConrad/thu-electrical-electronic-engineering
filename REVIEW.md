# Homework and random-practice review

Reviewed 2026-09-27 against HW01_EET.pdf and HW02_EET_luo.docx, including embedded circuit and equation images. All 19 questions are covered by 25 cards. The extra cards are the individual source-conversion subparts.

Official mode retains the sheet's statements, numbers, circuit connections, reference directions, and question types. Minor punctuation and equation rendering corrections remain. Random mode retains those procedures and replaces the givens; its header names the corresponding homework and exercise.

| Homework | Exercise | Procedure retained in random practice | Review result |
|---|---|---|---|
| 1 | 1 | Junction currents, resistor voltage drops, UAB | Independent network solution agrees with I and UAB. |
| 1 | 2 | Match four circuits to four U–I characteristics | Source constraints, slope signs and intercepts agree; curve positions now shuffle. |
| 1 | 3 | Current division in the shorted bridge, then midpoint KCL | Retains four choices; values and correct position vary. Bridge current verified through a zero-volt connecting branch. |
| 1 | 1.3 | Find four currents using KCL | Excludes a formerly possible but physically unrealizable zero-current case. Every generated case has an explicit realization using positive resistors. |
| 1 | 1.5(a) | Voltage source plus series resistance → Norton | Magnitude, upward direction and resistance verified under three loads. |
| 1 | 1.5(b) | Reversed voltage source → Norton | Downward source direction verified under three loads. |
| 1 | 1.5(c) | Ignore the internal shunt across an ideal voltage source, then convert | Internal shunt retained; external equivalence verified under three loads. |
| 1 | 1.5(d) | Explain why no finite Norton equivalent exists | Zero output resistance retained. Solution now uses the generated voltage. |
| 1 | 1.6(a) | Downward current source plus shunt → Thévenin | Bottom-positive polarity and resistance verified under three loads. |
| 1 | 1.6(b) | Upward current source plus shunt → Thévenin | Top-positive polarity and resistance verified under three loads. |
| 1 | 1.6(c) | Ignore the internal series resistance of an ideal current source, then convert | Series resistor retained; external equivalence verified under three loads. |
| 1 | 1.6(d) | Explain why no finite Thévenin equivalent exists | Infinite output resistance retained. |
| 1 | 1.7 | Convert, combine parallel branches, calculate load current | Original network solved independently, including the voltage-source branch. |
| 1 | 1.12 | Source-defined node potentials, resistor currents, source KCL | All four source currents verified from the original network. |
| 2 | 1.9 | Infer Thévenin parameters from two measurements, predict loaded voltage | Measurements yield a unique positive resistance; loaded circuit checked independently. |
| 2 | 1.12 | Open-circuit voltage, source deactivation, maximum power | Equivalent resistance and power verified; nearby load resistances give lower power. |
| 2 | 1.18 | Write two KCL and three KVL equations | Random mode now remains equation-only. All equations satisfy an independent network solution. |
| 2 | 1.19 | Two simultaneous node-potential equations | Both potentials verified from the complete resistor network. |
| 2 | 1.20 | Three identical branches with switch closed/open | Both topologies independently solved. Zero open-switch currents follow the original symmetry. |
| 2 | 1.21 | Node equations and labelled branch currents | Source ambiguity is explicit; numerical random variant supplies values and asks for all five currents. |
| 2 | 1.23 | Superposition with one source active at a time | Signed sum agrees with a solution of the full original network. |
| 2 | 1.25 | Remove bridge load, find Thévenin equivalent, reconnect | Crossing remains unconnected; loaded bridge solved independently. |
| 2 | 1.26 | Supernode/open-circuit voltage, equivalent resistance, load current | Both voltage-source polarities and the signed load current verified in the original network. |
| 2 | 2.1 | Frequency, RMS, initial phases, common phasor diagram, phase comparison | Retains one amplitude written with √2 and one plain peak amplitude. Equal phases now correctly read “in phase.” |
| 2 | 2.2 | Rectangular RMS phasors → sine waveforms | Reconstructed real and imaginary components match all three givens; angular frequency and quadrant checked. |

## Changes made during review

- Random prompts now retain the original wording wherever numerical substitution suffices. Single-pass replacement prevents a new value from being replaced a second time; prompt givens are checked against circuit values.
- The shorted bridge remains multiple choice. Graph matching and bridge choices shuffle to avoid fixed letter answers.
- Random 1.18 no longer adds a separate numerical-solving requirement.
- Random 2.1 retains the second peak-to-RMS conversion and handles equal phases correctly.
- Excluded HW1 1.3 cases that satisfy KCL but require an impossible passive-resistor voltage ordering.
- Replaced the generic hint section with 22 basic formula groups, filtered to the current exercise or shown together.
- Separated overlapping voltage/current labels, resistor labels and graph axis labels; connected two ground reference symbols to their nodes.
- Retained source labels E1–E3 alongside the numerical random values.

## Validation

- `node test-checker.cjs`: 230+ parser, answer, symbolic-equivalence and coverage checks.
- `node test-models.cjs`: 3,000 seeded models; 8,280 visual steps; official-answer parity and tidy DC arithmetic.
- `node test-review.cjs`: 2,525 models (25 official + 2,500 seeded); every final answer independently checked. Modified nodal analysis uses manually transcribed connections and component givens, not the generators' equivalent-circuit answer formulas. Additional checks cover realizability, loaded-source equivalence, sinusoid reconstruction, diagram values, formula coverage and choice variation.
- `python3 verify_math.py`: independent symbolic checks of the original homework solutions.
- `test-browser.py`: all 137 guided steps in both modes, formulas for every card, 22-entry reference, input synchronization, incorrect answers, new numbers, separate progress, reload, assisted attempts, five mobile layouts, offline use and no browser console errors.
- Direct-answer browser checks also pass for the changed graph-matching, multiple-choice, branch-equation and AC families.
- Visual inspection of all randomized starting circuits and statements, the full formula reference, and representative intermediate circuits. Large graphics retain their dimensions on narrow screens and scroll inside the card.

## Source limitation

HW2 1.21 repeats the symbolic network from 1.18, captions it P1.19, and supplies neither numerical component values nor one current labelled I. Official mode preserves the supplied diagram and statement with an explicit note, checking node equations and the five labelled current expressions. Random mode supplies component values and clearly states its adapted target. This is an explicit adaptation, not a claimed numerical solution of the ambiguous original.

The symbolic checker accepts rearrangements and constant multiples of the requested equation rows. It is not a general proof engine for every alternative independent loop basis.
