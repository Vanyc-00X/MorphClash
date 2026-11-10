/* 19 extra MorphClash modes */
window.MORPH_EXTRA = (() => {
  const MODES = [
    { id: "connect4", name: "4 в ряд", tip: "Кидай фишку в колонку. Собери 4 — крупный бонус." },
    { id: "reversi", name: "Реверси", tip: "Ставь диск и переворачивай линию врага." },
    { id: "mines", name: "Сапёр", tip: "Открывай безопасные клетки. Мина — ход врагу и штраф." },
    { id: "reaction", name: "Реакция", tip: "Жми цель, как только вспыхнет. Кто быстрее — тот в плюсе." },
    { id: "dice", name: "Кости", tip: "Бросай кости. Большая сумма за раунд побеждает." },
    { id: "rps", name: "КНБ", tip: "Камень / ножницы / бумага. Серия до очков." },
    { id: "war", name: "Карточная война", tip: "Тяни карту. Старше — забираешь очки." },
    { id: "blackjack", name: "21", tip: "Набери ближе к 21 без перебора. Hit / Stand." },
    { id: "archery", name: "Лучник", tip: "Останови прицел в зелёной зоне." },
    { id: "snake", name: "Змейка", tip: "Веди змейку к яблоку. Столкновение — очки сопернику." },
    { id: "lights", name: "Lights Out", tip: "Погаси все огни. Клик переключает крест." },
    { id: "sliding", name: "Пятнашки", tip: "Собери числа по порядку быстрее ИИ." },
    { id: "hangman", name: "Виселица", tip: "Угадывай буквы слова. Ошибка кормит ИИ." },
    { id: "match3", name: "3 в ряд", tip: "Жми группу из 3+ одинаковых — взрыв и очки." },
    { id: "ataxx", name: "Заражение", tip: "Прыгай/клонируйся на соседние клетки, перекрашивай врага." },
    { id: "mancala", name: "Манкала", tip: "Бери камни из ямы и сей по кругу. Захват даёт очки." },
    { id: "numbers", name: "Числовой дуэль", tip: "Выбери число ближе к цели, чем ИИ." },
    { id: "penalty", name: "Пенальти", tip: "Бей или лови: лево / центр / право." },
    { id: "quiz", name: "Блиц-квиз", tip: "Быстрый ответ на простой вопрос." },
  ];

  const BONUS = {
    connect4: { you: ["Ты кидаешь первым", "У тебя уже 1 фишка в центре"], ai: ["ИИ кидает первым", "У ИИ фишка в центре"] },
    reversi: { you: ["Ты ходишь первым", "Центральный захват за тобой"], ai: ["ИИ ходит первым", "Центр у ИИ"] },
    mines: { you: ["Первое открытие за тобой", "1 мина уже помечена"], ai: ["ИИ открывает первым", "ИИ знает 1 мину"] },
    reaction: { you: ["Чуть более ранний старт", "Цель больше"], ai: ["ИИ реагирует быстрее", "Цель меньше для тебя"] },
    dice: { you: ["+1 к броску", "+2 к броску"], ai: ["ИИ +1 к броску", "ИИ +2 к броску"] },
    rps: { you: ["Серия до 2", "Ты видишь ход ИИ на миг"], ai: ["ИИ начинает серию", "ИИ читает слабее случай"] },
    war: { you: ["Ты тянешь первым", "+1 к силе карты"], ai: ["ИИ тянет первым", "ИИ +1 к карте"] },
    blackjack: { you: ["Ты ходишь первым", "Стартовая карта +1"], ai: ["ИИ ходит первым", "ИИ стартует с бонусом"] },
    archery: { you: ["Зона шире", "Зона ещё шире"], ai: ["Зона уже", "Прицел быстрее"] },
    snake: { you: ["Ты ближе к яблоку", "Лишнее яблоко на поле"], ai: ["ИИ ближе к яблоку", "ИИ длиннее на старте"] },
    lights: { you: ["Поле проще", "1 клетка уже погашена"], ai: ["ИИ решает параллельно быстрее", "Поле сложнее"] },
    sliding: { you: ["Почти собрано", "Меньше хаоса"], ai: ["ИИ ближе к победе", "Тебе жёсткий шаффл"] },
    hangman: { you: ["Открыта 1 буква", "Открыты 2 буквы"], ai: ["ИИ знает 1 букву", "Слово длиннее"] },
    match3: { you: ["Ход первым", "Есть готовая тройка"], ai: ["ИИ ходит первым", "ИИ видит тройку"] },
    ataxx: { you: ["Лишний чип", "Ты ходишь первым + чип"], ai: ["Лишний чип ИИ", "ИИ ходит первым"] },
    mancala: { you: ["Лишний камень", "Ты ходишь первым"], ai: ["ИИ +камень", "ИИ ходит первым"] },
    numbers: { you: ["Уже ближе к цели", "Два попытки"], ai: ["ИИ ближе к цели", "ИИ точнее"] },
    penalty: { you: ["Бьёшь первым", "Вратарь ИИ ошибается чаще"], ai: ["ИИ бьёт первым", "Твой вратарь слабее"] },
    quiz: { you: ["Проще вопрос", "+1 сек"], ai: ["ИИ отвечает быстрее", "Вопрос сложнее"] },
  };

  function bonusText(id, bonus) {
    if (!bonus?.who) return "Бонусов нет — почти равный счёт";
    const row = BONUS[id];
    if (!row) return bonus.who === "you" ? "Ты с преимуществом" : "ИИ с преимуществом";
    return row[bonus.who][bonus.strong ? 1 : 0];
  }

  function $(id) { return document.getElementById(id); }
  function boardEl() { return window.MorphAPI.clearBoard(); }
  function setTurn(w) { window.MorphAPI.setTurn(w); }
  function addScore(w, p, why) { window.MorphAPI.addScore(w, p, why); }
  function toast(t) { window.MorphAPI.toastHelp(t); }
  function morphSoon() { setTimeout(() => window.MorphAPI.morphToRandom(), 750); }
  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  function leaderFirst(bonus, preferYou = true) {
    if (bonus?.who === "ai" && !bonus.strong) return "ai";
    if (bonus?.who === "ai" && bonus.strong && !preferYou) return "ai";
    return "you";
  }

  /* -------- Connect4 -------- */
  function initConnect4(bonus) {
    const R = 6, C = 7;
    const grid = Array.from({ length: R }, () => Array(C).fill(0));
    if (bonus?.who === "you" && bonus.strong) grid[R - 1][3] = 1;
    if (bonus?.who === "ai" && bonus.strong) grid[R - 1][3] = 2;
    const S = { type: "connect4", R, C, grid };
    window.MorphAPI.state.modeState = S;
    const first = bonus?.who === "ai" && !bonus.strong ? "ai" : "you";
    setTurn(first);
    renderConnect4();
    if (first === "ai") setTimeout(aiConnect4, 400);
  }
  function renderConnect4() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = `repeat(${S.C}, 42px)`;
    for (let r = 0; r < S.R; r++) for (let c = 0; c < S.C; c++) {
      const btn = document.createElement("button");
      btn.className = "cell dark";
      const v = S.grid[r][c];
      btn.textContent = v === 1 ? "●" : v === 2 ? "○" : "";
      if (v === 1) btn.classList.add("you-mark");
      if (v === 2) btn.classList.add("ai-mark");
      btn.addEventListener("click", () => dropConnect4(c, "you"));
      el.appendChild(btn);
    }
  }
  function dropConnect4(c, who) {
    const S = window.MorphAPI.state.modeState;
    if (!S || S.type !== "connect4") return;
    if (who === "you" && window.MorphAPI.state.turn !== "you") return;
    let row = -1;
    for (let r = S.R - 1; r >= 0; r--) if (!S.grid[r][c]) { row = r; break; }
    if (row < 0) return;
    S.grid[row][c] = who === "you" ? 1 : 2;
    renderConnect4();
    if (connect4Win(S.grid, S.R, S.C, who === "you" ? 1 : 2)) {
      addScore(who, 8, "4 в ряд!");
      morphSoon();
      return;
    }
    if (S.grid.every((row) => row.every(Boolean))) {
      addScore("you", 1); addScore("ai", 1);
      morphSoon();
      return;
    }
    setTurn(who === "you" ? "ai" : "you");
    if (who === "you") setTimeout(aiConnect4, 350);
  }
  function connect4Win(g, R, C, p) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (g[r][c] !== p) continue;
      for (const [dr, dc] of dirs) {
        let n = 1;
        for (let k = 1; k < 4; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || cc < 0 || rr >= R || cc >= C || g[rr][cc] !== p) break;
          n++;
        }
        if (n >= 4) return true;
      }
    }
    return false;
  }
  function aiConnect4() {
    if (window.MorphAPI.state.mode !== "connect4" || window.MorphAPI.state.turn !== "ai") return;
    const S = window.MorphAPI.state.modeState;
    const cols = [];
    for (let c = 0; c < S.C; c++) if (!S.grid[0][c]) cols.push(c);
    // prefer center / winning
    let pick = cols[Math.floor(Math.random() * cols.length)];
    for (const c of cols) {
      const copy = S.grid.map((r) => r.slice());
      for (let r = S.R - 1; r >= 0; r--) if (!copy[r][c]) { copy[r][c] = 2; break; }
      if (connect4Win(copy, S.R, S.C, 2)) { pick = c; break; }
    }
    dropConnect4(pick, "ai");
  }

  /* -------- Reversi -------- */
  function initReversi(bonus) {
    const N = 6;
    const g = Array.from({ length: N }, () => Array(N).fill(0));
    const m = N / 2;
    g[m - 1][m - 1] = 2; g[m][m] = 2; g[m - 1][m] = 1; g[m][m - 1] = 1;
    if (bonus?.who === "you" && bonus.strong) g[m - 1][m] = 1;
    if (bonus?.who === "ai" && bonus.strong) g[m - 1][m - 1] = 2;
    window.MorphAPI.state.modeState = { type: "reversi", N, g };
    const first = bonus?.who === "ai" && !bonus.strong ? "ai" : "you";
    setTurn(first);
    renderReversi();
    if (first === "ai") setTimeout(aiReversi, 400);
  }
  function revFlips(g, N, r, c, p) {
    if (g[r][c]) return [];
    const opp = p === 1 ? 2 : 1;
    const flips = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const line = [];
      let rr = r + dr, cc = c + dc;
      while (rr >= 0 && cc >= 0 && rr < N && cc < N && g[rr][cc] === opp) {
        line.push([rr, cc]); rr += dr; cc += dc;
      }
      if (line.length && rr >= 0 && cc >= 0 && rr < N && cc < N && g[rr][cc] === p) flips.push(...line);
    }
    return flips;
  }
  function renderReversi() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = `repeat(${S.N}, 48px)`;
    const p = window.MorphAPI.state.turn === "you" ? 1 : 2;
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const btn = document.createElement("button");
      btn.className = "cell dark";
      const v = S.g[r][c];
      btn.textContent = v === 1 ? "●" : v === 2 ? "○" : "";
      if (v === 1) btn.classList.add("you-mark");
      if (v === 2) btn.classList.add("ai-mark");
      const flips = revFlips(S.g, S.N, r, c, 1);
      if (!v && flips.length && window.MorphAPI.state.turn === "you") btn.classList.add("valid");
      btn.addEventListener("click", () => {
        if (window.MorphAPI.state.turn !== "you") return;
        const f = revFlips(S.g, S.N, r, c, 1);
        if (!f.length) return;
        S.g[r][c] = 1;
        f.forEach(([rr, cc]) => (S.g[rr][cc] = 1));
        addScore("you", f.length, "переворот");
        afterReversi("you");
      });
      el.appendChild(btn);
    }
  }
  function afterReversi(who) {
    const S = window.MorphAPI.state.modeState;
    const empty = S.g.flat().filter((x) => !x).length;
    if (!empty) {
      const you = S.g.flat().filter((x) => x === 1).length;
      const ai = S.g.flat().filter((x) => x === 2).length;
      if (you > ai) addScore("you", 6, "доска");
      else if (ai > you) addScore("ai", 6, "доска");
      morphSoon();
      return;
    }
    setTurn(who === "you" ? "ai" : "you");
    renderReversi();
    if (who === "you") setTimeout(aiReversi, 350);
  }
  function aiReversi() {
    if (window.MorphAPI.state.mode !== "reversi" || window.MorphAPI.state.turn !== "ai") return;
    const S = window.MorphAPI.state.modeState;
    let best = null, bestN = -1;
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const f = revFlips(S.g, S.N, r, c, 2);
      if (f.length > bestN) { bestN = f.length; best = { r, c, f }; }
    }
    if (!best) { setTurn("you"); renderReversi(); return; }
    S.g[best.r][best.c] = 2;
    best.f.forEach(([rr, cc]) => (S.g[rr][cc] = 2));
    addScore("ai", best.f.length, "переворот");
    afterReversi("ai");
  }

  /* -------- Mines -------- */
  function initMines(bonus) {
    const N = 5, mines = 5;
    const grid = Array.from({ length: N }, () => Array(N).fill(0));
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * N), c = Math.floor(Math.random() * N);
      if (!grid[r][c]) { grid[r][c] = 9; placed++; }
    }
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (grid[r][c] === 9) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (grid[r + dr]?.[c + dc] === 9) n++;
      }
      grid[r][c] = n;
    }
    const open = Array.from({ length: N }, () => Array(N).fill(false));
    if (bonus?.who === "you" && bonus.strong) {
      outer: for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] === 9) { open[r][c] = "flag"; break outer; }
    }
    window.MorphAPI.state.modeState = { type: "mines", N, grid, open, safeLeft: N * N - mines };
    setTurn(bonus?.who === "ai" && !bonus.strong ? "ai" : "you");
    renderMines();
    if (window.MorphAPI.state.turn === "ai") setTimeout(aiMines, 400);
  }
  function renderMines() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = `repeat(${S.N}, 54px)`;
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const btn = document.createElement("button");
      btn.className = "cell light";
      const o = S.open[r][c];
      if (o === true) {
        btn.textContent = S.grid[r][c] || "";
        btn.classList.add("mem", "open");
      } else if (o === "flag") btn.textContent = "⚑";
      else btn.textContent = "";
      btn.addEventListener("click", () => {
        if (window.MorphAPI.state.turn !== "you" || o) return;
        openMine(r, c, "you");
      });
      el.appendChild(btn);
    }
  }
  function openMine(r, c, who) {
    const S = window.MorphAPI.state.modeState;
    if (S.open[r][c]) return;
    if (S.grid[r][c] === 9) {
      S.open[r][c] = true;
      addScore(who === "you" ? "ai" : "you", 3, "мина!");
      renderMines();
      setTurn(who === "you" ? "ai" : "you");
      if (who === "you") setTimeout(aiMines, 400);
      return;
    }
    // flood small
    const stack = [[r, c]];
    while (stack.length) {
      const [rr, cc] = stack.pop();
      if (rr < 0 || cc < 0 || rr >= S.N || cc >= S.N || S.open[rr][cc]) continue;
      if (S.grid[rr][cc] === 9) continue;
      S.open[rr][cc] = true;
      S.safeLeft--;
      addScore(who, 1, "клетка");
      if (S.grid[rr][cc] === 0) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) stack.push([rr + dr, cc + dc]);
      }
    }
    renderMines();
    if (S.safeLeft <= 0) { addScore(who, 6, "поле чисто"); morphSoon(); return; }
    setTurn(who === "you" ? "ai" : "you");
    if (who === "you") setTimeout(aiMines, 350);
  }
  function aiMines() {
    if (window.MorphAPI.state.mode !== "mines" || window.MorphAPI.state.turn !== "ai") return;
    const S = window.MorphAPI.state.modeState;
    const opts = [];
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) if (!S.open[r][c] && S.grid[r][c] !== 9) opts.push([r, c]);
    if (!opts.length) {
      for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) if (!S.open[r][c]) opts.push([r, c]);
    }
    const [r, c] = opts[Math.floor(Math.random() * opts.length)];
    openMine(r, c, "ai");
  }

  /* -------- Reaction -------- */
  function initReaction(bonus) {
    const delay = 700 + Math.random() * 1600 - (bonus?.who === "you" ? 200 : 0) + (bonus?.who === "ai" ? 200 : 0);
    const size = bonus?.who === "you" && bonus.strong ? 96 : bonus?.who === "ai" && bonus.strong ? 56 : 72;
    window.MorphAPI.state.modeState = { type: "reaction", armed: false, done: false, size, t0: 0 };
    setTurn("you");
    const el = boardEl();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `<button class="cell light big-action" id="reactBtn" style="height:180px;width:min(280px,100%);margin:auto;font-size:18px">Жди…</button>`;
    const btn = $("reactBtn");
    btn.addEventListener("click", () => {
      const S = window.MorphAPI.state.modeState;
      if (S.done) return;
      if (!S.armed) {
        addScore("ai", 2, "фальстарт");
        S.done = true;
        btn.textContent = "Рано!";
        morphSoon();
        return;
      }
      const ms = performance.now() - S.t0;
      const aiMs = 220 + Math.random() * 180 - (bonus?.who === "ai" ? 60 : 0);
      S.done = true;
      if (ms < aiMs) {
        addScore("you", 5, `${Math.round(ms)}мс vs ${Math.round(aiMs)}мс`);
      } else {
        addScore("ai", 5, `${Math.round(aiMs)}мс быстрее`);
      }
      btn.textContent = `Ты ${Math.round(ms)}мс · ИИ ${Math.round(aiMs)}мс`;
      morphSoon();
    });
    setTimeout(() => {
      const S = window.MorphAPI.state.modeState;
      if (!S || S.type !== "reaction" || S.done) return;
      S.armed = true;
      S.t0 = performance.now();
      btn.textContent = "ЖМИ!";
      btn.style.background = "#3a6b2f";
      btn.style.width = `${S.size * 2}px`;
      btn.style.height = `${S.size * 1.6}px`;
      // AI auto-resolve if player too slow
      setTimeout(() => {
        if (!S.done && S.armed) {
          S.done = true;
          addScore("ai", 5, "ты не успел");
          btn.textContent = "ИИ успел";
          morphSoon();
        }
      }, 900);
    }, Math.max(400, delay));
  }

  /* -------- Dice -------- */
  function initDice(bonus) {
    const mod = bonus?.who === "you" ? (bonus.strong ? 2 : 1) : bonus?.who === "ai" ? (bonus.strong ? -2 : -1) : 0;
    window.MorphAPI.state.modeState = { type: "dice", mod, rolls: 0 };
    setTurn("you");
    const el = boardEl();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `
      <div class="mini-panel">
        <div class="dice-face" id="diceFace">🎲</div>
        <button class="cell light big-action" id="diceBtn">Бросить</button>
        <div class="mini-score" id="diceLog">3 броска · побеждает сумма</div>
      </div>`;
    let you = 0, ai = 0, n = 0;
    $("diceBtn").addEventListener("click", async () => {
      if (n >= 3) return;
      $("diceBtn").disabled = true;
      const y = 1 + Math.floor(Math.random() * 6);
      const a = 1 + Math.floor(Math.random() * 6);
      const y2 = Math.max(1, Math.min(6, y + Math.max(0, mod)));
      const a2 = Math.max(1, Math.min(6, a + (mod < 0 ? Math.abs(mod) : 0)));
      you += y2; ai += a2; n++;
      $("diceFace").textContent = `🎲 ${y2} : ${a2}`;
      $("diceLog").textContent = `Сумма ${you}:${ai} · бросок ${n}/3`;
      await wait(350);
      $("diceBtn").disabled = false;
      if (n >= 3) {
        if (you > ai) addScore("you", 6, `кости ${you}:${ai}`);
        else if (ai > you) addScore("ai", 6, `кости ${ai}:${you}`);
        else { addScore("you", 2); addScore("ai", 2); }
        morphSoon();
      }
    });
  }

  /* -------- RPS -------- */
  function initRps(bonus) {
    window.MorphAPI.state.modeState = { type: "rps", you: 0, ai: 0, need: bonus?.who === "you" ? 2 : 3 };
    setTurn("you");
    paintRps();
  }
  function paintRps() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = "repeat(3, 1fr)";
    el.innerHTML = "";
    [["✊", "rock"], ["✌", "scissors"], ["🖐", "paper"]].forEach(([icon, id]) => {
      const btn = document.createElement("button");
      btn.className = "cell light";
      btn.style.minHeight = "88px";
      btn.textContent = icon;
      btn.addEventListener("click", () => playRps(id, icon));
      el.appendChild(btn);
    });
    toast(`Серия ${S.you}:${S.ai}`);
  }
  function playRps(choice, icon) {
    const S = window.MorphAPI.state.modeState;
    const opts = ["rock", "scissors", "paper"];
    const icons = { rock: "✊", scissors: "✌", paper: "🖐" };
    let ai = opts[Math.floor(Math.random() * 3)];
    // mild bias if AI leading strongly handled elsewhere
    const beat = { rock: "scissors", scissors: "paper", paper: "rock" };
    if (choice === ai) toast(`Ничья ${icon} vs ${icons[ai]}`);
    else if (beat[choice] === ai) {
      S.you++;
      addScore("you", 3, `${icon} бьёт ${icons[ai]}`);
    } else {
      S.ai++;
      addScore("ai", 3, `${icons[ai]} бьёт ${icon}`);
    }
    if (S.you >= S.need || S.ai >= S.need) { morphSoon(); return; }
    paintRps();
  }

  /* -------- War -------- */
  function initWar(bonus) {
    const bump = bonus?.who === "you" ? (bonus.strong ? 1 : 0) : 0;
    const aiBump = bonus?.who === "ai" ? (bonus.strong ? 1 : 0) : 0;
    window.MorphAPI.state.modeState = { type: "war", round: 0, bump, aiBump };
    setTurn("you");
    const el = boardEl();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `<div class="mini-panel"><div class="dice-face" id="warFace">🂠 🂠</div><button class="cell light big-action" id="warBtn">Тянуть карту</button></div>`;
    $("warBtn").addEventListener("click", () => {
      const S = window.MorphAPI.state.modeState;
      if (S.round >= 4) return;
      const y = 2 + Math.floor(Math.random() * 13) + S.bump;
      const a = 2 + Math.floor(Math.random() * 13) + S.aiBump;
      $("warFace").textContent = `${y} vs ${a}`;
      S.round++;
      if (y > a) addScore("you", 3, "старше");
      else if (a > y) addScore("ai", 3, "старше");
      else { addScore("you", 1); addScore("ai", 1); }
      if (S.round >= 4) morphSoon();
    });
  }

  /* -------- Blackjack -------- */
  function initBlackjack(bonus) {
    const draw = () => 2 + Math.floor(Math.random() * 10);
    const you = [draw()];
    const ai = [draw()];
    if (bonus?.who === "you" && bonus.strong) you[0] = Math.min(11, you[0] + 1);
    if (bonus?.who === "ai" && bonus.strong) ai[0] = Math.min(11, ai[0] + 1);
    window.MorphAPI.state.modeState = { type: "bj", you, ai, done: false };
    setTurn("you");
    paintBJ();
  }
  function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
  function paintBJ() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = "1fr 1fr";
    el.innerHTML = `
      <div class="mini-panel"><div class="muted">Ты</div><div class="dice-face">${S.you.join("+")} = ${sum(S.you)}</div></div>
      <div class="mini-panel"><div class="muted">ИИ</div><div class="dice-face">${S.done ? `${S.ai.join("+")} = ${sum(S.ai)}` : "🂠"}</div></div>
      <button class="cell light" id="hitBtn">Hit</button>
      <button class="cell light" id="standBtn">Stand</button>`;
    $("hitBtn").onclick = () => {
      if (S.done) return;
      S.you.push(2 + Math.floor(Math.random() * 10));
      if (sum(S.you) > 21) {
        S.done = true;
        addScore("ai", 5, "перебор");
        paintBJ();
        morphSoon();
        return;
      }
      paintBJ();
    };
    $("standBtn").onclick = () => {
      if (S.done) return;
      while (sum(S.ai) < 17) S.ai.push(2 + Math.floor(Math.random() * 10));
      S.done = true;
      const ys = sum(S.you), as = sum(S.ai);
      paintBJ();
      if (as > 21 || ys > as) addScore("you", 5, `21: ${ys}:${as}`);
      else if (as > ys) addScore("ai", 5, `21: ${as}:${ys}`);
      else { addScore("you", 2); addScore("ai", 2); }
      morphSoon();
    };
  }

  /* -------- Archery -------- */
  function initArchery(bonus) {
    const zone = bonus?.who === "you" ? (bonus.strong ? 28 : 20) : bonus?.who === "ai" && bonus.strong ? 12 : 16;
    const speed = bonus?.who === "ai" && bonus.strong ? 18 : 12;
    window.MorphAPI.state.modeState = { type: "archery", pos: 0, dir: 1, zone, running: true, speed };
    setTurn("you");
    const el = boardEl();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `
      <div class="mini-panel" style="width:min(300px,100%)">
        <div class="aim-track" id="aimTrack"><i id="aimZone"></i><b id="aimNeedle"></b></div>
        <button class="cell light big-action" id="shootBtn">Выстрел</button>
      </div>`;
    const zoneEl = $("aimZone");
    const needle = $("aimNeedle");
    const center = 50;
    zoneEl.style.width = `${zone}%`;
    zoneEl.style.left = `${center - zone / 2}%`;
    const tick = () => {
      const S = window.MorphAPI.state.modeState;
      if (!S?.running) return;
      S.pos += S.dir * S.speed * 0.35;
      if (S.pos >= 100 || S.pos <= 0) S.dir *= -1;
      needle.style.left = `${S.pos}%`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    $("shootBtn").onclick = () => {
      const S = window.MorphAPI.state.modeState;
      if (!S.running) return;
      S.running = false;
      const hit = Math.abs(S.pos - 50) <= zone / 2;
      const aiHit = Math.random() < (bonus?.who === "ai" ? 0.72 : 0.48);
      if (hit && !aiHit) addScore("you", 6, "в яблочко");
      else if (!hit && aiHit) addScore("ai", 6, "ИИ попал");
      else if (hit && aiHit) { addScore("you", 3); addScore("ai", 3); }
      else toast("Оба мимо");
      $("shootBtn").textContent = hit ? "Есть!" : "Мимо";
      morphSoon();
    };
  }

  /* -------- Snake (turn-based grid) -------- */
  function initSnake(bonus) {
    const N = 7;
    const you = [{ r: N - 2, c: 1 }];
    const ai = [{ r: 1, c: N - 2 }];
    if (bonus?.who === "you" && bonus.strong) you.push({ r: N - 2, c: 0 });
    if (bonus?.who === "ai" && bonus.strong) ai.push({ r: 1, c: N - 1 });
    let apple = { r: 3, c: 3 };
    if (bonus?.who === "you") apple = { r: N - 3, c: 2 };
    if (bonus?.who === "ai") apple = { r: 2, c: N - 3 };
    window.MorphAPI.state.modeState = { type: "snake", N, you, ai, apple, dir: { r: -1, c: 0 } };
    setTurn("you");
    renderSnake();
  }
  function renderSnake() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = `repeat(${S.N}, 40px)`;
    const key = (r, c) => `${r},${c}`;
    const yset = new Set(S.you.map((p) => key(p.r, p.c)));
    const aset = new Set(S.ai.map((p) => key(p.r, p.c)));
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const btn = document.createElement("button");
      btn.className = "cell dark";
      const k = key(r, c);
      if (yset.has(k)) { btn.textContent = "●"; btn.classList.add("you-mark"); }
      else if (aset.has(k)) { btn.textContent = "○"; btn.classList.add("ai-mark"); }
      else if (S.apple.r === r && S.apple.c === c) btn.textContent = "🍎";
      btn.addEventListener("click", () => snakeStep(r, c));
      el.appendChild(btn);
    }
    toast("Кликни соседнюю клетку головы змейки");
  }
  function snakeStep(r, c) {
    if (window.MorphAPI.state.turn !== "you") return;
    const S = window.MorphAPI.state.modeState;
    const head = S.you[0];
    if (Math.abs(head.r - r) + Math.abs(head.c - c) !== 1) return;
    moveSnake("you", r - head.r, c - head.c);
  }
  function moveSnake(who, dr, dc) {
    const S = window.MorphAPI.state.modeState;
    const body = who === "you" ? S.you : S.ai;
    const head = body[0];
    const nr = head.r + dr, nc = head.c + dc;
    const hitWall = nr < 0 || nc < 0 || nr >= S.N || nc >= S.N;
    const yset = new Set(S.you.map((p) => `${p.r},${p.c}`));
    const aset = new Set(S.ai.map((p) => `${p.r},${p.c}`));
    const hitSelf = who === "you" ? yset.has(`${nr},${nc}`) : aset.has(`${nr},${nc}`);
    const hitOther = who === "you" ? aset.has(`${nr},${nc}`) : yset.has(`${nr},${nc}`);
    if (hitWall || hitSelf || hitOther) {
      addScore(who === "you" ? "ai" : "you", 4, "столкновение");
      morphSoon();
      return;
    }
    body.unshift({ r: nr, c: nc });
    if (nr === S.apple.r && nc === S.apple.c) {
      addScore(who, 4, "яблоко");
      S.apple = { r: Math.floor(Math.random() * S.N), c: Math.floor(Math.random() * S.N) };
    } else body.pop();
    renderSnake();
    setTurn(who === "you" ? "ai" : "you");
    if (who === "you") setTimeout(aiSnake, 280);
  }
  function aiSnake() {
    if (window.MorphAPI.state.mode !== "snake" || window.MorphAPI.state.turn !== "ai") return;
    const S = window.MorphAPI.state.modeState;
    const head = S.ai[0];
    const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
    dirs.sort((a, b) => {
      const da = Math.abs(head.r + a[0] - S.apple.r) + Math.abs(head.c + a[1] - S.apple.c);
      const db = Math.abs(head.r + b[0] - S.apple.r) + Math.abs(head.c + b[1] - S.apple.c);
      return da - db;
    });
    moveSnake("ai", dirs[0][0], dirs[0][1]);
  }

  /* -------- Lights Out -------- */
  function initLights(bonus) {
    const N = 4;
    const g = Array.from({ length: N }, () => Array.from({ length: N }, () => Math.random() < 0.55));
    if (bonus?.who === "you" && bonus.strong) g[0][0] = false;
    window.MorphAPI.state.modeState = { type: "lights", N, g, moves: 0 };
    setTurn("you");
    renderLights();
  }
  function toggleLights(r, c) {
    const S = window.MorphAPI.state.modeState;
    [[0,0],[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && cc >= 0 && rr < S.N && cc < S.N) S.g[rr][cc] = !S.g[rr][cc];
    });
  }
  function renderLights() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = `repeat(${S.N}, 64px)`;
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const btn = document.createElement("button");
      btn.className = `cell ${S.g[r][c] ? "you-mark" : "dark"}`;
      btn.style.background = S.g[r][c] ? "#ffd666" : "#1a1a26";
      btn.textContent = S.g[r][c] ? "●" : "";
      btn.addEventListener("click", () => {
        toggleLights(r, c);
        S.moves++;
        renderLights();
        if (S.g.flat().every((x) => !x)) {
          addScore("you", 7, `Lights Out за ${S.moves}`);
          // AI "race" score shadow
          if (S.moves > 8) addScore("ai", 3, "медленнее");
          morphSoon();
        } else if (S.moves >= 12) {
          addScore("ai", 4, "не успел");
          morphSoon();
        }
      });
      el.appendChild(btn);
    }
  }

  /* -------- Sliding -------- */
  function initSliding(bonus) {
    const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let tiles = solved.slice();
    const chaos = bonus?.who === "you" && bonus.strong ? 8 : bonus?.who === "ai" && bonus.strong ? 25 : 16;
    for (let i = 0; i < chaos; i++) {
      const z = tiles.indexOf(0);
      const zr = Math.floor(z / 3), zc = z % 3;
      const opts = [[zr - 1, zc], [zr + 1, zc], [zr, zc - 1], [zr, zc + 1]].filter(([r, c]) => r >= 0 && c >= 0 && r < 3 && c < 3);
      const [r, c] = opts[Math.floor(Math.random() * opts.length)];
      const ni = r * 3 + c;
      [tiles[z], tiles[ni]] = [tiles[ni], tiles[z]];
    }
    window.MorphAPI.state.modeState = { type: "sliding", tiles, moves: 0, aiProgress: bonus?.who === "ai" ? 2 : 0 };
    setTurn("you");
    renderSliding();
  }
  function renderSliding() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = "repeat(3, 72px)";
    S.tiles.forEach((v, i) => {
      const btn = document.createElement("button");
      btn.className = `cell ${v ? "light" : "dark"}`;
      btn.textContent = v || "";
      btn.addEventListener("click", () => slideAt(i));
      el.appendChild(btn);
    });
  }
  function slideAt(i) {
    const S = window.MorphAPI.state.modeState;
    const z = S.tiles.indexOf(0);
    const zr = Math.floor(z / 3), zc = z % 3;
    const r = Math.floor(i / 3), c = i % 3;
    if (Math.abs(zr - r) + Math.abs(zc - c) !== 1) return;
    [S.tiles[z], S.tiles[i]] = [S.tiles[i], S.tiles[z]];
    S.moves++;
    S.aiProgress += Math.random() < 0.45 ? 1 : 0;
    renderSliding();
    if (S.tiles.every((v, idx) => v === [1, 2, 3, 4, 5, 6, 7, 8, 0][idx])) {
      addScore("you", 7, "собрал");
      morphSoon();
    } else if (S.aiProgress >= 10 || S.moves >= 28) {
      addScore("ai", 5, "ИИ собрал раньше");
      morphSoon();
    }
  }

  /* -------- Hangman -------- */
  const WORDS = ["МОРФ", "ДУЭЛЬ", "ШАХМАТЫ", "АРКАДА", "КЛАШ", "РЕЖИМ", "БОНУС", "ПОБЕДА"];
  function initHangman(bonus) {
    let word = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (bonus?.who === "ai" && bonus.strong) word = "ПРЕИМУЩЕСТВО";
    const open = word.split("").map((ch, i) => {
      if (bonus?.who === "you" && bonus.strong && i < 2) return ch;
      if (bonus?.who === "you" && !bonus.strong && i === 0) return ch;
      return "_";
    });
    window.MorphAPI.state.modeState = { type: "hangman", word, open, wrong: 0, used: new Set() };
    setTurn("you");
    renderHangman();
  }
  function renderHangman() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = "repeat(8, 1fr)";
    el.innerHTML = `<div class="mini-panel" style="grid-column:1/-1"><div class="dice-face" style="font-size:28px;letter-spacing:6px">${S.open.join(" ")}</div><div class="mini-score">Ошибки ${S.wrong}/5</div></div>`;
    "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЫЭЮЯ".split("").forEach((ch) => {
      const btn = document.createElement("button");
      btn.className = "cell light";
      btn.style.fontSize = "14px";
      btn.textContent = ch;
      btn.disabled = S.used.has(ch);
      btn.addEventListener("click", () => guessHang(ch));
      el.appendChild(btn);
    });
  }
  function guessHang(ch) {
    const S = window.MorphAPI.state.modeState;
    if (S.used.has(ch)) return;
    S.used.add(ch);
    if (S.word.includes(ch)) {
      S.word.split("").forEach((w, i) => { if (w === ch) S.open[i] = ch; });
      addScore("you", 2, `буква ${ch}`);
      if (!S.open.includes("_")) { addScore("you", 5, "слово"); morphSoon(); return; }
    } else {
      S.wrong++;
      addScore("ai", 2, "ошибка");
      if (S.wrong >= 5) { addScore("ai", 4, "виселица"); morphSoon(); return; }
    }
    renderHangman();
  }

  /* -------- Match3 -------- */
  function initMatch3(bonus) {
    const N = 6;
    const icons = ["🔴", "🟢", "🔵", "🟡", "🟣"];
    const g = Array.from({ length: N }, () => Array.from({ length: N }, () => icons[Math.floor(Math.random() * icons.length)]));
    if (bonus?.who === "you" && bonus.strong) g[2][2] = g[2][3] = g[2][4] = "🔴";
    window.MorphAPI.state.modeState = { type: "match3", N, g, icons, turns: 0 };
    setTurn(bonus?.who === "ai" && !bonus.strong ? "ai" : "you");
    renderMatch3();
    if (window.MorphAPI.state.turn === "ai") setTimeout(aiMatch3, 400);
  }
  function flood(g, N, r, c, icon, seen) {
    const k = `${r},${c}`;
    if (seen.has(k) || r < 0 || c < 0 || r >= N || c >= N || g[r][c] !== icon) return [];
    seen.add(k);
    return [[r, c], ...flood(g, N, r + 1, c, icon, seen), ...flood(g, N, r - 1, c, icon, seen), ...flood(g, N, r, c + 1, icon, seen), ...flood(g, N, r, c - 1, icon, seen)];
  }
  function renderMatch3() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = `repeat(${S.N}, 44px)`;
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const btn = document.createElement("button");
      btn.className = "cell dark";
      btn.textContent = S.g[r][c];
      btn.addEventListener("click", () => {
        if (window.MorphAPI.state.turn !== "you") return;
        match3At(r, c, "you");
      });
      el.appendChild(btn);
    }
  }
  function match3At(r, c, who) {
    const S = window.MorphAPI.state.modeState;
    const group = flood(S.g, S.N, r, c, S.g[r][c], new Set());
    if (group.length < 3) { toast("Нужно 3+"); return; }
    group.forEach(([rr, cc]) => { S.g[rr][cc] = S.icons[Math.floor(Math.random() * S.icons.length)]; });
    addScore(who, group.length, "комбо");
    S.turns++;
    renderMatch3();
    if (S.turns >= 5) { morphSoon(); return; }
    setTurn(who === "you" ? "ai" : "you");
    if (who === "you") setTimeout(aiMatch3, 300);
  }
  function aiMatch3() {
    if (window.MorphAPI.state.mode !== "match3" || window.MorphAPI.state.turn !== "ai") return;
    const S = window.MorphAPI.state.modeState;
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const g = flood(S.g, S.N, r, c, S.g[r][c], new Set());
      if (g.length >= 3) { match3At(r, c, "ai"); return; }
    }
    S.turns++;
    setTurn("you");
    renderMatch3();
    if (S.turns >= 5) morphSoon();
  }

  /* -------- Ataxx-like -------- */
  function initAtaxx(bonus) {
    const N = 5;
    const g = Array.from({ length: N }, () => Array(N).fill(0));
    g[0][0] = 1; g[N - 1][N - 1] = 1; g[0][N - 1] = 2; g[N - 1][0] = 2;
    if (bonus?.who === "you") g[2][1] = 1;
    if (bonus?.who === "ai") g[2][3] = 2;
    window.MorphAPI.state.modeState = { type: "ataxx", N, g, selected: null };
    setTurn(bonus?.who === "ai" && !bonus.strong ? "ai" : "you");
    renderAtaxx();
    if (window.MorphAPI.state.turn === "ai") setTimeout(aiAtaxx, 400);
  }
  function renderAtaxx() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = `repeat(${S.N}, 54px)`;
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
      const btn = document.createElement("button");
      btn.className = "cell dark";
      const v = S.g[r][c];
      btn.textContent = v === 1 ? "●" : v === 2 ? "○" : "";
      if (v === 1) btn.classList.add("you-mark");
      if (v === 2) btn.classList.add("ai-mark");
      if (S.selected && S.selected[0] === r && S.selected[1] === c) btn.classList.add("selected");
      btn.addEventListener("click", () => onAtaxx(r, c));
      el.appendChild(btn);
    }
  }
  function onAtaxx(r, c) {
    if (window.MorphAPI.state.turn !== "you") return;
    const S = window.MorphAPI.state.modeState;
    if (S.g[r][c] === 1) { S.selected = [r, c]; renderAtaxx(); return; }
    if (!S.selected || S.g[r][c]) return;
    const [sr, sc] = S.selected;
    const dist = Math.max(Math.abs(sr - r), Math.abs(sc - c));
    if (dist === 0 || dist > 2) return;
    if (dist === 2) S.g[sr][sc] = 0;
    S.g[r][c] = 1;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && cc >= 0 && rr < S.N && cc < S.N && S.g[rr][cc] === 2) S.g[rr][cc] = 1;
    }
    const gained = S.g.flat().filter((x) => x === 1).length;
    addScore("you", 2, `контроль ${gained}`);
    S.selected = null;
    finishAtaxx("you");
  }
  function finishAtaxx(who) {
    const S = window.MorphAPI.state.modeState;
    const empty = S.g.flat().filter((x) => !x).length;
    renderAtaxx();
    if (!empty) {
      const y = S.g.flat().filter((x) => x === 1).length;
      const a = S.g.flat().filter((x) => x === 2).length;
      if (y > a) addScore("you", 6); else if (a > y) addScore("ai", 6);
      morphSoon();
      return;
    }
    setTurn(who === "you" ? "ai" : "you");
    if (who === "you") setTimeout(aiAtaxx, 300);
  }
  function aiAtaxx() {
    if (window.MorphAPI.state.mode !== "ataxx" || window.MorphAPI.state.turn !== "ai") return;
    const S = window.MorphAPI.state.modeState;
    const chips = [];
    for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) if (S.g[r][c] === 2) chips.push([r, c]);
    const moves = [];
    for (const [sr, sc] of chips) {
      for (let r = 0; r < S.N; r++) for (let c = 0; c < S.N; c++) {
        if (S.g[r][c]) continue;
        const dist = Math.max(Math.abs(sr - r), Math.abs(sc - c));
        if (dist >= 1 && dist <= 2) moves.push([sr, sc, r, c, dist]);
      }
    }
    if (!moves.length) { setTurn("you"); return; }
    const [sr, sc, r, c, dist] = moves[Math.floor(Math.random() * moves.length)];
    if (dist === 2) S.g[sr][sc] = 0;
    S.g[r][c] = 2;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && cc >= 0 && rr < S.N && cc < S.N && S.g[rr][cc] === 1) S.g[rr][cc] = 2;
    }
    addScore("ai", 2, "заражение");
    finishAtaxx("ai");
  }

  /* -------- Mancala (ultra simplified 6 pits) -------- */
  function initMancala(bonus) {
    const pits = [4, 4, 4, 4, 4, 4];
    if (bonus?.who === "you") pits[0]++;
    if (bonus?.who === "ai") pits[3]++;
    window.MorphAPI.state.modeState = { type: "mancala", pits, store: { you: 0, ai: 0 } };
    setTurn(bonus?.who === "ai" && !bonus.strong ? "ai" : "you");
    renderMancala();
    if (window.MorphAPI.state.turn === "ai") setTimeout(aiMancala, 400);
  }
  function renderMancala() {
    const S = window.MorphAPI.state.modeState;
    const el = boardEl();
    el.style.gridTemplateColumns = "repeat(3, 1fr)";
    el.innerHTML = `<div class="mini-panel" style="grid-column:1/-1">Склады · ты ${S.store.you} · ИИ ${S.store.ai}</div>`;
    S.pits.forEach((n, i) => {
      const btn = document.createElement("button");
      btn.className = "cell light";
      btn.innerHTML = `<div>${i < 3 ? "Ты" : "ИИ"}</div><strong>${n}</strong>`;
      btn.disabled = window.MorphAPI.state.turn === "you" ? i >= 3 || !n : true;
      btn.addEventListener("click", () => mancalaMove(i, "you"));
      el.appendChild(btn);
    });
  }
  function mancalaMove(i, who) {
    const S = window.MorphAPI.state.modeState;
    let stones = S.pits[i];
    if (!stones) return;
    if (who === "you" && i >= 3) return;
    if (who === "ai" && i < 3) return;
    S.pits[i] = 0;
    let idx = i;
    while (stones > 0) {
      idx = (idx + 1) % 6;
      S.pits[idx]++;
      stones--;
    }
    // capture if land on own non-empty historically simplified: if last pit was empty-ish take
    if (S.pits[idx] === 1) {
      const opp = 5 - idx;
      if (S.pits[opp]) {
        const gain = S.pits[opp] + 1;
        S.pits[opp] = 0; S.pits[idx] = 0;
        S.store[who] += gain;
        addScore(who, gain, "захват");
      }
    } else addScore(who, 1, "ход");
    if (S.pits.every((x) => !x) || S.store.you + S.store.ai >= 20) {
      if (S.store.you >= S.store.ai) addScore("you", 4, "склад");
      else addScore("ai", 4, "склад");
      morphSoon();
      return;
    }
    setTurn(who === "you" ? "ai" : "you");
    renderMancala();
    if (who === "you") setTimeout(aiMancala, 350);
  }
  function aiMancala() {
    if (window.MorphAPI.state.mode !== "mancala" || window.MorphAPI.state.turn !== "ai") return;
    const S = window.MorphAPI.state.modeState;
    const opts = [3, 4, 5].filter((i) => S.pits[i] > 0);
    if (!opts.length) { setTurn("you"); renderMancala(); return; }
    mancalaMove(opts[Math.floor(Math.random() * opts.length)], "ai");
  }

  /* -------- Numbers -------- */
  function initNumbers(bonus) {
    const target = 10 + Math.floor(Math.random() * 80);
    window.MorphAPI.state.modeState = { type: "numbers", target, picks: [] };
    setTurn("you");
    const el = boardEl();
    el.style.gridTemplateColumns = "repeat(5, 1fr)";
    el.innerHTML = `<div class="mini-panel" style="grid-column:1/-1">Цель: <strong>${target}</strong>. Выбери число.</div>`;
    for (let n = 1; n <= 10; n++) {
      const val = n * 10;
      const btn = document.createElement("button");
      btn.className = "cell light";
      btn.textContent = String(val);
      btn.addEventListener("click", () => {
        const aiBias = bonus?.who === "ai" ? 4 : 0;
        const youBias = bonus?.who === "you" ? (bonus.strong ? 8 : 3) : 0;
        let you = val;
        // second try if bonus
        if (bonus?.who === "you" && bonus.strong) {
          const alt = val + (Math.random() < 0.5 ? -5 : 5);
          if (Math.abs(alt - target) < Math.abs(you - target)) you = alt;
        }
        const ai = Math.max(10, Math.min(100, target + Math.floor(Math.random() * 21) - 10 - aiBias + (bonus?.who === "you" ? 6 : 0) - youBias));
        const yd = Math.abs(you - target), ad = Math.abs(ai - target);
        toast(`Ты ${you} · ИИ ${ai} · цель ${target}`);
        if (yd < ad) addScore("you", 5, "ближе");
        else if (ad < yd) addScore("ai", 5, "ближе");
        else { addScore("you", 2); addScore("ai", 2); }
        morphSoon();
      });
      el.appendChild(btn);
    }
  }

  /* -------- Penalty -------- */
  function initPenalty(bonus) {
    window.MorphAPI.state.modeState = { type: "penalty", round: 0, bias: bonus?.who === "you" && bonus.strong ? 0.2 : bonus?.who === "ai" && bonus.strong ? -0.15 : 0 };
    setTurn(bonus?.who === "ai" && !bonus.strong ? "ai" : "you");
    paintPenalty("Бей пенальти");
    if (window.MorphAPI.state.turn === "ai") setTimeout(() => resolvePenalty(1 + Math.floor(Math.random() * 3), "ai"), 500);
  }
  function paintPenalty(title) {
    const el = boardEl();
    el.style.gridTemplateColumns = "repeat(3, 1fr)";
    el.innerHTML = `<div class="mini-panel" style="grid-column:1/-1">${title}</div>`;
    ["⬅️ Лево", "⬆ Центр", "Право ➡️"].forEach((label, i) => {
      const btn = document.createElement("button");
      btn.className = "cell light";
      btn.style.minHeight = "90px";
      btn.textContent = label;
      btn.addEventListener("click", () => resolvePenalty(i, "you"));
      el.appendChild(btn);
    });
  }
  function resolvePenalty(choice, who) {
    const S = window.MorphAPI.state.modeState;
    if (who === "you" && window.MorphAPI.state.turn !== "you") return;
    const dive = Math.floor(Math.random() * 3);
    let goal = choice !== dive;
    if (who === "you") goal = Math.random() < 0.55 + S.bias ? choice !== dive : false;
    if (who === "ai") goal = Math.random() < 0.5 - S.bias;
    if (goal) addScore(who, 4, "гол!");
    else addScore(who === "you" ? "ai" : "you", 2, "сейв");
    S.round++;
    if (S.round >= 3) { morphSoon(); return; }
    setTurn(who === "you" ? "ai" : "you");
    paintPenalty(window.MorphAPI.state.turn === "you" ? "Твой удар" : "Удар ИИ…");
    if (window.MorphAPI.state.turn === "ai") setTimeout(() => resolvePenalty(Math.floor(Math.random() * 3), "ai"), 450);
  }

  /* -------- Quiz -------- */
  const QUIZZES = [
    { q: "2+2×2?", a: ["6", "8", "4"], ok: 0 },
    { q: "Столица Японии?", a: ["Киото", "Осака", "Токио"], ok: 2 },
    { q: "Сколько клеток в шахматах?", a: ["64", "81", "100"], ok: 0 },
    { q: "Пи ≈ ?", a: ["2.7", "3.14", "1.62"], ok: 1 },
    { q: "RGB — это?", a: ["Цвет", "Звук", "Файл"], ok: 0 },
    { q: "8×7?", a: ["54", "56", "63"], ok: 1 },
  ];
  function initQuiz(bonus) {
    const item = QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
    window.MorphAPI.state.modeState = { type: "quiz", item, answered: false };
    setTurn("you");
    const el = boardEl();
    el.style.gridTemplateColumns = "1fr";
    el.innerHTML = `<div class="mini-panel"><div class="dice-face" style="font-size:20px">${item.q}</div></div>`;
    item.a.forEach((ans, i) => {
      const btn = document.createElement("button");
      btn.className = "cell light big-action";
      btn.textContent = ans;
      btn.addEventListener("click", () => {
        const S = window.MorphAPI.state.modeState;
        if (S.answered) return;
        S.answered = true;
        const aiCorrect = Math.random() < (bonus?.who === "ai" ? 0.75 : 0.45);
        if (i === item.ok) addScore("you", 5, "верно");
        else addScore("ai", 3, "ошибка");
        if (aiCorrect) addScore("ai", 2, "ИИ тоже");
        morphSoon();
      });
      el.appendChild(btn);
    });
  }

  const INIT = {
    connect4: initConnect4,
    reversi: initReversi,
    mines: initMines,
    reaction: initReaction,
    dice: initDice,
    rps: initRps,
    war: initWar,
    blackjack: initBlackjack,
    archery: initArchery,
    snake: initSnake,
    lights: initLights,
    sliding: initSliding,
    hangman: initHangman,
    match3: initMatch3,
    ataxx: initAtaxx,
    mancala: initMancala,
    numbers: initNumbers,
    penalty: initPenalty,
    quiz: initQuiz,
  };

  return { MODES, BONUS, bonusText, INIT };
})();
