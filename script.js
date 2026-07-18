"use strict";

const RoomState = Object.freeze({
  IDLE: "idle",
  SWITCHING: "switching",
  ACTIVE: "active",
  NORMAL: "normal",
  RECOVERING: "recovering",
});

const allowedTransitions = Object.freeze({
  [RoomState.IDLE]: [RoomState.SWITCHING],
  [RoomState.SWITCHING]: [RoomState.ACTIVE, RoomState.NORMAL],
  [RoomState.ACTIVE]: [RoomState.RECOVERING],
  [RoomState.NORMAL]: [RoomState.RECOVERING],
  [RoomState.RECOVERING]: [RoomState.IDLE],
});

class RoomStateMachine {
  constructor(onChange) {
    this.current = RoomState.IDLE;
    this.onChange = onChange;
  }

  canTransition(nextState) {
    return allowedTransitions[this.current]?.includes(nextState) ?? false;
  }

  transition(nextState) {
    if (!this.canTransition(nextState)) {
      console.warn(`Ignored invalid room transition: ${this.current} → ${nextState}`);
      return false;
    }

    this.current = nextState;
    this.onChange(nextState);
    return true;
  }

  reset() {
    this.current = RoomState.IDLE;
    this.onChange(RoomState.IDLE);
  }
}

class SoundEngine {
  constructor() {
    this.enabled = true;
    this.context = null;
    this.master = null;
    this.activeNodes = new Set();
  }

  ensureContext() {
    if (!this.enabled) return false;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.12;
      this.master.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      void this.context.resume();
    }

    return true;
  }

  tone(frequency, duration = 0.12, options = {}) {
    if (!this.ensureContext()) return;

    const { type = "sine", volume = 0.55, delay = 0, endFrequency = frequency } = options;
    const start = this.context.currentTime + delay;
    const end = start + duration;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(frequency, 1), start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), end);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.001), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
    this.activeNodes.add(oscillator);
    oscillator.addEventListener("ended", () => this.activeNodes.delete(oscillator), { once: true });
  }

  sequence(notes) {
    notes.forEach(({ frequency, duration, delay, type, volume, endFrequency }) => {
      this.tone(frequency, duration, { delay, type, volume, endFrequency });
    });
  }

  click(isOn) {
    this.sequence([
      { frequency: isOn ? 155 : 125, endFrequency: 72, duration: 0.045, delay: 0, type: "square", volume: 0.45 },
      { frequency: 52, duration: 0.06, delay: 0.035, type: "triangle", volume: 0.6 },
    ]);
  }

  play(effectId) {
    const sounds = {
      red: [
        { frequency: 185, duration: 0.28, delay: 0, type: "sawtooth", volume: 0.3 },
        { frequency: 155, duration: 0.28, delay: 0.32, type: "sawtooth", volume: 0.3 },
      ],
      disco: [
        { frequency: 110, duration: 0.12, delay: 0, type: "square", volume: 0.6 },
        { frequency: 220, duration: 0.1, delay: 0.18, type: "square", volume: 0.35 },
        { frequency: 165, duration: 0.12, delay: 0.36, type: "square", volume: 0.48 },
        { frequency: 330, duration: 0.15, delay: 0.54, type: "square", volume: 0.35 },
      ],
      "table-lamp": [
        { frequency: 70, endFrequency: 120, duration: 0.2, delay: 0, type: "sine", volume: 0.45 },
        { frequency: 240, duration: 0.5, delay: 0.12, type: "sine", volume: 0.16 },
      ],
      moonlight: [
        { frequency: 392, duration: 1.2, delay: 0, type: "sine", volume: 0.16 },
        { frequency: 587, duration: 1, delay: 0.18, type: "sine", volume: 0.1 },
      ],
      flicker: Array.from({ length: 7 }, (_, index) => ({
        frequency: index % 2 ? 48 : 95,
        duration: 0.035,
        delay: index * 0.16,
        type: "square",
        volume: 0.34,
      })),
      everything: [
        { frequency: 60, duration: 1.3, delay: 0, type: "sawtooth", volume: 0.18 },
        { frequency: 120, duration: 1.3, delay: 0, type: "sine", volume: 0.12 },
      ],
      moved: [
        { frequency: 130, endFrequency: 560, duration: 0.45, delay: 0, type: "triangle", volume: 0.35 },
        { frequency: 560, endFrequency: 180, duration: 0.35, delay: 0.46, type: "triangle", volume: 0.3 },
      ],
      ghost: [
        { frequency: 310, endFrequency: 72, duration: 1.5, delay: 0, type: "sine", volume: 0.22 },
        { frequency: 420, endFrequency: 105, duration: 1.3, delay: 0.12, type: "sine", volume: 0.12 },
      ],
      upside: [
        { frequency: 95, endFrequency: 620, duration: 0.7, delay: 0, type: "sawtooth", volume: 0.25 },
      ],
      fish: [
        { frequency: 520, duration: 0.18, delay: 0, type: "sine", volume: 0.25 },
        { frequency: 680, duration: 0.16, delay: 0.2, type: "sine", volume: 0.22 },
        { frequency: 810, duration: 0.22, delay: 0.38, type: "sine", volume: 0.18 },
      ],
      normal: [
        { frequency: 262, duration: 0.35, delay: 0, type: "sine", volume: 0.28 },
        { frequency: 330, duration: 0.35, delay: 0.12, type: "sine", volume: 0.24 },
        { frequency: 392, duration: 0.55, delay: 0.24, type: "sine", volume: 0.2 },
      ],
      failure: [
        { frequency: 120, endFrequency: 35, duration: 0.5, delay: 0, type: "sawtooth", volume: 0.28 },
      ],
    };

    this.sequence(sounds[effectId] ?? []);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stopAll();
  }

  stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // The oscillator may already have stopped between scheduling and cleanup.
      }
    });
    this.activeNodes.clear();
  }
}

