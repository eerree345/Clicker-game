const STORAGE_KEY = 'croissant_clicker_save_v1';
const BELT_VISIBLE_ITEMS = 15;

const defaultState = {
  croissants: 0,
  perClick: 1,
  ovens: 0,
  bakeries: 0,
  butter: 0,
  restaurants: 0,
  prices: {
    oven: 25,
    bakery: 120,
    butter: 60,
    restaurant: 480,
  },
  prestige: {
    oven: 0,
    bakery: 0,
    butter: 0,
    restaurant: 0,
  },
};

let state = loadState();
let rainEventActive = false;
let rouletteSpinning = false;
let rouletteRotation = 0;

const refs = {
  count: document.getElementById('count'),
  perClick: document.getElementById('perClick'),
  perSecond: document.getElementById('perSecond'),
  button: document.getElementById('croissantButton'),
  rouletteCost: document.getElementById('rouletteCost'),
  spinRoulette: document.getElementById('spinRoulette'),
  rouletteResult: document.getElementById('rouletteResult'),
  rouletteWheel: document.getElementById('rouletteWheel'),
  buyOven: document.getElementById('buyOven'),
  buyBakery: document.getElementById('buyBakery'),
  buyButter: document.getElementById('buyButter'),
  buyRestaurant: document.getElementById('buyRestaurant'),
  ovenPrice: document.getElementById('ovenPrice'),
  bakeryPrice: document.getElementById('bakeryPrice'),
  butterPrice: document.getElementById('butterPrice'),
  restaurantPrice: document.getElementById('restaurantPrice'),
  ovenOwned: document.getElementById('ovenOwned'),
  bakeryOwned: document.getElementById('bakeryOwned'),
  butterOwned: document.getElementById('butterOwned'),
  restaurantOwned: document.getElementById('restaurantOwned'),
  ovenPrestige: document.getElementById('ovenPrestige'),
  bakeryPrestige: document.getElementById('bakeryPrestige'),
  butterPrestige: document.getElementById('butterPrestige'),
  restaurantPrestige: document.getElementById('restaurantPrestige'),
  prestigeOven: document.getElementById('prestigeOven'),
  prestigeBakery: document.getElementById('prestigeBakery'),
  prestigeButter: document.getElementById('prestigeButter'),
  prestigeRestaurant: document.getElementById('prestigeRestaurant'),
  ovenAchLevel: document.getElementById('ovenAchLevel'),
  bakeryAchLevel: document.getElementById('bakeryAchLevel'),
  butterAchLevel: document.getElementById('butterAchLevel'),
  restaurantAchLevel: document.getElementById('restaurantAchLevel'),
  ovenAchProgress: document.getElementById('ovenAchProgress'),
  bakeryAchProgress: document.getElementById('bakeryAchProgress'),
  butterAchProgress: document.getElementById('butterAchProgress'),
  restaurantAchProgress: document.getElementById('restaurantAchProgress'),
  eventStatus: document.getElementById('eventStatus'),
  rainLayer: document.getElementById('rainLayer'),
  rainTimer: document.getElementById('rainTimer'),
  beltTrack: document.getElementById('beltTrack'),
};

refs.button.addEventListener('click', (event) => {
  const gain = perClickValue() * (rainEventActive ? 5 : 1);
  state.croissants += gain;
  showClickGain(event, gain);
  refresh();
});

refs.buyOven.addEventListener('click', () => buyUpgrade('oven'));
refs.buyBakery.addEventListener('click', () => buyUpgrade('bakery'));
refs.buyButter.addEventListener('click', () => buyUpgrade('butter'));
refs.buyRestaurant.addEventListener('click', () => buyUpgrade('restaurant'));
refs.spinRoulette.addEventListener('click', spinRoulette);
refs.prestigeOven.addEventListener('click', () => prestigeBranch('oven'));
refs.prestigeBakery.addEventListener('click', () => prestigeBranch('bakery'));
refs.prestigeButter.addEventListener('click', () => prestigeBranch('butter'));
refs.prestigeRestaurant.addEventListener('click', () => prestigeBranch('restaurant'));

setInterval(() => {
  state.croissants += perSecond();
  refresh();
}, 1000);

