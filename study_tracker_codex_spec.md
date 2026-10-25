# Codex Build Specification — Personal Study Tracker

## Mission
Build a clean, responsive, static GitHub Pages website to track three parallel 6-week learning paths. The website is for one person, not a social product. Implement a working app, not a mockup. All 126 syllabus entries below are authoritative seed data. Do not generate new syllabus topics or silently omit entries.

## Technology and deployment
- React + TypeScript + Vite, with lightweight CSS (plain CSS or CSS modules preferred).
- GitHub Pages using GitHub Actions deployment on pushes to `main`.
- Set Vite `base` correctly for project repositories (`/<repo-name>/`) and support user/organization pages (`/`) through configuration or clear documentation. Avoid broken deep links: use hash routing or a route strategy compatible with GitHub Pages.
- No backend, login, paid services, API keys, or external database.
- Persist user data in `localStorage`, namespaced and versioned, e.g. `study-tracker:v1`.
- Provide export/import of all progress and notes as JSON, with validation, schema version, and confirmation before replacing existing data. Warn that browser storage is device/browser-specific and can be cleared. Export is the backup and cross-device transfer method.
- Include README with `npm install`, `npm run dev`, `npm run build`, `npm run preview`, GitHub Pages setup, and data backup instructions.

## User experience
Design a pleasant minimal dashboard suitable for desktop and mobile. Clear typography, accessible contrast, keyboard navigation, visible focus indicators, and a dark/light theme toggle. No unnecessary animations.

### Dashboard
- Three course cards: AI Internals, Fusion 360 Mechanisms, Linux Reverse Engineering & Security.
- For each: total completed out of 42, percentage, progress bar, next incomplete exercise, and link to course.
- Overall progress out of 126 and recent activity (based on completed timestamps).
- Study sessions are 30 minutes per exercise; show estimated remaining study time based on incomplete exercises. Do not confuse estimates with actual time spent.
- Option to mark a session complete, reopen it, or reset course progress with confirmation.

### Course view
- Six expandable weeks with seven numbered days each; show week titles, goals, and progress.
- Each day shows exercise title, completion state, and a link to its detail view.
- Filters: all, incomplete, completed; optional search across exercise titles.
- The week 7th day is a mini-project/review where indicated in the syllabus.

### Exercise detail view
- Breadcrumbs to dashboard/course/week.
- Objective derived from syllabus entry, estimated duration 30 minutes, and a short timebox: 5 minutes concept, 20 minutes hands-on, 5 minutes verify/explain. This is guidance, not a mandatory timer.
- Checklist for personal steps; editable notes and reflections (saved automatically).
- Optional hint and solution sections **collapsed by default**. The syllabus contains prompts, not canonical solutions; do not invent detailed answers or claim they are verified. Instead provide clearly labeled editable hint/solution fields, initially blank, with placeholders explaining they can be added later. Do not automatically expose a solution when marking complete.
- Completion toggle and previous/next exercise navigation.
- Optional links to reference materials as editable user-added URLs, validated as HTTP(S).

### Progress and data model
Use stable IDs such as `ai-w1-d1`, `fusion-w3-d18`, `linux-w4-d22` (day numbers are global within each course). Keep syllabus content separate from progress state. Example:
```ts
type CourseId = 'ai' | 'fusion' | 'linux';
type Exercise = {
  id: string; courseId: CourseId; week: number; day: number;
  title: string; task: string; isMiniProject?: boolean;
};
type ExerciseProgress = {
  completed: boolean; completedAt?: string; notes: string;
  checklist?: { id: string; text: string; done: boolean }[];
  hint?: string; solution?: string; referenceUrls?: string[];
};
type PersistedState = {
  schemaVersion: 1;
  exercises: Record<string, ExerciseProgress>;
  theme?: 'light' | 'dark' | 'system';
};
```
- Progress is not tied to dates; the user can study in any order and pause without penalties.
- Do not auto-mark exercises complete when notes are entered.
- Include optional completion dates; handle local time clearly.
- Defensive handling of malformed storage/import data, unknown IDs, and migration/version mismatch. Preserve existing progress on normal app upgrades.
- Autosave without losing typed notes during navigation.

