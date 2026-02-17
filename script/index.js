
// API Base URL
const API_BASE = 'https://fakestoreapi.com';

let allProducts = [];
let cart = [];
let selectedCategory = 'all';

// DOM Elements
const elements = {
  hamburger: document.getElementById('hamburger'),
  closeBtn: document.getElementById('close_btn'),
  navContainer: document.getElementById('nav_container'),
  navLinks: document.querySelectorAll('.nav_links'),
  shopNowBtn: document.getElementById('shop-now-btn'),
  categoryButtons: document.getElementById('category-buttons'),
  loading: document.getElementById('loading'),
  trendingGrid: document.getElementById('trending-grid'),
  productsGrid: document.getElementById('products-grid'),
  productCount: document.getElementById('product-count'),
  cartBtn: document.getElementById('cart-btn'),
  cartCount: document.getElementById('cart-count'),
  cartModal: document.getElementById('cart-modal'),
  closeCart: document.getElementById('close-cart'),
  cartItems: document.getElementById('cart-items'),
  emptyCart: document.getElementById('empty-cart'),
  cartFooter: document.getElementById('cart-footer'),
  cartTotal: document.getElementById('cart-total'),
  detailsModal: document.getElementById('details-modal'),
  closeDetails: document.getElementById('close-details'),
  detailsContent: document.getElementById('details-content'),
  newsletterForm: document.getElementById('newsletter-form')
};


document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupEventListeners();
  await fetchCategories();
  await fetchProducts();
  loadCartFromStorage();
}


function setupEventListeners() {
  // Mobile Menu Toggle
  elements.hamburger?.addEventListener('click', openMobileMenu);
  elements.closeBtn?.addEventListener('click', closeMobileMenu);
  elements.navContainer?.addEventListener('click', (e) => {
    if (e.target === elements.navContainer) closeMobileMenu();
  });

  // Close menu when clicking nav links
  elements.navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Shop Now button - navigate to products page
  elements.shopNowBtn?.addEventListener('click', () => {
    window.location.href = 'products.html';
  });

  // Cart Modal
  elements.cartBtn?.addEventListener('click', openCartModal);
  elements.closeCart?.addEventListener('click', closeCartModal);
  elements.cartModal?.addEventListener('click', (e) => {
    if (e.target === elements.cartModal) closeCartModal();
  });

  // Details Modal
  elements.closeDetails?.addEventListener('click', closeDetailsModal);
  elements.detailsModal?.addEventListener('click', (e) => {
    if (e.target === elements.detailsModal) closeDetailsModal();
  });

  // Newsletter Form
  elements.newsletterForm?.addEventListener('submit', handleNewsletterSubmit);
}

function openMobileMenu() {
  elements.navContainer.style.left = '0';
}

function closeMobileMenu() {
  elements.navContainer.style.left = '-100%';
}


async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE}/products/categories`);
    const categories = await response.json();
    renderCategoryButtons(['all', ...categories]);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

async function fetchProducts(category = 'all') {
  showLoading(true);
  try {
    const url = category === 'all' 
      ? `${API_BASE}/products` 
      : `${API_BASE}/products/category/${category}`;
    
    const response = await fetch(url);
    allProducts = await response.json();
    
    renderTrendingProducts();
    renderAllProducts();
    updateProductCount();
  } catch (error) {
    console.error('Error fetching products:', error);
    showError();
  } finally {
    showLoading(false);
  }
}

async function fetchProductDetails(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    const product = await response.json();
    showProductDetails(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
  }
}

function renderCategoryButtons(categories) {
  if (!elements.categoryButtons) return;
  
  elements.categoryButtons.innerHTML = categories.map(category => `
    <button 
      class="category-btn px-4 py-2 rounded-lg text-sm font-medium transition ${
        category === selectedCategory 
          ? 'bg-indigo-600 text-white' 
          : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
      }"
      data-category="${category}"
    >
      ${category.charAt(0).toUpperCase() + category.slice(1)}
    </button>
  `).join('');

  // Add click listeners
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedCategory = e.target.dataset.category;
      fetchProducts(selectedCategory === 'all' ? 'all' : selectedCategory);
      renderCategoryButtons(categories);
    });
  });
}

function renderTrendingProducts() {
  if (!elements.trendingGrid) return;

  // Get top 3 products by rating
  const topRated = [...allProducts]
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, 3);

  elements.trendingGrid.innerHTML = topRated.map(product => createProductCard(product, true)).join('');
  attachProductCardListeners();
}

function renderAllProducts() {
  if (!elements.productsGrid) return;
  
  elements.productsGrid.innerHTML = allProducts.map(product => createProductCard(product)).join('');
  attachProductCardListeners();
}

function createProductCard(product, isTrending = false) {
  return `
    <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden group">
      <div class="relative overflow-hidden bg-gray-50 ${isTrending ? 'h-64' : 'h-48'}">
        <img 
          src="${product.image}" 
          alt="${product.title}" 
          class="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
        />
        ${isTrending ? '<div class="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">Top Rated</div>' : ''}
        <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
          <button 
            class="view-details-btn w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-indigo-600 hover:text-white transition"
            data-id="${product.id}"
          >
            <i class="fas fa-eye text-sm"></i>
          </button>
        </div>
      </div>
      <div class="p-4">
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 flex-1" title="${product.title}">
            ${product.title}
          </h3>
        </div>
        <div class="flex items-center gap-1 mb-3">
          <div class="flex text-yellow-400">
            ${'<i class="fas fa-star text-xs"></i>'.repeat(Math.floor(product.rating.rate))}
            ${product.rating.rate % 1 >= 0.5 ? '<i class="fas fa-star-half-alt text-xs"></i>' : ''}
          </div>
          <span class="text-xs text-gray-500">(${product.rating.count})</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-indigo-600">$${product.price.toFixed(2)}</span>
          <button 
            class="add-to-cart-btn px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            data-id="${product.id}"
          >
            <i class="fas fa-cart-plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachProductCardListeners() {
  // View Details buttons
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      fetchProductDetails(id);
    });
  });

  // Add to Cart buttons - FIX: Prevent double-add
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const button = e.currentTarget;
      const id = parseInt(button.dataset.id);
      
      // Disable button temporarily to prevent double-click
      if (button.disabled) return;
      button.disabled = true;
      button.style.opacity = '0.6';
      
      addToCart(id);
      
      // Re-enable button after a short delay
      setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
      }, 300);
    });
  });
}

