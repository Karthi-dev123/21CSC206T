# 🔴🟡 Connect 4 AI — Minimax with Alpha-Beta Pruning

An interactive Connect 4 game featuring an AI opponent powered by the **Minimax algorithm** with **Alpha-Beta Pruning**. Built as a practical implementation of adversarial search concepts from Artificial Intelligence (Unit 3 — Adversarial Search Problems and Intelligent Agents).

> **Course**: Artificial Intelligence — SRM University, Kattankulathur  
> **School**: School of Computing
>
> try it out : 
<img width="2000" height="2000" alt="Connect 4 game" src="https://github.com/user-attachments/assets/ae128ccd-2008-48c1-b5e3-01fb348de01f" />

---

## 📸 Screenshots

<!-- Add your screenshots here -->
<!-- ![Game Board](./screenshots/gameplay.png) -->
<img width="1227" height="817" alt="image" src="https://github.com/user-attachments/assets/a28e409b-02c8-42f0-adab-33ff22743ed6" />


<img width="1070" height="772" alt="image" src="https://github.com/user-attachments/assets/8f2cde06-0f0a-4a81-9e70-68fefe071f26" />

<!-- ![AI Analytics](./screenshots/analytics.png) -->
<img width="1022" height="694" alt="image" src="https://github.com/user-attachments/assets/42c67980-7f88-4163-95bd-73defe9a44f7" />

<!-- ![Win State](./screenshots/win.png) -->

---

## 🎯 Overview

This project implements a **human vs AI** Connect 4 game where the AI uses game tree search to determine optimal moves. The AI evaluates thousands of possible future board states using the Minimax algorithm and accelerates the process with Alpha-Beta Pruning, which eliminates branches of the game tree that cannot influence the final decision.

The application includes a **real-time analytics panel** that exposes the AI's decision-making process — showing nodes explored, nodes pruned, pruning efficiency, evaluation scores, and thinking time — making the underlying algorithms transparent and observable.

---

## 🧠 AI Concepts Implemented

### Minimax Algorithm
A recursive, depth-first search algorithm for two-player zero-sum games. The **maximizing player** (AI) picks the move with the highest evaluation, while the **minimizing player** (human) is assumed to pick the move with the lowest evaluation. This adversarial assumption ensures the AI plays optimally against a rational opponent.

### Alpha-Beta Pruning
An optimization over standard Minimax that maintains two values — **alpha** (best score the maximizer can guarantee) and **beta** (best score the minimizer can guarantee). When `alpha >= beta`, the current branch is pruned since it cannot produce a better outcome. This dramatically reduces the number of nodes evaluated without affecting the result.

### Evaluation Function
When the search tree is too deep to fully explore, a **heuristic evaluation function** scores intermediate board positions based on:
- **Center column control** — pieces in the center have more potential connections
- **Window scoring** — evaluates every possible 4-cell window for threats and opportunities
- **Threat detection** — prioritizes blocking opponent's 3-in-a-row setups

### Search Depth & Difficulty
| Difficulty | Search Depth | Behavior |
|------------|-------------|----------|
| Easy       | 3 levels    | Plays casually, misses some threats |
| Medium     | 5 levels    | Strong play, catches most setups |
| Hard       | 7 levels    | Near-optimal, extremely difficult to beat |

---

## 🗂️ Project Structure

```
connect4-ai/
├── index.html            # Entry HTML file
├── package.json          # Project dependencies & scripts
├── vite.config.js        # Vite build configuration
├── public/
│   └── vite.svg          # Favicon
├── src/
│   ├── main.jsx          # React mount point
│   └── App.jsx           # Complete game — AI engine + UI
└── README.md
```

The entire game logic (Minimax, Alpha-Beta, evaluation function) and UI are contained in a **single file** (`src/App.jsx`) for simplicity and portability.

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher) — [Download here](https://nodejs.org/)
- **npm** (comes bundled with Node.js)

### Steps

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd connect4-ai
```

**2. Install dependencies**
```bash
npm install
```

**3. Start the development server**
```bash
npm run dev
```

**4. Open in browser**
```
http://localhost:5173
```

### Build for Production
```bash
npm run build
```
The optimized output will be in the `dist/` folder, ready to deploy anywhere.

---

## 🎮 How to Play

1. **Select a difficulty** — Easy, Medium, or Hard
2. **Click a column** to drop your red piece
3. The **AI (yellow)** responds automatically using Minimax search
4. **Connect 4 pieces** in a row (horizontal, vertical, or diagonal) to win
5. Watch the **AI Analytics panel** to see the search algorithm in action

---

## 📊 AI Analytics Panel

The real-time stats panel exposes the AI's decision-making on every move:

| Metric | Description |
|--------|-------------|
| **Nodes Explored** | Total game states evaluated in the search tree |
| **Nodes Pruned** | Branches eliminated by Alpha-Beta pruning |
| **Pruning Efficiency** | Percentage of nodes skipped (higher = more efficient) |
| **Think Time** | Wall-clock time for the AI to decide (in ms) |
| **Best Score** | The AI's evaluation of its chosen move |
| **Move Log** | Full history of player and AI moves |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React** | UI components & state management |
| **Vite** | Build tool & dev server |
| **JavaScript** | AI engine (Minimax, Alpha-Beta, evaluation) |
| **CSS-in-JS** | Styling (inline styles, no external dependencies) |
| **Google Fonts** | Outfit (headings) + JetBrains Mono (stats) |

---

## 📚 References

- Russell, S. & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.) — Chapter 5: Adversarial Search
- Galli, K. — [How to Program Connect 4 AI (Minimax Algorithm)](https://www.youtube.com/watch?v=MMLtza3CZFM)
- [Alpha-Beta Pruning — Wikipedia](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)
- [Minimax Algorithm in Game Theory — GeeksForGeeks](https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-1-introduction/)

---

## 📝 License

This project was built for academic purposes as part of the AI course curriculum.

