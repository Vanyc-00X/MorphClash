/* MorphClash Online — PeerJS P2P rooms (host-authoritative) */
window.MorphOnline = (() => {
  const PREFIX = "morphclash-";
  const ONLINE_MODES = [
    { id: "xo", name: "Крестики-нолики" },
    { id: "connect4", name: "4 в ряд" },
    { id: "rps", name: "КНБ" },
    { id: "dice", name: "Кости" },
    { id: "war", name: "Карты" },
    { id: "penalty", name: "Пенальти" },
    { id: "memory", name: "Memory" },
    { id: "quiz", name: "Квиз" },
    { id: "numbers", name: "Числа" },
    { id: "reaction", name: "Реакция" },
    { id: "sea", name: "Морской бой" },
    { id: "archery", name: "Лучник" },
  ];

  const net = {
    active: false,
    role: null, // host | guest
    peer: null,
    conn: null,
    room: null,
    connected: false,
  };

  let match = null;
  let morphTimer = null;

  function $(id) { return document.getElementById(id); }

  function send(msg) {
    if (net.conn && net.conn.open) net.conn.send(msg);
  }

  function codeGen() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return s;
  }

  function setStatus(text, ok) {
    const el = $("onlineStatus");
    if (!el) return;
    el.textContent = text;
    el.className = "online-status" + (ok ? " ok" : "");
  }

  function bindConn(conn) {
    net.conn = conn;
    conn.on("open", () => {
      net.connected = true;
      setStatus("Соперник подключён", true);
      if (net.role === "host") {
        send({ type: "hello", room: net.room });
        $("onlineStartBtn").disabled = false;
      } else {
        setStatus("В комнате · жди старта хоста", true);
      }
    });
    conn.on("data", (data) => onMessage(data));
    conn.on("close", () => {
      net.connected = false;
      setStatus("Соединение потеряно");
      stopMatch(false);
    });
    conn.on("error", () => setStatus("Ошибка канала"));
  }

  async function createRoom() {
    cleanupPeer();
    net.role = "host";
    net.room = codeGen();
    $("roomCodeOut").textContent = net.room;
    $("roomCodeBox").hidden = false;
    $("onlineStartBtn").disabled = true;
    setStatus("Создаём комнату…");

    await loadPeer();
    net.peer = new window.Peer(PREFIX + net.room, { debug: 0 });
    net.peer.on("open", () => setStatus(`Код ${net.room} · ждём игрока`));
    net.peer.on("connection", (conn) => bindConn(conn));
    net.peer.on("error", (e) => setStatus("Ошибка: " + (e.type || e.message || "peer")));
  }

  async function joinRoom() {
    cleanupPeer();
    const code = ($("roomCodeIn").value || "").trim().toUpperCase();
    if (code.length < 4) return setStatus("Введи код комнаты");
    net.role = "guest";
    net.room = code;
    $("roomCodeBox").hidden = true;
    $("onlineStartBtn").disabled = true;
    setStatus("Подключение…");

    await loadPeer();
    net.peer = new window.Peer(undefined, { debug: 0 });
    net.peer.on("open", () => {
      const conn = net.peer.connect(PREFIX + code, { reliable: true });
      bindConn(conn);
    });
    net.peer.on("error", (e) => setStatus("Не удалось войти: " + (e.type || "error")));
  }

  function loadPeer() {
    if (window.Peer) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("PeerJS CDN"));
      document.head.appendChild(s);
    }).catch((e) => {
      setStatus("Не загрузился PeerJS (нужен интернет)");
      throw e;
    });
  }

  function cleanupPeer() {
    stopMorph();
    try { net.conn && net.conn.close(); } catch (_) {}
    try { net.peer && net.peer.destroy(); } catch (_) {}
    net.peer = null;
    net.conn = null;
    net.connected = false;
    net.active = false;
  }

  function stopMatch(showMenu) {
    stopMorph();
    match = null;
    net.active = false;
    if (showMenu !== false) {
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
      $("page-online").classList.add("active");
    }
  }

  function stopMorph() {
    clearInterval(morphTimer);
    morphTimer = null;
  }

  function sideLabel(me) {
    return me ? "Ты" : "Соперник";
  }

  function myKey() {
    return net.role === "host" ? "p1" : "p2";
  }

  function oppKey() {
    return net.role === "host" ? "p2" : "p1";
  }

  function isMyTurn() {
    return match && match.turn === myKey();
  }

  function startHostMatch() {
    if (net.role !== "host" || !net.connected) return;
    const interval = $("intervalSelect").value;
    match = {
      p1: 0,
      p2: 0,
      turn: "p1",
      mode: null,
      history: [],
      interval,
      morphLeft: 20,
      morphTotal: 20,
      locked: false,
      modeState: null,
    };
    net.active = true;
    showGameShell();
    hostMorph(true);
    broadcastSync(true);
    startHostMorphTimer();
  }

  function showGameShell() {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    $("page-game").classList.add("active");
    $("scoreYou").parentElement.querySelector("span").textContent = "Ты";
    const opp = $("oppLabel") || $("scoreAi").parentElement.querySelector("span");
    if (opp) opp.textContent = "Соперник";
    $("morphNow").onclick = () => {
      if (net.role === "host") hostMorph(false);
      else send({ type: "requestMorph" });
    };
    $("quitBtn").onclick = () => {
      send({ type: "quit" });
      cleanupPeer();
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
      $("page-menu").classList.add("active");
    };
  }

  function startHostMorphTimer() {
    stopMorph();
    morphTimer = setInterval(() => {
      if (!match || match.locked) return;
      match.morphLeft -= 0.25;
      paintHud();
      send({ type: "tick", morphLeft: match.morphLeft, morphTotal: match.morphTotal });
      if (match.morphLeft <= 0) hostMorph(false);
    }, 250);
  }

  function nextInterval() {
    if (match.interval === "random") return 12 + Math.floor(Math.random() * 17);
    return Number(match.interval) || 20;
  }

  function hostMorph(first) {
    if (!match || match.locked) return;
    match.locked = true;
    stopMorph();
    const pool = ONLINE_MODES.filter((m) => m.id !== match.mode);
    const next = pool[Math.floor(Math.random() * pool.length)];
    const bonus = makeBonus(next.id);
    match.mode = next.id;
    match.history.push(next.name);
    match.morphTotal = nextInterval();
    match.morphLeft = match.morphTotal;
    match.bonus = bonus;

    paintOverlay(next.name, bonus.text);
    send({ type: "morph", mode: next.id, name: next.name, bonus, p1: match.p1, p2: match.p2, history: match.history });

    setTimeout(() => {
      $("morphOverlay").hidden = true;
      initMode(next.id, bonus, true);
      match.locked = false;
      if (!first) startHostMorphTimer();
      else startHostMorphTimer();
      broadcastSync(true);
    }, 1200);
  }

  function makeBonus(modeId) {
    if (match.p1 === match.p2 || Math.abs(match.p1 - match.p2) < 2) {
      return { who: null, text: "Бонусов нет — равный счёт", strong: false };
    }
    const who = match.p1 > match.p2 ? "p1" : "p2";
    const strong = Math.abs(match.p1 - match.p2) >= 6;
    return {
      who,
      strong,
      text: who === "p1"
        ? (strong ? "Хост входит с сильным бонусом" : "Хост ходит первым")
        : (strong ? "Гость входит с сильным бонусом" : "Гость ходит первым"),
    };
  }

  function paintOverlay(name, bonus) {
    $("morphName").textContent = name;
    $("morphBonus").textContent = bonus || "";
    $("morphOverlay").hidden = false;
  }

  function paintHud() {
    if (!match) return;
    const me = myKey();
    const opp = oppKey();
    $("scoreYou").textContent = match[me];
    $("scoreAi").textContent = match[opp];
    const total = Math.max(1, match.p1 + match.p2);
    $("advYou").style.width = `${(match[me] / total) * 100}%`;
    $("advAi").style.width = `${(match[opp] / total) * 100}%`;
    $("morphSec").textContent = String(Math.max(0, Math.ceil(match.morphLeft)));
    const pct = match.morphLeft / match.morphTotal;
    $("morphArc").style.strokeDashoffset = String(150 - 150 * (pct || 0));
    const meta = ONLINE_MODES.find((m) => m.id === match.mode);
    $("modeLabel").textContent = meta ? meta.name : "—";
    $("turnPill").textContent = isMyTurn() ? "Твой ход" : "Ход соперника";
    $("turnPill").style.color = isMyTurn() ? "var(--you)" : "var(--ai)";
    const lead = match.p1 === match.p2 ? null : match.p1 > match.p2 ? "p1" : "p2";
    $("advText").textContent = !lead
      ? "равная партия"
      : lead === me
        ? `твоё преимущество +${Math.abs(match.p1 - match.p2)}`
        : `давление соперника +${Math.abs(match.p1 - match.p2)}`;
    if (match.bonus?.who) {
      $("bonusPill").hidden = false;
      $("bonusPill").textContent = match.bonus.text;
    } else $("bonusPill").hidden = true;
  }

  function addScore(who, pts, why) {
    if (!match || pts <= 0) return;
    match[who] += pts;
    $("helpText").textContent = `${who === myKey() ? "Ты" : "Соперник"} +${pts}${why ? " · " + why : ""}`;
    paintHud();
    if (net.role === "host") send({ type: "score", p1: match.p1, p2: match.p2, why, who });
    if (match.p1 >= 40 || match.p2 >= 40) endOnline();
  }

  function setTurn(who) {
    match.turn = who;
    paintHud();
    if (net.role === "host") send({ type: "turn", turn: who });
  }

  function broadcastSync(full) {
    if (net.role !== "host" || !match) return;
    send({
      type: "sync",
      p1: match.p1,
      p2: match.p2,
      turn: match.turn,
      mode: match.mode,
      morphLeft: match.morphLeft,
      morphTotal: match.morphTotal,
      history: match.history,
      bonus: match.bonus,
      modeState: full ? match.modeState : undefined,
    });
  }

  function endOnline() {
    stopMorph();
    const me = myKey();
    const opp = oppKey();
    $("finalYou").textContent = match[me];
    $("finalAi").textContent = match[opp];
    const win = match[me] === match[opp] ? null : match[me] > match[opp];
    $("resultTitle").textContent = win == null ? "Ничья" : win ? "Победа" : "Поражение";
    $("resultSub").textContent = "Онлайн-дуэль MorphClash";
    $("history").innerHTML = (match.history || []).map((h) => `<span>${h}</span>`).join("");
    $("scoreAi").parentElement.querySelector("span").textContent = "Соперник";
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    $("page-result").classList.add("active");
    send({ type: "end", p1: match.p1, p2: match.p2, history: match.history });
    net.active = false;
    $("againBtn").onclick = () => {
      if (net.role === "host" && net.connected) startHostMatch();
      else {
        document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
        $("page-online").classList.add("active");
      }
    };
  }

  function onMessage(data) {
    if (!data || !data.type) return;

    if (data.type === "requestMorph" && net.role === "host") return hostMorph(false);
    if (data.type === "quit") {
      setStatus("Соперник вышел");
      cleanupPeer();
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
      $("page-online").classList.add("active");
      return;
    }

    if (net.role === "guest") {
      if (data.type === "morph") {
        showGameShell();
        net.active = true;
        match = match || { p1: 0, p2: 0, turn: "p1", history: [], morphLeft: 20, morphTotal: 20 };
        match.p1 = data.p1; match.p2 = data.p2;
        match.mode = data.mode;
        match.bonus = data.bonus;
        match.history = data.history || [];
        paintOverlay(data.name, data.bonus?.text);
        setTimeout(() => {
          $("morphOverlay").hidden = true;
          initMode(data.mode, data.bonus, false);
          paintHud();
        }, 1200);
      }
      if (data.type === "tick") {
        if (!match) return;
        match.morphLeft = data.morphLeft;
        match.morphTotal = data.morphTotal;
        paintHud();
      }
      if (data.type === "score") {
        match.p1 = data.p1; match.p2 = data.p2;
        paintHud();
      }
      if (data.type === "turn") {
        match.turn = data.turn;
        paintHud();
      }
      if (data.type === "sync") {
        if (!match) match = {};
        Object.assign(match, data);
        if (data.modeState) match.modeState = data.modeState;
        paintHud();
        if (data.modeState) renderMode();
      }
      if (data.type === "state") {
        match.modeState = data.modeState;
        match.turn = data.turn;
        renderMode();
        paintHud();
      }
      if (data.type === "end") {
        match.p1 = data.p1; match.p2 = data.p2; match.history = data.history;
        endOnline();
      }
    }

    if (net.role === "host" && data.type === "input") {
      applyInput(data.input, "p2");
    }
  }

  function emitState() {
    if (net.role !== "host") return;
    send({ type: "state", modeState: match.modeState, turn: match.turn, p1: match.p1, p2: match.p2 });
  }

  function sendInput(input) {
    if (net.role === "host") applyInput(input, "p1");
    else send({ type: "input", input });
  }

  /* ================= modes ================= */
  function initMode(id, bonus, isHostInit) {
    $("helpText").textContent = "Онлайн · " + (ONLINE_MODES.find((m) => m.id === id)?.name || id);
    const first = bonus?.who === "p2" ? "p2" : "p1";
    match.turn = first;
    if (id === "xo") initXO(bonus);
    else if (id === "connect4") initC4(bonus);
    else if (id === "rps") initRps();
    else if (id === "dice") initDice();
    else if (id === "war") initWar();
    else if (id === "penalty") initPenalty();
    else if (id === "memory") initMemory(bonus);
    else if (id === "quiz") initQuiz();
    else if (id === "numbers") initNumbers();
    else if (id === "reaction") initReaction();
    else if (id === "sea") initSea(bonus);
    else if (id === "archery") initArchery(bonus);
    paintHud();
    if (isHostInit) emitState();
  }

  function renderMode() {
    const id = match.mode;
    if (id === "xo") renderXO();
    else if (id === "connect4") renderC4();
    else if (id === "rps") renderRps();
    else if (id === "dice") renderDice();
    else if (id === "war") renderWar();
    else if (id === "penalty") renderPenalty();
    else if (id === "memory") renderMemory();
    else if (id === "quiz") renderQuiz();
    else if (id === "numbers") renderNumbers();
    else if (id === "reaction") renderReaction();
    else if (id === "sea") renderSea();
    else if (id === "archery") renderArchery();
  }

  function board() {
    const el = $("board");
    el.innerHTML = "";
    el.style.gridTemplateColumns = "";
    return el;
  }

  function applyInput(input, who) {
    if (!match || match.locked) return;
    if (match.turn !== who && input.kind !== "react" && input.kind !== "shared") return;
    const id = match.mode;
    if (id === "xo" && input.kind === "cell") xoMove(input.i, who);
    if (id === "connect4" && input.kind === "col") c4Drop(input.c, who);
    if (id === "rps" && input.kind === "rps") rpsPlay(input.choice, who);
    if (id === "dice" && input.kind === "roll") diceRoll();
    if (id === "war" && input.kind === "draw") warDraw();
    if (id === "penalty" && input.kind === "shot") penaltyShot(input.dir, who);
    if (id === "memory" && input.kind === "card") memFlip(input.i, who);
    if (id === "quiz" && input.kind === "answer") quizAnswer(input.i, who);
    if (id === "numbers" && input.kind === "pick") numbersPick(input.v, who);
    if (id === "reaction" && input.kind === "react") reactTap(who);
    if (id === "sea" && input.kind === "fire") seaFire(input.r, input.c, who);
    if (id === "archery" && input.kind === "shoot") archeryShoot(who, input.pos);
    emitState();
  }

  /* XO */
  function initXO(bonus) {
    const cells = Array(9).fill(null);
    if (bonus?.who === "p1" && bonus.strong) cells[4] = "p1";
    if (bonus?.who === "p2" && bonus.strong) cells[4] = "p2";
    match.modeState = { cells, done: false };
    renderXO();
  }
  function renderXO() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "repeat(3, 88px)";
    S.cells.forEach((v, i) => {
      const b = document.createElement("button");
      b.className = "cell light";
      b.textContent = v === "p1" ? "✕" : v === "p2" ? "○" : "";
      if (v === "p1") b.classList.add("you-mark");
      if (v === "p2") b.classList.add("ai-mark");
      b.onclick = () => { if (isMyTurn() && !v && !S.done) sendInput({ kind: "cell", i }); };
      el.appendChild(b);
    });
  }
  function xoMove(i, who) {
    const S = match.modeState;
    if (S.done || S.cells[i]) return;
    S.cells[i] = who;
    renderXO();
    const w = xoWinner(S.cells);
    if (w === "p1" || w === "p2") {
      S.done = true;
      addScore(w, 8, "линия");
      setTimeout(() => net.role === "host" && hostMorph(false), 700);
      return;
    }
    if (w === "draw") {
      S.done = true;
      addScore("p1", 1); addScore("p2", 1);
      setTimeout(() => net.role === "host" && hostMorph(false), 700);
      return;
    }
    setTurn(who === "p1" ? "p2" : "p1");
  }
  function xoWinner(c) {
    const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b,d] of L) if (c[a] && c[a] === c[b] && c[a] === c[d]) return c[a];
    if (c.every(Boolean)) return "draw";
    return null;
  }

  /* Connect4 */
  function initC4(bonus) {
    const R = 6, C = 7;
    const grid = Array.from({ length: R }, () => Array(C).fill(null));
    if (bonus?.who === "p1" && bonus.strong) grid[R - 1][3] = "p1";
    if (bonus?.who === "p2" && bonus.strong) grid[R - 1][3] = "p2";
    match.modeState = { R, C, grid, done: false };
    renderC4();
  }
  function renderC4() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = `repeat(${S.C}, 42px)`;
    for (let r = 0; r < S.R; r++) for (let c = 0; c < S.C; c++) {
      const b = document.createElement("button");
      b.className = "cell dark";
      const v = S.grid[r][c];
      b.textContent = v === "p1" ? "●" : v === "p2" ? "○" : "";
      if (v === myKey()) b.classList.add("you-mark");
      if (v && v !== myKey()) b.classList.add("ai-mark");
      b.onclick = () => { if (isMyTurn() && !S.done) sendInput({ kind: "col", c }); };
      el.appendChild(b);
    }
  }
  function c4Drop(c, who) {
    const S = match.modeState;
    if (S.done) return;
    let row = -1;
    for (let r = S.R - 1; r >= 0; r--) if (!S.grid[r][c]) { row = r; break; }
    if (row < 0) return;
    S.grid[row][c] = who;
    renderC4();
    if (c4win(S.grid, S.R, S.C, who)) {
      S.done = true;
      addScore(who, 8, "4 в ряд");
      setTimeout(() => net.role === "host" && hostMorph(false), 700);
      return;
    }
    setTurn(who === "p1" ? "p2" : "p1");
  }
  function c4win(g, R, C, p) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (g[r][c] !== p) continue;
      for (const [dr, dc] of dirs) {
        let n = 1;
        for (let k = 1; k < 4; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (g[rr]?.[cc] !== p) break;
          n++;
        }
        if (n >= 4) return true;
      }
    }
    return false;
  }

  /* RPS */
  function initRps() {
    match.modeState = { p1: null, p2: null, s1: 0, s2: 0 };
    setTurn("p1");
    renderRps();
  }
  function renderRps() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "repeat(3, 1fr)";
    [["✊","rock"],["✌","scissors"],["🖐","paper"]].forEach(([icon, id]) => {
      const b = document.createElement("button");
      b.className = "cell light";
      b.style.minHeight = "88px";
      b.textContent = icon;
      b.onclick = () => { if (isMyTurn()) sendInput({ kind: "rps", choice: id }); };
      el.appendChild(b);
    });
    $("helpText").textContent = `Серия ${S.s1}:${S.s2} · ${isMyTurn() ? "выбери знак" : "ждём соперника"}`;
  }
  function rpsPlay(choice, who) {
    const S = match.modeState;
    S[who] = choice;
    if (S.p1 && S.p2) {
      const beat = { rock: "scissors", scissors: "paper", paper: "rock" };
      if (S.p1 === S.p2) $("helpText").textContent = "Ничья";
      else if (beat[S.p1] === S.p2) { S.s1++; addScore("p1", 3, "КНБ"); }
      else { S.s2++; addScore("p2", 3, "КНБ"); }
      S.p1 = S.p2 = null;
      if (S.s1 >= 2 || S.s2 >= 2) setTimeout(() => net.role === "host" && hostMorph(false), 600);
      else setTurn("p1");
    } else setTurn(who === "p1" ? "p2" : "p1");
    renderRps();
  }

  /* Dice / War — shared button, host resolves both rolls */
  function initDice() {
    match.modeState = { n: 0, a: 0, b: 0 };
    setTurn("p1");
    renderDice();
  }
  function renderDice() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `<div class="mini-panel"><div class="dice-face" id="onDice">${S.n ? `🎲 ${S.last || ""}` : "🎲"}</div>
      <button class="cell light big-action" id="onDiceBtn">${isMyTurn() ? "Бросить" : "Ждём…"}</button>
      <div class="mini-score">Сумма ${S.a}:${S.b} · ${S.n}/3</div></div>`;
    $("onDiceBtn").onclick = () => { if (isMyTurn()) sendInput({ kind: "roll" }); };
  }
  function diceRoll() {
    if (net.role !== "host") return;
    const S = match.modeState;
    const x = 1 + Math.floor(Math.random() * 6);
    const y = 1 + Math.floor(Math.random() * 6);
    S.a += x; S.b += y; S.n++; S.last = `${x}:${y}`;
    renderDice();
    if (S.n >= 3) {
      if (S.a > S.b) addScore("p1", 6, "кости");
      else if (S.b > S.a) addScore("p2", 6, "кости");
      else { addScore("p1", 2); addScore("p2", 2); }
      setTimeout(() => hostMorph(false), 700);
    } else setTurn(match.turn === "p1" ? "p2" : "p1");
    emitState();
  }

  function initWar() {
    match.modeState = { n: 0 };
    setTurn("p1");
    renderWar();
  }
  function renderWar() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `<div class="mini-panel"><div class="dice-face">${S.last || "🂠 🂠"}</div>
      <button class="cell light big-action" id="onWarBtn">${isMyTurn() ? "Тянуть" : "Ждём…"}</button></div>`;
    $("onWarBtn").onclick = () => { if (isMyTurn()) sendInput({ kind: "draw" }); };
  }
  function warDraw() {
    if (net.role !== "host") return;
    const S = match.modeState;
    const a = 2 + Math.floor(Math.random() * 13);
    const b = 2 + Math.floor(Math.random() * 13);
    S.last = `${a} vs ${b}`;
    S.n++;
    if (a > b) addScore("p1", 3);
    else if (b > a) addScore("p2", 3);
    else { addScore("p1", 1); addScore("p2", 1); }
    renderWar();
    if (S.n >= 4) setTimeout(() => hostMorph(false), 700);
    else setTurn(match.turn === "p1" ? "p2" : "p1");
  }

  /* Penalty */
  function initPenalty() {
    match.modeState = { round: 0 };
    setTurn("p1");
    renderPenalty();
  }
  function renderPenalty() {
    const el = board();
    el.style.gridTemplateColumns = "repeat(3, 1fr)";
    el.innerHTML = `<div class="mini-panel" style="grid-column:1/-1">${isMyTurn() ? "Бить / выбрать угол" : "Ход соперника"}</div>`;
    ["Лево", "Центр", "Право"].forEach((label, dir) => {
      const b = document.createElement("button");
      b.className = "cell light";
      b.style.minHeight = "90px";
      b.textContent = label;
      b.onclick = () => { if (isMyTurn()) sendInput({ kind: "shot", dir }); };
      el.appendChild(b);
    });
  }
  function penaltyShot(dir, who) {
    if (net.role !== "host") return;
    const dive = Math.floor(Math.random() * 3);
    const goal = dir !== dive;
    if (goal) addScore(who, 4, "гол");
    else addScore(who === "p1" ? "p2" : "p1", 2, "сейв");
    match.modeState.round++;
    if (match.modeState.round >= 4) setTimeout(() => hostMorph(false), 600);
    else setTurn(who === "p1" ? "p2" : "p1");
    renderPenalty();
  }

  /* Memory */
  function initMemory() {
    const icons = ["🌟", "🔥", "💎", "🎯", "🚀", "🎵"];
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5).map((icon, id) => ({ id, icon, open: false, matched: false }));
    match.modeState = { cards: deck, flip: [], busy: false };
    setTurn("p1");
    renderMemory();
  }
  function renderMemory() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "repeat(4, 70px)";
    S.cards.forEach((card, i) => {
      const b = document.createElement("button");
      b.className = "cell mem" + (card.open || card.matched ? " open" : "");
      b.textContent = card.open || card.matched ? card.icon : "?";
      b.onclick = () => {
        if (!isMyTurn() || S.busy || card.open || card.matched) return;
        sendInput({ kind: "card", i });
      };
      el.appendChild(b);
    });
  }
  function memFlip(i, who) {
    const S = match.modeState;
    if (S.busy) return;
    const card = S.cards[i];
    if (card.open || card.matched) return;
    card.open = true;
    S.flip.push(i);
    renderMemory();
    emitState();
    if (S.flip.length < 2) return;
    S.busy = true;
    const [a, b] = S.flip;
    setTimeout(() => {
      if (S.cards[a].icon === S.cards[b].icon) {
        S.cards[a].matched = S.cards[b].matched = true;
        addScore(who, 4, "пара");
        if (S.cards.every((c) => c.matched)) {
          addScore(who, 5, "борд");
          setTimeout(() => net.role === "host" && hostMorph(false), 600);
        } else setTurn(who);
      } else {
        S.cards[a].open = S.cards[b].open = false;
        setTurn(who === "p1" ? "p2" : "p1");
      }
      S.flip = [];
      S.busy = false;
      renderMemory();
      emitState();
    }, 550);
  }

  /* Quiz / Numbers */
  const QUIZZES = [
    { q: "2+2×2?", a: ["6", "8", "4"], ok: 0 },
    { q: "Столица Франции?", a: ["Лион", "Париж", "Ницца"], ok: 1 },
    { q: "8×7?", a: ["54", "56", "63"], ok: 1 },
  ];
  function initQuiz() {
    match.modeState = { item: QUIZZES[Math.floor(Math.random() * QUIZZES.length)], answered: {} };
    setTurn("p1");
    renderQuiz();
  }
  function renderQuiz() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `<div class="mini-panel"><div class="dice-face" style="font-size:20px">${S.item.q}</div></div>`;
    S.item.a.forEach((ans, i) => {
      const b = document.createElement("button");
      b.className = "cell light big-action";
      b.textContent = ans;
      b.onclick = () => { if (isMyTurn()) sendInput({ kind: "answer", i }); };
      el.appendChild(b);
    });
  }
  function quizAnswer(i, who) {
    const S = match.modeState;
    if (S.answered[who]) return;
    S.answered[who] = true;
    if (i === S.item.ok) addScore(who, 5, "верно");
    else addScore(who === "p1" ? "p2" : "p1", 2, "ошибка соперника");
    if (S.answered.p1 && S.answered.p2) setTimeout(() => net.role === "host" && hostMorph(false), 700);
    else setTurn(who === "p1" ? "p2" : "p1");
    renderQuiz();
  }

  function initNumbers() {
    match.modeState = { target: 10 + Math.floor(Math.random() * 80), picks: {} };
    setTurn("p1");
    renderNumbers();
  }
  function renderNumbers() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "repeat(5, 1fr)";
    el.innerHTML = `<div class="mini-panel" style="grid-column:1/-1">Цель: <strong>${S.target}</strong></div>`;
    for (let n = 1; n <= 10; n++) {
      const val = n * 10;
      const b = document.createElement("button");
      b.className = "cell light";
      b.textContent = String(val);
      b.onclick = () => { if (isMyTurn()) sendInput({ kind: "pick", v: val }); };
      el.appendChild(b);
    }
  }
  function numbersPick(v, who) {
    const S = match.modeState;
    S.picks[who] = v;
    if (S.picks.p1 != null && S.picks.p2 != null) {
      const d1 = Math.abs(S.picks.p1 - S.target);
      const d2 = Math.abs(S.picks.p2 - S.target);
      if (d1 < d2) addScore("p1", 5, "ближе");
      else if (d2 < d1) addScore("p2", 5, "ближе");
      else { addScore("p1", 2); addScore("p2", 2); }
      setTimeout(() => net.role === "host" && hostMorph(false), 700);
    } else setTurn(who === "p1" ? "p2" : "p1");
  }

  /* Reaction */
  function initReaction() {
    match.modeState = { armed: false, done: false, t0: 0, times: {} };
    setTurn("p1");
    renderReaction();
    if (net.role === "host") {
      setTimeout(() => {
        if (!match || match.mode !== "reaction") return;
        match.modeState.armed = true;
        match.modeState.t0 = Date.now();
        send({ type: "state", modeState: match.modeState, turn: match.turn });
        renderReaction();
      }, 800 + Math.random() * 1400);
    }
  }
  function renderReaction() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "1fr";
    const label = S.done ? "Готово" : S.armed ? "ЖМИ!" : "Жди…";
    el.innerHTML = `<button class="cell light big-action" id="onReact" style="height:160px;font-size:22px;${S.armed && !S.done ? "background:#3a6b2f" : ""}">${label}</button>`;
    $("onReact").onclick = () => sendInput({ kind: "react" });
  }
  function reactTap(who) {
    const S = match.modeState;
    if (S.done) return;
    if (!S.armed) {
      addScore(who === "p1" ? "p2" : "p1", 3, "фальстарт");
      S.done = true;
      setTimeout(() => net.role === "host" && hostMorph(false), 700);
      renderReaction();
      return;
    }
    if (S.times[who] != null) return;
    S.times[who] = Date.now() - S.t0;
    renderReaction();
    if (S.times.p1 != null && S.times.p2 != null) {
      S.done = true;
      if (S.times.p1 < S.times.p2) addScore("p1", 5, `${S.times.p1}мс`);
      else if (S.times.p2 < S.times.p1) addScore("p2", 5, `${S.times.p2}мс`);
      else { addScore("p1", 2); addScore("p2", 2); }
      setTimeout(() => net.role === "host" && hostMorph(false), 800);
    }
  }

  /* Sea */
  function placeShips(N) {
    const grid = Array.from({ length: N }, () => Array(N).fill(0));
    const cells = new Set();
    [3, 2, 2].forEach((len) => {
      for (let t = 0; t < 60; t++) {
        const horiz = Math.random() < 0.5;
        const r = Math.floor(Math.random() * N), c = Math.floor(Math.random() * N);
        const spots = [];
        for (let i = 0; i < len; i++) {
          const rr = horiz ? r : r + i, cc = horiz ? c + i : c;
          if (rr >= N || cc >= N || grid[rr][cc]) { spots.length = 0; break; }
          spots.push([rr, cc]);
        }
        if (spots.length === len) {
          spots.forEach(([rr, cc]) => { grid[rr][cc] = 1; cells.add(rr + "," + cc); });
          break;
        }
      }
    });
    return { grid, cells };
  }
  function initSea(bonus) {
    const N = 5;
    match.modeState = {
      N,
      p1: placeShips(N),
      p2: placeShips(N),
      shots: { p1: Array.from({ length: N }, () => Array(N).fill(0)), p2: Array.from({ length: N }, () => Array(N).fill(0)) },
    };
    if (bonus?.who === "p1" && bonus.strong) {
      // reveal one
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (match.modeState.p2.grid[r][c]) { match.modeState.shots.p1[r][c] = 2; match.modeState.p2.cells.delete(r + "," + c); return renderSea(); }
    }
    renderSea();
  }
  function renderSea() {
    const S = match.modeState;
    const me = myKey();
    const enemy = oppKey();
    const shots = S.shots[me];
    const el = board();
    el.style.gridTemplateColumns = `repeat(${S.N}, 54px)`;
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const b = document.createElement("button");
      b.className = "cell sea";
      const shot = shots[r][c];
      if (shot === 1) { b.classList.add("miss"); b.textContent = "•"; }
      if (shot === 2) { b.classList.add("hit"); b.textContent = "✕"; }
      b.onclick = () => { if (isMyTurn() && !shot) sendInput({ kind: "fire", r, c }); };
      el.appendChild(b);
    }
    $("helpText").textContent = isMyTurn() ? "Твой выстрел" : "Ждём выстрел соперника";
  }
  function seaFire(r, c, who) {
    const S = match.modeState;
    const enemy = who === "p1" ? "p2" : "p1";
    if (S.shots[who][r][c]) return;
    const hit = S[enemy].grid[r][c] === 1;
    S.shots[who][r][c] = hit ? 2 : 1;
    if (hit) {
      S[enemy].cells.delete(r + "," + c);
      addScore(who, 3, "попадание");
      if (S[enemy].cells.size === 0) {
        addScore(who, 8, "флот");
        setTimeout(() => net.role === "host" && hostMorph(false), 700);
      }
    }
    renderSea();
    setTurn(who === "p1" ? "p2" : "p1");
  }

  /* Archery */
  function initArchery(bonus) {
    match.modeState = {
      pos: 0,
      dir: 1,
      zone: bonus?.strong ? 26 : 16,
      running: true,
      shots: {},
    };
    setTurn("p1");
    renderArchery();
    if (net.role === "host") archeryLoop();
  }
  function archeryLoop() {
    const tick = () => {
      if (!match || match.mode !== "archery" || !match.modeState?.running) return;
      const S = match.modeState;
      S.pos += S.dir * 3.2;
      if (S.pos >= 100 || S.pos <= 0) S.dir *= -1;
      const needle = $("aimNeedle");
      if (needle) needle.style.left = S.pos + "%";
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function renderArchery() {
    const S = match.modeState;
    const el = board();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `<div class="mini-panel" style="width:min(300px,100%)">
      <div class="aim-track"><i id="aimZone" style="width:${S.zone}%;left:${50 - S.zone / 2}%"></i><b id="aimNeedle" style="left:${S.pos}%"></b></div>
      <button class="cell light big-action" id="onShoot">${isMyTurn() ? "Выстрел" : "Ждём…"}</button></div>`;
    $("onShoot").onclick = () => {
      if (!isMyTurn()) return;
      sendInput({ kind: "shoot", pos: S.pos });
    };
  }
  function archeryShoot(who) {
    const S = match.modeState;
    // позиция только с хоста — иначе рассинхрон анимации
    const pos = S.pos;
    const hit = Math.abs(pos - 50) <= S.zone / 2;
    S.shots[who] = hit;
    if (hit) addScore(who, 5, "в зону");
    else addScore(who === "p1" ? "p2" : "p1", 2, "мимо");
    if (S.shots.p1 != null && S.shots.p2 != null) {
      S.running = false;
      setTimeout(() => net.role === "host" && hostMorph(false), 700);
    } else setTurn(who === "p1" ? "p2" : "p1");
    renderArchery();
  }

  function openLobby() {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    $("page-online").classList.add("active");
    setStatus("Создай комнату или войди по коду");
  }

  return { createRoom, joinRoom, startHostMatch, openLobby, cleanupPeer, net, ONLINE_MODES };
})();
