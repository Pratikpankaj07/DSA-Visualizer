export const generateDSUSteps = (operations, initialSize, config = { pathCompression: false, unionByRank: false }) => {
  const steps = [];
  const parent = Array.from({ length: initialSize }, (_, i) => i);
  const rank = Array(initialSize).fill(0); // Height or Size based on implementation. Using Height (Rank).

  // Snapshot Helper
  const snapshot = (action, message, activeNode = null, highlights = []) => {
    steps.push({
      parent: [...parent],
      rank: [...rank],
      activeNode,
      highlights, // e.g., ['0-1'] edge keys
      action,
      message
    });
  };

  snapshot('INIT', 'Initialized Disjoint Set. Each node is its own parent.');

  const find = (i) => {
    snapshot('FIND', `Find(${i}): Checking parent of ${i}`, i);

    if (parent[i] !== i) {
      // Path Compression Logic
      if (config.pathCompression) {
        snapshot('FIND', `Parent of ${i} is ${parent[i]}. Recursively finding root...`, i, [`${i}-${parent[i]}`]);
        const root = find(parent[i]);

        if (parent[i] !== root) {
          parent[i] = root; // Compress
          snapshot('COMPRESS', `Path Compression: Pointing ${i} directly to root ${root}`, i, [`${i}-${root}`]);
        }
        return root;
      } else {
        // No Compression
        snapshot('FIND', `Parent of ${i} is ${parent[i]}. Moving up...`, i, [`${i}-${parent[i]}`]);
        return find(parent[i]);
      }
    }

    snapshot('FOUND', `Node ${i} is a root.`, i);
    return i;
  };

  const union = (i, j) => {
    snapshot('UNION', `Union(${i}, ${j}): Finding roots...`, null, []);

    const rootI = find(i);
    const rootJ = find(j);

    if (rootI !== rootJ) {
      snapshot('UNION', `Roots are different (${rootI} and ${rootJ}). Linking trees...`, null, [`${i}-${rootI}`, `${j}-${rootJ}`]);

      if (config.unionByRank) {
        if (rank[rootI] < rank[rootJ]) {
          parent[rootI] = rootJ;
          snapshot('LINK', `Rank(${rootI}) < Rank(${rootJ}). Attaching ${rootI} to ${rootJ}.`, rootI, [`${rootI}-${rootJ}`]);
        } else if (rank[rootI] > rank[rootJ]) {
          parent[rootJ] = rootI;
          snapshot('LINK', `Rank(${rootI}) > Rank(${rootJ}). Attaching ${rootJ} to ${rootI}.`, rootJ, [`${rootJ}-${rootI}`]);
        } else {
          parent[rootJ] = rootI;
          rank[rootI]++;
          snapshot('LINK', `Ranks equal. Attaching ${rootJ} to ${rootI} and increasing rank of ${rootI}.`, rootJ, [`${rootJ}-${rootI}`]);
        }
      } else {
        // Naive Union: Always attach i's root to j's root (or vice versa, typically rootI -> rootJ)
        parent[rootI] = rootJ;
        snapshot('LINK', `Naive Union: Attaching root ${rootI} to root ${rootJ}`, rootI, [`${rootI}-${rootJ}`]);
      }
    } else {
      snapshot('UNION', `Nodes ${i} and ${j} are already in the same set (Root ${rootI}).`, null);
    }
  };

  operations.forEach(op => {
    if (op.type === 'UNION') {
      union(op.u, op.v);
    } else if (op.type === 'FIND') {
      find(op.u);
    }
  });

  snapshot('DONE', 'Operations complete.');

  return steps;
};