## Full syllabus seed data
Each course has 6 weeks × 7 exercises. Keep the exact order, and assign global day numbers 1–42 per course. Use week heading as the weekly goal context. The task descriptions below are the minimum required content; you may add concise objective and verification prompts, but do not claim untested code or answers are verified.

### Course A — AI Internals: from first principles
**Outcome:** Implement fundamental learning algorithms in Python and assemble a miniature GPT-style character language model. Prefer Python/NumPy before high-level ML libraries; use PyTorch autograd only late in the course.

#### Week 1 — What does it mean for a machine to learn?
1. Write a linear predictor `y = wx + b`. Change its parameters manually and observe predictions.
2. Implement mean squared error (MSE). Measure how wrong your predictor is.
3. Write a brute-force search that finds the best `w` and `b` for a small dataset.
4. Calculate the derivative of MSE numerically using finite differences.
5. Implement gradient descent to update `w` and `b` automatically.
6. Introduce noisy data. Compare training error and test error.
7. Mini-project: Train a model on synthetic data and plot predictions against actual values.

#### Week 2 — Neural networks and their building blocks
8. Implement one artificial neuron: inputs, weights, bias, and output.
9. Implement sigmoid, ReLU, and tanh activation functions. Plot their behavior.
10. Combine multiple neurons into a fully connected layer.
11. Implement matrix multiplication for a layer using NumPy. Check dimensions.
12. Connect two layers and implement a forward pass.
13. Implement binary cross-entropy loss for a classification task.
14. Mini-project: Build a network that evaluates XOR inputs, using hand-selected weights.

#### Week 3 — How neural networks learn
15. Derive and code the gradient of a single neuron using the chain rule.
16. Implement gradients for a fully connected layer.
17. Propagate gradients through ReLU.
18. Implement backpropagation through a two-layer network.
19. Train the XOR network automatically using gradient descent.
20. Experiment with learning rates and diagnose unstable training.
21. Mini-project: Train a tiny classifier on a 2D dataset and visualize its decision boundary.

#### Week 4 — How AI understands images
22. Represent a grayscale image as a matrix of pixel values.
23. Implement a 2D convolution with a small kernel using loops.
24. Apply edge-detection and blur kernels to a sample image.
25. Implement max pooling and observe the information it removes.
26. Build a simple convolution + ReLU + pooling feature extractor.
27. Compare features from images containing vertical and horizontal lines.
28. Mini-project: Build a classifier for simple synthetic shapes using handcrafted convolutional features and your trained dense layer.

#### Week 5 — How language models work
29. Write a character tokenizer and map characters to integer IDs.
30. Build a bigram model that predicts the next character from the previous one.
31. Train the bigram model using character frequency counts. Generate text.
32. Implement a trainable embedding lookup table.
33. Calculate query, key, and value vectors and attention scores.
34. Implement scaled dot-product attention with causal masking.
35. Mini-project: Build a small single-head self-attention forward pass and inspect which tokens attend to which earlier tokens.

#### Week 6 — Build a miniature transformer
36. Implement positional embeddings and combine them with token embeddings.
37. Build a single-head causal self-attention layer.
38. Implement a feed-forward subnetwork with residual connections.
39. Assemble a minimal transformer forward pass with layer normalization.
40. Implement cross-entropy loss and verify gradients on a tiny example.
41. Train a very small transformer using PyTorch autograd while retaining your own architecture code.
42. Final project: Generate text, inspect attention, and explain every major part of your model.

### Course B — Fusion 360: real 3D-printable moving mechanisms
**Outcome:** Work backward from desired movement to a parameterized, motion-tested, 3D-printable mechanical assembly. Favor features available in Fusion 360 Personal; do not imply that joint animation validates torque, contact, friction, or real-world durability. Printer runtime is outside the 30-minute session.

#### Week 1 — Foundations of moving assemblies
1. Create two components connected by a revolute joint. Test rotation.
2. Create a slider with a prismatic joint. Restrict its travel to 30 mm.
3. Create a hinge with defined rotation limits and inspect its range of motion.
4. Create a simple pin-and-hole connection with a parameterized clearance.
5. Model a shaft supported by two brackets. Keep the shaft free to rotate.
6. Design a printable hinge and export its separate parts as STL or 3MF.
7. Mini-project: Create a small hinged arm with a printable pin and verify its range of movement.

