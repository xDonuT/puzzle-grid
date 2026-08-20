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
const docProxy = new Proxy({}, {
  get(_, p) {
    if (p === "getElementById") return () => stubEl();
    if (p === "querySelector") return () => stubEl();
    if (p === "querySelectorAll") return () => [];
    if (p === "createElement") return () => stubEl();
    if (p === "createElementNS") return () => stubEl();
    if (p === "createTextNode") return () => stubEl();
    if (p === "createDocumentFragment") return () => stubEl();
    if (p === "getElementsByClassName") return () => [];
    if (p === "body") return stubEl();
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
    gain: { setValueAtTime: noop, exponentialRampToValueAtTime: noop, linearRampToValueAtTime: noop, value: 0 },
    Q: { value: 0 }, type: ""
  };
}
globalThis.AudioContext = class {
  constructor() { this.state = "running"; this.currentTime = 0; this.sampleRate = 44100; this.destination = {}; }
  resume() {}
  createOscillator() { return stubNode(); }
  createGain() { return stubNode(); }
  createBiquadFilter() { return stubNode(); }
  createBufferSource() { return { buffer: null, start: noop, stop: noop, connect: noop }; }
  createBuffer() { return { getChannelData: () => new Float32Array(10) }; }
};
globalThis.webkitAudioContext = globalThis.AudioContext;
globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 1);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.getComputedStyle = () => ({ getPropertyValue: () => "" });
globalThis.matchMedia = () => ({ matches: false, addListener: noop, removeListener: noop, addEventListener: noop, removeEventListener: noop });
globalThis.confirm = () => true;
globalThis.alert = noop;