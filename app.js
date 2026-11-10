const MODES_CORE = [
  { id: "chess", name: "Шахматы", tip: "Ходи фигурами. Взятие даёт очки по силе фигуры." },
  { id: "checkers", name: "Шашки", tip: "Ходи по диагонали. Рубка даёт очки." },
  { id: "sea", name: "Морской бой", tip: "Стреляй по сетке врага. Попал — очки." },
  { id: "xo", name: "Крестики-нолики", tip: "Собери линию из 3. Победа раунда = крупный бонус." },
  { id: "memory", name: "Memory", tip: "Открывай пары. Каждая пара — очки." },
];
const MODES = [...MODES_CORE, ...(window.MORPH_EXTRA?.MODES || [])];

const PIECE_VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const PIECE_ICON = {
  P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕", K: "♔",
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚",
};

const state = {
  you: 0,
  ai: 0,
  mode: null,
  turn: "you",
  locked: false,
  intervalMode: "20",
  morphLeft: 20,
  morphTotal: 20,
  morphTimer: null,
  history: [],
  bonus: null,
  modeState: null,
};

function $(id) { return document.getElementById(id); }

function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.toggle("active", p.id === id));
}

function toastHelp(text) { $("helpText").textContent = text; }

function lead() {
  if (state.you === state.ai) return null;
  return state.you > state.ai ? "you" : "ai";
}

function leadGap() {
  return Math.abs(state.you - state.ai);
}

function updateScores() {
  $("scoreYou").textContent = state.you;
  $("scoreAi").textContent = state.ai;
  const total = Math.max(1, state.you + state.ai);
  const y = (state.you / total) * 100;
  const a = (state.ai / total) * 100;
  $("advYou").style.width = `${y}%`;
  $("advAi").style.width = `${a}%`;
  const L = lead();
  $("advText").textContent = !L
    ? "равная партия"
    : L === "you"
      ? `твоё преимущество +${leadGap()}`
      : `давление ИИ +${leadGap()}`;
}

function setTurn(who) {
  state.turn = who;
  $("turnPill").textContent = who === "you" ? "Твой ход" : "Ход ИИ";
  $("turnPill").style.color = who === "you" ? "var(--you)" : "var(--ai)";
}

function addScore(who, pts, why) {
  if (pts <= 0) return;
  state[who] += pts;
  updateScores();
  toastHelp(`${who === "you" ? "Ты" : "ИИ"} +${pts}${why ? ` · ${why}` : ""}`);
  if (state.you >= 40 || state.ai >= 40) setTimeout(endGame, 900);
}

function nextInterval() {
  if (state.intervalMode === "random") return 12 + Math.floor(Math.random() * 17);
  return Number(state.intervalMode);
}

function updateMorphUI() {
  $("morphSec").textContent = String(Math.max(0, Math.ceil(state.morphLeft)));
  const pct = state.morphLeft / state.morphTotal;
  $("morphArc").style.strokeDashoffset = String(150 - 150 * pct);
}

function stopMorphTimer() {
  clearInterval(state.morphTimer);
  state.morphTimer = null;
}

function startMorphTimer() {
  stopMorphTimer();
  state.morphTotal = nextInterval();
  state.morphLeft = state.morphTotal;
  updateMorphUI();
  state.morphTimer = setInterval(() => {
    state.morphLeft -= 0.25;
    updateMorphUI();
    if (state.morphLeft <= 0) morphToRandom();
  }, 250);
}

function pickRandomMode(except) {
  const pool = MODES.filter((m) => m.id !== except);
  return pool[Math.floor(Math.random() * pool.length)];
}