#### Week 2 — Transforming movement using linkages
8. Model a crank and observe the circular path of its endpoint.
9. Connect a crank to a connecting rod using revolute joints.
10. Add a guided slider to create a complete slider-crank assembly.
11. Change crank radius and measure the resulting slider stroke.
12. Build a basic four-bar linkage with a grounded frame.
13. Change linkage lengths and compare output movement and reachable positions.
14. Mini-project: Design a 3D-printable hand-operated reciprocating mechanism with a specified stroke.

#### Week 3 — Gears and transmitting motion
15. Generate a pair of involute spur gears using an available Fusion gear generator.
16. Calculate gear ratios and verify the relative rotation using motion links.
17. Build a three-gear train and observe how direction changes.
18. Design a gear pair for a 3:1 speed reduction.
19. Build a rack-and-pinion mechanism to convert rotation into translation.
20. Design gear shafts, supports, and clearances for printing.
21. Mini-project: Create a printable hand-cranked gearbox with a specified ratio.

#### Week 4 — Cams and unusual movement
22. Model an eccentric cam and observe its changing effective radius.
23. Build a cam follower guided by a slider joint.
24. Design a cam profile that creates a rise, dwell, and return.
25. Inspect a Geneva drive and model its driver and driven wheel.
26. Design a Geneva mechanism with a four-position indexing wheel.
27. Model a simple ratchet and pawl; examine its engagement geometry.
28. Mini-project: Design a mechanism that lifts an object, holds it briefly, and lowers it during one input cycle.

#### Week 5 — Designing from a desired movement
29. Define a desired movement using start position, end position, travel, and timing.
30. Compare slider-crank, cam, and four-bar solutions for the same movement.
31. Sketch the output trajectory and identify required degrees of freedom.
32. Select a mechanism and calculate its initial dimensions.
33. Model the mechanism using named parameters so dimensions can change easily.
34. Check motion range, collisions, and problematic joint configurations.
35. Mini-project: Design a mechanism that moves a platform through a specified path using one rotary input.

#### Week 6 — Build a real 3D-printable mechanism
36. Define a final movement challenge, such as a walking leg or lifting platform.
37. Sketch the mechanism and determine its joints and dimensions.
38. Model the main moving components parametrically.
39. Assemble the mechanism and verify its motion with Fusion joints.
40. Add printable pins, spacers, supports, and adjustable clearances.
41. Export the parts, inspect them in a slicer, and correct printability problems.
42. Final project: Produce an assembly, bill of parts, and motion demonstration; print and test if time and hardware permit.

### Course C — Linux Reverse Engineering & Vulnerability Research
**Outcome:** Develop interview-ready Linux/C/x86-64 debugging, assembly-reading, TOCTOU, and memory-corruption skills. All vulnerable programs should be isolated local educational examples. Tools: Ubuntu, gcc/clang, GDB, objdump, strace, sanitizers.

#### Week 1 — Linux fundamentals
1. Use `ps`, `/proc`, and `strace` to observe a running Linux process.
2. Write a C program using `fork()` and explain why it returns twice.
3. Use `execve()` and `waitpid()`; trace the resulting process behavior.
4. Examine `/proc/self/maps` and identify stack, heap, and executable mappings.
5. Use GDB to inspect local variables, addresses, and a function's stack frame.
6. Easy LeetCode: Two Sum in C, with a simple array-based solution.
7. Assembly puzzle: Identify the return value of a short function using `mov`, `add`, and `ret`.

#### Week 2 — Assembly and reverse engineering
8. Learn x86-64 registers and the Linux System V calling convention.
9. Assembly puzzle: Trace `cmp`, `test`, and conditional jumps.
10. Compile a C loop with `-O0` and read its assembly using `objdump`.
11. Assembly puzzle: Reconstruct a loop that sums integers.
12. Use GDB to step through instructions and inspect register changes.
13. Easy LeetCode: Valid Parentheses in C.
14. Mini-challenge: Reverse engineer a compiled function before reading its source.

