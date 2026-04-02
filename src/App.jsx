import { useState, useCallback, useEffect, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;
const WIN_LENGTH = 4;

// ─── AI Engine: Minimax with Alpha-Beta Pruning ─────────────────────────────

let aiStats = { nodesExplored: 0, nodesPruned: 0, startTime: 0 };

function getValidColumns(board) {
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === EMPTY) cols.push(c);
  }
  return cols;
}

function getNextOpenRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) return r;
  }
  return -1;
}

function dropPiece(board, row, col, piece) {
  const newBoard = board.map((r) => [...r]);
  newBoard[row][col] = piece;
  return newBoard;
}

function checkWin(board, piece) {
  // Horizontal
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (
        board[r][c] === piece &&
        board[r][c + 1] === piece &&
        board[r][c + 2] === piece &&
        board[r][c + 3] === piece
      )
        return true;
  // Vertical
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c < COLS; c++)
      if (
        board[r][c] === piece &&
        board[r + 1][c] === piece &&
        board[r + 2][c] === piece &&
        board[r + 3][c] === piece
      )
        return true;
  // Diagonal ↘
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (
        board[r][c] === piece &&
        board[r + 1][c + 1] === piece &&
        board[r + 2][c + 2] === piece &&
        board[r + 3][c + 3] === piece
      )
        return true;
  // Diagonal ↗
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (
        board[r][c] === piece &&
        board[r - 1][c + 1] === piece &&
        board[r - 2][c + 2] === piece &&
        board[r - 3][c + 3] === piece
      )
        return true;
  return false;
}

function getWinningCells(board, piece) {
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r][c + 1] === piece && board[r][c + 2] === piece && board[r][c + 3] === piece)
        cells.push([r, c], [r, c + 1], [r, c + 2], [r, c + 3]);
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c] === piece && board[r + 1][c] === piece && board[r + 2][c] === piece && board[r + 3][c] === piece)
        cells.push([r, c], [r + 1, c], [r + 2, c], [r + 3, c]);
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r + 1][c + 1] === piece && board[r + 2][c + 2] === piece && board[r + 3][c + 3] === piece)
        cells.push([r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]);
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r - 1][c + 1] === piece && board[r - 2][c + 2] === piece && board[r - 3][c + 3] === piece)
        cells.push([r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]);
  return cells;
}

function isTerminal(board) {
  return (
    checkWin(board, PLAYER) ||
    checkWin(board, AI) ||
    getValidColumns(board).length === 0
  );
}

function evaluateWindow(window, piece) {
  const opp = piece === AI ? PLAYER : AI;
  const pieceCount = window.filter((v) => v === piece).length;
  const emptyCount = window.filter((v) => v === EMPTY).length;
  const oppCount = window.filter((v) => v === opp).length;

  if (pieceCount === 4) return 100;
  if (pieceCount === 3 && emptyCount === 1) return 5;
  if (pieceCount === 2 && emptyCount === 2) return 2;
  if (oppCount === 3 && emptyCount === 1) return -4;
  return 0;
}

function scorePosition(board, piece) {
  let score = 0;
  // Center column preference
  const centerCol = Math.floor(COLS / 2);
  const centerCount = board.reduce(
    (acc, row) => acc + (row[centerCol] === piece ? 1 : 0),
    0
  );
  score += centerCount * 3;

  // Horizontal windows
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += evaluateWindow(board[r].slice(c, c + 4), piece);

  // Vertical windows
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - 4; r++) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(window, piece);
    }

  // Diagonal ↘
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(window, piece);
    }

  // Diagonal ↗
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++) {
      const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += evaluateWindow(window, piece);
    }

  return score;
}

function minimax(board, depth, alpha, beta, isMaximizing) {
  aiStats.nodesExplored++;
  const validCols = getValidColumns(board);
  const terminal = isTerminal(board);

  if (depth === 0 || terminal) {
    if (terminal) {
      if (checkWin(board, AI)) return [null, 100000000];
      if (checkWin(board, PLAYER)) return [null, -100000000];
      return [null, 0];
    }
    return [null, scorePosition(board, AI)];
  }

  if (isMaximizing) {
    let value = -Infinity;
    let bestCol = validCols[Math.floor(Math.random() * validCols.length)];
    for (const col of validCols) {
      const row = getNextOpenRow(board, col);
      const newBoard = dropPiece(board, row, col, AI);
      const newScore = minimax(newBoard, depth - 1, alpha, beta, false)[1];
      if (newScore > value) {
        value = newScore;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) {
        aiStats.nodesPruned++;
        break;
      }
    }
    return [bestCol, value];
  } else {
    let value = Infinity;
    let bestCol = validCols[Math.floor(Math.random() * validCols.length)];
    for (const col of validCols) {
      const row = getNextOpenRow(board, col);
      const newBoard = dropPiece(board, row, col, PLAYER);
      const newScore = minimax(newBoard, depth - 1, alpha, beta, true)[1];
      if (newScore < value) {
        value = newScore;
        bestCol = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) {
        aiStats.nodesPruned++;
        break;
      }
    }
    return [bestCol, value];
  }
}

