
# DSA Visualizer

An interactive, front-end-only web application built with React to visualize core Data Structures and Algorithms.
This project focuses on helping users understand algorithmic logic through step-by-step animations and user-driven simulations.

---

## Features

* Interactive algorithm visualizations
* User-controlled inputs and configurations
* Step-by-step execution with animation control
* Clean UI focused on learning and clarity
* No backend or external APIs

---

## Algorithms Implemented

### 1. Dijkstra’s Algorithm (Graph)

* Users can dynamically add nodes and weighted edges
* Select source and destination nodes
* Visualizes shortest path computation
* Adjustable animation speed (slow to fast)
* Highlights:

  * Visited nodes
  * Edge relaxations
  * Final shortest path

Concepts covered:

* Graph representation
* Priority queue logic
* Greedy algorithm behavior

---

### 2. Rat in a Maze (Backtracking)

* Customizable grid size
* Users can toggle walls and open cells
* Start and destination selection
* Visualizes:

  * Recursive exploration
  * Dead ends
  * Backtracking steps
* Displays one valid path if it exists

Concepts covered:

* Recursion
* Backtracking
* State undoing
* Depth-first search behavior

---

### 3. 0/1 Knapsack (Dynamic Programming)

* Users can add items with weights and values
* Adjustable knapsack capacity
* Step-by-step DP table construction
* Highlights:

  * Take vs skip decisions
  * State transitions
  * Final optimal item selection

Concepts covered:

* Dynamic programming
* Optimal substructure
* Decision-based optimization

---

### 4. Disjoint Set Union (DSU / Union-Find)

* Visualizes multiple disjoint sets as trees
* Supports:

  * Find operation
  * Union operation
* Optional optimizations:

  * Path compression
  * Union by rank / size
* Displays parent and rank arrays dynamically

Concepts covered:

* Tree-based data structures
* Amortized time complexity
* Graph connectivity foundations

---

## Tech Stack

* React (Functional Components)
* JavaScript (ES6+)
* HTML5
* CSS / Tailwind CSS
* Vite
* Git & GitHub

---

## Project Structure

```
src/
 ├── pages/
 │    ├── DijkstraPage.jsx
 │    ├── RatInMazePage.jsx
 │    ├── KnapsackPage.jsx
 │    └── DSUPage.jsx
 ├── components/
 ├── utils/
 ├── App.jsx
 └── main.jsx
```

---

## Getting Started

### Prerequisites

* Node.js
* npm or yarn

### Installation

```bash
git clone https://github.com/your-username/dsa-visualizer.git
cd dsa-visualizer
npm install
npm run dev
```

---

## Learning Outcomes

* Strengthened understanding of core DSA concepts
* Practical experience with algorithm visualization
* Improved ability to explain algorithms clearly in interviews
* Front-end state management for complex logic

---

## Future Enhancements

* Add more graph algorithms (BFS, DFS, Kruskal)
* Export steps as code or logs
* Add time and space complexity indicators
* Mobile-friendly enhancements

---

## Author

Pratik Pankaj
B.Tech Information Technology, DTU