function advantageBonus(modeId) {
  const L = lead();
  if (!L || leadGap() < 2) return { who: null, text: "Бонусов нет — почти равный счёт" };
  const gap = leadGap();
  const strong = gap >= 6;
  const map = {
    chess: {
      you: strong ? "Лидер получает ферзя вместо коня" : "Лидер ходит первым + темп",
      ai: strong ? "ИИ получает ферзя вместо коня" : "ИИ ходит первым",
    },
    checkers: {
      you: strong ? "Твоя шашка становится дамкой" : "Ты ходишь первым",
      ai: strong ? "У ИИ появляется дамка" : "ИИ ходит первым",
    },
    sea: {
      you: strong ? "Бесплатный выстрел по врагу" : "Открыта 1 клетка врага",
      ai: strong ? "ИИ получает бесплатный выстрел" : "ИИ видит 1 твою клетку",
    },
    xo: {
      you: strong ? "Центр уже твой" : "Ты ставишь первым",
      ai: strong ? "Центр у ИИ" : "ИИ ставит первым",
    },
    memory: {
      you: strong ? "Пара подсвечена на старте" : "Ты открываешь первым",
      ai: strong ? "ИИ видит пару на старте" : "ИИ открывает первым",
    },
  };
  const bonus = { who: L, strong, gap };
  if (map[modeId]) bonus.text = map[modeId][L];
  else if (window.MORPH_EXTRA?.bonusText) bonus.text = window.MORPH_EXTRA.bonusText(modeId, bonus);
  else bonus.text = L === "you" ? "Ты входишь с преимуществом" : "ИИ входит с преимуществом";
  return bonus;
}

async function morphToRandom(forcedId) {
  if (state.locked) return;
  state.locked = true;
  stopMorphTimer();

  const next = forcedId ? MODES.find((m) => m.id === forcedId) : pickRandomMode(state.mode);
  const bonus = advantageBonus(next.id);
  state.bonus = bonus;

  $("morphName").textContent = next.name;
  $("morphBonus").textContent = bonus.text;
  $("morphOverlay").hidden = false;

  await wait(1400);
  $("morphOverlay").hidden = true;

  state.history.push(next.name);
  startMode(next.id, bonus);
  state.locked = false;
  startMorphTimer();
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clearBoard() {
  const board = $("board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = "";
  return board;
}

function startMode(modeId, bonus) {
  state.mode = modeId;
  const meta = MODES.find((m) => m.id === modeId);
  $("modeLabel").textContent = meta.name;
  toastHelp(meta.tip);
  $("bonusPill").hidden = !bonus?.who;
  if (bonus?.who) {
    $("bonusPill").hidden = false;
    $("bonusPill").textContent = bonus.text;
  }

  if (modeId === "chess") initChess(bonus);
  else if (modeId === "checkers") initCheckers(bonus);
  else if (modeId === "sea") initSea(bonus);
  else if (modeId === "xo") initXO(bonus);
  else if (modeId === "memory") initMemory(bonus);
  else if (window.MORPH_EXTRA?.INIT?.[modeId]) window.MORPH_EXTRA.INIT[modeId](bonus);
}

/* ===================== CHESS ===================== */
function initChess(bonus) {
  const N = 5;
  const empty = () => Array.from({ length: N }, () => Array(N).fill(null));
  const board = empty();
  // rows: 0 AI back, 4 you back
  board[0] = ["r", "n", "q", "n", "k"];
  board[1] = ["p", "p", "p", "p", "p"];
  board[3] = ["P", "P", "P", "P", "P"];
  board[4] = ["R", "N", "Q", "N", "K"];

  if (bonus?.who === "you" && bonus.strong) board[4][1] = "Q";
  if (bonus?.who === "ai" && bonus.strong) board[0][1] = "q";

  state.modeState = { type: "chess", N, board, selected: null, over: false };
  const first = bonus?.who === "ai" ? "ai" : "you";
  setTurn(first);
  renderChess();
  if (first === "ai") setTimeout(aiChessMove, 500);
}

function isWhite(p) { return p && p === p.toUpperCase(); }
function isBlack(p) { return p && p === p.toLowerCase(); }

function chessMoves(r, c, board, N) {
  const p = board[r][c];
  if (!p) return [];
  const moves = [];
  const enemy = isWhite(p) ? isBlack : isWhite;
  const ray = (dr, dc) => {
    let rr = r + dr, cc = c + dc;
    while (rr >= 0 && cc >= 0 && rr < N && cc < N) {
      if (!board[rr][cc]) moves.push([rr, cc]);
      else { if (enemy(board[rr][cc])) moves.push([rr, cc]); break; }
      rr += dr; cc += dc;
    }
  };
  const t = p.toLowerCase();
  if (t === "p") {
    const dir = isWhite(p) ? -1 : 1;
    if (r + dir >= 0 && r + dir < N && !board[r + dir][c]) moves.push([r + dir, c]);
    if (board[r + dir]?.[c - 1] && enemy(board[r + dir][c - 1])) moves.push([r + dir, c - 1]);
    if (board[r + dir]?.[c + 1] && enemy(board[r + dir][c + 1])) moves.push([r + dir, c + 1]);
  }
  if (t === "n") {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= N || cc >= N) return;
      if (!board[rr][cc] || enemy(board[rr][cc])) moves.push([rr, cc]);
    });
  }
  if (t === "b" || t === "q") { ray(-1,-1); ray(-1,1); ray(1,-1); ray(1,1); }
  if (t === "r" || t === "q") { ray(-1,0); ray(1,0); ray(0,-1); ray(0,1); }
  if (t === "k") {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
      if (!board[rr][cc] || enemy(board[rr][cc])) moves.push([rr, cc]);
    }
  }
  return moves;
}

