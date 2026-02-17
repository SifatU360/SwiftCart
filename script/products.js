
const API_BASE = 'https://fakestoreapi.com';

let allProducts = [];
let filteredProducts = [];
let cart = [];
let selectedCategory = 'all';


const elements = {
  hamburger: document.getElementById('hamburger'),
  closeBtn: document.getElementById('close_btn'),
  navContainer: document.getElementById('nav_container'),
  categoryButtons: document.getElementById('category-buttons'),
  loading: document.getElementById('loading'),
  productsGrid: document.getElementById('products-grid'),
  productCount: document.getElementById('product-count'),
  currentCategory: document.getElementById('current-category'),
  emptyState: document.getElementById('empty-state'),
  cartBtn: document.getElementById('cart-btn'),
  cartCount: document.getElementById('cart-count'),
  cartModal: document.getElementById('cart-modal'),
  closeCart: document.getElementById('close-cart'),
  cartItems: document.getElementById('cart-items'),
  emptyCart: document.getElementById('empty-cart'),
  cartFooter: document.getElementById('cart-footer'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartTotal: document.getElementById('cart-total'),
  clearCart: document.getElementById('clear-cart'),
  detailsModal: document.getElementById('details-modal'),
  closeDetails: document.getElementById('close-details'),
  detailsContent: document.getElementById('details-content')
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupEventListeners();
  loadCartFromStorage();
  await loadCategories();
  await loadProducts();
}

function setupEventListeners() {
  // Mobile Menu
  elements.hamburger?.addEventListener('click', () => {
    elements.navContainer.style.left = '0';
  });

  elements.closeBtn?.addEventListener('click', () => {
    elements.navContainer.style.left = '-100%';
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

  // Clear Cart
  elements.clearCart?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      cart = [];
      updateCart();
      showNotification('Cart cleared', 'info');
    }
  });
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/products/categories`);
    const categories = await response.json();
    renderCategoryButtons(['all', ...categories]);
  } catch (error) {
    console.error('Error loading categories:', error);
    showNotification('Failed to load categories', 'error');
  }
}

async function loadProducts(category = 'all') {
  showLoading(true);
  try {
    const url = category === 'all' 
      ? `${API_BASE}/products` 
      : `${API_BASE}/products/category/${category}`;
    
    const response = await fetch(url);
    allProducts = await response.json();
    filteredProducts = allProducts;
    
    renderProducts();
    updateProductCount();
    
  } catch (error) {
    console.error('Error loading products:', error);
    showError();
    showNotification('Failed to load products', 'error');
  } finally {
    showLoading(false);
  }
}

async function loadProductDetails(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    const product = await response.json();
    showProductDetailsModal(product);
  } catch (error) {
    console.error('Error loading product details:', error);
    showNotification('Failed to load product details', 'error');
  }
}

function renderCategoryButtons(categories) {
  if (!elements.categoryButtons) return;

  elements.categoryButtons.innerHTML = categories.map(category => {
    const isActive = category === selectedCategory;
    return `
      <button 
        class="category-btn px-5 py-2.5 rounded-lg text-sm font-medium transition ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
        }"
        data-category="${category}"
      >
        ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
      </button>
    `;
  }).join('');

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const category = e.target.dataset.category;
      selectedCategory = category;
      
      // Update current category display
      if (elements.currentCategory) {
        elements.currentCategory.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      }
      
      await loadProducts(category);
      renderCategoryButtons(categories);
    });
  });
}

function renderProducts() {
  if (!elements.productsGrid) return;

  if (filteredProducts.length === 0) {
    elements.productsGrid.classList.add('hidden');
    elements.emptyState?.classList.remove('hidden');
    return;
  }

  elements.productsGrid.classList.remove('hidden');
  elements.emptyState?.classList.add('hidden');

  elements.productsGrid.innerHTML = filteredProducts.map(product => 
    createProductCard(product)
  ).join('');

  attachProductEventListeners();
}

function createProductCard(product) {
  return `
    <div class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <!-- Product Image -->
      <div class="relative overflow-hidden bg-gray-50 h-56">
        <img 
          src="${product.image}" 
          alt="${product.title}" 
          class="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
        />
        
        <!-- Category Badge -->
        <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-gray-700 font-medium">
          ${product.category}
        </div>
        
        <!-- Quick View Button -->
        <button 
          class="view-details-btn absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
          data-id="${product.id}"
          title="Quick View"
        >
          <i class="fas fa-eye text-sm"></i>
        </button>
      </div>

      <!-- Product Info -->
      <div class="p-4">
        <!-- Title -->
        <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[40px]" title="${product.title}">
          ${product.title}
        </h3>

        <!-- Rating -->
        <div class="flex items-center gap-1 mb-3">
          <div class="flex text-yellow-400 text-sm">
            ${generateStars(product.rating.rate)}
          </div>
          <span class="text-xs text-gray-500 ml-1">
            ${product.rating.rate} (${product.rating.count})
          </span>
        </div>

        <!-- Price & Add to Cart -->
        <div class="flex items-center justify-between gap-2">
          <div>
            <span class="text-2xl font-bold text-indigo-600">$${product.price.toFixed(2)}</span>
          </div>
          <button 
            class="add-to-cart-btn px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            data-id="${product.id}"
          >
            <i class="fas fa-cart-plus mr-1"></i>Add
          </button>
        </div>
      </div>
    </div>
  `;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  return stars;
}

function attachProductEventListeners() {
  // View Details Buttons
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      loadProductDetails(id);
    });
  });

  // Add to Cart Buttons - FIX: Prevent double-add by using pointer-events
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
    elements.productCount.textContent = filteredProducts.length;
  }
}


function showProductDetailsModal(product) {
  if (!elements.detailsContent) return;

  elements.detailsContent.innerHTML = `
    <div class="mt-8">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Product Image -->
        <div class="bg-gray-50 rounded-xl p-8 flex items-center justify-center">
          <img src="${product.image}" alt="${product.title}" class="max-h-80 object-contain" />
        </div>

        <!-- Product Details -->
        <div class="space-y-4">
          <!-- Category Badge -->
          <div>
            <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              ${product.category}
            </span>
          </div>

          <!-- Title -->
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">${product.title}</h2>

          <!-- Rating -->
          <div class="flex items-center gap-2">
            <div class="flex text-yellow-400 text-lg">
              ${generateStars(product.rating.rate)}
            </div>
            <span class="text-gray-600 font-medium">
              ${product.rating.rate} <span class="text-gray-400">(${product.rating.count} reviews)</span>
            </span>
          </div>

          <!-- Price -->
          <div class="py-4 border-y border-gray-200">
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-bold text-indigo-600">$${product.price.toFixed(2)}</span>
              <span class="text-gray-500 line-through">$${(product.price * 1.2).toFixed(2)}</span>
              <span class="text-green-600 font-semibold text-sm">Save 20%</span>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-2 text-lg">Description</h3>
            <p class="text-gray-600 leading-relaxed">${product.description}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4">
            <button 
              class="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
              onclick="addToCart(${product.id}); closeDetailsModal();"
            >
              <i class="fas fa-cart-plus mr-2"></i>Add to Cart
            </button>
            <button 
              class="px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              title="Add to Wishlist"
            >
              <i class="far fa-heart text-xl"></i>
            </button>
          </div>

          <!-- Additional Info -->
          <div class="grid grid-cols-2 gap-3 pt-4 text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-truck text-indigo-600"></i>
              <span>Free Shipping</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-undo text-indigo-600"></i>
              <span>30-Day Returns</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-shield-alt text-indigo-600"></i>
              <span>Secure Payment</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-headset text-indigo-600"></i>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
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
    showNotification(`Updated quantity for ${product.title}`, 'success');
  } else {
    cart.push({ ...product, quantity: 1 });
    showNotification(`${product.title} added to cart!`, 'success');
  }

  updateCart();
}

