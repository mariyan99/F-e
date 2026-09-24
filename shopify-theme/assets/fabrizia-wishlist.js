const STORAGE_KEY = 'fabrizia:wishlist';

function readWishlist() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

function writeWishlist(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(items.map(String))]));
}

function syncWishlist() {
  const items = readWishlist();
  const count = items.length;

  document.querySelectorAll('[data-fabrizia-wishlist-count]').forEach((node) => {
    node.textContent = count ? String(count) : '';
    node.toggleAttribute('hidden', count === 0);
  });

  document.querySelectorAll('[data-fabrizia-wishlist-button]').forEach((button) => {
    const id = button.getAttribute('data-product-id');
    const active = Boolean(id && items.includes(id));
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.setAttribute('title', active ? 'Премахни от любими' : 'Добави в любими');
  });
}

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('[data-fabrizia-wishlist-button]') : null;
  if (!target) return;

  event.preventDefault();
  event.stopPropagation();

  const id = target.getAttribute('data-product-id');
  if (!id) return;

  const items = readWishlist();
  const next = items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
  writeWishlist(next);
  syncWishlist();
});

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) syncWishlist();
});

document.addEventListener('shopify:section:load', syncWishlist);
document.addEventListener('DOMContentLoaded', syncWishlist);
syncWishlist();
