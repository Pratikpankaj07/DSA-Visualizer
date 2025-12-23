export const generateMazeSteps = (grid, startPos, endPos) => {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;

  // Directions: Down, Right, Up, Left
  const directions = [
    { dr: 1, dc: 0, name: 'Down' },
    { dr: 0, dc: 1, name: 'Right' },
    { dr: -1, dc: 0, name: 'Up' },
    { dr: 0, dc: -1, name: 'Left' }
  ];

  // Global visited set for the recursion path tracking
  // In backtracking, we mark visited, recurse, then UNMARK (backtrack).
  // But for "Steps", we want to show the history.
  // We need to simulate the stack state.

  const visitedOnCurrentPath = new Set();

  const isValid = (r, c) => {
    return r >= 0 && r < rows && c >= 0 && c < cols &&
      grid[r][c] === 1 && // 1 is open, 0 is wall
      !visitedOnCurrentPath.has(`${r},${c}`);
  };

  const solve = (r, c, pathStack) => {
    // 1. Record move
    steps.push({
      r, c,
      status: 'VISITING',
      path: [...pathStack, [r, c]],
      message: `Moving to (${r}, ${c})`
    });

    // 2. Check Solution
    if (r === endPos.r && c === endPos.c) {
      steps.push({
        r, c,
        status: 'FOUND',
        path: [...pathStack, [r, c]],
        message: 'Destination Reached!'
      });
      return true;
    }

    // 3. Mark visited (add to current path)
    visitedOnCurrentPath.add(`${r},${c}`);
    pathStack.push([r, c]);

    // 4. Explore neighbors
    for (let { dr, dc, name } of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (isValid(nr, nc)) {
        if (solve(nr, nc, pathStack)) return true;
      } else {
        // Visualize hitting a wall if it is in bounds but blocked
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0) {
          steps.push({
            r: nr, c: nc,
            status: 'BLOCKED',
            path: [...pathStack],
            message: `Blocked at (${nr}, ${nc})`
          });
        }
      }
    }

    // 5. Backtrack (Unmark and retreat)
    visitedOnCurrentPath.delete(`${r},${c}`);
    pathStack.pop();

    steps.push({
      r, c,
      status: 'BACKTRACK',
      path: [...pathStack],
      message: `Backtracking from (${r}, ${c})...`
    });

    return false;
  };

  // Start
  if (grid[startPos.r][startPos.c] === 0) {
    steps.push({ r: startPos.r, c: startPos.c, status: 'FAILED', path: [], message: 'Start position is blocked!' });
    return steps;
  }

  const found = solve(startPos.r, startPos.c, []);

  if (!found) {
    steps.push({
      r: startPos.r, c: startPos.c,
      status: 'FAILED',
      path: [],
      message: 'No path found to destination.'
    });
  }

  return steps;
};