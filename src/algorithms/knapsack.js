export const generateKnapsackSteps = (items, capacity) => {
  const steps = [];
  const n = items.length;
  // dp[i][w]
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));

  steps.push({
    i: 0, w: 0, dp: JSON.parse(JSON.stringify(dp)),
    action: 'INIT',
    message: 'Initialized DP table with 0s.'
  });

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      const { weight, value } = items[i - 1];

      // Snapshot: Compare
      // We store comparison values so the UI can show: max(dp[i-1][w], val + dp[i-1][w-weight])
      const valWithout = dp[i - 1][w];
      let valWith = -1;
      let canTake = false;

      if (weight <= w) {
        canTake = true;
        valWith = value + dp[i - 1][w - weight];
        dp[i][w] = Math.max(valWithout, valWith);
      } else {
        dp[i][w] = valWithout;
      }

      steps.push({
        i, w,
        dp: JSON.parse(JSON.stringify(dp)), // Full snapshot is expensive but easy for React
        action: 'COMPARE',
        compare: {
          valWithout,
          valWith: canTake ? valWith : null,
          canTake,
          weight,
          value,
          prevIndex: i - 1,
          loadIndex: canTake ? w - weight : null
        },
        message: canTake
          ? `Checking: Skip (${valWithout}) vs Take (${value} + ${dp[i - 1][w - weight]} = ${valWith})`
          : `Item too heavy (${weight} > ${w}). Skipping.`
      });
    }
  }

  // Backtracking Logic
  const selected = [];
  let i = n, w = capacity;
  const pathCells = [];

  while (i > 0 && w > 0) {
    pathCells.push({ r: i, c: w }); // Track cells in the solution path
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(i - 1);
      w -= items[i - 1].weight;
    }
    i--;
  }

  // Add 0th row cell to path if needed visually, but usually we stop at i=0

  steps.push({
    i: -1, w: -1,
    dp: JSON.parse(JSON.stringify(dp)),
    action: 'FINISHED',
    selected: selected.reverse(),
    pathCells,
    message: `Max Value: ${dp[n][capacity]}. Selected Items highlighted.`
  });

  return steps;
};