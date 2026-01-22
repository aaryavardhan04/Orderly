document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        window.location.href = '/index.html';
        return;
    }

    const currentOrdersList = document.getElementById('current-orders-list');
    const pastOrdersList = document.getElementById('past-orders-list');
    const logoutBtn = document.getElementById('logout-btn');
    const cartLink = document.getElementById('cart-link');

    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartLink.textContent = `Cart (${totalItems})`;
    };

    const fetchOrderHistory = async () => {
        try {
            const response = await fetch(`/api/orders/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = '/index.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch order history.');
            }

            const orders = await response.json();
            displayOrders(orders);

        } catch (error) {
            currentOrdersList.innerHTML = `<p class="error-message" style="display: block;">Error: ${error.message}</p>`;
        }
    };

    const displayOrders = (orders) => {
        currentOrdersList.innerHTML = '';
        pastOrdersList.innerHTML = '';

        orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));

        let hasCurrentOrders = false;
        let hasPastOrders = false;

        orders.forEach(order => {
            const orderCard = createOrderCard(order);
            const status = order.status.toLowerCase();

            if (status === 'completed' || status === 'received') {
                pastOrdersList.appendChild(orderCard);
                hasPastOrders = true;
            } else {
                currentOrdersList.appendChild(orderCard);
                hasCurrentOrders = true;
            }
        });

        if (!hasCurrentOrders) {
            currentOrdersList.innerHTML = '<p>No current orders.</p>';
        }
        if (!hasPastOrders) {
            pastOrdersList.innerHTML = '<p>No past orders found.</p>';
        }
    };

    const createOrderCard = (order) => {
        const card = document.createElement('div');
        card.className = 'order-card';

        const itemsSummary = order.orderItems.map(item => `${item.menuItem.name} (x${item.quantity})`).join(', ');
        const orderTime = new Date(order.orderTime).toLocaleString();
        const status = order.status.toLowerCase();
        const statusClass = `status-${status}`;

        // --- THIS IS THE NEW LOGIC ---
        // Show "Mark as Received" button only if the order is "Ready"
        const actionButton = status === 'ready'
            ? `<button class="btn mark-received-btn" data-id="${order.id}">Mark as Received</button>`
            : '';

        card.innerHTML = `
            <div class="order-card-header">
                <span>Order ID: #${order.id}</span>
                <span class="order-status ${statusClass}">${order.status}</span>
            </div>
            <div class="order-card-body">
                <p><strong>Items:</strong> ${itemsSummary}</p>
                <p><strong>Total:</strong> ₹${order.totalPrice.toFixed(2)}</p>
                <p><strong>Time:</strong> ${orderTime}</p>
                ${actionButton} 
            </div>
        `;
        return card;
    };

    // --- NEW EVENT LISTENER FOR THE BUTTON ---
    currentOrdersList.addEventListener('click', async (e) => {
        if (e.target && e.target.classList.contains('mark-received-btn')) {
            const orderId = e.target.dataset.id;

            try {
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'Completed' })
                });

                if (!response.ok) throw new Error('Failed to update status.');

                // Refresh the order list to show the change
                await fetchOrderHistory();

            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    });

    // Initial Load
    updateCartCount();
    fetchOrderHistory();
});