export const generateDijkstraSteps = (nodes, edges, startId, endId) => {
  const steps = [];
  const distances = {};
  const previous = {};
  const visited = new Set();
  const pq = [{ id: startId, dist: 0 }];
  
  // Init
  nodes.forEach(n => distances[n.id] = Infinity);
  distances[startId] = 0;

  steps.push({
    type: 'INIT',
    distances: { ...distances },
    visited: new Set(visited),
    currentNode: null,
    path: [],
    message: 'Initialize all distances to Infinity, Source to 0.'
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { id: currentId, dist: currentDist } = pq.shift();

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Snapshot: Visit Node
    steps.push({
      type: 'VISIT',
      currentNode: currentId,
      distances: { ...distances },
      visited: new Set(visited),
      path: [],
      message: `Visiting Node ${currentId} (Distance: ${currentDist})`
    });

    if (currentId === endId) break;

    const neighbors = edges.filter(e => e.from === currentId);
    
    for (let edge of neighbors) {
      if (!visited.has(edge.to)) {
        const newDist = currentDist + edge.weight;
        
        if (newDist < distances[edge.to]) {
          distances[edge.to] = newDist;
          previous[edge.to] = currentId;
          pq.push({ id: edge.to, dist: newDist });
          
          // Snapshot: Relax Edge
          steps.push({
            type: 'UPDATE',
            currentNode: currentId,
            distances: { ...distances },
            visited: new Set(visited),
            path: [],
            message: `Relaxing edge ${currentId}→${edge.to}. Updating dist to ${newDist}.`
          });
        }
      }
    }
  }
  
  // Reconstruct path
  const path = [];
  let curr = endId;
  if (distances[endId] !== Infinity) {
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  steps.push({
    type: 'FINISHED',
    distances: { ...distances },
    visited: new Set(visited),
    currentNode: null,
    path,
    message: `Shortest Path Found: ${path.join(' → ')} (Cost: ${distances[endId]})`
  });

  return steps;
};