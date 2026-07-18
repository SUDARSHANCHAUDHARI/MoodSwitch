# MoodSwitch

MoodSwitch is a standalone interactive room where one wall switch controls everything except the ceiling light. Each attempt triggers a random lighting mishap, spatial anomaly, ghost intervention, or an extremely rare moment of electrical competence.

## Run locally

No build step or dependencies are required.

1. Open `index.html` directly in a modern browser, or
2. Serve the folder with any static web server, for example:

   ```bash
   python3 -m http.server 8080
   ```

   Then visit `http://localhost:8080`.

## Verify

The app has no runtime packages. The verification suite requires Node.js 18 or newer:

```bash
./scripts/verify.sh
```

This checks JavaScript syntax, all random outcomes, transition locking, the tenth-attempt guarantee, reset cancellation, DOM/ARIA references, local asset references, and SVG well-formedness when `xmllint` is available.

## Interaction

- Click the wall switch or focus it and press <kbd>Space</kbd> / <kbd>Enter</kbd>.
- Every ordinary attempt selects from ten failure effects plus a rare normal-light result.
- Every tenth attempt forces the ceiling light to work normally for three seconds before it fails again.
- Use **Sound** to enable or mute generated Web Audio effects.
- Use **Reset room** or press <kbd>R</kbd> to clear attempts and cancel the active transition.
- Press <kbd>M</kbd> to toggle sound.

## Technical notes

- The room is a responsive inline SVG, while the wall switch is a native HTML button positioned over the same stage for reliable keyboard and screen-reader behavior.
- A finite state machine allows only `idle → switching → active/normal → recovering → idle`, preventing overlapping effects from rapid input.
- All sounds are generated at runtime with the Web Audio API. There are no audio, image, font, package, or network dependencies.
- `prefers-reduced-motion` removes extended transitions and looping animation while preserving effect meaning.
- Live status text announces effects without exposing decorative SVG shapes to assistive technology.

## Files

- `index.html` — semantic page structure and SVG room artwork
- `style.css` — responsive scene styling, lighting, animation, and accessibility preferences
- `script.js` — state machine, random outcomes, timers, controls, and generated sound
- `.gitignore` — common local/editor exclusions
- `favicon.svg` — local vector favicon
- `tests/` — dependency-free state-machine and static regression checks
- `scripts/verify.sh` — the main production-readiness command

## Browser support

MoodSwitch targets current versions of Chrome, Edge, Firefox, and Safari. Browsers without Web Audio support still provide the complete visual experience.

## Deploy

MoodSwitch can be published to any static host. Deploy the repository root and serve `index.html` as the entry point. The app requires no environment variables, backend, rewrites, or remote assets.

Before a release:

1. Run `./scripts/verify.sh`.
2. Check the deployed page over HTTPS in the supported browsers.
3. Confirm the switch is keyboard operable and sound starts only after user interaction.
4. Keep the GitHub repository private until its visibility is intentionally changed.

There is no automated deployment workflow. Adding or changing GitHub Actions requires explicit project approval.