function renderChess() {
  const { N, board, selected } = state.modeState;
  const el = clearBoard();
  el.style.gridTemplateColumns = `repeat(${N}, 54px)`;
  let valids = [];
  if (selected) valids = chessMoves(selected[0], selected[1], board, N);

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const btn = document.createElement("button");
      btn.className = `cell ${(r + c) % 2 ? "dark" : "light"}`;
      const p = board[r][c];
      btn.textContent = p ? PIECE_ICON[p] : "";
      if (selected && selected[0] === r && selected[1] === c) btn.classList.add("selected");
      if (valids.some(([vr, vc]) => vr === r && vc === c)) btn.classList.add("valid");
      btn.addEventListener("click", () => onChessClick(r, c));
      el.appendChild(btn);
    }
  }
}

function onChessClick(r, c) {
  if (state.turn !== "you" || state.locked) return;
  const S = state.modeState;
  const p = S.board[r][c];
  if (S.selected) {
    const moves = chessMoves(S.selected[0], S.selected[1], S.board, S.N);
    if (moves.some(([vr, vc]) => vr === r && vc === c)) {
      doChessMove(S.selected[0], S.selected[1], r, c, "you");
      return;
    }
  }
  if (p && isWhite(p)) {
    S.selected = [r, c];
    renderChess();
  } else {
    S.selected = null;
    renderChess();
  }
}

function doChessMove(r1, c1, r2, c2, who) {
  const S = state.modeState;
  const target = S.board[r2][c2];
  const piece = S.board[r1][c1];
  S.board[r2][c2] = piece;
  S.board[r1][c1] = null;
  S.selected = null;
  if (target) {
    const val = PIECE_VAL[target.toLowerCase()] || 1;
    if (target.toLowerCase() === "k") {
      addScore(who, 15, "шах и мат-бонус");
      renderChess();
      setTimeout(() => morphToRandom(), 700);
      return;
    }
    addScore(who, Math.max(1, val), `взял ${PIECE_ICON[target]}`);
  } else if (who === "you") {
    toastHelp("Ход сделан");
  }
  renderChess();
  setTurn(who === "you" ? "ai" : "you");
  if (who === "you") setTimeout(aiChessMove, 450);
}