const effects = [
  {
    id: "red",
    className: "effect-red",
    title: "Emergency red. No emergency included.",
    detail: "The room is being dramatic in a very specific wavelength.",
    duration: 2400,
  },
  {
    id: "disco",
    className: "effect-disco",
    title: "Disco protocol activated.",
    detail: "The lease says nothing about this. The neighbors probably will.",
    duration: 3100,
  },
  {
    id: "table-lamp",
    className: "effect-table-lamp",
    title: "Wrong lamp. Right enthusiasm.",
    detail: "The table lamp has volunteered for a job nobody offered it.",
    duration: 2500,
  },
  {
    id: "moonlight",
    className: "effect-moonlight",
    title: "The moon picked up the shift.",
    detail: "Natural light, technically. Customer service remains unavailable.",
    duration: 2800,
  },
  {
    id: "flicker",
    className: "effect-flicker",
    title: "A brief negotiation with electricity.",
    detail: "The bulb is fluent in Morse code but refuses to translate.",
    duration: 2600,
  },
  {
    id: "everything",
    className: "effect-everything",
    title: "Everything is glowing. Except the bulb.",
    detail: "Furniture, plants, curtains: all promoted above ceiling light.",
    duration: 2900,
  },
  {
    id: "moved",
    className: "effect-moved",
    title: "The switch has changed departments.",
    detail: "It can do that, apparently. Please remain professionally calm.",
    duration: 2600,
  },
  {
    id: "ghost",
    className: "effect-ghost",
    title: "A previous tenant disagrees.",
    detail: "The ghost switched it back. Boundaries were not discussed.",
    duration: 2900,
  },
  {
    id: "upside",
    className: "effect-upside",
    title: "Room orientation: unhelpful.",
    detail: "Gravity has filed a temporary change-of-address form.",
    duration: 2900,
  },
  {
    id: "fish",
    className: "effect-fish",
    title: "The bulb is now a bioluminescent fish.",
    detail: "It still will not light the room, but it does look fulfilled.",
    duration: 3200,
  },
];

