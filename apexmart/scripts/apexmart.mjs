import { fetchProducts } from './data.mjs';

/* Shared state and guarded storage access keep preferences and cart data persistent. */
const THEME_KEY = 'apexmart-theme';
const CART_KEY = 'apexmart-cart';
const productModal = document.querySelector('#product-modal');
const cartModal = document.querySelector('#cart-modal');
const modalContent = document.querySelector('#modal-content');
const cartItemsContainer = document.querySelector('#cart-items-container');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const catalogStatus = document.querySelector('#search-status-text');
let products = [];
let cart = readStoredCart();
let activeCategory = 'all';
let searchTerm = '';

function readStoredCart() {
	try {
		const storedCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
		return Array.isArray(storedCart) ? storedCart : [];
	} catch (error) {
		console.warn('Saved cart data could not be read:', error);
		return [];
	}
}

function saveCart() {
	try {
		localStorage.setItem(CART_KEY, JSON.stringify(cart));
	} catch (error) {
		console.warn('Cart changes could not be saved:', error);
	}
}

function escapeHTML(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}

function productPrice(product) {
	return Number(product.discountPrice ?? product.price ?? 0);
}

function formatPrice(amount) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/* Theme and responsive navigation controls are shared by every ApexMart page. */
function initializeTheme() {
	const themeButton = document.querySelector('#theme-btn');
	let savedTheme = 'light';

	try {
		savedTheme = localStorage.getItem(THEME_KEY) || 'light';
	} catch (error) {
		console.warn('Saved theme preference could not be read:', error);
	}

	document.body.classList.toggle('dark-theme', savedTheme === 'dark');
	themeButton?.setAttribute('aria-pressed', String(savedTheme === 'dark'));

	themeButton?.addEventListener('click', () => {
		const isDark = document.body.classList.toggle('dark-theme');
		themeButton.setAttribute('aria-pressed', String(isDark));
		try {
			localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
		} catch (error) {
			console.warn('Theme preference could not be saved:', error);
		}
	});

	const menuButton = document.querySelector('#ham-btn');
	const navigation = document.querySelector('#navigation');
	menuButton?.addEventListener('click', () => {
		const isExpanded = navigation?.classList.toggle('active') ?? false;
		menuButton.setAttribute('aria-expanded', String(isExpanded));
	});

	navigation?.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', () => {
			navigation.classList.remove('active');
			menuButton?.setAttribute('aria-expanded', 'false');
		});
	});
}

/* Product cards are generated from the fetched JSON and expose several data values. */
function renderCatalog() {
	const container = document.querySelector('#products-container, #shop-products-container');
	if (!container) return;

	const matchingProducts = products.filter(product => {
		const categoryMatches = activeCategory === 'all' || product.category.toLowerCase() === activeCategory;
		const searchableText = [product.name, product.brand, product.category, product.subcategory, product.description, ...(product.tags || [])]
			.join(' ')
			.toLowerCase();
		return categoryMatches && searchableText.includes(searchTerm);
	});

	if (catalogStatus) {
		catalogStatus.textContent = `Showing ${matchingProducts.length} of ${products.length} products`;
	}

	if (matchingProducts.length === 0) {
		container.innerHTML = '<p class="no-results-card">No products match your search.</p>';
		return;
	}

	container.innerHTML = matchingProducts.map(product => {
		const image = escapeHTML(product.images?.[0] || 'images/apexmart-logo.webp');
		const category = escapeHTML(product.category);
		const name = escapeHTML(product.name);
		const brand = escapeHTML(product.brand);
		const rating = Number(product.rating || 0).toFixed(1);

		return `
			<article class="product-card">
				<div class="product-img-wrapper">
					<img src="${image}" alt="${name}" loading="lazy">
				</div>
				<div class="product-info">
					<span class="category-badge">${category}</span>
					<p class="product-brand">${brand}</p>
					<h3>${name}</h3>
					<p class="price">${formatPrice(productPrice(product))}</p>
					<p class="product-rating">Rating: ${rating} / 5 (${Number(product.reviewCount || 0)} reviews)</p>
					<div class="card-buttons">
						<button type="button" class="view-btn" data-product-action="view" data-id="${Number(product.id)}">View Details</button>
						<button type="button" class="add-cart-btn" data-product-action="add" data-id="${Number(product.id)}">Add to Cart</button>
					</div>
				</div>
			</article>
		`;
	}).join('');
}

