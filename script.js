const STORAGE_KEY = 'croissant_clicker_save_v1';
const BELT_VISIBLE_ITEMS = 15;
const BRANCH_KEYS = ['oven', 'bakery', 'butter', 'restaurant', 'cart', 'chef', 'factory', 'airport'];
const BRANCH_CONFIG = {
  oven: { ownedKey: 'ovens', perSecond: 1, label: 'Духовка', ids: { buy: 'buyOven', price: 'ovenPrice', owned: 'ovenOwned', prestige: 'ovenPrestige', prestigeBtn: 'prestigeOven', achLevel: 'ovenAchLevel', achProgress: 'ovenAchProgress' } },
  bakery: { ownedKey: 'bakeries', perSecond: 5, label: 'Пекарня', ids: { buy: 'buyBakery', price: 'bakeryPrice', owned: 'bakeryOwned', prestige: 'bakeryPrestige', prestigeBtn: 'prestigeBakery', achLevel: 'bakeryAchLevel', achProgress: 'bakeryAchProgress' } },
  butter: { ownedKey: 'butter', perSecond: 0, label: 'Масло', ids: { buy: 'buyButter', price: 'butterPrice', owned: 'butterOwned', prestige: 'butterPrestige', prestigeBtn: 'prestigeButter', achLevel: 'butterAchLevel', achProgress: 'butterAchProgress' } },
  restaurant: { ownedKey: 'restaurants', perSecond: 20, label: 'Ресторан', ids: { buy: 'buyRestaurant', price: 'restaurantPrice', owned: 'restaurantOwned', prestige: 'restaurantPrestige', prestigeBtn: 'prestigeRestaurant', achLevel: 'restaurantAchLevel', achProgress: 'restaurantAchProgress' } },
  cart: { ownedKey: 'carts', perSecond: 2, label: 'Тележка', ids: { buy: 'buyCart', price: 'cartPrice', owned: 'cartOwned', prestige: 'cartPrestige', prestigeBtn: 'prestigeCart', achLevel: 'cartAchLevel', achProgress: 'cartAchProgress' } },
  chef: { ownedKey: 'chefs', perSecond: 12, label: 'Шеф-пекарь', ids: { buy: 'buyChef', price: 'chefPrice', owned: 'chefOwned', prestige: 'chefPrestige', prestigeBtn: 'prestigeChef', achLevel: 'chefAchLevel', achProgress: 'chefAchProgress' } },
  factory: { ownedKey: 'factories', perSecond: 45, label: 'Фабрика', ids: { buy: 'buyFactory', price: 'factoryPrice', owned: 'factoryOwned', prestige: 'factoryPrestige', prestigeBtn: 'prestigeFactory', achLevel: 'factoryAchLevel', achProgress: 'factoryAchProgress' } },
  airport: { ownedKey: 'airports', perSecond: 150, label: 'Аэропекарня', ids: { buy: 'buyAirport', price: 'airportPrice', owned: 'airportOwned', prestige: 'airportPrestige', prestigeBtn: 'prestigeAirport', achLevel: 'airportAchLevel', achProgress: 'airportAchProgress' } },
};