function aiChessMove() {
  if (state.mode !== "chess" || state.turn !== "ai") return;
  const S = state.modeState;
  const options = [];
  for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
    const p = S.board[r][c];
    if (!p || !isBlack(p)) continue;
    chessMoves(r, c, S.board, S.N).forEach(([rr, cc]) => {
      const t = S.board[rr][cc];
      const score = t ? (PIECE_VAL[t.toLowerCase()] || 1) * 10 : Math.random();
      options.push({ r, c, rr, cc, score });
    });
  }
  if (!options.length) { setTurn("you"); return; }
  options.sort((a, b) => b.score - a.score);
  const pick = options[Math.floor(Math.random() * Math.min(3, options.length))];
  doChessMove(pick.r, pick.c, pick.rr, pick.cc, "ai");
}

/* ===================== CHECKERS ===================== */
function initCheckers(bonus) {
  const N = 6;
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  for (let r = 0; r < 2; r++) for (let c = 0; c < N; c++) if ((r + c) % 2) board[r][c] = "a";
  for (let r = N - 2; r < N; r++) for (let c = 0; c < N; c++) if ((r + c) % 2) board[r][c] = "y";

  if (bonus?.who === "you" && bonus.strong) {
    for (let r = N - 1; r >= 0; r--) for (let c = 0; c < N; c++) if (board[r][c] === "y") { board[r][c] = "Y"; r = -1; break; }
  }
  if (bonus?.who === "ai" && bonus.strong) {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (board[r][c] === "a") { board[r][c] = "A"; r = N; break; }
  }

  state.modeState = { type: "checkers", N, board, selected: null };
  const first = bonus?.who === "ai" ? "ai" : "you";
  setTurn(first);
  renderCheckers();
  if (first === "ai") setTimeout(aiCheckersMove, 500);
}

function checkerMoves(r, c, board, N, who) {
  const p = board[r][c];
  if (!p) return [];
  const mine = who === "you" ? ["y", "Y"] : ["a", "A"];
  if (!mine.includes(p)) return [];
  const king = p === "Y" || p === "A";
  const dirs = king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : who === "you" ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];
  const moves = [];
  const jumps = [];
  dirs.forEach(([dr, dc]) => {
    const rr = r + dr, cc = c + dc;
    if (rr < 0 || cc < 0 || rr >= N || cc >= N) return;
    if (!board[rr][cc]) moves.push({ r: rr, c: cc });
    else {
      const enemy = who === "you" ? ["a", "A"] : ["y", "Y"];
      if (enemy.includes(board[rr][cc])) {
        const jr = rr + dr, jc = cc + dc;
        if (jr >= 0 && jc >= 0 && jr < N && jc < N && !board[jr][jc]) {
          jumps.push({ r: jr, c: jc, capR: rr, capC: cc });
        }
      }
    }
  });
  return jumps.length ? jumps : moves;
}

function renderCheckers() {
  const { N, board, selected } = state.modeState;
  const el = clearBoard();
  el.style.gridTemplateColumns = `repeat(${N}, 48px)`;
  let valids = [];
  if (selected) valids = checkerMoves(selected[0], selected[1], board, N, "you");

  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const btn = document.createElement("button");
    btn.className = `cell ${(r + c) % 2 ? "dark" : "light"}`;
    const p = board[r][c];
    if (p === "y") btn.textContent = "●";
    if (p === "Y") btn.textContent = "♛";
    if (p === "a") btn.textContent = "○";
    if (p === "A") btn.textContent = "♔";
    if (p === "y" || p === "Y") btn.classList.add("you-mark");
    if (p === "a" || p === "A") btn.classList.add("ai-mark");
    if (selected && selected[0] === r && selected[1] === c) btn.classList.add("selected");
    if (valids.some((v) => v.r === r && v.c === c)) btn.classList.add("valid");
    btn.addEventListener("click", () => onCheckersClick(r, c));
    el.appendChild(btn);
  }
}