setInterval(saveState, 3000);
window.addEventListener('beforeunload', saveState);
scheduleCroissantRain();
initDishBelt();

refresh();

function buyUpgrade(type) {
  const price = getCurrentPrice(type);
  if (state.croissants < price) return;

  state.croissants -= price;
  grantBranchLevel(type);

  refresh();
}

function grantBranchLevel(type) {
  state.prices[type] = Math.ceil(state.prices[type] * 1.2);

  if (type === 'oven') state.ovens += 1;
  if (type === 'bakery') state.bakeries += 1;
  if (type === 'butter') {
    state.butter += 1;
    state.perClick += 1;
  }
  if (type === 'restaurant') state.restaurants += 1;
}

function spinRoulette() {
  if (rouletteSpinning) return;
  const cost = rouletteCost();
  if (state.croissants < cost) return;

  state.croissants -= cost;
  const outcome = pickRouletteOutcome();
  const segment = pickSegmentForOutcome(outcome.kind);
  startRouletteSpin(segment, () => {
    applyRouletteOutcome(outcome);
    refresh();
  });
}

function rouletteCost() {
  const average = (
    getCurrentPrice('oven')
    + getCurrentPrice('bakery')
    + getCurrentPrice('butter')
    + getCurrentPrice('restaurant')
  ) / 4;
  return Math.ceil(average);
}

function randomBranch() {
  const branches = ['oven', 'bakery', 'butter', 'restaurant'];
  return branches[randomInt(0, branches.length - 1)];
}

function branchLabel(type) {
  if (type === 'oven') return 'Духовка';
  if (type === 'bakery') return 'Пекарня';
  if (type === 'butter') return 'Масло';
  return 'Ресторан';
}

function pickRouletteOutcome() {
  const roll = Math.random();

  if (roll < 0.01) {
    const branch = randomBranch();
    return {
      kind: 'prestige',
      apply: () => { state.prestige[branch] += 1; },
      message: `✨ Престиж +1: ${branchLabel(branch)}`,
    };
  }

  if (roll < 0.11) {
    return { kind: 'lose', apply: () => {}, message: 'УВЫ' };
  }

  if (roll < 0.41) {
    return { kind: 'reroll', apply: () => {}, message: '🔁 Повторная прокрутка!' };
  }

  const branch = randomBranch();
  return {
    kind: branch,
    apply: () => { grantBranchLevel(branch); },
    message: `🎉 +1 уровень: ${branchLabel(branch)}`,
  };
}

function pickSegmentForOutcome(kind) {
  if (kind === 'prestige') return 7;
  if (kind === 'lose') return 4;
  if (kind === 'reroll') return Math.random() < 0.5 ? 2 : 6;
  if (kind === 'oven') return 3;
  if (kind === 'bakery') return 0;
  if (kind === 'butter') return 1;
  return 5;
}

