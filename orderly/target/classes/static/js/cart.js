document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication Check ---
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    const cartContainer = document.getElementById('cart-container');
    const cartSummaryContainer = document.getElementById('cart-summary');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Logout Functionality ---
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });

    const displayCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartContainer.innerHTML = ''; // Clear previous content
        cartSummaryContainer.innerHTML = ''; // Clear summary

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
            updateCartCount();
            return;
        }

        let tableHTML = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let total = 0;
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            tableHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>
                        <div class="quantity-controls">
                            <button class="quantity-change-btn" data-item-id="${item.id}" data-change="-1">-</button>
                            <input type="text" value="${item.quantity}" readonly>
                            <button class="quantity-change-btn" data-item-id="${item.id}" data-change="1">+</button>
                        </div>
                    </td>
                    <td>₹${subtotal.toFixed(2)}</td>
                    <td><button class="remove-btn" data-item-id="${item.id}">Remove</button></td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        cartContainer.innerHTML = tableHTML;

        // --- Display Summary ---
        cartSummaryContainer.innerHTML = `
            <h3>Total: ₹${total.toFixed(2)}</h3>
            <button id="place-order-btn" class="place-order-btn">Place Order</button>
        `;

        updateCartCount();
    };

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartLink = document.getElementById('cart-link');
        cartLink.textContent = `Cart (${totalItems})`;
    };

    const updateQuantity = (itemId, change) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
            }
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart(); // Re-render the cart
    };

    const removeItem = (itemId) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart(); // Re-render the cart
    };

    // --- Place Order Functionality ---
    const placeOrder = async () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Transform cart for the backend
        const cartItems = cart.reduce((acc, item) => {
            acc[item.id] = item.quantity;
            return acc;
        }, {});

        const orderRequest = {
            userId: parseInt(localStorage.getItem('userId')), // Make sure userId is stored on login
            cartItems: cartItems
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderRequest)
            });

            if (response.status === 201) { // Created
                alert('Order placed successfully!');
                localStorage.removeItem('cart'); // Clear the cart
                window.location.href = '/history.html'; // Redirect to history page
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order.');
            }

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // --- Event Delegation for cart actions ---
    cartContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('quantity-change-btn')) {
            const itemId = parseInt(target.dataset.itemId);
            const change = parseInt(target.dataset.change);
            updateQuantity(itemId, change);
        }
        if (target.classList.contains('remove-btn')) {
            const itemId = parseInt(target.dataset.itemId);
            removeItem(itemId);
        }
    });

    // Note: Event listener for place order must be on the summary container
    cartSummaryContainer.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'place-order-btn') {
            placeOrder();
        }
    });

    // --- Initial Load ---
    displayCart();
});