function onCheckersClick(r, c) {
  if (state.turn !== "you" || state.locked) return;
  const S = state.modeState;
  const p = S.board[r][c];
  if (S.selected) {
    const moves = checkerMoves(S.selected[0], S.selected[1], S.board, S.N, "you");
    const m = moves.find((v) => v.r === r && v.c === c);
    if (m) { doCheckersMove(S.selected[0], S.selected[1], m, "you"); return; }
  }
  if (p === "y" || p === "Y") { S.selected = [r, c]; renderCheckers(); }
  else { S.selected = null; renderCheckers(); }
}

function doCheckersMove(r1, c1, move, who) {
  const S = state.modeState;
  let piece = S.board[r1][c1];
  S.board[r1][c1] = null;
  if (move.capR != null) {
    S.board[move.capR][move.capC] = null;
    addScore(who, 3, "рубка");
  }
  if (who === "you" && move.r === 0) piece = "Y";
  if (who === "ai" && move.r === S.N - 1) piece = "A";
  S.board[move.r][move.c] = piece;
  S.selected = null;
  renderCheckers();
  setTurn(who === "you" ? "ai" : "you");
  if (who === "you") setTimeout(aiCheckersMove, 450);
}

function aiCheckersMove() {
  if (state.mode !== "checkers" || state.turn !== "ai") return;
  const S = state.modeState;
  const options = [];
  for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
    const p = S.board[r][c];
    if (p !== "a" && p !== "A") continue;
    checkerMoves(r, c, S.board, S.N, "ai").forEach((m) => {
      options.push({ r, c, m, score: m.capR != null ? 10 : Math.random() });
    });
  }
  if (!options.length) { setTurn("you"); return; }
  options.sort((a, b) => b.score - a.score);
  const pick = options[0];
  doCheckersMove(pick.r, pick.c, pick.m, "ai");
}

/* ===================== SEA BATTLE ===================== */
function placeShips(N, sizes) {
  const grid = Array.from({ length: N }, () => Array(N).fill(0));
  const cells = [];
  for (const len of sizes) {
    let ok = false;
    for (let tries = 0; tries < 80 && !ok; tries++) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * N);
      const c = Math.floor(Math.random() * N);
      const spots = [];
      for (let i = 0; i < len; i++) {
        const rr = horiz ? r : r + i;
        const cc = horiz ? c + i : c;
        if (rr >= N || cc >= N || grid[rr][cc]) { spots.length = 0; break; }
        spots.push([rr, cc]);
      }
      if (spots.length === len) {
        spots.forEach(([rr, cc]) => { grid[rr][cc] = 1; cells.push(`${rr},${cc}`); });
        ok = true;
      }
    }
  }
  return { grid, cells: new Set(cells) };
}

function initSea(bonus) {
  const N = 6;
  const you = placeShips(N, [3, 2, 2]);
  const ai = placeShips(N, [3, 2, 2]);
  const shotsYou = Array.from({ length: N }, () => Array(N).fill(0)); // on enemy
  const shotsAi = Array.from({ length: N }, () => Array(N).fill(0));

  state.modeState = {
    type: "sea", N, you, ai, shotsYou, shotsAi, view: "attack",
  };

  // apply bonus
  if (bonus?.who === "you") {
    if (bonus.strong) {
      // free shot after render
      setTimeout(() => freeSeaShot("you"), 300);
    } else {
      revealOne(ai.grid, shotsYou, N);
    }
  }
  if (bonus?.who === "ai") {
    if (bonus.strong) setTimeout(() => freeSeaShot("ai"), 400);
    else revealOne(you.grid, shotsAi, N);
  }

  setTurn(bonus?.who === "ai" ? "ai" : "you");
  renderSea();
  if (state.turn === "ai") setTimeout(aiSeaShot, 600);
}

function revealOne(grid, shots, N) {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (grid[r][c] && !shots[r][c]) { shots[r][c] = 2; return; }
  }
}

function freeSeaShot(who) {
  const S = state.modeState;
  if (!S || S.type !== "sea") return;
  const targetGrid = who === "you" ? S.ai.grid : S.you.grid;
  const shots = who === "you" ? S.shotsYou : S.shotsAi;
  for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
    if (targetGrid[r][c] && !shots[r][c]) {
      applySeaShot(r, c, who, true);
      return;
    }
  }
}

