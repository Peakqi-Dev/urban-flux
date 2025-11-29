/**
 * UI Module
 * Handles navigation, page rendering, and event listeners
 */

const UI = {
    currentPage: 'dashboard',

    init() {
        this.setupNavigation();
        this.renderPage('dashboard');
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update Active State
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Switch Page
                const target = item.dataset.target;
                this.renderPage(target);
            });
        });

        // Modal Close Handlers
        document.querySelectorAll('.close-btn, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el) this.closeModal();
            });
        });
    },

    renderPage(pageId) {
        this.currentPage = pageId;
        const contentArea = document.getElementById('content-area');
        const pageTitle = document.getElementById('page-title');

        // Clear Content
        contentArea.innerHTML = '';

        switch (pageId) {
            case 'dashboard':
                pageTitle.textContent = '營運儀表板';
                this.renderDashboard(contentArea);
                break;
            case 'dispatch':
                pageTitle.textContent = '即時派遣中心';
                this.renderDispatch(contentArea);
                break;
            case 'orders':
                pageTitle.textContent = '訂單管理';
                this.renderOrders(contentArea);
                break;
            case 'drivers':
                pageTitle.textContent = '夥伴管理';
                this.renderDrivers(contentArea);
                break;
            case 'settings':
                pageTitle.textContent = '系統設定';
                this.renderSettings(contentArea);
                break;
            default:
                contentArea.innerHTML = '<h1>404 Not Found</h1>';
        }
    },

    // --- Page Renderers ---

    renderDashboard(container) {
        const summary = Data.getSummary();

        const grid = document.createElement('div');
        grid.className = 'dashboard-grid';
        grid.innerHTML = `
            ${Render.statCard('今日總單量', summary.totalOrders, '📦')}
            ${Render.statCard('線上夥伴', summary.activeDrivers, '🛵')}
            ${Render.statCard('完成率', summary.completionRate + '%', '📈')}
            ${Render.statCard('今日營收', '$' + summary.revenue, '💰')}
        `;

        const recentOrdersCard = document.createElement('div');
        recentOrdersCard.innerHTML = `
            <h3 style="margin-bottom: 16px;">最近訂單</h3>
            ${Render.table([
            { key: 'id', label: '訂單編號' },
            { key: 'customer', label: '客戶', render: row => row.customer.name },
            { key: 'status', label: '狀態', render: row => Render.badge(row.status) },
            { key: 'price', label: '金額', render: row => '$' + row.price }
        ], Data.getOrders().slice(0, 5))}
        `;

        container.appendChild(grid);
        container.appendChild(recentOrdersCard);
    },

    renderDispatch(container) {
        container.innerHTML = `
            <div class="split-view">
                <!-- Left: Order List -->
                <div style="overflow-y: auto; padding-right: 8px;">
                    <h3 style="margin-bottom: 16px;">待派遣訂單</h3>
                    <div id="dispatch-order-list">
                        ${Data.getOrders()
                .filter(o => o.status === 'PENDING')
                .map(o => Render.orderListItem(o))
                .join('')}
                    </div>
                </div>
                
                <!-- Right: Map -->
                <div class="map-container" id="map-root">
                    <!-- Map will be initialized here -->
                </div>
            </div>
        `;

        // Initialize Map after DOM is inserted
        if (window.MapModule) {
            window.MapModule.init('map-root');
        }
    },

    renderOrders(container) {
        const orders = Data.getOrders();
        container.innerHTML = `
            <div style="margin-bottom: 16px; display: flex; gap: 8px;">
                <input type="text" placeholder="搜尋訂單編號..." style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <select style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="all">所有狀態</option>
                    <option value="pending">待處理</option>
                    <option value="completed">已完成</option>
                </select>
            </div>
            ${Render.table([
            { key: 'id', label: '訂單編號' },
            { key: 'createdAt', label: '建立時間', render: row => new Date(row.createdAt).toLocaleTimeString() },
            { key: 'pickup', label: '取件地', render: row => row.pickup.address },
            { key: 'dropoff', label: '送件地', render: row => row.dropoff.address },
            { key: 'driverId', label: '夥伴', render: row => row.driverId || '-' },
            { key: 'status', label: '狀態', render: row => Render.badge(row.status) },
            { key: 'price', label: '金額', render: row => '$' + row.price }
        ], orders)}
        `;
    },

    renderDrivers(container) {
        const drivers = Data.getDrivers();
        container.innerHTML = `
            ${Render.table([
            { key: 'id', label: '夥伴編號' },
            { key: 'name', label: '姓名' },
            { key: 'vehicle', label: '車種' },
            { key: 'status', label: '狀態', render: row => Render.badge(row.status) },
            { key: 'stats', label: '今日單量', render: row => row.stats.todayOrders },
            { key: 'stats', label: '評分', render: row => '⭐ ' + row.stats.rating }
        ], drivers)}
        `;
    },

    renderSettings(container) {
        const settings = Data.settings;
        container.innerHTML = `
            <div class="card" style="max-width: 600px;">
                <h3 style="margin-bottom: 20px;">費率設定</h3>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">起步價 (TWD)</label>
                    <input type="number" value="${settings.baseFare}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 24px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">每公里費率 (TWD)</label>
                    <input type="number" value="${settings.perKmRate}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button class="btn btn-primary">儲存設定</button>
            </div>
        `;
    },

    // --- Modal Logic ---

    openOrderModal(orderId) {
        const order = Data.getOrders().find(o => o.id === orderId);
        if (!order) return;

        const modalOverlay = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const confirmBtn = document.getElementById('modal-confirm-btn');

        modalTitle.textContent = `訂單詳情 ${order.id}`;
        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <p style="color: var(--text-gray); font-size: 12px;">客戶資訊</p>
                    <p><strong>${order.customer.name}</strong></p>
                    <p>${order.customer.phone}</p>
                </div>
                <div>
                    <p style="color: var(--text-gray); font-size: 12px;">訂單金額</p>
                    <p style="font-size: 18px; color: var(--primary-color); font-weight: bold;">$${order.price}</p>
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 16px 0;">
            <div style="margin-bottom: 12px;">
                <span style="color: var(--text-gray);">📍 取件：</span>
                <span>${order.pickup.address}</span>
            </div>
            <div style="margin-bottom: 12px;">
                <span style="color: var(--text-gray);">🏁 送件：</span>
                <span>${order.dropoff.address}</span>
            </div>
            
            ${order.status === 'PENDING' ? `
                <div style="margin-top: 20px; padding: 12px; background: #f0f7ff; border-radius: 8px;">
                    <p style="margin-bottom: 8px; font-weight: 500;">推薦夥伴</p>
                    <select id="driver-select" style="width: 100%; padding: 8px;">
                        <option value="">請選擇夥伴...</option>
                        ${Data.getDrivers()
                    .filter(d => d.status === 'IDLE')
                    .map(d => `<option value="${d.id}">${d.name} (${d.vehicle}) - 距離 2km</option>`)
                    .join('')}
                    </select>
                </div>
            ` : ''}
        `;

        if (order.status === 'PENDING') {
            confirmBtn.style.display = 'block';
            confirmBtn.textContent = '指派訂單';
            confirmBtn.onclick = () => {
                const select = document.getElementById('driver-select');
                if (select && select.value) {
                    Data.assignDriver(order.id, select.value);
                    this.closeModal();
                    this.renderPage(this.currentPage); // Refresh
                } else {
                    alert('請選擇一位夥伴');
                }
            };
        } else {
            confirmBtn.style.display = 'none';
        }

        modalOverlay.classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }
};

window.UI = UI;
