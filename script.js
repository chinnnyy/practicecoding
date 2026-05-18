const recipes = [
  {
    name: "Oak Latte",
    ingredients: ["espresso", "milk", "foam"],
    value: 120,
    patience: 18
  },
  {
    name: "Iced Vanilla",
    ingredients: ["espresso", "vanilla", "ice"],
    value: 140,
    patience: 16
  },
  {
    name: "Matcha Cream",
    ingredients: ["matcha", "milk", "foam"],
    value: 150,
    patience: 17
  },
  {
    name: "Croissant Set",
    ingredients: ["croissant", "espresso"],
    value: 130,
    patience: 15
  },
  {
    name: "Cloud Coffee",
    ingredients: ["espresso", "milk", "vanilla", "foam"],
    value: 180,
    patience: 19
  },
  {
    name: "Market Cooler",
    ingredients: ["matcha", "vanilla", "ice"],
    value: 150,
    patience: 16
  }
];

const customerNames = [
  "Mika",
  "Sofia",
  "Theo",
  "Aria",
  "Nico",
  "Lena",
  "Jules",
  "Kai"
];

const ingredientLabels = {
  espresso: "Esp",
  milk: "Milk",
  foam: "Foam",
  vanilla: "Van",
  ice: "Ice",
  matcha: "Tea",
  croissant: "Bake"
};

const scoreEl = document.querySelector("#score");
const tipsEl = document.querySelector("#tips");
const timerEl = document.querySelector("#timer");
const streakEl = document.querySelector("#streak");
const customerNameEl = document.querySelector("#customer-name");
const orderNameEl = document.querySelector("#order-name");
const recipeListEl = document.querySelector("#recipe-list");
const patienceBarEl = document.querySelector("#patience-bar");
const queueEl = document.querySelector("#queue");
const trayEl = document.querySelector("#tray");
const trayCountEl = document.querySelector("#tray-count");
const roundMessageEl = document.querySelector("#round-message");
const servedCountEl = document.querySelector("#served-count");
const missedCountEl = document.querySelector("#missed-count");
const bonusCountEl = document.querySelector("#bonus-count");
const highScoreEl = document.querySelector("#high-score");
const startModalEl = document.querySelector("#start-modal");
const modalTitleEl = document.querySelector("#modal-title");
const modalCopyEl = document.querySelector("#modal-copy");
const startButtonEl = document.querySelector("#start-button");
const serveButtonEl = document.querySelector("#serve-button");
const clearButtonEl = document.querySelector("#clear-button");
const stationButtons = document.querySelectorAll(".station");

const game = {
  active: false,
  score: 0,
  tips: 0,
  timeLeft: 60,
  streak: 0,
  served: 0,
  missed: 0,
  bonus: 0,
  tray: [],
  queue: [],
  current: null,
  patienceLeft: 0,
  timerId: null,
  patienceId: null,
  highScore: Number(localStorage.getItem("cafeRushHighScore") || 0)
};

function createOrder() {
  const recipe = recipes[Math.floor(Math.random() * recipes.length)];
  const customer = customerNames[Math.floor(Math.random() * customerNames.length)];

  return {
    ...recipe,
    customer,
    id: Date.now() + Math.random()
  };
}

function startGame() {
  game.active = true;
  game.score = 0;
  game.tips = 0;
  game.timeLeft = 60;
  game.streak = 0;
  game.served = 0;
  game.missed = 0;
  game.bonus = 0;
  game.tray = [];
  game.queue = [createOrder(), createOrder(), createOrder()];
  startModalEl.classList.remove("active");
  roundMessageEl.textContent = "The first order is up.";
  nextOrder();
  render();

  clearInterval(game.timerId);
  clearInterval(game.patienceId);

  game.timerId = setInterval(() => {
    game.timeLeft -= 1;

    if (game.timeLeft <= 0) {
      endGame();
      return;
    }

    render();
  }, 1000);

  game.patienceId = setInterval(() => {
    if (!game.active || !game.current) {
      return;
    }

    game.patienceLeft -= 0.12;

    if (game.patienceLeft <= 0) {
      missOrder();
      return;
    }

    renderPatience();
  }, 120);
}

function nextOrder() {
  game.current = game.queue.shift() || createOrder();
  game.queue.push(createOrder());
  game.patienceLeft = game.current.patience;
  game.tray = [];
  render();
}

function addIngredient(ingredient) {
  if (!game.active || game.tray.length >= 4) {
    return;
  }

  game.tray.push(ingredient);
  roundMessageEl.textContent = `${ingredientLabels[ingredient]} added.`;
  renderTray();
}

