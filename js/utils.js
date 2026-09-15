// ---- Shared, dependency-free utilities ----
    // Loaded first so every module can rely on these helpers.

    // Clamp a number into [min, max]
    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    // Coalesce repeated calls into at most one invocation per animation frame.
    // Returns a function that applies `fn` with the latest arguments on the next frame.
    function onNextFrame(fn) {
      let pending = false;
      let lastArgs = null;
      return function nextFrame(...args) {
        lastArgs = args;
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          const apply = lastArgs;
          lastArgs = null;
          if (apply) fn(...apply);
        });
      };
    }

    // Debounce: delay `fn` until `wait` ms have passed since the last call.
    function debounce(fn, wait = 200) {
      let timer = null;
      return function debounced(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { timer = null; fn(...args); }, wait);
      };
    }

    // Throttle: at most one `fn` invocation per `wait` ms (no trailing edge).
    function throttle(fn, wait = 100) {
      let last = 0;
      return function throttled(...args) {
        const now = Date.now();
        if (now - last < wait) return;
        last = now;
        fn(...args);
      };
    }

    // Lightweight event bus for decoupled module communication.
    const eventBus = {
      _handlers: {},
      on(event, handler) {
        (this._handlers[event] = this._handlers[event] || []).push(handler);
        return () => this.off(event, handler);
      },
      off(event, handler) {
        const list = this._handlers[event];
        if (!list) return;
        const i = list.indexOf(handler);
        if (i >= 0) list.splice(i, 1);
      },
      emit(event, payload) {
        const list = this._handlers[event];
        if (!list) return;
        for (const handler of list.slice()) {
          try { handler(payload); }
          catch (err) { console.error("[eventBus] handler error for " + event, err); }
        }
      },
      clear(event) {
        if (event) delete this._handlers[event];
        else this._handlers = {};
      }
    };