const rareNormalEffect = Object.freeze({
  id: "normal",
  className: "effect-normal",
  title: "Wait. It actually worked.",
  detail: "Statistically suspicious. Enjoy it while the wiring reconsiders.",
  duration: 2300,
  isNormal: true,
});

const milestoneNormalEffect = Object.freeze({
  ...rareNormalEffect,
  title: "Ten attempts. The light finally works.",
  detail: "Three seconds of ordinary competence. Try not to make it nervous.",
  duration: 3000,
  isMilestone: true,
});

const elements = {
  roomFrame: document.querySelector("#room-frame"),
  roomTransform: document.querySelector("#room-transform"),
  wallSwitch: document.querySelector("#wall-switch"),
  stateLabel: document.querySelector("#state-label"),
  effectName: document.querySelector("#effect-name"),
  effectDetail: document.querySelector("#effect-detail"),
  attemptCount: document.querySelector("#attempt-count"),
  attemptProgress: document.querySelector("#attempt-progress"),
  cycleLabel: document.querySelector("#cycle-label"),
  soundToggle: document.querySelector("#sound-toggle"),
  soundLabel: document.querySelector("#sound-label"),
  resetButton: document.querySelector("#reset-button"),
};

const sound = new SoundEngine();
let attempts = 0;
let switchIsOn = false;
let operationToken = 0;
let lastEffectId = null;
let pendingTimers = new Set();

const stateLabels = {
  [RoomState.IDLE]: "System idle",
  [RoomState.SWITCHING]: "Rerouting power",
  [RoomState.ACTIVE]: "Anomaly active",
  [RoomState.NORMAL]: "Unexpected success",
  [RoomState.RECOVERING]: "Failure restored",
};

const machine = new RoomStateMachine((state) => {
  elements.roomFrame.dataset.state = state;
  elements.stateLabel.textContent = stateLabels[state];
  const isBusy = state !== RoomState.IDLE;
  elements.wallSwitch.disabled = isBusy;
  elements.wallSwitch.setAttribute("aria-busy", String(isBusy));
});

function setStatus(title, detail) {
  elements.effectName.textContent = title;
  elements.effectDetail.textContent = detail;
}

function updateAttemptDisplay(showMilestoneComplete = false) {
  elements.attemptCount.value = String(attempts).padStart(2, "0");
  elements.attemptCount.textContent = String(attempts).padStart(2, "0");
  elements.attemptCount.setAttribute("aria-label", `${attempts} ${attempts === 1 ? "attempt" : "attempts"}`);

  const cyclePosition = attempts === 0 ? 0 : attempts % 10 || (showMilestoneComplete ? 10 : 0);
  const remaining = cyclePosition === 0 && attempts > 0 ? 10 : 10 - cyclePosition;
  elements.attemptProgress.value = cyclePosition;
  elements.attemptProgress.textContent = `${cyclePosition} out of 10`;
  elements.cycleLabel.textContent = `${remaining} ${remaining === 1 ? "try" : "tries"} until guaranteed competence`;
}

function schedule(callback, delay) {
  const timer = window.setTimeout(() => {
    pendingTimers.delete(timer);
    callback();
  }, delay);
  pendingTimers.add(timer);
  return timer;
}

function wait(delay, token) {
  return new Promise((resolve) => {
    schedule(() => resolve(token === operationToken), delay);
  });
}

function clearTimers() {
  pendingTimers.forEach((timer) => window.clearTimeout(timer));
  pendingTimers.clear();
}

function clearEffectClasses() {
  effects.forEach((effect) => elements.roomFrame.classList.remove(effect.className));
  elements.roomFrame.classList.remove("effect-normal", "effect-failure");
  elements.roomTransform.classList.remove("is-upside-down");
  elements.wallSwitch.classList.remove("is-relocated");
}

function chooseEffect() {
  if (Math.random() < 0.035) return rareNormalEffect;

  const available = effects.filter((effect) => effect.id !== lastEffectId);
  return available[Math.floor(Math.random() * available.length)];
}