function renderSea() {
  const S = state.modeState;
  const el = clearBoard();
  el.style.gridTemplateColumns = `repeat(${S.N}, 48px)`;
  toastHelp(state.turn === "you" ? "Твой выстрел по вражескому полю" : "ИИ целится…");
  for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
    const btn = document.createElement("button");
    const shot = S.shotsYou[r][c];
    btn.className = "cell sea";
    if (shot === 1) { btn.classList.add("miss"); btn.textContent = "•"; }
    if (shot === 2) { btn.classList.add("hit"); btn.textContent = "✕"; }
    btn.disabled = state.turn !== "you" || !!shot;
    btn.addEventListener("click", () => {
      if (state.turn !== "you" || shot) return;
      applySeaShot(r, c, "you", false);
    });
    el.appendChild(btn);
  }
}

function applySeaShot(r, c, who, free) {
  const S = state.modeState;
  if (!S || S.type !== "sea") return;
  const enemy = who === "you" ? S.ai : S.you;
  const shots = who === "you" ? S.shotsYou : S.shotsAi;
  if (shots[r][c]) return;
  const hit = enemy.grid[r][c] === 1;
  shots[r][c] = hit ? 2 : 1;
  if (hit) {
    enemy.cells.delete(`${r},${c}`);
    addScore(who, free ? 4 : 3, hit ? "попадание" : "");
    if (enemy.cells.size === 0) {
      addScore(who, 10, "флот уничтожен");
      renderSea();
      setTimeout(() => morphToRandom(), 700);
      return;
    }
  } else if (!free) {
    toastHelp(who === "you" ? "Мимо" : "ИИ промахнулся");
  }
  renderSea();
  if (!free) {
    setTurn(who === "you" ? "ai" : "you");
    if (who === "you") setTimeout(aiSeaShot, 550);
  }
}

function aiSeaShot() {
  if (state.mode !== "sea" || state.turn !== "ai") return;
  const S = state.modeState;
  const opts = [];
  for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) if (!S.shotsAi[r][c]) opts.push([r, c]);
  if (!opts.length) return;
  // prefer adjacent to hits
  let pick = opts[Math.floor(Math.random() * opts.length)];
  for (const [r, c] of opts) {
    const near = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(([rr,cc]) => S.shotsAi[rr]?.[cc] === 2);
    if (near) { pick = [r, c]; break; }
  }
  applySeaShot(pick[0], pick[1], "ai", false);
}

/* ===================== XO ===================== */
function initXO(bonus) {
  const board = Array(9).fill(null);
  if (bonus?.who === "you" && bonus.strong) board[4] = "X";
  if (bonus?.who === "ai" && bonus.strong) board[4] = "O";
  state.modeState = { type: "xo", board, done: false };
  const first = bonus?.who === "ai" && !bonus.strong ? "ai" : bonus?.who === "ai" && bonus.strong ? "you" : "you";
  // if AI has center, you still play; if AI should go first without strong, AI first
  let who = "you";
  if (bonus?.who === "ai" && !bonus.strong) who = "ai";
  if (bonus?.who === "you") who = "you";
  setTurn(who);
  renderXO();
  if (who === "ai") setTimeout(aiXO, 400);
}

function renderXO() {
  const S = state.modeState;
  const el = clearBoard();
  el.style.gridTemplateColumns = "repeat(3, 88px)";
  S.board.forEach((v, i) => {
    const btn = document.createElement("button");
    btn.className = "cell light";
    btn.textContent = v === "X" ? "✕" : v === "O" ? "○" : "";
    if (v === "X") btn.classList.add("you-mark");
    if (v === "O") btn.classList.add("ai-mark");
    btn.disabled = !!v || state.turn !== "you" || S.done;
    btn.addEventListener("click", () => {
      if (state.turn !== "you" || S.board[i] || S.done) return;
      S.board[i] = "X";
      afterXO("you");
    });
    el.appendChild(btn);
  });
}