const defaultState = {
  croissants: 0,
  recipes: 1,
  talentUnlocked: false,
  talents: {
    core: 0,
    passive: 0,
    click: 0,
  },
  perClick: 1,
  ovens: 0,
  bakeries: 0,
  butter: 0,
  restaurants: 0,
  carts: 0,
  chefs: 0,
  factories: 0,
  airports: 0,
  prices: {
    oven: 25,
    bakery: 120,
    butter: 60,
    restaurant: 480,
    cart: 70,
    chef: 260,
    factory: 1200,
    airport: 4200,
  },
  prestige: {
    oven: 0,
    bakery: 0,
    butter: 0,
    restaurant: 0,
    cart: 0,
    chef: 0,
    factory: 0,
    airport: 0,
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
  openTalentTree: document.getElementById('openTalentTree'),
  talentModal: document.getElementById('talentModal'),
  closeTalentTree: document.getElementById('closeTalentTree'),
  unlockTalentTree: document.getElementById('unlockTalentTree'),
  recipesCount: document.getElementById('recipesCount'),
  talentLocked: document.getElementById('talentLocked'),
  talentUnlocked: document.getElementById('talentUnlocked'),
  talentCoreLevel: document.getElementById('talentCoreLevel'),
  talentPassiveLevel: document.getElementById('talentPassiveLevel'),
  talentClickLevel: document.getElementById('talentClickLevel'),
  upgradeTalentCore: document.getElementById('upgradeTalentCore'),
  upgradeTalentPassive: document.getElementById('upgradeTalentPassive'),
  upgradeTalentClick: document.getElementById('upgradeTalentClick'),
  rouletteCost: document.getElementById('rouletteCost'),
  spinRoulette: document.getElementById('spinRoulette'),
  rouletteResult: document.getElementById('rouletteResult'),
  rouletteWheel: document.getElementById('rouletteWheel'),
  buyOven: document.getElementById('buyOven'),
  buyBakery: document.getElementById('buyBakery'),
  buyButter: document.getElementById('buyButter'),
  buyRestaurant: document.getElementById('buyRestaurant'),
  buyCart: document.getElementById('buyCart'),
  buyChef: document.getElementById('buyChef'),
  buyFactory: document.getElementById('buyFactory'),
  buyAirport: document.getElementById('buyAirport'),
  ovenPrice: document.getElementById('ovenPrice'),
  bakeryPrice: document.getElementById('bakeryPrice'),
  butterPrice: document.getElementById('butterPrice'),
  restaurantPrice: document.getElementById('restaurantPrice'),
  cartPrice: document.getElementById('cartPrice'),
  chefPrice: document.getElementById('chefPrice'),
  factoryPrice: document.getElementById('factoryPrice'),
  airportPrice: document.getElementById('airportPrice'),
  ovenOwned: document.getElementById('ovenOwned'),
  bakeryOwned: document.getElementById('bakeryOwned'),
  butterOwned: document.getElementById('butterOwned'),
  restaurantOwned: document.getElementById('restaurantOwned'),
  cartOwned: document.getElementById('cartOwned'),
  chefOwned: document.getElementById('chefOwned'),
  factoryOwned: document.getElementById('factoryOwned'),
  airportOwned: document.getElementById('airportOwned'),
  ovenPrestige: document.getElementById('ovenPrestige'),
  bakeryPrestige: document.getElementById('bakeryPrestige'),
  butterPrestige: document.getElementById('butterPrestige'),
  restaurantPrestige: document.getElementById('restaurantPrestige'),
  cartPrestige: document.getElementById('cartPrestige'),
  chefPrestige: document.getElementById('chefPrestige'),
  factoryPrestige: document.getElementById('factoryPrestige'),
  airportPrestige: document.getElementById('airportPrestige'),
  prestigeOven: document.getElementById('prestigeOven'),
  prestigeBakery: document.getElementById('prestigeBakery'),
  prestigeButter: document.getElementById('prestigeButter'),
  prestigeRestaurant: document.getElementById('prestigeRestaurant'),
  prestigeCart: document.getElementById('prestigeCart'),
  prestigeChef: document.getElementById('prestigeChef'),
  prestigeFactory: document.getElementById('prestigeFactory'),
  prestigeAirport: document.getElementById('prestigeAirport'),
  ovenAchLevel: document.getElementById('ovenAchLevel'),
  bakeryAchLevel: document.getElementById('bakeryAchLevel'),
  butterAchLevel: document.getElementById('butterAchLevel'),
  restaurantAchLevel: document.getElementById('restaurantAchLevel'),
  cartAchLevel: document.getElementById('cartAchLevel'),
  chefAchLevel: document.getElementById('chefAchLevel'),
  factoryAchLevel: document.getElementById('factoryAchLevel'),
  airportAchLevel: document.getElementById('airportAchLevel'),
  ovenAchProgress: document.getElementById('ovenAchProgress'),
  bakeryAchProgress: document.getElementById('bakeryAchProgress'),
  butterAchProgress: document.getElementById('butterAchProgress'),
  restaurantAchProgress: document.getElementById('restaurantAchProgress'),
  cartAchProgress: document.getElementById('cartAchProgress'),
  chefAchProgress: document.getElementById('chefAchProgress'),
  factoryAchProgress: document.getElementById('factoryAchProgress'),
  airportAchProgress: document.getElementById('airportAchProgress'),
  eventStatus: document.getElementById('eventStatus'),
  rainLayer: document.getElementById('rainLayer'),
  rainTimer: document.getElementById('rainTimer'),
  beltTrack: document.getElementById('beltTrack'),
};

const branchUI = Object.fromEntries(
  BRANCH_KEYS.map((branch) => {
    const ids = BRANCH_CONFIG[branch].ids;
    return [branch, {
      buy: document.getElementById(ids.buy),
      price: document.getElementById(ids.price),
      owned: document.getElementById(ids.owned),
      prestige: document.getElementById(ids.prestige),
      prestigeBtn: document.getElementById(ids.prestigeBtn),
      achLevel: document.getElementById(ids.achLevel),
      achProgress: document.getElementById(ids.achProgress),
    }];
  }),
);

refs.button.addEventListener('click', (event) => {
  const gain = perClickValue() * (rainEventActive ? 5 : 1);
  state.croissants += gain;
  showClickGain(event, gain);
  refresh();
});

BRANCH_KEYS.forEach((branch) => {
  branchUI[branch].buy.addEventListener('click', () => buyUpgrade(branch));
  branchUI[branch].prestigeBtn.addEventListener('click', () => prestigeBranch(branch));
});
refs.openTalentTree.addEventListener('click', openTalentTree);
refs.closeTalentTree.addEventListener('click', closeTalentTree);
refs.unlockTalentTree.addEventListener('click', unlockTalentTree);
refs.upgradeTalentCore.addEventListener('click', () => upgradeTalent('core'));
refs.upgradeTalentPassive.addEventListener('click', () => upgradeTalent('passive'));
refs.upgradeTalentClick.addEventListener('click', () => upgradeTalent('click'));
refs.spinRoulette.addEventListener('click', spinRoulette);

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
  const { ownedKey } = BRANCH_CONFIG[type];
  state[ownedKey] += 1;
  if (type === 'butter') {
    state.perClick += 1;
  }
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
    + getCurrentPrice('cart')
    + getCurrentPrice('chef')
    + getCurrentPrice('factory')
    + getCurrentPrice('airport')
  ) / 8;
  return Math.ceil(average);
}

