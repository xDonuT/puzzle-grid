// map.js — branching act map for Bloom Tower
// Generates a map of connected nodes per act.
// Node types: "normal", "elite", "mystery" (card flip), "boss"

const MAP_LAYERS_PER_ACT = [
  [2, 3, 2, 3, 2, 1, 1], // layer 0..6 node counts per act (14 battle nodes + boss)
];

const NODE_ICONS = {
  normal:  "⚔️",
  elite:   "💀",
  mystery: "❓",
  shop:    "🛒",
  boss:    "👑",
};

const NODE_LABELS = {
  normal:  "Battle",
  elite:   "Elite",
  mystery: "Mystery",
  shop:    "Shop",
  boss:    "Boss",
};

function generateActMap(act) {
  const counts = MAP_LAYERS_PER_ACT[0]; // all acts share same layout for now
  const layers = [];

  for (let li = 0; li < counts.length; li++) {
    const n = counts[li];
    const layer = [];
    for (let ni = 0; ni < n; ni++) {
      // Types assigned after connections exist (see below) so elites are
      // guaranteed reachable AND avoidable — real safe/risky path choices.
      layer.push({ type: "normal", layer: li, index: ni, id: `a${act}l${li}n${ni}` });
    }
    layers.push(layer);
  }

  // Boss node
  layers.push([{ type: "boss", layer: counts.length, index: 0, id: `a${act}boss` }]);

  // Generate connections: each node in layer li connects to 1-2 nodes in li+1
  const connections = [];
  for (let li = 0; li < layers.length - 1; li++) {
    const cur = layers[li];
    const nxt = layers[li + 1];
    for (let ni = 0; ni < cur.length; ni++) {
      // Map node index to next layer indices
      const ratio = nxt.length / cur.length;
      const primary = Math.min(nxt.length - 1, Math.floor(ni * ratio));
      const connections_for_node = [primary];
      // Add a second connection sometimes (always into the pre-boss funnel)
      if (li < layers.length - 2 && nxt.length > 1 && Math.random() < 0.6) {
        const secondary = primary + 1 < nxt.length ? primary + 1 : primary - 1;
        if (secondary >= 0 && secondary < nxt.length && secondary !== primary) {
          connections_for_node.push(secondary);
        }
      }
      connections.push({ from: cur[ni].id, to: connections_for_node.map(i => nxt[i].id) });
    }
  }

  assignNodeTypes(layers, connections, counts);

  // Guarantee every node past the first layer has an incoming edge — the
  // fan-out above can strand nodes (unreachable mysteries/loot)
  for (let li = 1; li < layers.length; li++) {
    for (const n of layers[li]) {
      const hasIn = connections.some(c => Array.isArray(c.to) ? c.to.includes(n.id) : c.to === n.id);
      if (!hasIn) {
        const prev = layers[li - 1][Math.floor(Math.random() * layers[li - 1].length)];
        const existing = connections.find(c => c.from === prev.id);
        if (existing) { if (!Array.isArray(existing.to)) existing.to = [existing.to]; existing.to.push(n.id); }
        else connections.push({ from: prev.id, to: [n.id] });
      }
    }
  }

  return { act, layers, connections };
}

// Post-placement pass: decide node types AFTER the graph exists so we can
// guarantee (a) elites are reachable, (b) elites always have a normal
// alternative on their layer => genuine safe-vs-risky route decisions.
function assignNodeTypes(layers, connections, counts) {
  // Set of node ids reachable when entering layer li
  const reachableEntering = (li) => {
    let frontier = new Set(layers[0].map(n => n.id));
    for (let k = 0; k < li; k++) {
      const next = new Set();
      for (const id of frontier) {
        const conn = connections.find(c => c.from === id);
        if (conn) conn.to.forEach(t => next.add(t));
      }
      frontier = next;
    }
    return frontier;
  };

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  // --- Layer 0: gentle start (one mystery + one normal) ---
  layers[0][0].type = "mystery";

  // --- Elites: 2 per act on middle layers, reachable + avoidable ---
  const eliteLayers = [
    1 + Math.floor(Math.random() * 2), // layer 1 or 2
    3 + Math.floor(Math.random() * 2), // layer 3 or 4
  ];
  for (const li of eliteLayers) {
    const layer = layers[li];
    if (layer.length < 2) continue; // must be avoidable
    const frontier = reachableEntering(li);
    const cands = layer.filter(n => frontier.has(n.id));
    const pool = cands.length ? cands : layer.slice(0, layer.length - 1);
    pool[Math.floor(Math.random() * pool.length)].type = "elite";
  }

  // --- Mysteries: sprinkle 2-3 on remaining middle nodes ---
  const mid = [];
  for (let li = 1; li < counts.length - 2; li++) {
    for (const n of layers[li]) {
      if (n.type === "normal") mid.push(n);
    }
  }
  shuffle(mid);
  const mysteryCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < Math.min(mysteryCount, mid.length); i++) {
    mid[i].type = "mystery";
  }
}

function pickNodeType(layerIdx, act) {
  // Legacy RNG picker kept for compatibility; new maps use assignNodeTypes.
  if (layerIdx === 0) {
    const r = Math.random();
    if (r < 0.4) return "normal";
    if (r < 0.75) return "mystery";
    return "normal";
  }
  if (layerIdx <= 5) {
    const r = Math.random();
    if (r < 0.45) return "normal";
    if (r < 0.65) return "elite";
    return "mystery";
  }
  return "normal";
}

function getNodeById(map, id) {
  for (const layer of map.layers) {
    for (const node of layer) {
      if (node.id === id) return node;
    }
  }
  return null;
}

function getConnectedNodes(map, nodeId) {
  for (const conn of map.connections) {
    if (conn.from === nodeId) return conn.to;
  }
  return [];
}

function isNodeReachable(map, nodeId, visited) {
  // A node is reachable if any visited node connects to it
  if (visited.size === 0) {
    // Start: first layer nodes are always reachable
    const firstLayer = map.layers[0];
    return firstLayer.some(n => n.id === nodeId);
  }
  for (const visId of visited) {
    const connected = getConnectedNodes(map, visId);
    if (connected.includes(nodeId)) return true;
  }
  return false;
}

// Bump when MAP_LAYERS_PER_ACT / node structure changes so old saves regenerate.
const MAP_VERSION = 2;

function generateFullMap() {
  return {
    v: MAP_VERSION,
    acts: [generateActMap(1), generateActMap(2), generateActMap(3)],
    visitedNodes: {},  // "act-layer-index" → true
    currentNode: null, // currently active node id
    currentAct: 1,
  };
}

function isMapCompatible(map) {
  const expectedLayers = MAP_LAYERS_PER_ACT[0].length + 1; // + boss layer
  return !!map && map.v === MAP_VERSION &&
    Array.isArray(map.acts) && map.acts.length === 3 &&
    map.acts.every(a => a && Array.isArray(a.layers) && a.layers.length === expectedLayers);
}