function winnerXO(b) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b1,c] of lines) if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  if (b.every(Boolean)) return "draw";
  return null;
}

function afterXO(who) {
  const S = state.modeState;
  renderXO();
  const w = winnerXO(S.board);
  if (w === "X") {
    S.done = true;
    addScore("you", 8, "линия!");
    setTimeout(() => morphToRandom(), 800);
    return;
  }
  if (w === "O") {
    S.done = true;
    addScore("ai", 8, "линия!");
    setTimeout(() => morphToRandom(), 800);
    return;
  }
  if (w === "draw") {
    S.done = true;
    addScore("you", 1, "ничья");
    addScore("ai", 1, "ничья");
    setTimeout(() => morphToRandom(), 700);
    return;
  }
  setTurn(who === "you" ? "ai" : "you");
  if (who === "you") setTimeout(aiXO, 400);
}

function aiXO() {
  if (state.mode !== "xo" || state.turn !== "ai") return;
  const S = state.modeState;
  const empties = S.board.map((v, i) => (v ? null : i)).filter((x) => x != null);
  // win / block
  const tryWin = (mark) => {
    for (const i of empties) {
      const copy = S.board.slice();
      copy[i] = mark;
      if (winnerXO(copy) === mark) return i;
    }
    return null;
  };
  let i = tryWin("O");
  if (i == null) i = tryWin("X");
  if (i == null) i = empties.includes(4) ? 4 : empties[Math.floor(Math.random() * empties.length)];
  S.board[i] = "O";
  afterXO("ai");
}

/* ===================== MEMORY ===================== */
function initMemory(bonus) {
  const icons = ["🌟", "🔥", "💎", "🎯", "🚀", "🎵"];
  const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
  const cards = deck.map((icon, i) => ({ id: i, icon, open: false, matched: false }));
  state.modeState = { type: "memory", cards, flip: [], busy: false };

  if (bonus?.who && bonus.strong) {
    // reveal one matching pair briefly
    const icon = icons[0];
    const pair = cards.filter((c) => c.icon === icon);
    pair.forEach((c) => (c.open = true));
    setTimeout(() => {
      pair.forEach((c) => (c.open = false));
      renderMemory();
    }, 900);
  }

  const first = bonus?.who === "ai" && !bonus.strong ? "ai" : "you";
  setTurn(first);
  renderMemory();
  if (first === "ai") setTimeout(aiMemory, 500);
}

function renderMemory() {
  const S = state.modeState;
  const el = clearBoard();
  el.style.gridTemplateColumns = "repeat(4, 70px)";
  S.cards.forEach((card, i) => {
    const btn = document.createElement("button");
    btn.className = "cell mem";
    if (card.open || card.matched) btn.classList.add("open");
    if (card.matched) btn.classList.add("matched");
    btn.textContent = card.open || card.matched ? card.icon : "?";
    btn.disabled = card.matched || card.open || state.turn !== "you" || S.busy;
    btn.addEventListener("click", () => onMemoryClick(i));
    el.appendChild(btn);
  });
}

function onMemoryClick(i) {
  const S = state.modeState;
  if (state.turn !== "you" || S.busy) return;
  const card = S.cards[i];
  if (card.open || card.matched) return;
  card.open = true;
  S.flip.push(i);
  renderMemory();
  if (S.flip.length === 2) resolveMemoryFlip("you");
}

function resolveMemoryFlip(who) {
  const S = state.modeState;
  S.busy = true;
  const [a, b] = S.flip;
  const ca = S.cards[a];
  const cb = S.cards[b];
  setTimeout(() => {
    if (ca.icon === cb.icon) {
      ca.matched = cb.matched = true;
      addScore(who, 4, "пара");
      if (S.cards.every((c) => c.matched)) {
        addScore(who, 5, "доска очищена");
        S.busy = false;
        S.flip = [];
        renderMemory();
        setTimeout(() => morphToRandom(), 700);
        return;
      }
    } else {
      ca.open = cb.open = false;
    }
    S.flip = [];
    S.busy = false;
    renderMemory();
    setTurn(who === "you" ? "ai" : "you");
    if (who === "you") setTimeout(aiMemory, 500);
  }, 650);
}

