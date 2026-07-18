# MoodSwitch Project Instructions

MoodSwitch is a dependency-free static web experience built with semantic HTML, CSS, inline SVG, and vanilla JavaScript.

## Architecture

- `index.html` owns page semantics and the SVG room artwork.
- `style.css` owns responsive layout, effect presentation, focus states, and reduced-motion behavior.
- `script.js` owns the finite state machine, outcomes, timers, controls, and generated Web Audio.
- The visible wall switch must remain a native HTML button positioned over the SVG stage.

## Working Rules

- Preserve the allowed state flow: `idle → switching → active/normal → recovering → idle`.
- Keep the app standalone; do not add runtime dependencies or remote assets without a concrete need.
- Do not use `innerHTML`, `eval`, or string-created executable code.
- Preserve keyboard operation, live status announcements, visible focus, and static reduced-motion alternatives.
- Never commit environment files, credentials, deployment state, generated memory trees, or signing material.
- Do not add or expand GitHub Actions without explicit approval.

## Verification

Run the complete local quality gate before committing or releasing:

```bash
./scripts/verify.sh
```

The site has no build step. A production deployment publishes the repository root as static files.