function randomBranch() {
  return BRANCH_KEYS[randomInt(0, BRANCH_KEYS.length - 1)];
}

function branchLabel(type) {
  return BRANCH_CONFIG[type].label;
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
  if (kind === 'cart') return 0;
  if (kind === 'chef') return 1;
  if (kind === 'factory') return 3;
  if (kind === 'airport') return 5;
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

function openTalentTree() {
  refs.talentModal.classList.add('open');
  refreshTalentUI();
}

function closeTalentTree() {
  refs.talentModal.classList.remove('open');
}

function unlockTalentTree() {
  const unlockCost = 10_000;
  if (state.talentUnlocked) return;
  if (state.croissants < unlockCost) return;
  state.croissants -= unlockCost;
  state.talentUnlocked = true;
  refresh();
}

function upgradeTalent(type) {
  if (!state.talentUnlocked) return;
  if ((type === 'passive' || type === 'click') && state.talents.core < 3) return;

  const cost = type === 'passive' ? 2 : 1;
  if (state.recipes < cost) return;

  state.recipes -= cost;
  state.talents[type] += 1;
  refresh();
}

function getTalentMultipliers() {
  const all = 1 + state.talents.core * 0.01;
  const passive = 1 + state.talents.passive * 0.03;
  const click = 1 + state.talents.click * 0.10;
  return { all, passive, click };
}

function refreshTalentUI() {
  refs.recipesCount.textContent = format(state.recipes);
  refs.talentLocked.style.display = state.talentUnlocked ? 'none' : 'block';
  refs.talentUnlocked.style.display = state.talentUnlocked ? 'block' : 'none';

  refs.unlockTalentTree.disabled = state.talentUnlocked || state.croissants < 10_000;
  refs.talentCoreLevel.textContent = state.talents.core;
  refs.talentPassiveLevel.textContent = state.talents.passive;
  refs.talentClickLevel.textContent = state.talents.click;

  refs.upgradeTalentCore.disabled = !state.talentUnlocked || state.recipes < 1;
  refs.upgradeTalentPassive.disabled = !state.talentUnlocked || state.talents.core < 3 || state.recipes < 2;
  refs.upgradeTalentClick.disabled = !state.talentUnlocked || state.talents.core < 3 || state.recipes < 1;
}

function prestigeBranch(type) {
  if (!canPrestige(type)) return;
  const { ownedKey } = BRANCH_CONFIG[type];
  state[ownedKey] = Math.max(0, state[ownedKey] - 10);
  if (type === 'butter') {
    state.perClick = Math.max(1, state.perClick - 10);
  }

  state.prestige[type] += 1;
  refresh();
}

function canPrestige(type) {
  return ownedCount(BRANCH_CONFIG[type].ownedKey) >= 10;
}

function ownedCount(key) {
  const value = Number(state[key]);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function branchMultiplier(type) {
  return 1 + (state.prestige[type] || 0) * 0.03;
}

function canPrestige(type) {
  return ownedCount(BRANCH_CONFIG[type].ownedKey) >= 10;
}

function ownedCount(key) {
  const value = Number(state[key]);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function branchMultiplier(type) {
  return 1 + (state.prestige[type] || 0) * 0.03;
}

function perSecond() {
  const talent = getTalentMultipliers();
  return BRANCH_KEYS.reduce((sum, branch) => {
    const { ownedKey, perSecond: base } = BRANCH_CONFIG[branch];
    if (!base) return sum;
    return sum + state[ownedKey] * base * branchMultiplier(branch) * talent.all * talent.passive;
  }, 0);
}

function perClickValue() {
  const butterPrestigeBonus = state.butter * (branchMultiplier('butter') - 1);
  const talent = getTalentMultipliers();
  return (state.perClick + butterPrestigeBonus) * talent.all * talent.click;
}

function refresh() {
  refs.count.textContent = format(state.croissants);
  refs.perClick.textContent = formatStat(perClickValue());
  refs.perSecond.textContent = formatStat(perSecond());

  BRANCH_KEYS.forEach((branch) => {
    branchUI[branch].price.textContent = getPriceLabel(branch);
  });
  refs.rouletteCost.textContent = format(rouletteCost());

  BRANCH_KEYS.forEach((branch) => {
    const { ownedKey } = BRANCH_CONFIG[branch];
    branchUI[branch].owned.textContent = state[ownedKey];
    branchUI[branch].prestige.textContent = state.prestige[branch];
  });
  refreshAchievements();

  BRANCH_KEYS.forEach((branch) => {
    branchUI[branch].buy.disabled = state.croissants < getCurrentPrice(branch);
    branchUI[branch].prestigeBtn.disabled = !canPrestige(branch);
  });
  refs.spinRoulette.disabled = rouletteSpinning || state.croissants < rouletteCost();
  refs.openTalentTree.textContent = `🌿 Дерево талантов (${format(state.recipes)})`;
  refreshTalentUI();
}

function refreshAchievements() {
  BRANCH_KEYS.forEach((branch) => {
    const { ownedKey } = BRANCH_CONFIG[branch];
    updateAchievement(branchUI[branch].achLevel, branchUI[branch].achProgress, state[ownedKey]);
  });
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
    const merged = {
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
      talents: {
        ...defaultState.talents,
        ...(parsed.talents || {}),
      },
    };
    return sanitizeState(merged);
  } catch {
    return sanitizeState(structuredClone(defaultState));
  }
}

function sanitizeState(inputState) {
  const next = { ...inputState };
  next.croissants = sanitizeNonNegative(next.croissants);
  next.recipes = sanitizeNonNegative(next.recipes);
  next.talentUnlocked = Boolean(next.talentUnlocked);
  next.talents = {
    core: sanitizeNonNegative(next.talents?.core),
    passive: sanitizeNonNegative(next.talents?.passive),
    click: sanitizeNonNegative(next.talents?.click),
  };
  next.perClick = Math.max(1, sanitizeNonNegative(next.perClick));

  next.ovens = sanitizeNonNegative(next.ovens);
  next.bakeries = sanitizeNonNegative(next.bakeries);
  next.butter = sanitizeNonNegative(next.butter);
  next.restaurants = sanitizeNonNegative(next.restaurants);
  next.carts = sanitizeNonNegative(next.carts);
  next.chefs = sanitizeNonNegative(next.chefs);
  next.factories = sanitizeNonNegative(next.factories);
  next.airports = sanitizeNonNegative(next.airports);

  next.prices = { ...next.prices };
  BRANCH_KEYS.forEach((key) => {
    next.prices[key] = Math.max(1, sanitizeNonNegative(next.prices[key]));
  });

  next.prestige = { ...next.prestige };
  BRANCH_KEYS.forEach((key) => {
    next.prestige[key] = sanitizeNonNegative(next.prestige[key]);
  });

  return next;
}

function sanitizeNonNegative(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return number;
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