function clearTray() {
  if (!game.active) {
    return;
  }

  game.tray = [];
  roundMessageEl.textContent = "Tray cleared.";
  renderTray();
}

function serveOrder() {
  if (!game.active || !game.current) {
    return;
  }

  if (matchesRecipe(game.tray, game.current.ingredients)) {
    const patienceBonus = Math.ceil(game.patienceLeft * 3);
    const streakBonus = game.streak * 20;
    const points = game.current.value + patienceBonus + streakBonus;

    game.score += points;
    game.tips += Math.max(2, Math.floor(points / 50));
    game.streak += 1;
    game.served += 1;

    if (game.streak > 0 && game.streak % 3 === 0) {
      game.timeLeft += 5;
      game.bonus += 1;
      roundMessageEl.textContent = `Rush bonus: ${points} points and extra time.`;
    } else {
      roundMessageEl.textContent = `Served for ${points} points.`;
    }

    nextOrder();
    return;
  }

  game.streak = 0;
  game.timeLeft = Math.max(0, game.timeLeft - 3);
  game.tray = [];
  roundMessageEl.textContent = "Order mismatch. Time lost.";
  trayEl.classList.remove("shake");
  void trayEl.offsetWidth;
  trayEl.classList.add("shake");
  render();
}

function missOrder() {
  game.missed += 1;
  game.streak = 0;
  game.timeLeft = Math.max(0, game.timeLeft - 4);
  roundMessageEl.textContent = `${game.current.customer} left the line.`;
  nextOrder();
}

function endGame() {
  game.active = false;
  clearInterval(game.timerId);
  clearInterval(game.patienceId);
  game.timeLeft = 0;

  if (game.score > game.highScore) {
    game.highScore = game.score;
    localStorage.setItem("cafeRushHighScore", String(game.highScore));
    modalTitleEl.textContent = "New best shift";
  } else {
    modalTitleEl.textContent = "Shift complete";
  }

  modalCopyEl.textContent = `Score ${game.score}. Served ${game.served}, missed ${game.missed}, tips $${game.tips}.`;
  startButtonEl.textContent = "Play Again";
  startModalEl.classList.add("active");
  render();
}

function matchesRecipe(tray, recipe) {
  if (tray.length !== recipe.length) {
    return false;
  }

  const trayItems = [...tray].sort().join("|");
  const recipeItems = [...recipe].sort().join("|");
  return trayItems === recipeItems;
}

function makeIngredientToken(ingredient) {
  const token = document.createElement("span");
  token.className = `ingredient-token ingredient-${ingredient}`;
  token.textContent = ingredientLabels[ingredient];
  token.title = ingredient;
  return token;
}

function renderRecipe() {
  recipeListEl.innerHTML = "";

  if (!game.current) {
    return;
  }

  game.current.ingredients.forEach((ingredient) => {
    recipeListEl.append(makeIngredientToken(ingredient));
  });
}

function renderQueue() {
  queueEl.innerHTML = "";

  game.queue.slice(0, 3).forEach((order) => {
    const card = document.createElement("div");
    card.className = "queue-card";
    card.innerHTML = `<span>${order.customer}</span><small>${order.name}</small>`;
    queueEl.append(card);
  });
}

function renderTray() {
  trayEl.innerHTML = "";
  game.tray.forEach((ingredient) => {
    trayEl.append(makeIngredientToken(ingredient));
  });
  trayCountEl.textContent = `${game.tray.length}/4`;
}

function renderPatience() {
  const patiencePercent = game.current
    ? Math.max(0, (game.patienceLeft / game.current.patience) * 100)
    : 100;

  patienceBarEl.style.width = `${patiencePercent}%`;
}

function render() {
  scoreEl.textContent = game.score;
  tipsEl.textContent = `$${game.tips}`;
  timerEl.textContent = game.timeLeft;
  streakEl.textContent = game.streak;
  servedCountEl.textContent = game.served;
  missedCountEl.textContent = game.missed;
  bonusCountEl.textContent = game.bonus;
  highScoreEl.textContent = `Best ${game.highScore}`;

  if (game.current) {
    customerNameEl.textContent = game.current.customer;
    orderNameEl.textContent = game.current.name;
  }

  renderRecipe();
  renderQueue();
  renderTray();
  renderPatience();
}

stationButtons.forEach((button) => {
  button.addEventListener("click", () => addIngredient(button.dataset.ingredient));
});

serveButtonEl.addEventListener("click", serveOrder);
clearButtonEl.addEventListener("click", clearTray);
startButtonEl.addEventListener("click", startGame);

render();
