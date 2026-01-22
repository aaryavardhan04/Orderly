document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication & Authorization Check ---
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'STAFF') {
        localStorage.clear();
        window.location.href = '/index.html';
        return;
    }

    // --- View Toggling ---
    const ordersView = document.getElementById('orders-view');
    const manageMenuView = document.getElementById('manage-menu-view');
    const ordersNavLink = document.getElementById('orders-nav-link');
    const manageMenuNavLink = document.getElementById('manage-menu-nav-link');

    ordersNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        showView('orders');
    });

    manageMenuNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        showView('manage-menu');
    });

    const showView = (viewName) => {
        ordersView.style.display = 'none';
        manageMenuView.style.display = 'none';
        ordersNavLink.classList.remove('active');
        manageMenuNavLink.classList.remove('active');

        if (viewName === 'orders') {
            ordersView.style.display = 'block';
            ordersNavLink.classList.add('active');
            fetchAndDisplayOrders();
        } else if (viewName === 'manage-menu') {
            manageMenuView.style.display = 'block';
            manageMenuNavLink.classList.add('active');
        }
    };

    // --- General ---
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });

    // --- MANAGE MENU LOGIC ---
    const menuListContainer = document.getElementById('current-menu-list');
    const menuItemForm = document.getElementById('menu-item-form');
    const formTitle = document.getElementById('form-title');
    const saveItemBtn = document.getElementById('save-item-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    const fetchAndDisplayMenu = async () => {
        try {
            const response = await fetch('/api/menu-items', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch menu.');

            const menuItems = await response.json();
            menuListContainer.innerHTML = '';

            menuItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'list-item';
                const imageHtml = item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="menu-item-image">` : `<div style="width: 50px; height: 50px; margin-right: 15px; background-color: #eee; border-radius: 5px;"></div>`;
                itemDiv.innerHTML = `
                    <div style="display: flex; align-items: center; flex-grow: 1;">
                        ${imageHtml}
                        <span>
                            <strong>${item.name}</strong> (${item.price.toFixed(2)}) - ${item.category} | Status: ${item.available ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                    <div>
                        <button class="btn-secondary edit-btn" data-id="${item.id}">Edit</button>
                        <button class="remove-btn delete-btn" data-id="${item.id}">Remove</button>
                    </div>
                `;
                menuListContainer.appendChild(itemDiv);
            });
        } catch (error) {
            menuListContainer.innerHTML = `<p class="error-message" style="display:block">${error.message}</p>`;
        }
    };

    menuItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const itemId = document.getElementById('item-id').value;
        const isUpdate = !!itemId;

        const itemData = {
            id: itemId ? parseInt(itemId) : null,
            name: document.getElementById('item-name').value,
            price: parseFloat(document.getElementById('item-price').value),
            prepTime: parseInt(document.getElementById('item-prep-time').value),
            category: document.getElementById('item-category').value,
            imageUrl: document.getElementById('item-image-url').value,
            available: document.getElementById('item-available').value === 'true',
        };

        const url = isUpdate ? `/api/menu-items/${itemId}` : '/api/menu-items';
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) throw new Error('Failed to save item.');

            resetForm();
            await fetchAndDisplayMenu();

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // --- THIS IS THE UPDATED LOGIC ---
    menuListContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const itemId = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            // Fetch the specific item to get all its details
            const response = await fetch(`/api/menu-items/${itemId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const item = await response.json();
                populateFormForEdit(item);
            } else {
                alert('Could not fetch item details.');
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to make this item UNAVAILABLE? (It will not be deleted)')) {
                try {
                    // First, get the current item details
                    const getResponse = await fetch(`/api/menu-items/${itemId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!getResponse.ok) throw new Error('Could not fetch item to update.');

                    const itemToUpdate = await getResponse.json();

                    // Change its availability
                    itemToUpdate.available = false;

                    // Send the updated object back
                    const putResponse = await fetch(`/api/menu-items/${itemId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(itemToUpdate)
                    });

                    if (!putResponse.ok) throw new Error('Failed to mark item as unavailable.');

                    await fetchAndDisplayMenu(); // Refresh the list
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
    });

    cancelEditBtn.addEventListener('click', resetForm);

    function populateFormForEdit(item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-prep-time').value = item.prepTime;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-image-url').value = item.imageUrl;
        document.getElementById('item-available').value = item.available.toString();

        formTitle.textContent = 'Edit Item';
        saveItemBtn.textContent = 'Update Item';
        cancelEditBtn.style.display = 'inline-block';
    }

    function resetForm() {
        menuItemForm.reset();
        document.getElementById('item-id').value = '';
        formTitle.textContent = 'Add Item';
        saveItemBtn.textContent = 'Add Item';
        cancelEditBtn.style.display = 'none';
    }

    // --- ORDERS LOGIC ---
    const activeOrdersList = document.getElementById('active-orders-list');
    const completedOrdersList = document.getElementById('completed-orders-list');

    const fetchAndDisplayOrders = async () => {
        try {
            const response = await fetch('/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch orders.');
            const orders = await response.json();
            orders.sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));
            activeOrdersList.innerHTML = '';
            completedOrdersList.innerHTML = '';
            let hasActive = false;
            let hasCompleted = false;
            orders.forEach(order => {
                const orderCard = createOrderCard(order);
                const status = order.status.toLowerCase();
                if (status === 'pending' || status === 'ready') {
                    activeOrdersList.appendChild(orderCard);
                    hasActive = true;
                } else {
                    if (completedOrdersList.childElementCount < 5) {
                        completedOrdersList.prepend(orderCard);
                        hasCompleted = true;
                    }
                }
            });
            if (!hasActive) activeOrdersList.innerHTML = '<p>No active orders.</p>';
            if (!hasCompleted) completedOrdersList.innerHTML = '<p>No recent completed orders.</p>';
        } catch (error) {
            activeOrdersList.innerHTML = `<p class="error-message" style="display:block">${error.message}</p>`;
        }
    };

    const createOrderCard = (order) => {
        const card = document.createElement('div');
        card.className = 'order-card';
        const itemsSummary = order.orderItems.map(item => `${item.menuItem.name} (x${item.quantity})`).join(', ');
        const orderTime = new Date(order.orderTime).toLocaleTimeString();
        const statusClass = `status-${order.status.toLowerCase()}`;
        const actionButton = order.status.toLowerCase() === 'pending'
            ? `<button class="btn mark-ready-btn" data-id="${order.id}">Mark as Ready</button>`
            : '';
        card.innerHTML = `
            <div class="order-card-header">
                <span>Order #${order.id} | User: ${order.user.username}</span>
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

    activeOrdersList.addEventListener('click', async (e) => {
        if (e.target && e.target.classList.contains('mark-ready-btn')) {
            const orderId = e.target.dataset.id;
            try {
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'Ready' })
                });
                if (!response.ok) throw new Error('Failed to update status.');
                await fetchAndDisplayOrders();
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    });

    // --- Initial Load ---
    showView('orders');
    fetchAndDisplayMenu();
});