async function initializeCatalog() {
	const catalogContainers = document.querySelectorAll('#products-container, #shop-products-container');
	if (catalogContainers.length === 0 && !cartModal) return;

	catalogContainers.forEach(container => {
		container.setAttribute('aria-busy', 'true');
		container.innerHTML = '<p>Loading products...</p>';
	});

	products = await fetchProducts();
	catalogContainers.forEach(container => container.setAttribute('aria-busy', 'false'));

	if (products.length === 0) {
		catalogContainers.forEach(container => {
			container.innerHTML = '<p class="error-msg" role="alert">The product catalog is unavailable. Please try again later.</p>';
		});
		return;
	}

	renderCatalog();
}

/* Product details use a native modal dialog, a labelled heading, and a close control. */
function openProductDetails(product) {
	if (!productModal || !modalContent) return;

	const sizes = product.sizes?.length ? `<p><strong>Sizes:</strong> ${escapeHTML(product.sizes.join(', '))}</p>` : '';
	const features = (product.features || []).map(feature => `<li>${escapeHTML(feature)}</li>`).join('');
	modalContent.innerHTML = `
		<button type="button" class="close-modal-btn" data-close-dialog aria-label="Close product details">&times;</button>
		<h2 id="product-modal-title">${escapeHTML(product.name)}</h2>
		<img class="modal-product-image" src="${escapeHTML(product.images?.[0] || 'images/apexmart-logo.webp')}" alt="${escapeHTML(product.name)}">
		<p>${escapeHTML(product.description)}</p>
		<p><strong>Brand:</strong> ${escapeHTML(product.brand)}</p>
		<p><strong>Category:</strong> ${escapeHTML(product.category)}</p>
		<p><strong>Price:</strong> ${formatPrice(productPrice(product))}</p>
		<p><strong>Rating:</strong> ${Number(product.rating || 0).toFixed(1)} / 5</p>
		<p><strong>Stock:</strong> ${Number(product.stock || 0)}</p>
		${sizes}
		<h3>Features</h3>
		<ul>${features}</ul>
		<button type="button" class="add-cart-btn" data-product-action="add" data-id="${Number(product.id)}">Add to Cart</button>
	`;
	productModal.setAttribute('aria-labelledby', 'product-modal-title');
	productModal.showModal();
	modalContent.querySelector('[data-close-dialog]')?.focus();
}

/* Cart rendering, quantity changes, and localStorage persistence share one update path. */
function renderCart() {
	const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
	if (cartCount) cartCount.textContent = String(itemCount);

	const cartProducts = cart.map(item => ({
		...item,
		product: products.find(product => product.id === item.id)
	})).filter(item => item.product);

	const total = cartProducts.reduce((sum, item) => sum + productPrice(item.product) * item.quantity, 0);
	if (cartTotal) cartTotal.textContent = formatPrice(total);
	if (!cartItemsContainer) return;

	if (cartProducts.length === 0) {
		cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
		return;
	}

	cartItemsContainer.innerHTML = cartProducts.map(({ product, quantity }) => `
		<article class="cart-item">
			<h3>${escapeHTML(product.name)}</h3>
			<p>${formatPrice(productPrice(product))} each</p>
			<div class="cart-item-controls">
				<button type="button" data-cart-action="decrease" data-id="${Number(product.id)}" aria-label="Decrease ${escapeHTML(product.name)} quantity">−</button>
				<span>Quantity: ${quantity}</span>
				<button type="button" data-cart-action="increase" data-id="${Number(product.id)}" aria-label="Increase ${escapeHTML(product.name)} quantity">+</button>
				<button type="button" data-cart-action="remove" data-id="${Number(product.id)}" aria-label="Remove ${escapeHTML(product.name)} from cart">Remove</button>
			</div>
		</article>
	`).join('');
}