function updateProductCount() {
  if (elements.productCount) {
    elements.productCount.textContent = `${allProducts.length} items`;
  }
}

function showLoading(show) {
  if (!elements.loading) return;
  elements.loading.classList.toggle('hidden', !show);
}

function showError() {
  if (elements.productsGrid) {
    elements.productsGrid.innerHTML = `
      <div class="col-span-full text-center py-12 text-gray-500">
        <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
        <p>Failed to load products. Please try again later.</p>
      </div>
    `;
  }
}


function showProductDetails(product) {
  if (!elements.detailsContent) return;

  elements.detailsContent.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6 mt-4">
      <div class="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
        <img src="${product.image}" alt="${product.title}" class="max-h-72 object-contain" />
      </div>
      <div class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">${product.title}</h2>
        <div class="flex items-center gap-2">
          <div class="flex text-yellow-400">
            ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating.rate))}
            ${product.rating.rate % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
          </div>
          <span class="text-sm text-gray-600">${product.rating.rate} (${product.rating.count} reviews)</span>
        </div>
        <div class="text-3xl font-bold text-indigo-600">$${product.price.toFixed(2)}</div>
        <div>
          <h3 class="font-semibold text-gray-800 mb-2">Description</h3>
          <p class="text-gray-600 text-sm leading-relaxed">${product.description}</p>
        </div>
        <div>
          <span class="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
            ${product.category}
          </span>
        </div>
        <button 
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          onclick="addToCart(${product.id}); closeDetailsModal();"
        >
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  `;

  openDetailsModal();
}

function openDetailsModal() {
  elements.detailsModal?.classList.remove('hidden');
  elements.detailsModal?.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeDetailsModal() {
  elements.detailsModal?.classList.add('hidden');
  elements.detailsModal?.classList.remove('flex');
  document.body.style.overflow = '';
}


function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showNotification('Added to cart!');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity += change;
  
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    updateCart();
  }
}

function updateCart() {
  renderCart();
  updateCartCount();
  saveCartToStorage();
}

function renderCart() {
  if (!elements.cartItems) return;

  if (cart.length === 0) {
    elements.emptyCart?.classList.remove('hidden');
    elements.cartFooter?.classList.add('hidden');
    elements.cartItems.innerHTML = '';
    return;
  }

  elements.emptyCart?.classList.add('hidden');
  elements.cartFooter?.classList.remove('hidden');

  elements.cartItems.innerHTML = cart.map(item => `
    <div class="flex gap-4 border-b border-gray-200 pb-4">
      <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain bg-gray-50 rounded" />
      <div class="flex-1">
        <h4 class="text-sm font-semibold text-gray-800 line-clamp-1">${item.title}</h4>
        <p class="text-sm text-indigo-600 font-bold mt-1">$${item.price.toFixed(2)}</p>
        <div class="flex items-center gap-2 mt-2">
          <button 
            class="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 transition"
            onclick="updateQuantity(${item.id}, -1)"
          >
            <i class="fas fa-minus text-xs"></i>
          </button>
          <span class="text-sm font-medium">${item.quantity}</span>
          <button 
            class="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 transition"
            onclick="updateQuantity(${item.id}, 1)"
          >
            <i class="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>
      <button 
        class="text-red-500 hover:text-red-700 transition"
        onclick="removeFromCart(${item.id})"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');

  updateCartTotal();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (elements.cartCount) {
    if (totalItems > 0) {
      elements.cartCount.textContent = totalItems;
      elements.cartCount.classList.remove('hidden');
    } else {
      elements.cartCount.classList.add('hidden');
    }
  }
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (elements.cartTotal) {
    elements.cartTotal.textContent = `$${total.toFixed(2)}`;
  }
}

function openCartModal() {
  elements.cartModal?.classList.remove('hidden');
  elements.cartModal?.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeCartModal() {
  elements.cartModal?.classList.add('hidden');
  elements.cartModal?.classList.remove('flex');
  document.body.style.overflow = '';
}

function saveCartToStorage() {
  localStorage.setItem('swiftcart-cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const saved = localStorage.getItem('swiftcart-cart');
  if (saved) {
    cart = JSON.parse(saved);
    updateCart();
  }
}


function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email')?.value;
  
  if (email) {
    showNotification('Thanks for subscribing!');
    e.target.reset();
  }
}


function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
  notification.innerHTML = `
    <i class="fas fa-check-circle mr-2"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slide-down 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.closeDetailsModal = closeDetailsModal;
window.closeCartModal = closeCartModal;
