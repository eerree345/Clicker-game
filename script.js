const STORAGE_KEY = 'croissant_clicker_save_v1';

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
};

let state = loadState();
let rainEventActive = false;
let rainDiscountBranch = null;

const refs = {
  count: document.getElementById('count'),
  perClick: document.getElementById('perClick'),
  perSecond: document.getElementById('perSecond'),
  button: document.getElementById('croissantButton'),
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
  eventStatus: document.getElementById('eventStatus'),
  rainLayer: document.getElementById('rainLayer'),
  rainTimer: document.getElementById('rainTimer'),
};

refs.button.addEventListener('click', (event) => {
  state.croissants += state.perClick;
  showClickGain(event);
  refresh();
});

refs.buyOven.addEventListener('click', () => buyUpgrade('oven'));
refs.buyBakery.addEventListener('click', () => buyUpgrade('bakery'));
refs.buyButter.addEventListener('click', () => buyUpgrade('butter'));
refs.buyRestaurant.addEventListener('click', () => buyUpgrade('restaurant'));

setInterval(() => {
  state.croissants += perSecond();
  refresh();
}, 1000);

setInterval(saveState, 3000);
window.addEventListener('beforeunload', saveState);
scheduleCroissantRain();

refresh();

function buyUpgrade(type) {
  const price = getCurrentPrice(type);
  if (state.croissants < price) return;

  state.croissants -= price;
  state.prices[type] = Math.ceil(state.prices[type] * 1.2);

  if (type === 'oven') state.ovens += 1;
  if (type === 'bakery') state.bakeries += 1;
  if (type === 'butter') {
    state.butter += 1;
    state.perClick += 1;
  }
  if (type === 'restaurant') state.restaurants += 1;

  refresh();
}

function perSecond() {
  return state.ovens * 1 + state.bakeries * 5 + state.restaurants * 20;
}

function refresh() {
  refs.count.textContent = format(state.croissants);
  refs.perClick.textContent = state.perClick;
  refs.perSecond.textContent = perSecond();

  refs.ovenPrice.textContent = getPriceLabel('oven');
  refs.bakeryPrice.textContent = getPriceLabel('bakery');
  refs.butterPrice.textContent = getPriceLabel('butter');
  refs.restaurantPrice.textContent = getPriceLabel('restaurant');

  refs.ovenOwned.textContent = state.ovens;
  refs.bakeryOwned.textContent = state.bakeries;
  refs.butterOwned.textContent = state.butter;
  refs.restaurantOwned.textContent = state.restaurants;

  refs.buyOven.disabled = state.croissants < getCurrentPrice('oven');
  refs.buyBakery.disabled = state.croissants < getCurrentPrice('bakery');
  refs.buyButter.disabled = state.croissants < getCurrentPrice('butter');
  refs.buyRestaurant.disabled = state.croissants < getCurrentPrice('restaurant');
}

function format(value) {
  return new Intl.NumberFormat('ru-RU').format(Math.floor(value));
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
  const incomeEveryMs = 600;
  const bonusPerTick = Math.max(5, state.perClick * 3 + perSecond());
  const rainEndsAt = Date.now() + rainDurationMs;
  rainEventActive = true;
  rainDiscountBranch = pickRandomBranch();

  refs.eventStatus.textContent = `🌧️ Дождь из круассанов! Скидка 20% на ${branchName(rainDiscountBranch)}.`;
  showRainTimer(rainEndsAt);
  refresh();

  const spawnTimer = setInterval(spawnFallingCroissant, spawnEveryMs);
  const incomeTimer = setInterval(() => {
    state.croissants += bonusPerTick;
    refresh();
  }, incomeEveryMs);
  const countdownTimer = setInterval(() => updateRainTimer(rainEndsAt), 250);

  setTimeout(() => {
    clearInterval(spawnTimer);
    clearInterval(incomeTimer);
    clearInterval(countdownTimer);
    refs.eventStatus.textContent = '';
    rainEventActive = false;
    rainDiscountBranch = null;
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

function pickRandomBranch() {
  const branches = ['oven', 'bakery', 'butter', 'restaurant'];
  return branches[randomInt(0, branches.length - 1)];
}

function getCurrentPrice(type) {
  const basePrice = state.prices[type];
  if (rainEventActive && rainDiscountBranch === type) {
    return Math.ceil(basePrice * 0.8);
  }
  return basePrice;
}

function getPriceLabel(type) {
  const currentPrice = getCurrentPrice(type);
  if (rainEventActive && rainDiscountBranch === type) {
    return `${currentPrice} (−20%)`;
  }
  return `${currentPrice}`;
}

function branchName(type) {
  if (type === 'oven') return 'Духовку';
  if (type === 'bakery') return 'Пекарню';
  if (type === 'restaurant') return 'Ресторан';
  return 'Масло';
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

function showClickGain(event) {
  const gain = state.perClick;
  const node = document.createElement('span');
  node.className = 'click-gain';
  node.textContent = `+${format(gain)}`;

  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;

  document.body.appendChild(node);
  setTimeout(() => node.remove(), 900);
}