function addToCart(productId) {
	const product = products.find(item => item.id === productId);
	if (!product) return;

	const existingItem = cart.find(item => item.id === productId);
	if (existingItem) {
		existingItem.quantity += 1;
	} else {
		cart.push({ id: productId, quantity: 1 });
	}
	saveCart();
	renderCart();
}

/* Search, filter, cart, and dialog events use delegation for dynamically rendered controls. */
function initializeInteractions() {
	/* Home-page category cards open their corresponding native dialogs. */
	document.querySelectorAll('[data-open-category]').forEach(button => {
		button.addEventListener('click', () => {
			const dialog = document.querySelector(`#${button.getAttribute('aria-controls')}`);
			dialog?.showModal();
			dialog?.querySelector('[data-close-dialog]')?.focus();
		});
	});

	document.querySelector('#search-form')?.addEventListener('submit', event => event.preventDefault());
	document.querySelector('#search-input')?.addEventListener('input', event => {
		searchTerm = event.currentTarget.value.trim().toLowerCase();
		renderCatalog();
	});

	document.querySelector('#clear-search-btn')?.addEventListener('click', () => {
		const input = document.querySelector('#search-input');
		if (input) input.value = '';
		searchTerm = '';
		renderCatalog();
		input?.focus();
	});

	document.querySelector('#category-filters')?.addEventListener('click', event => {
		const filterButton = event.target.closest('[data-category]');
		if (!filterButton) return;
		activeCategory = filterButton.dataset.category.toLowerCase();
		document.querySelectorAll('#category-filters [data-category]').forEach(button => {
			const isActive = button === filterButton;
			button.classList.toggle('active', isActive);
			button.setAttribute('aria-pressed', String(isActive));
		});
		renderCatalog();
	});

	document.addEventListener('click', event => {
		const productButton = event.target.closest('[data-product-action]');
		if (productButton) {
			const productId = Number(productButton.dataset.id);
			if (productButton.dataset.productAction === 'add') addToCart(productId);
			if (productButton.dataset.productAction === 'view') {
				const product = products.find(item => item.id === productId);
				if (product) openProductDetails(product);
			}
		}

		const cartAction = event.target.closest('[data-cart-action]');
		if (cartAction) {
			const productId = Number(cartAction.dataset.id);
			if (cartAction.dataset.cartAction === 'remove') {
				cart = cart.filter(item => item.id !== productId);
			} else {
				const cartItem = cart.find(item => item.id === productId);
				if (cartItem) {
					cartItem.quantity += cartAction.dataset.cartAction === 'increase' ? 1 : -1;
					cart = cart.filter(item => item.quantity > 0);
				}
			}
			saveCart();
			renderCart();
		}

		if (event.target.closest('#cart-btn')) {
			renderCart();
			cartModal?.showModal();
		}

		if (event.target.closest('[data-close-dialog]') || event.target.closest('#close-cart-btn')) {
			event.target.closest('dialog')?.close();
		}
	});

	[...document.querySelectorAll('dialog')].forEach(dialog => {
		dialog?.addEventListener('click', event => {
			if (event.target === dialog) dialog.close();
		});
	});

	document.querySelector('.checkout-btn')?.addEventListener('click', () => {
		if (cart.length === 0) {
			cartItemsContainer && (cartItemsContainer.innerHTML = '<p>Add a product before checkout.</p>');
			return;
		}
		window.alert('Checkout is not configured yet. Your cart has been saved on this device.');
	});

	window.addEventListener('storage', event => {
		if (event.key === CART_KEY) {
			cart = readStoredCart();
			renderCart();
		}
		if (event.key === THEME_KEY) {
			document.body.classList.toggle('dark-theme', event.newValue === 'dark');
		}
	});
}

/* Initialize shared controls, restore saved state, and fetch products for catalog pages. */
initializeTheme();
initializeInteractions();
renderCart();
initializeCatalog();