function getBestMove(board, depth) {
  aiStats = { nodesExplored: 0, nodesPruned: 0, startTime: performance.now() };
  const [col, score] = minimax(board, depth, -Infinity, Infinity, true);
  const elapsed = performance.now() - aiStats.startTime;
  return {
    column: col,
    score,
    nodesExplored: aiStats.nodesExplored,
    nodesPruned: aiStats.nodesPruned,
    thinkingTime: elapsed,
  };
}

// ─── React Component ─────────────────────────────────────────────────────────

const DIFFICULTIES = [
  { label: "Easy", depth: 3, desc: "Looks 3 moves ahead" },
  { label: "Medium", depth: 5, desc: "Looks 5 moves ahead" },
  { label: "Hard", depth: 7, desc: "Looks 7 moves ahead" },
];

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

export default function Connect4AI() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [hoverCol, setHoverCol] = useState(-1);
  const [stats, setStats] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [winCells, setWinCells] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [animatingRow, setAnimatingRow] = useState(null);
  const [animatingCol, setAnimatingCol] = useState(null);
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const boardRef = useRef(null);

  const isWinCell = (r, c) => winCells.some(([wr, wc]) => wr === r && wc === c);

  const handleColumnClick = useCallback(
    (col) => {
      if (gameOver || currentPlayer !== PLAYER || aiThinking) return;
      const row = getNextOpenRow(board, col);
      if (row === -1) return;

      setAnimatingRow(row);
      setAnimatingCol(col);
      setAnimatingPiece(PLAYER);

      setTimeout(() => {
        const newBoard = dropPiece(board, row, col, PLAYER);
        setBoard(newBoard);
        setLastMove([row, col]);
        setMoveHistory((h) => [...h, { player: "You", col: col + 1 }]);
        setAnimatingRow(null);
        setAnimatingCol(null);
        setAnimatingPiece(null);

        if (checkWin(newBoard, PLAYER)) {
          setGameOver(true);
          setWinner(PLAYER);
          setWinCells(getWinningCells(newBoard, PLAYER));
          return;
        }
        if (getValidColumns(newBoard).length === 0) {
          setGameOver(true);
          return;
        }
        setCurrentPlayer(AI);
      }, 300);
    },
    [board, currentPlayer, gameOver, aiThinking]
  );

  useEffect(() => {
    if (currentPlayer !== AI || gameOver) return;
    setAiThinking(true);

    const timer = setTimeout(() => {
      const depth = DIFFICULTIES[difficulty].depth;
      const result = getBestMove(board, depth);
      const col = result.column;
      const row = getNextOpenRow(board, col);

      setStats(result);
      setAnimatingRow(row);
      setAnimatingCol(col);
      setAnimatingPiece(AI);

      setTimeout(() => {
        const newBoard = dropPiece(board, row, col, AI);
        setBoard(newBoard);
        setLastMove([row, col]);
        setMoveHistory((h) => [...h, { player: "AI", col: col + 1 }]);
        setAnimatingRow(null);
        setAnimatingCol(null);
        setAnimatingPiece(null);
        setAiThinking(false);

        if (checkWin(newBoard, AI)) {
          setGameOver(true);
          setWinner(AI);
          setWinCells(getWinningCells(newBoard, AI));
          return;
        }
        if (getValidColumns(newBoard).length === 0) {
          setGameOver(true);
          return;
        }
        setCurrentPlayer(PLAYER);
      }, 300);
    }, 200);

    return () => clearTimeout(timer);
  }, [currentPlayer, gameOver, board, difficulty]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER);
    setGameOver(false);
    setWinner(null);
    setStats(null);
    setHoverCol(-1);
    setLastMove(null);
    setWinCells([]);
    setMoveHistory([]);
    setAiThinking(false);
    setAnimatingRow(null);
    setAnimatingCol(null);
    setAnimatingPiece(null);
  };

  const statusText = gameOver
    ? winner === PLAYER
      ? "You Win!"
      : winner === AI
        ? "AI Wins!"
        : "Draw!"
    : aiThinking
      ? "AI is thinking..."
      : "Your turn — drop a piece";

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes dropIn {
          0% { transform: translateY(-480px); opacity: 0.8; }
          60% { transform: translateY(8px); }
          80% { transform: translateY(-4px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes winPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.12); filter: brightness(1.4); }
        }
        @keyframes thinking {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bgShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,59,48,0.15); }
          50% { box-shadow: 0 0 40px rgba(255,59,48,0.3); }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div>
            <h1 style={styles.title}>CONNECT<span style={styles.titleAccent}>4</span></h1>
            <p style={styles.subtitle}>Minimax AI with Alpha-Beta Pruning</p>
          </div>
        </div>

        {/* Difficulty */}
        <div style={styles.difficultyRow}>
          {DIFFICULTIES.map((d, i) => (
            <button
              key={i}
              onClick={() => { if (!aiThinking) { setDifficulty(i); resetGame(); } }}
              style={{
                ...styles.diffBtn,
                ...(difficulty === i ? styles.diffBtnActive : {}),
              }}
            >
              <span style={styles.diffLabel}>{d.label}</span>
              <span style={styles.diffDesc}>{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Area ── */}
      <div style={styles.mainArea}>
        {/* Board */}
        <div style={styles.boardWrapper}>
          {/* Status */}
          <div style={{
            ...styles.statusBar,
            background: gameOver
              ? winner === PLAYER ? 'linear-gradient(135deg, #34c759, #30d158)' : winner === AI ? 'linear-gradient(135deg, #ff3b30, #ff453a)' : 'linear-gradient(135deg, #8e8e93, #aeaeb2)'
              : aiThinking ? 'linear-gradient(135deg, #ff9f0a, #ffb340)' : 'linear-gradient(135deg, #007aff, #0a84ff)',
          }}>
            <div style={styles.statusDot(aiThinking)} />
            <span style={styles.statusText}>{statusText}</span>
          </div>

          {/* Column hover indicators */}
          <div style={styles.hoverRow}>
            {Array.from({ length: COLS }, (_, c) => (
              <div
                key={c}
                style={styles.hoverCell}
                onMouseEnter={() => !gameOver && !aiThinking && setHoverCol(c)}
                onMouseLeave={() => setHoverCol(-1)}
                onClick={() => handleColumnClick(c)}
              >
                <div style={{
                  ...styles.hoverPiece,
                  opacity: hoverCol === c && !gameOver && !aiThinking ? 1 : 0,
                  transform: hoverCol === c ? 'scale(1)' : 'scale(0.6)',
                }} />
              </div>
            ))}
          </div>

          {/* Board grid */}
          <div ref={boardRef} style={styles.board}>
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isWin = isWinCell(r, c);
                const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;
                const isAnimating = animatingRow === r && animatingCol === c;
                return (
                  <div
                    key={`${r}-${c}`}
                    style={styles.cellOuter}
                    onMouseEnter={() => !gameOver && !aiThinking && setHoverCol(c)}
                    onMouseLeave={() => setHoverCol(-1)}
                    onClick={() => handleColumnClick(c)}
                  >
                    <div style={{
                      ...styles.cell,
                      ...(hoverCol === c && !gameOver && !aiThinking ? styles.cellHover : {}),
                    }}>
                      <div
                        style={{
                          ...styles.piece,
                          ...(cell === PLAYER ? styles.playerPiece : cell === AI ? styles.aiPiece : styles.emptyPiece),
                          ...(isAnimating ? {
                            animation: 'dropIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                            ...(animatingPiece === PLAYER ? styles.playerPiece : styles.aiPiece),
                          } : {}),
                          ...(isWin ? { animation: 'winPulse 0.8s ease-in-out infinite' } : {}),
                          ...(isLast && !isWin ? { boxShadow: cell === PLAYER ? '0 0 0 3px rgba(255,59,48,0.5)' : '0 0 0 3px rgba(255,204,0,0.5)' } : {}),
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Column numbers */}
          <div style={styles.colNumbers}>
            {Array.from({ length: COLS }, (_, c) => (
              <span key={c} style={styles.colNum}>{c + 1}</span>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div style={styles.statsPanel}>
          <div style={styles.statsPanelInner}>
            <h3 style={styles.statsTitle}>AI Analytics</h3>
            <p style={styles.statsSubtitle}>Unit 3 — Adversarial Search</p>

            <div style={styles.conceptBox}>
              <div style={styles.conceptLabel}>Algorithm</div>
              <div style={styles.conceptValue}>Minimax + α-β Pruning</div>
            </div>

            <div style={styles.conceptBox}>
              <div style={styles.conceptLabel}>Search Depth</div>
              <div style={styles.conceptValue}>{DIFFICULTIES[difficulty].depth} levels deep</div>
            </div>

            {stats ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={styles.divider} />
                <h4 style={styles.lastMoveTitle}>Last AI Move</h4>

                <div style={styles.statGrid}>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>{stats.nodesExplored.toLocaleString()}</div>
                    <div style={styles.statLabel}>Nodes Explored</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statNumber, color: '#34c759' }}>{stats.nodesPruned.toLocaleString()}</div>
                    <div style={styles.statLabel}>Nodes Pruned</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>{stats.thinkingTime.toFixed(1)}ms</div>
                    <div style={styles.statLabel}>Think Time</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statNumber, color: '#ff9f0a' }}>{stats.score > 99999 ? '∞' : stats.score < -99999 ? '-∞' : stats.score}</div>
                    <div style={styles.statLabel}>Best Score</div>
                  </div>
                </div>

                {stats.nodesExplored > 0 && (
                  <div style={styles.pruneBar}>
                    <div style={styles.pruneLabel}>
                      Pruning efficiency: <strong>{((stats.nodesPruned / (stats.nodesExplored + stats.nodesPruned)) * 100).toFixed(1)}%</strong>
                    </div>
                    <div style={styles.pruneTrack}>
                      <div style={{
                        ...styles.pruneFill,
                        width: `${(stats.nodesPruned / (stats.nodesExplored + stats.nodesPruned)) * 100}%`,
                      }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.noStats}>
                <p style={styles.noStatsText}>Make a move to see AI analytics</p>
              </div>
            )}

            <div style={styles.divider} />

            {/* Move History */}
            <h4 style={styles.lastMoveTitle}>Move Log</h4>
            <div style={styles.moveLog}>
              {moveHistory.length === 0 ? (
                <p style={styles.noStatsText}>No moves yet</p>
              ) : (
                moveHistory.slice(-10).map((m, i) => (
                  <div key={i} style={{
                    ...styles.moveEntry,
                    animation: `slideIn 0.2s ease ${i * 0.03}s both`,
                  }}>
                    <div style={{
                      ...styles.moveDot,
                      background: m.player === 'You' ? '#ff3b30' : '#ffcc00',
                    }} />
                    <span style={styles.moveText}>
                      <strong>{m.player}</strong> → Column {m.col}
                    </span>
                    <span style={styles.moveNum}>#{moveHistory.indexOf(m) + 1}</span>
                  </div>
                ))
              )}
            </div>

            <button onClick={resetGame} style={styles.resetBtn}>
              New Game
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span>AI Concepts: <strong>Minimax</strong> · <strong>Alpha-Beta Pruning</strong> · <strong>Evaluation Functions</strong> · <strong>Game Trees</strong></span>
        <span style={styles.footerUnit}>Unit 3 — Adversarial Search & Intelligent Agents</span>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  container: {
    fontFamily: "'Outfit', -apple-system, sans-serif",
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#e5e5ea",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 20px 12px",
    gap: "20px",
    overflow: "auto",
  },
  header: {
    textAlign: "center",
    width: "100%",
    maxWidth: "900px",
  },
  titleRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: "clamp(28px, 5vw, 40px)",
    fontWeight: 900,
    margin: 0,
    letterSpacing: "-1.5px",
    color: "#ffffff",
  },
  titleAccent: {
    background: "linear-gradient(135deg, #ff3b30, #ff9500)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginLeft: "2px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#8e8e93",
    margin: "4px 0 0",
    fontWeight: 400,
    letterSpacing: "0.5px",
  },
  difficultyRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  diffBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "8px 20px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    transition: "all 0.2s ease",
    color: "#8e8e93",
  },
  diffBtnActive: {
    background: "rgba(0,122,255,0.15)",
    borderColor: "#007aff",
    color: "#fff",
  },
  diffLabel: {
    fontSize: "14px",
    fontWeight: 700,
  },
  diffDesc: {
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    opacity: 0.7,
  },
  mainArea: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "920px",
  },
  boardWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 24px",
    borderRadius: "14px 14px 0 0",
    width: "100%",
    boxSizing: "border-box",
    justifyContent: "center",
  },
  statusDot: (thinking) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#fff",
    ...(thinking ? { animation: "thinking 1s ease infinite" } : {}),
  }),
  statusText: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "0.3px",
  },
  hoverRow: {
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
    width: "100%",
    background: "#12121a",
  },
  hoverCell: {
    display: "flex",
    justifyContent: "center",
    padding: "6px 0",
    cursor: "pointer",
  },
  hoverPiece: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "radial-gradient(circle at 35% 35%, #ff6b6b, #ff3b30)",
    transition: "all 0.15s ease",
    boxShadow: "0 2px 12px rgba(255,59,48,0.4)",
  },
  board: {
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
    gap: "0",
    background: "linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)",
    padding: "12px",
    borderRadius: "0 0 18px 18px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderTop: "none",
  },
  cellOuter: {
    padding: "4px",
    cursor: "pointer",
  },
  cell: {
    width: "clamp(42px, 8vw, 60px)",
    height: "clamp(42px, 8vw, 60px)",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s ease",
    border: "2px solid rgba(255,255,255,0.04)",
  },
  cellHover: {
    background: "rgba(0,122,255,0.1)",
    borderColor: "rgba(0,122,255,0.2)",
  },
  piece: {
    width: "85%",
    height: "85%",
    borderRadius: "50%",
    transition: "all 0.15s ease",
  },
  emptyPiece: {
    background: "transparent",
  },
  playerPiece: {
    background: "radial-gradient(circle at 35% 35%, #ff6b6b, #d32f2f)",
    boxShadow: "0 3px 12px rgba(255,59,48,0.4), inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)",
  },
  aiPiece: {
    background: "radial-gradient(circle at 35% 35%, #ffe066, #f9a825)",
    boxShadow: "0 3px 12px rgba(255,204,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)",
  },
  colNumbers: {
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
    width: "100%",
    paddingTop: "6px",
  },
  colNum: {
    textAlign: "center",
    fontSize: "11px",
    color: "#48484a",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 500,
  },
  statsPanel: {
    width: "280px",
    flexShrink: 0,
  },
  statsPanelInner: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "20px",
  },
  statsTitle: {
    margin: "0 0 2px",
    fontSize: "18px",
    fontWeight: 800,
    color: "#fff",
  },
  statsSubtitle: {
    margin: "0 0 16px",
    fontSize: "11px",
    color: "#636366",
    fontFamily: "'JetBrains Mono', monospace",
  },
  conceptBox: {
    background: "rgba(0,122,255,0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "8px",
    border: "1px solid rgba(0,122,255,0.12)",
  },
  conceptLabel: {
    fontSize: "10px",
    color: "#8e8e93",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: 600,
    marginBottom: "2px",
  },
  conceptValue: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#fff",
    fontFamily: "'JetBrains Mono', monospace",
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "16px 0",
  },
  lastMoveTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#aeaeb2",
    margin: "0 0 12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  statCard: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: "10px",
    padding: "12px 10px",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "20px",
    fontWeight: 800,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#007aff",
  },
  statLabel: {
    fontSize: "9px",
    color: "#636366",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginTop: "4px",
    fontWeight: 600,
  },
  pruneBar: {
    marginTop: "12px",
  },
  pruneLabel: {
    fontSize: "11px",
    color: "#8e8e93",
    marginBottom: "6px",
  },
  pruneTrack: {
    height: "6px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  pruneFill: {
    height: "100%",
    background: "linear-gradient(90deg, #34c759, #30d158)",
    borderRadius: "3px",
    transition: "width 0.4s ease",
  },
  noStats: {
    padding: "20px 0",
    textAlign: "center",
  },
  noStatsText: {
    fontSize: "12px",
    color: "#48484a",
    margin: 0,
  },
  moveLog: {
    maxHeight: "150px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    scrollbarWidth: "none",
  },
  moveEntry: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "8px",
    fontSize: "12px",
  },
  moveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  moveText: {
    flex: 1,
    color: "#aeaeb2",
  },
  moveNum: {
    fontSize: "10px",
    color: "#48484a",
    fontFamily: "'JetBrains Mono', monospace",
  },
  resetBtn: {
    width: "100%",
    marginTop: "16px",
    padding: "12px",
    background: "linear-gradient(135deg, #ff3b30, #ff453a)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.5px",
    transition: "all 0.2s ease",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#48484a",
    paddingTop: "8px",
  },
  footerUnit: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "#3a3a3c",
  },
};
