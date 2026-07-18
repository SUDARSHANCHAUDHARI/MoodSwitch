# MoodSwitch

> One switch. One ceiling light. Absolutely no cooperation.

MoodSwitch is a standalone interactive web experience set inside an unreliable apartment room. Operating the wall switch triggers lighting mistakes, spatial anomalies, ghost interference, or—very rarely—the correct ceiling light.

The project is built entirely with semantic HTML, CSS, inline SVG, and vanilla JavaScript. It has no runtime packages, remote assets, backend, account system, or build step.

## Project status

- **Readiness:** Production-ready static site
- **Repository:** Private
- **Default branch:** `main`
- **Deployment:** Not publicly deployed
- **Runtime dependencies:** None
- **Automated verification:** 11 dependency-free checks

## Features

- Responsive illustrated room containing a ceiling bulb, wall switch, window, table lamp, furniture, plants, books, artwork, and decorative objects.
- Native HTML switch control layered over the SVG scene for dependable mouse, touch, keyboard, and screen-reader operation.
- Ten randomized failure outcomes:

  | Outcome | Room response |
  | --- | --- |
  | Emergency red | The entire room becomes red. |
  | Disco protocol | Colored beams and disco lights animate across the room. |
  | Wrong lamp | The table lamp turns on instead of the ceiling bulb. |
  | Moon shift | Moonlight enters through the window. |
  | Bulb negotiation | The ceiling bulb flickers without staying on. |
  | Everything else | Furniture and decorations glow while the bulb remains dark. |
  | Switch relocation | The wall switch moves to another part of the room. |
  | Ghost intervention | A ghost appears and switches the control back. |
  | Orientation failure | The room turns upside down. |
  | Aquatic conversion | The bulb becomes a glowing fish. |

- A rare normal-light result with a 3.5% selection chance.
- A guaranteed normal-light result on every tenth attempt, lasting exactly three seconds before failure returns.
- Finite state machine that permits only `idle → switching → active/normal → recovering → idle`.
- Re-entry locking and cancellable operation tokens that prevent overlapping or stale transitions.
- Attempt counter and ten-attempt progress indicator.
- Generated sound effects using the Web Audio API—no downloaded audio files.
- Sound and reset controls, plus keyboard shortcuts.
- Responsive layout for desktop, tablet, and mobile screens.
- Reduced-motion and increased-contrast support.
- No cookies, analytics, local storage, tracking, or network requests.

## Controls

| Action | Mouse or touch | Keyboard |
| --- | --- | --- |
| Operate switch | Select the wall switch | Focus it and press <kbd>Space</kbd> or <kbd>Enter</kbd> |
| Toggle sound | Select **Sound on/off** | Press <kbd>M</kbd> |
| Reset room | Select **Reset room** | Press <kbd>R</kbd> |

Browsers allow generated audio only after user interaction. The first switch or sound-control activation initializes the audio context.

## Technology

- **Structure:** HTML5 semantic elements
- **Artwork:** Responsive inline SVG
- **Presentation:** CSS custom properties, gradients, filters, media queries, and keyframe effects
- **Logic:** Vanilla JavaScript with a finite state machine and guarded asynchronous transitions
- **Audio:** Web Audio API oscillators and gain envelopes
- **Tests:** Node.js built-in test runner, assertions, and VM sandbox
- **Dependencies:** None

## Project structure

```text
MoodSwitch/
├── index.html              # Semantic interface and SVG room artwork
├── style.css               # Layout, lighting, effects, and accessibility preferences
├── script.js               # State machine, outcomes, controls, timers, and audio
├── favicon.svg             # Local vector favicon
├── scripts/
│   └── verify.sh           # Complete production-readiness command
├── tests/
│   ├── room.test.cjs       # State-machine and outcome regression tests
│   └── static.test.cjs     # DOM, ARIA, CSS, asset, and security checks
├── AGENTS.md               # Project-specific development instructions
├── .gitignore              # Secret, tooling, editor, and deployment exclusions
└── README.md
```

## Run locally

There is no installation or build step.

### Option 1: Open directly

Open `index.html` in a current browser.

### Option 2: Use a static server

From the project directory:

```bash
python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

### Clone the private repository

GitHub access to the repository is required:

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/MoodSwitch.git
cd MoodSwitch
```

## Verification

The website itself requires no tooling. Running the regression suite requires Node.js 18 or newer.

```bash
./scripts/verify.sh
```

The verification command checks:

- JavaScript syntax.
- All ten failure outcomes.
- The rare normal-light branch.
- Transition re-entry locking and recovery.
- The exact three-second tenth-attempt guarantee.
- Reset cancellation during pending work.
- Required production files.
- Unique DOM IDs and valid ARIA references.
- JavaScript-to-DOM selector integrity.
- Effect presentation hooks and reduced-motion coverage.
- Remote runtime assets and unsafe HTML execution patterns.
- Balanced CSS braces.
- Inline SVG well-formedness when `xmllint` is available.

## Accessibility

- The wall switch is a native `<button>` with standard keyboard behavior.
- Visible focus indicators are provided for every interactive control.
- Status changes are announced through a polite live region.
- Decorative SVG elements do not compete with the scene description exposed to assistive technology.
- `prefers-reduced-motion` replaces looping and moving effects with static visual states.
- `prefers-contrast: more` strengthens borders and supporting text.
- The bulb flicker remains below three flashes per second.
- The interface includes a skip link to the primary switch control.

## Privacy and security

MoodSwitch runs entirely in the browser and does not collect, transmit, or persist personal data.

- No account or authentication system.
- No analytics, advertising, trackers, or third-party scripts.
- No cookies, local storage, session storage, or IndexedDB.
- No API calls or external runtime assets.
- No environment variables or embedded credentials.
- No dynamic `innerHTML`, `eval`, or string-created executable code.
- Generated audio begins only after a user gesture and can be muted at any time.

The `.gitignore` excludes environment files, credentials, signing keys, local databases, hosting-provider state, editor files, caches, and generated local knowledge views.

## Browser support

MoodSwitch targets current versions of Chrome, Edge, Firefox, and Safari. Browsers without Web Audio support still provide the complete visual experience without sound.

## Deployment

MoodSwitch can be deployed to any static host, including GitHub Pages, Cloudflare Pages, Netlify, Vercel, or a conventional web server.

Publish the repository root and serve `index.html` as the entry point. The app requires no environment variables, server functions, redirects, rewrites, or generated build directory.

### Release checklist

1. Run `./scripts/verify.sh`.
2. Confirm the Git working tree is clean and `main` matches `origin/main`.
3. Deploy over HTTPS.
4. Manually check the supported desktop and mobile browsers.
5. Confirm keyboard operation, reduced-motion behavior, responsive layout, and user-initiated sound.
6. Change repository visibility only through an intentional release decision.

There is no automated deployment workflow. Adding or modifying GitHub Actions requires explicit project approval.

## Author

**Sudarshan Chaudhari**<br>
Independent developer at **SudarshanTechLabs**<br>
Bangkok, Thailand

- GitHub: [@SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)
- Email: [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)

## License and ownership

Copyright © 2026 Sudarshan Chaudhari / SudarshanTechLabs. All rights reserved.

This private repository does not currently include or grant an open-source license. Redistribution, modification, or publication requires explicit permission from the author.