function applyEffect(effect, token) {
  clearEffectClasses();
  elements.roomFrame.classList.add(effect.className);

  if (effect.id === "moved") {
    elements.wallSwitch.classList.add("is-relocated");
  }

  if (effect.id === "upside") {
    elements.roomTransform.classList.add("is-upside-down");
  }

  if (effect.id === "ghost") {
    schedule(() => {
      if (token !== operationToken) return;
      switchIsOn = !switchIsOn;
      elements.wallSwitch.classList.toggle("is-on", switchIsOn);
      elements.wallSwitch.setAttribute("aria-pressed", String(switchIsOn));
      sound.click(switchIsOn);
    }, 1050);
  }

  setStatus(effect.title, effect.detail);
  sound.play(effect.id);
}

async function finishEffect(effect, token) {
  if (!(await wait(effect.duration, token))) return;
  if (!machine.transition(RoomState.RECOVERING)) return;

  clearEffectClasses();
  elements.roomFrame.classList.add("effect-failure");
  setStatus(
    effect.isNormal ? "And… it’s gone." : "Darkness restored.",
    effect.isNormal
      ? "The bulb has returned to its core value: not working."
      : "The switch is ready to disappoint you differently."
  );
  sound.play("failure");

  if (!(await wait(620, token))) return;
  elements.roomFrame.classList.remove("effect-failure");
  machine.transition(RoomState.IDLE);
  setStatus("Dark. Suspiciously dark.", "The ceiling bulb is refusing eye contact.");

  if (effect.isMilestone) {
    updateAttemptDisplay(false);
  }
}

async function operateSwitch() {
  if (machine.current !== RoomState.IDLE) return;

  const token = ++operationToken;
  clearEffectClasses();
  attempts += 1;
  switchIsOn = !switchIsOn;
  elements.wallSwitch.classList.toggle("is-on", switchIsOn);
  elements.wallSwitch.setAttribute("aria-pressed", String(switchIsOn));
  updateAttemptDisplay(attempts % 10 === 0);

  if (!machine.transition(RoomState.SWITCHING)) return;
  setStatus("The switch is thinking…", "This is already more deliberation than wiring should require.");
  sound.click(switchIsOn);

  if (!(await wait(260, token))) return;

  const effect = attempts % 10 === 0 ? milestoneNormalEffect : chooseEffect();
  lastEffectId = effect.id;
  const targetState = effect.isNormal ? RoomState.NORMAL : RoomState.ACTIVE;
  if (!machine.transition(targetState)) return;

  applyEffect(effect, token);
  await finishEffect(effect, token);
}

function resetRoom() {
  operationToken += 1;
  clearTimers();
  sound.stopAll();
  attempts = 0;
  switchIsOn = false;
  lastEffectId = null;
  clearEffectClasses();
  elements.wallSwitch.classList.remove("is-on");
  elements.wallSwitch.setAttribute("aria-pressed", "false");
  machine.reset();
  updateAttemptDisplay();
  setStatus("Room reset. Expectations lowered.", "The switch has forgotten everything, which may be an improvement.");
  elements.wallSwitch.focus({ preventScroll: true });
}

function toggleSound() {
  sound.setEnabled(!sound.enabled);
  elements.soundToggle.setAttribute("aria-pressed", String(sound.enabled));
  elements.soundLabel.textContent = sound.enabled ? "Sound on" : "Sound off";

  if (sound.enabled) {
    sound.tone(440, 0.08, { type: "sine", volume: 0.2 });
  }
}

elements.wallSwitch.addEventListener("click", operateSwitch);
elements.soundToggle.addEventListener("click", toggleSound);
elements.resetButton.addEventListener("click", resetRoom);

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  const tagName = document.activeElement?.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return;

  if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    resetRoom();
  } else if (event.key.toLowerCase() === "m") {
    event.preventDefault();
    toggleSound();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) sound.stopAll();
});

updateAttemptDisplay();
