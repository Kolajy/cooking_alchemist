# Plan: Pre-recorded Fireplace Hearth Audio (Archived)

We replaced the procedurally synthesized Web Audio API hearth ambience with a pre-recorded, loopable CC0 fireplace audio file (`hearth.mp3`).

## 1. Proposed Changes

### [NEW] [hearth.mp3](file:///Users/kolajy/pg/cooking/web/src/public/assets/audio/hearth.mp3)
- Loopable, high-quality CC0/Public Domain fireplace crackling audio downloaded from an open source repository.

### [MODIFY] [sounds.ts](file:///Users/kolajy/pg/cooking/web/src/game/feedback/sounds.ts)
- Replace the procedural oscillator/LFO/noise synthesis code in `startHearthAmbience` and `stopHearthAmbience` with an `HTMLAudioElement` that loads and loops `/assets/audio/hearth.mp3`.
- Hook it into `unlockAudioOnGesture` so it plays after the user's first gesture if the ambience preference is enabled.

## 2. Verification Plan

### Manual Verification
1. Run `npm run dev` in the `web` workspace.
2. Open the browser, open the settings menu (Gear icon), and enable **Hearth ambience**.
3. Verify the relaxing fireplace audio plays and loops cleanly.
4. Disable **Hearth ambience** and verify the audio pauses immediately.