function aiMemory() {
  if (state.mode !== "memory" || state.turn !== "ai") return;
  const S = state.modeState;
  const closed = S.cards.map((c, i) => (!c.matched && !c.open ? i : null)).filter((x) => x != null);
  if (closed.length < 2) return;
  const i1 = closed[Math.floor(Math.random() * closed.length)];
  let i2 = closed[Math.floor(Math.random() * closed.length)];
  while (i2 === i1) i2 = closed[Math.floor(Math.random() * closed.length)];
  // light memory: if known match exists among open history — skip for simplicity
  S.cards[i1].open = true;
  S.cards[i2].open = true;
  S.flip = [i1, i2];
  renderMemory();
  resolveMemoryFlip("ai");
}

/* ===================== FLOW ===================== */
function startGame() {
  state.you = 0;
  state.ai = 0;
  state.history = [];
  state.intervalMode = $("intervalSelect").value;
  updateScores();
  showPage("page-game");
  const opp = $("oppLabel");
  if (opp) opp.textContent = "ИИ";
  const first = MODES[Math.floor(Math.random() * MODES.length)];
  state.history.push(first.name);
  startMode(first.id, { who: null, text: "" });
  startMorphTimer();
}

function endGame() {
  stopMorphTimer();
  $("finalYou").textContent = state.you;
  $("finalAi").textContent = state.ai;
  const L = lead();
  $("resultTitle").textContent = !L ? "Ничья" : L === "you" ? "Победа" : "Поражение";
  $("resultSub").textContent = !L
    ? "Счёт равный после всех морфов"
    : L === "you"
      ? "Ты удержал преимущество через смены режимов"
      : "ИИ перехватил инициативу между стилями";
  $("history").innerHTML = state.history.map((h) => `<span>${h}</span>`).join("");
  showPage("page-result");
}

function renderMenuPreview() {
  $("modePreview").innerHTML = MODES.map((m) => `<span>${m.name}</span>`).join("");
}

$("startBtn").addEventListener("click", startGame);
$("againBtn").addEventListener("click", () => {
  if (window.MorphOnline?.net?.active) return;
  startGame();
});
$("quitBtn").addEventListener("click", () => {
  stopMorphTimer();
  if (window.MorphOnline?.net?.connected) window.MorphOnline.cleanupPeer();
  showPage("page-menu");
  const opp = $("oppLabel") || $("scoreAi").parentElement.querySelector("span");
  if (opp) opp.textContent = "ИИ";
});
$("morphNow").addEventListener("click", () => morphToRandom());

$("onlineBtn")?.addEventListener("click", () => window.MorphOnline.openLobby());
$("onlineBackBtn")?.addEventListener("click", () => {
  window.MorphOnline.cleanupPeer();
  showPage("page-menu");
});
$("createRoomBtn")?.addEventListener("click", () => window.MorphOnline.createRoom());
$("joinRoomBtn")?.addEventListener("click", () => window.MorphOnline.joinRoom());
$("onlineStartBtn")?.addEventListener("click", () => window.MorphOnline.startHostMatch());
$("copyRoomBtn")?.addEventListener("click", async () => {
  const code = $("roomCodeOut").textContent.trim();
  try {
    await navigator.clipboard.writeText(code);
    $("onlineStatus").textContent = "Код скопирован";
    $("onlineStatus").className = "online-status ok";
  } catch (_) {
    $("onlineStatus").textContent = code;
  }
});

window.MorphAPI = {
  get state() { return state; },
  clearBoard,
  setTurn,
  addScore,
  toastHelp,
  morphToRandom,
};

renderMenuPreview();