function startRouletteSpin(segmentIndex, onDone) {
  rouletteSpinning = true;
  const spinDuration = randomInt(7000, 12000);
  const segmentAngle = 360 / 8;
  const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2;
  const extraSpins = randomInt(9, 13) * 360;
  const target = extraSpins + (360 - segmentCenter);
  rouletteRotation += target;

  if (refs.rouletteWheel) {
    refs.rouletteWheel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.15, 0.82, 0.22, 1)`;
    refs.rouletteWheel.style.transform = `rotate(${rouletteRotation}deg)`;
  }

  refs.rouletteResult.textContent = '🎡 Крутим...';
  refresh();

  setTimeout(() => {
    rouletteSpinning = false;
    onDone();
  }, spinDuration + 50);
}

function applyRouletteOutcome(outcome) {
  outcome.apply();
  refs.rouletteResult.textContent = outcome.message;
}

function prestigeBranch(type) {
  if (!canPrestige(type)) return;

  if (type === 'oven') state.ovens -= 10;
  if (type === 'bakery') state.bakeries -= 10;
  if (type === 'butter') {
    state.butter -= 10;
    state.perClick = Math.max(1, state.perClick - 10);
  }
  if (type === 'restaurant') state.restaurants -= 10;

  state.prestige[type] += 1;
  refresh();
}

function canPrestige(type) {
  if (type === 'oven') return state.ovens >= 10;
  if (type === 'bakery') return state.bakeries >= 10;
  if (type === 'butter') return state.butter >= 10;
  return state.restaurants >= 10;
}

function branchMultiplier(type) {
  return 1 + (state.prestige[type] || 0) * 0.03;
}

function prestigeBranch(type) {
  if (!canPrestige(type)) return;

  if (type === 'oven') state.ovens -= 10;
  if (type === 'bakery') state.bakeries -= 10;
  if (type === 'butter') {
    state.butter -= 10;
    state.perClick = Math.max(1, state.perClick - 10);
  }
  if (type === 'restaurant') state.restaurants -= 10;

  state.prestige[type] += 1;
  refresh();
}

function canPrestige(type) {
  if (type === 'oven') return state.ovens >= 10;
  if (type === 'bakery') return state.bakeries >= 10;
  if (type === 'butter') return state.butter >= 10;
  return state.restaurants >= 10;
}

function branchMultiplier(type) {
  return 1 + (state.prestige[type] || 0) * 0.03;
}

function perSecond() {
  const ovensIncome = state.ovens * 1 * branchMultiplier('oven');
  const bakeryIncome = state.bakeries * 5 * branchMultiplier('bakery');
  const restaurantIncome = state.restaurants * 20 * branchMultiplier('restaurant');
  return ovensIncome + bakeryIncome + restaurantIncome;
}

function perClickValue() {
  const butterPrestigeBonus = state.butter * (branchMultiplier('butter') - 1);
  return state.perClick + butterPrestigeBonus;
}

function refresh() {
  refs.count.textContent = format(state.croissants);
  refs.perClick.textContent = formatStat(perClickValue());
  refs.perSecond.textContent = formatStat(perSecond());

  refs.ovenPrice.textContent = getPriceLabel('oven');
  refs.bakeryPrice.textContent = getPriceLabel('bakery');
  refs.butterPrice.textContent = getPriceLabel('butter');
  refs.restaurantPrice.textContent = getPriceLabel('restaurant');
  refs.rouletteCost.textContent = format(rouletteCost());

  refs.ovenOwned.textContent = state.ovens;
  refs.bakeryOwned.textContent = state.bakeries;
  refs.butterOwned.textContent = state.butter;
  refs.restaurantOwned.textContent = state.restaurants;
  refs.ovenPrestige.textContent = state.prestige.oven;
  refs.bakeryPrestige.textContent = state.prestige.bakery;
  refs.butterPrestige.textContent = state.prestige.butter;
  refs.restaurantPrestige.textContent = state.prestige.restaurant;
  refreshAchievements();

  refs.buyOven.disabled = state.croissants < getCurrentPrice('oven');
  refs.buyBakery.disabled = state.croissants < getCurrentPrice('bakery');
  refs.buyButter.disabled = state.croissants < getCurrentPrice('butter');
  refs.buyRestaurant.disabled = state.croissants < getCurrentPrice('restaurant');
  refs.spinRoulette.disabled = rouletteSpinning || state.croissants < rouletteCost();
  refs.prestigeOven.disabled = !canPrestige('oven');
  refs.prestigeBakery.disabled = !canPrestige('bakery');
  refs.prestigeButter.disabled = !canPrestige('butter');
  refs.prestigeRestaurant.disabled = !canPrestige('restaurant');
}

function refreshAchievements() {
  updateAchievement(refs.ovenAchLevel, refs.ovenAchProgress, state.ovens);
  updateAchievement(refs.bakeryAchLevel, refs.bakeryAchProgress, state.bakeries);
  updateAchievement(refs.butterAchLevel, refs.butterAchProgress, state.butter);
  updateAchievement(refs.restaurantAchLevel, refs.restaurantAchProgress, state.restaurants);
}

function updateAchievement(levelNode, progressNode, owned) {
  if (!levelNode || !progressNode) return;
  const level = Math.floor(owned / 10);
  const progress = owned % 10;
  levelNode.textContent = `${level}`;
  progressNode.textContent = `${progress}/10`;
}

function format(value) {
  return new Intl.NumberFormat('ru-RU').format(Math.floor(value));
}

function formatStat(value) {
  if (Number.isInteger(value)) return `${value}`;
  return value.toFixed(2);
}

function formatGain(value) {
  return value.toFixed(1);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);

    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      prices: {
        ...defaultState.prices,
        ...(parsed.prices || {}),
      },
      prestige: {
        ...defaultState.prestige,
        ...(parsed.prestige || {}),
      },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function scheduleCroissantRain() {
  const minDelayMs = 3 * 60 * 1000;
  const maxDelayMs = 5 * 60 * 1000;
  const delay = randomInt(minDelayMs, maxDelayMs);

  setTimeout(() => {
    startCroissantRain();
    scheduleCroissantRain();
  }, delay);
}

function startCroissantRain() {
  const rainDurationMs = randomInt(30_000, 45_000);
  const spawnEveryMs = 180;
  rainEventActive = true;
  const rainEndsAt = Date.now() + rainDurationMs;

  refs.eventStatus.textContent = '🌧️ Дождь из круассанов! Бонус: x5 за клик.';
  showRainTimer(rainEndsAt);
  refresh();

  const spawnTimer = setInterval(spawnFallingCroissant, spawnEveryMs);
  const countdownTimer = setInterval(() => updateRainTimer(rainEndsAt), 250);

  setTimeout(() => {
    clearInterval(spawnTimer);
    clearInterval(countdownTimer);
    refs.eventStatus.textContent = '';
    rainEventActive = false;
    hideRainTimer();
    refresh();
  }, rainDurationMs);
}

function spawnFallingCroissant() {
  if (!refs.rainLayer) return;

  const node = document.createElement('span');
  node.className = 'rain-croissant';
  node.textContent = '🥐';
  node.style.left = `${Math.random() * 100}vw`;
  node.style.animationDuration = `${randomInt(1200, 2500)}ms`;
  node.style.setProperty('--drift', `${randomInt(-120, 120)}px`);

  refs.rainLayer.appendChild(node);
  setTimeout(() => node.remove(), 3000);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentPrice(type) {
  return state.prices[type];
}

function getPriceLabel(type) {
  return `${getCurrentPrice(type)}`;
}

function showRainTimer(rainEndsAt) {
  if (!refs.rainTimer) return;
  refs.rainTimer.style.display = 'block';
  updateRainTimer(rainEndsAt);
}

function updateRainTimer(rainEndsAt) {
  if (!refs.rainTimer) return;
  const msLeft = Math.max(0, rainEndsAt - Date.now());
  const secondsLeft = Math.ceil(msLeft / 1000);
  refs.rainTimer.textContent = `🌧️ Дождь: ${secondsLeft}с`;
}

function hideRainTimer() {
  if (!refs.rainTimer) return;
  refs.rainTimer.style.display = 'none';
  refs.rainTimer.textContent = '';
}

function showClickGain(event, gain = state.perClick) {
  const node = document.createElement('span');
  node.className = 'click-gain';
  node.textContent = `+${formatGain(gain)}`;

  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;

  document.body.appendChild(node);
  setTimeout(() => node.remove(), 900);
}

function initDishBelt() {
  if (!refs.beltTrack) return;

  const baseItems = [];
  for (let i = 0; i < BELT_VISIBLE_ITEMS; i += 1) {
    const node = createDishNode(randomDishType());
    baseItems.push(node);
    refs.beltTrack.appendChild(node);
  }

  baseItems.forEach((node) => {
    refs.beltTrack.appendChild(node.cloneNode(true));
  });

  refs.beltTrack.addEventListener('click', onBeltClick);
}

function randomDishType() {
  return Math.random() < 0.15 ? 'pizza' : 'croissant';
}

function createDishNode(type) {
  const node = document.createElement('span');
  node.className = 'belt-item';
  node.setAttribute('aria-hidden', 'true');
  node.dataset.kind = type;
  node.textContent = type === 'pizza' ? '🍕' : '🥐';
  if (type === 'pizza') {
    node.classList.add('is-pizza');
  }
  return node;
}

function onBeltClick(event) {
  const dishNode = event.target.closest('.belt-item');
  if (!dishNode || dishNode.dataset.kind !== 'pizza') return;

  state.croissants += 1000;
  showClickGain(event, 1000);
  dishNode.replaceWith(createDishNode('croissant'));
  refresh();
}
