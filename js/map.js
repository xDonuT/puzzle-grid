// map.js — STS-style branching map for Puzzle Grid
// Generates a map of connected nodes per act.
// Node types: "normal", "elite", "mystery" (card flip), "boss"

const MAP_LAYERS_PER_ACT = [
  [3, 2, 3, 2, 1], // layer 0..4 node counts per act (boss is separate)
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
      layer.push({ type: pickNodeType(li, act), layer: li, index: ni, id: `a${act}l${li}n${ni}` });
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
      // Add a second connection sometimes (not for last pre-boss layer)
      if (li < layers.length - 2 && nxt.length > 1 && Math.random() < 0.5) {
        const secondary = primary + 1 < nxt.length ? primary + 1 : primary - 1;
        if (secondary >= 0 && secondary < nxt.length && secondary !== primary) {
          connections_for_node.push(secondary);
        }
      }
      connections.push({ from: cur[ni].id, to: connections_for_node.map(i => nxt[i].id) });
    }
  }

  return { act, layers, connections };
}

function pickNodeType(layerIdx, act) {
  // Layer 0: bias toward normal + mystery (starting variety)
  if (layerIdx === 0) {
    const r = Math.random();
    if (r < 0.4) return "normal";
    if (r < 0.75) return "mystery";
    return "normal";
  }
  // Middle layers: more variety
  if (layerIdx <= 3) {
    const r = Math.random();
    if (r < 0.45) return "normal";
    if (r < 0.65) return "elite";
    return "mystery";
  }
  // Layer 4 (last before boss): always normal warmup
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

function generateFullMap() {
  return {
    acts: [generateActMap(1), generateActMap(2), generateActMap(3)],
    visitedNodes: {},  // "act-layer-index" → true
    currentNode: null, // currently active node id
    currentAct: 1,
  };
}
