const products = [
  {id:1,name:'Laptop Pro',category:'Electronics',price:85000,code:'NXR-CMP-01',description:'A focused everyday machine for study, creative work and development. Clean profile, generous display, no unnecessary visual noise.',image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=86'},
  {id:2,name:'Studio Headphones',category:'Electronics',price:5000,code:'NXR-AUD-02',description:'Comfort-first wireless headphones with a restrained silhouette and an easy all-day fit.',image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=86'},
  {id:3,name:'Field Watch',category:'Electronics',price:12000,code:'NXR-WTC-03',description:'A compact smart watch for notifications, training and daily activity without living on your wrist.',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=86'},
  {id:4,name:'Precision Mouse',category:'Electronics',price:2500,code:'NXR-DSK-04',description:'An understated wireless mouse shaped for long work sessions and clean desk setups.',image:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=86'},
  {id:5,name:'Heavy Tee',category:'Clothing',price:2500,code:'NXR-WEAR-05',description:'A heavier everyday tee with a relaxed shape that works just as well outside the gym.',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=86'},
  {id:6,name:'Indigo Denim',category:'Clothing',price:4500,code:'NXR-WEAR-06',description:'Straight-cut denim with a clean wash and enough structure to hold its shape through repeat wear.',image:'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=86'},
  {id:7,name:'Tempo Runner',category:'Shoes',price:8000,code:'NXR-FTW-07',description:'Lightweight running shoes built around comfort, movement and a shape you can wear beyond training.',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=86'},
  {id:8,name:'Court Sneaker',category:'Shoes',price:6500,code:'NXR-FTW-08',description:'A low-profile everyday sneaker balancing soft comfort with a sharper, minimal upper.',image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=86'},
  {id:9,name:'Fold Wallet',category:'Accessories',price:3000,code:'NXR-ACC-09',description:'A slim everyday wallet designed to disappear into a pocket while keeping the essentials in order.',image:'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=86'}
];

const $ = (s, scope = document) => scope.querySelector(s);
const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
const grid = $('#productGrid');
const productCount = $('#productCount');
const emptyState = $('#emptyState');
const searchInput = $('#searchInput');
const inlineSearch = $('#inlineSearch');
const inlineSearchClear = $('#inlineSearchClear');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let selectedCategory = 'All';
let searchText = '';
let cart = JSON.parse(localStorage.getItem('nexora-cart') || '[]');

function money(n) {
  return `Rs. ${n.toLocaleString()}`;
}

function filtered() {
  const query = searchText.toLowerCase().replace(/\s+/g, ' ').trim();

  let list = products.filter(p => {
    const productName = p.name.toLowerCase();
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = query === '' || productName.includes(query);
    return matchesCategory && matchesSearch;
  });

  const sort = $('#sortSelect').value;
  if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
  if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function setSelectedCategory(category) {
  selectedCategory = category;
  $$('#categoryFilters button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

function closeInlineSearch() {
  inlineSearch.classList.remove('open');
  inlineSearch.setAttribute('aria-hidden', 'true');
}

function updateSearchClear() {
  inlineSearchClear.disabled = searchInput.value.length === 0;
}

function renderProducts() {
  const list = filtered();
  productCount.textContent = `${list.length} object${list.length === 1 ? '' : 's'}`;

  const hasResults = list.length > 0;
  emptyState.hidden = hasResults;
  grid.hidden = !hasResults;

  grid.innerHTML = list.map(p => `
    <article class="product-card reveal in" data-id="${p.id}">
      <div class="product-media">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-code">${p.code}</span>
        <button class="quick-add" data-add="${p.id}" aria-label="Add ${p.name} to bag">＋</button>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <span class="category">${p.category}</span>
        <span class="price">${money(p.price)}</span>
      </div>
      <button class="details-link" data-details="${p.id}" aria-label="View ${p.name} details">View details</button>
    </article>`).join('');
}

function saveCart() {
  localStorage.setItem('nexora-cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const found = cart.find(item => item.id === id);
  if (found) found.qty += 1;
  else cart.push({id, qty: 1});
  saveCart();
}

function changeQty(id, delta) {
  const found = cart.find(i => i.id === id);
  if (!found) return;
  found.qty += delta;
  if (found.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function renderCart() {
  const items = $('#cartItems');
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  $('#cartBadge').textContent = count;

  if (!cart.length) {
    items.innerHTML = '<div class="cart-empty">Your bag is waiting.</div>';
    $('#cartTotal').textContent = 'Rs. 0';
    return;
  }

  items.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    return `<div class="cart-row"><img src="${p.image}" alt=""><div><h4>${p.name}</h4><small>${p.category}</small><div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1">＋</button></div></div><div class="row-right"><strong>${money(p.price * item.qty)}</strong><button class="remove" data-remove="${p.id}">Remove</button></div></div>`;
  }).join('');

  $('#cartTotal').textContent = money(
    cart.reduce((sum, item) => sum + products.find(p => p.id === item.id).price * item.qty, 0)
  );
}

function lockScroll() {
  if (document.body.dataset.scrollLocked === 'true') return;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.dataset.scrollLocked = 'true';
  document.body.style.setProperty('--lock-scrollbar', `${scrollbarWidth}px`);
  document.body.classList.add('scroll-locked');
}

function unlockScroll() {
  document.body.dataset.scrollLocked = 'false';
  document.body.classList.remove('scroll-locked');
  document.body.style.removeProperty('--lock-scrollbar');
}

function openLayer(el) {
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  $('#scrim').classList.add('show');
  lockScroll();
}

function closeLayer(el) {
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');

  if (!$('.cart-drawer.open') && !$('.product-modal.open') && !$('.checkout-modal.open')) {
    $('#scrim').classList.remove('show');
    unlockScroll();
  }
}

function openCart() {
  openLayer($('#cartDrawer'));
}

function openDetails(id) {
  const p = products.find(x => x.id === id);
  $('#modalImage').src = p.image;
  $('#modalImage').alt = p.name;
  $('#modalCategory').textContent = p.category;
  $('#modalName').textContent = p.name;
  $('#modalDescription').textContent = p.description;
  $('#modalPrice').textContent = money(p.price);
  $('#modalAdd').dataset.id = p.id;
  openLayer($('#productModal'));
}

function openInlineSearch() {
  // Search is global, so do not leave an old category filter silently active.
  setSelectedCategory('All');
  renderProducts();

  inlineSearch.classList.add('open');
  inlineSearch.setAttribute('aria-hidden', 'false');
  $('#shop').scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});

  window.setTimeout(() => {
    searchInput.focus({preventScroll: true});
  }, reduced ? 0 : 350);
}

function clearSearch({focus = false} = {}) {
  searchText = '';
  searchInput.value = '';
  setSelectedCategory('All');
  updateSearchClear();
  renderProducts();
  if (focus) searchInput.focus();
}

document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(Number(add.dataset.add));

    window.clearTimeout(add._resetTimer);
    add.classList.add('added');
    add.textContent = '✓';
    add._resetTimer = window.setTimeout(() => {
      add.classList.remove('added');
      add.textContent = '＋';
    }, 700);
  }

  const details = e.target.closest('[data-details]');
  if (details) openDetails(Number(details.dataset.details));

  const qty = e.target.closest('[data-qty]');
  if (qty) changeQty(Number(qty.dataset.qty), Number(qty.dataset.delta));

  const remove = e.target.closest('[data-remove]');
  if (remove) {
    cart = cart.filter(i => i.id !== Number(remove.dataset.remove));
    saveCart();
  }
});

$$('#categoryFilters button').forEach(btn => btn.addEventListener('click', () => {
  // Category filters and search are separate modes so the result is never ambiguous.
  searchText = '';
  searchInput.value = '';
  updateSearchClear();
  closeInlineSearch();
  setSelectedCategory(btn.dataset.category);
  renderProducts();
}));

$('#sortSelect').addEventListener('change', renderProducts);
$('#cartTrigger').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', () => closeLayer($('#cartDrawer')));
$('#scrim').addEventListener('click', () => $$('.open').forEach(closeLayer));
$('#modalClose').addEventListener('click', () => closeLayer($('#productModal')));
$('#modalAdd').addEventListener('click', e => {
  addToCart(Number(e.currentTarget.dataset.id));
  closeLayer($('#productModal'));
  openCart();
});

$('#searchTrigger').addEventListener('click', openInlineSearch);
searchInput.addEventListener('input', e => {
  searchText = e.target.value;

  // Any typed search should search the entire catalogue, not only the last selected category.
  if (searchText.trim() !== '') setSelectedCategory('All');

  updateSearchClear();
  renderProducts();
});
inlineSearchClear.addEventListener('click', () => clearSearch({focus: true}));
$('#clearSearch').addEventListener('click', () => clearSearch({focus: true}));

$('#checkoutBtn').addEventListener('click', () => {
  closeLayer($('#cartDrawer'));
  openLayer($('#checkoutModal'));
});
$('#checkoutClose').addEventListener('click', () => closeLayer($('#checkoutModal')));
$('#checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  $('#checkoutNote').textContent = 'Demo order received. A production build would now create the order and take payment.';
  $('#checkoutNote').style.color = '#c9ff3f';
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('.open').forEach(closeLayer);
});

renderProducts();
renderCart();
updateSearchClear();

if (!reduced) {
  const obs = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      obs.unobserve(entry.target);
    }
  }), {threshold: .12});

  $$('.reveal:not(.in)').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
    obs.observe(el);
  });

  addEventListener('scroll', () => {
    $$('.parallax').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        el.style.transform = `rotate(3deg) translateY(${(scrollY - el.offsetTop) * Number(el.dataset.speed || 0)}px)`;
      }
    });
  }, {passive: true});
} else {
  $$('.reveal').forEach(el => el.classList.add('in'));
}
