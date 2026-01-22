document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication Check ---
    const token = localStorage.getItem('token');
    if (!token) {
        // If no token, redirect to login page
        window.location.href = '/index.html';
        return;
    }

    const menuContainer = document.getElementById('menu-items-container');
    const logoutBtn = document.getElementById('logout-btn');
    const categoryFilter = document.getElementById('category-filter');
    let allMenuItems = []; // Store all fetched items to enable client-side filtering

    // --- Logout Functionality ---
    logoutBtn.addEventListener('click', () => {
        localStorage.clear(); // Clear all user data
        window.location.href = '/index.html';
    });

    // --- Fetch Menu Items from API ---
    const fetchMenu = async () => {
        try {
            const response = await fetch('/api/menu-items', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                // 401 - Unauthorized , 403 - Forbidden
                // If token is invalid or expired, redirect to login
                localStorage.clear();
                window.location.href = '/index.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch menu items.');
            }

            allMenuItems = await response.json();
            populateCategories(allMenuItems);
            displayMenu(allMenuItems);

        } catch (error) {
            menuContainer.innerHTML = `<p class="error-message" style="display: block;">Error: ${error.message}</p>`;
        }
    };

    // --- Populate Category Filter Dropdown ---
    const populateCategories = (items) => {
        const categories = [...new Set(items.map(item => item.category))]; // Get unique categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    };

    // --- Display Menu Items on the Page ---
    const displayMenu = (items) => {
        menuContainer.innerHTML = ''; // Clear previous items

        if (items.length === 0) {
            menuContainer.innerHTML = '<p>No menu items available in this category.</p>';
            return;
        }

        items.forEach(item => {
            if (!item.available) return; // Skip unavailable items

            const card = document.createElement('div');
            card.className = 'menu-card';

            const imageHtml = item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="menu-card-img">` : `<div class="img-placeholder">${item.name}</div>`;

            card.innerHTML = `
                <div class="menu-card-content">
                    ${imageHtml}
                    <h3>${item.name}</h3>
                    <p class="price">₹${item.price.toFixed(2)}</p>
                    <p class="info">
                        Prep Time: ${item.prepTime} mins<br>
                        Category: ${item.category}
                    </p>
                    <button class="btn add-to-cart-btn" data-item-id="${item.id}">Add to Cart</button>
                </div>
            `;
            menuContainer.appendChild(card);
        });
    };

    // --- Handle Category Filtering ---
    categoryFilter.addEventListener('change', () => {
        const selectedCategory = categoryFilter.value;
        if (selectedCategory === 'All') {
            displayMenu(allMenuItems);
        } else {
            const filteredItems = allMenuItems.filter(item => item.category === selectedCategory);
            displayMenu(filteredItems);
        }
    });

    // --- Add to Cart Functionality (using event delegation) ---
    menuContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('add-to-cart-btn')) {
            const itemId = parseInt(e.target.dataset.itemId);
            const itemToAdd = allMenuItems.find(item => item.id === itemId);
            if (itemToAdd) {
                addToCart(itemToAdd);
            }
        }
    });

    const addToCart = (item) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${item.name} has been added to your cart!`);
    };

    // --- Update Cart Count in Navbar ---
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartLink = document.getElementById('cart-link');
        cartLink.textContent = `Cart (${totalItems})`;
    };


    // --- Initial Load ---
    fetchMenu();
    updateCartCount();
});