function removeFromCart(productId) {
  const product = cart.find(item => item.id === productId);
  cart = cart.filter(item => item.id !== productId);
  updateCart();
  showNotification(`Removed from cart`, 'info');
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
    <div class="flex gap-4 p-4 bg-gray-50 rounded-lg">
      <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-contain bg-white rounded border" />
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">${item.title}</h4>
        <p class="text-sm text-indigo-600 font-bold mb-2">$${item.price.toFixed(2)}</p>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-white border rounded-lg">
            <button 
              class="w-8 h-8 hover:bg-gray-100 transition rounded-l-lg"
              onclick="updateQuantity(${item.id}, -1)"
            >
              <i class="fas fa-minus text-xs"></i>
            </button>
            <span class="text-sm font-semibold w-8 text-center">${item.quantity}</span>
            <button 
              class="w-8 h-8 hover:bg-gray-100 transition rounded-r-lg"
              onclick="updateQuantity(${item.id}, 1)"
            >
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
          <span class="text-sm font-semibold text-gray-700">
            = $${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
      <button 
        class="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded transition"
        onclick="removeFromCart(${item.id})"
        title="Remove"
      >
        <i class="fas fa-trash text-sm"></i>
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
  
  if (elements.cartSubtotal) {
    elements.cartSubtotal.textContent = `$${total.toFixed(2)}`;
  }
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
    try {
      cart = JSON.parse(saved);
      updateCart();
    } catch (e) {
      console.error('Error loading cart from storage:', e);
    }
  }
}

function showLoading(show) {
  if (!elements.loading) return;
  elements.loading.classList.toggle('hidden', !show);
  elements.productsGrid?.classList.toggle('hidden', show);
}

function showError() {
  if (elements.productsGrid) {
    elements.productsGrid.innerHTML = `
      <div class="col-span-full text-center py-20">
        <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
        <p class="text-gray-600 text-lg mb-4">Failed to load products</p>
        <button 
          onclick="location.reload()" 
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    `;
  }
}

function showNotification(message, type = 'success') {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };

  const notification = document.createElement('div');
  notification.className = `fixed bottom-6 right-6 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-up flex items-center gap-3 max-w-sm`;
  notification.innerHTML = `
    <i class="fas ${icons[type]} text-xl"></i>
    <span class="font-medium">${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slide-down 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.closeDetailsModal = closeDetailsModal;
window.closeCartModal = closeCartModal;