#### Week 3 — Memory corruption
15. Trigger a stack buffer overflow in a local test program and detect it with AddressSanitizer.
16. Find an out-of-bounds read in a C array-processing function.
17. Create a use-after-free example and inspect the sanitizer report.
18. Diagnose a double-free and explain allocator ownership.
19. Investigate integer overflow in a size calculation.
20. Easy LeetCode: Best Time to Buy and Sell Stock in C.
21. Assembly puzzle: Recognize array indexing and pointer arithmetic.

#### Week 4 — TOCTOU and race conditions
22. Read a vulnerable `access()` followed by `open()` example and identify the race window.
23. Build a controlled file-replacement race in a temporary directory.
24. Examine how symlinks can change what a pathname resolves to.
25. Fix a pathname TOCTOU using descriptor-based operations and appropriate `openat`/`openat2` protections.
26. Write a two-thread counter and observe a data race using ThreadSanitizer.
27. Easy LeetCode: Binary Search in C.
28. Mini-project: Audit three short C snippets for TOCTOU and explain the fixes.

#### Week 5 — Kernel interfaces and research
29. Trace `read`, `write`, and `openat` from user space using `strace`.
30. Inspect file descriptor behavior with `dup`, `close`, and `/proc/self/fd`.
31. Study `ioctl` and write a tiny user-space program that calls an existing safe ioctl.
32. Compare `copy_from_user` and `copy_to_user` concepts in Linux kernel code.
33. Fuzz a small C parser using a simple mutation-based harness.
34. Use GDB and AddressSanitizer to identify the cause of a generated crash.
35. Assembly puzzle: Reconstruct a function that checks a password-like byte sequence.

#### Week 6 — Interview simulation
36. Timed assembly puzzle: Explain a function with branches and a loop.
37. Timed C challenge: Find two memory-safety bugs in a short function.
38. Timed TOCTOU challenge: Identify a race and propose a safe redesign.
39. Easy LeetCode: Reverse Linked List in C.
40. Reverse engineer a small stripped binary with GDB and `objdump`.
41. Mini research challenge: Reproduce, explain, and fix a controlled vulnerability.
42. Mock interview: Assembly, TOCTOU, memory corruption, Linux internals, and algorithmic reasoning.

## Suggested UI layout
- Top navigation: Dashboard | AI | Fusion 360 | Linux RE | Settings.
- Dashboard: overall summary, three course cards, recently completed exercises, next steps.
- Course: week accordion/cards, progress indicators, completion controls.
- Exercise: main task, personal checklist, notes, collapsible optional hints/solutions, mark complete, previous/next.
- Settings: theme, export backup, import backup, destructive reset with confirmation.
- Use small friendly visual accents per course; do not rely on color alone for status.

## Acceptance criteria / definition of done
1. `npm run build` succeeds with no TypeScript errors.
2. All three courses contain exactly 42 exercises, all IDs unique, with six weeks and seven exercises per week. Add an automated test for this.
3. Marking a day complete immediately updates the course and dashboard progress; reloading retains it.
4. Notes and checklist edits persist across refreshes and navigation.
5. Backup export then import round-trip restores completion states, dates, notes, checklist, optional hints/solutions, and reference links.
6. Invalid import JSON is rejected with a clear message without erasing existing data.
7. GitHub Pages deployment works under a repository subpath; refresh and navigation work.
8. Site is usable on a phone and with a keyboard; check basic accessibility labels and focus.
9. Empty or incomplete content (hints, solutions) is honestly labeled rather than filled with fabricated solutions.
10. README includes deployment steps and the localStorage limitations.

## Implementation sequence for Codex
1. Scaffold Vite React TypeScript project, layout, and routing.
2. Convert syllabus above into typed seed data; add integrity tests.
3. Build versioned persistence and import/export with validation.
4. Implement dashboard, course, and exercise views.
5. Add notes, personal checklists, optional hint/solution fields, progress, and navigation.
6. Polish responsive styling and accessibility.
7. Add GitHub Actions Pages workflow, README, and verify build/tests.

## Scope control
Do not add authentication, cloud sync, calendar integration, AI-generated solutions, notifications, or a database in v1. Do not add daily streak penalties. Focus on a reliable, maintainable, attractive working study tracker.
