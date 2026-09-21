// ---- Minimal DOM/browser mocks for headless playtest ----
const noop = () => {};
function stubEl() {
  const style = new Proxy({}, {
    get(t, p) { if (p === "setProperty") return () => {}; if (typeof p === "string") return t[p]; },
    set(t, p, v) { t[p] = v; return true; }
  });
  return {
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    style,
    dataset: {},
    children: [], firstChild: null, lastChild: null, nextSibling: null, parentNode: null,
    parentElement: null, closest: () => stubEl(),
    appendChild: noop, removeChild: noop, insertBefore: noop, replaceWith: noop, remove: noop,
    addEventListener: noop, removeEventListener: noop,
    setAttribute: noop, getAttribute: () => null, removeAttribute: noop,
    querySelector: () => stubEl(), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    animate: () => ({ onfinish: null, cancel: noop, finished: Promise.resolve() }),
    set innerHTML(v) {}, get innerHTML() { return ""; },
    set textContent(v) {}, get textContent() { return ""; },
    offsetWidth: 0, offsetHeight: 0, value: "", checked: false, disabled: false, hidden: false, tabIndex: 0,
    scrollTop: 0, scrollHeight: 0, focus: noop, blur: noop, click: noop
  };
}
function stubStyle() {
  const store = Object.create(null);
  return new Proxy(store, {
    get(t, p) {
      if (p === "setProperty") return (k, v) => { t[k] = v; };
      if (p === "removeProperty") return (k) => { delete t[k]; };
      if (p === "getPropertyValue") return (k) => (k in t ? t[k] : "");
      return t[p];
    },
    set(t, p, v) { t[p] = v; return true; }
  });
}
function persistentBody() {
  const el = stubEl();
  const set = new Set();
  el.classList = {
    add(...cs) { cs.forEach(c => set.add(c)); },
    remove(...cs) { cs.forEach(c => set.delete(c)); },
    toggle(c, force) { const on = force === undefined ? !set.has(c) : !!force; if (on) set.add(c); else set.delete(c); return on; },
    contains(c) { return set.has(c); }
  };
  el.style = stubStyle();
  return el;
}
const sharedBody = persistentBody();
function makeStubEl() { return stubEl(); }
function makeDocumentFragment() {
  // A fragment must track its appended children so the scroll element
  // can absorb them (lets the tactical filter test count rendered rows).
  const frag = stubEl();
  frag.children = [];
  frag.appendChild = (n) => { frag.children.push(n); };
  frag.querySelectorAll = (s) => (s.includes("log-entry") ? frag.children.filter((n) => String(n.className || "").includes("log-entry")) : []);
  return frag;
}
// `actionLogScroll` needs real child tracking so tests can verify renders.
const scrollEl = stubEl();
scrollEl.__id = "actionLogScroll";
scrollEl.children = [];
Object.defineProperty(scrollEl, "innerHTML", {
  set(v) { scrollEl.children = []; },
  get() { return ""; }
});
scrollEl.appendChild = (n) => {
  const kids = (n && n.children && n.children.length) ? n.children : (n ? [n] : []);
  scrollEl.children.push(...kids);
};
scrollEl.querySelectorAll = (s) => {
  if (!s.includes("log-entry")) return [];
  return scrollEl.children.slice().filter((n) => String(n.className || "").includes("log-entry"));
};
scrollEl.querySelector = () => stubEl();
const docById = new Map();
// Recorded elements let tests observe aria-live announces and rendered chips.
function recordedEl() {
  const el = stubEl();
  Object.defineProperty(el, "innerHTML", { set(v) { el.__html = String(v); }, get() { return el.__html || ""; } });
  Object.defineProperty(el, "textContent", { set(v) { el.__text = String(v); }, get() { return el.__text || ""; } });
  return el;
}
const docProxy = new Proxy({}, {
  get(_, p) {
    if (p === "getElementById") return (id) => {
      if (id === "actionLogScroll") return scrollEl;
      if (id === "srAnnounce" || id === "careerLine") {
        if (!docById.has(id)) docById.set(id, recordedEl());
        return docById.get(id);
      }
      if (!docById.has(id)) docById.set(id, makeStubEl());
      return docById.get(id);
    };
    if (p === "querySelector") return () => stubEl();
    if (p === "querySelectorAll") return () => [];
    if (p === "createElement") return () => stubEl();
    if (p === "createElementNS") return () => stubEl();
    if (p === "createTextNode") return () => stubEl();
    if (p === "createDocumentFragment") return () => makeDocumentFragment();
    if (p === "getElementsByClassName") return () => [];
    if (p === "body") return sharedBody;
    if (p === "documentElement") return stubEl();
    if (p === "head") return stubEl();
    if (p === "title") return "test";
    if (p === "addEventListener") return noop;
    if (p === "removeEventListener") return noop;
    return undefined;
  }
});
globalThis.document = docProxy;
globalThis.window = globalThis;
globalThis.navigator = { vibrate: noop, userAgent: "headless" };
const audioStore = new Map();
globalThis.Audio = class Audio {
  constructor(src) { this.src = src; this.loop = false; this.volume = 0; this.preload = "auto"; this.paused = true; this.currentTime = 0; }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
};
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};
function stubNode() {
  return {
    connect: noop, start: noop, stop: noop,
    frequency: { setValueAtTime: noop, exponentialRampToValueAtTime: noop, value: 0 },
    gain: { setValueAtTime: noop, exponentialRampToValueAtTime: noop, linearRampToValueAtTime: noop, setTargetAtTime: noop, value: 0 },
    Q: { value: 0 }, type: ""
  };
}
globalThis.AudioContext = class {
  constructor() { this.state = "running"; this.currentTime = 0; this.sampleRate = 44100; this.destination = {}; }
  resume() {}
  createOscillator() { return stubNode(); }
  createGain() { return stubNode(); }
  createBiquadFilter() { return stubNode(); }
  createDynamicsCompressor() { const n = stubNode(); n.threshold = { value: -100 }; n.knee = { value: 0 }; n.ratio = { value: 1 }; n.attack = { value: 0 }; n.release = { value: 0.25 }; return n; }
  createBufferSource() { return { buffer: null, start: noop, stop: noop, connect: noop }; }
  createBuffer() { return { getChannelData: () => new Float32Array(10) }; }
  createConvolver() { return stubNode(); }
};
globalThis.webkitAudioContext = globalThis.AudioContext;
globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 1);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.getComputedStyle = () => ({ getPropertyValue: () => "" });
globalThis.matchMedia = () => ({ matches: false, addListener: noop, removeListener: noop, addEventListener: noop, removeEventListener: noop });
globalThis.confirm = () => true;
globalThis.alert = noop;