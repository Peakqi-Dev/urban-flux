/**
 * Map Module
 * Manages the visual representation of the "Fake Map"
 */

const MapModule = {
    container: null,

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.render();

        // Auto-refresh map every 3 seconds to simulate movement
        // In a real app, this would be WebSocket updates
        if (!this.interval) {
            this.interval = setInterval(() => this.render(), 3000);
        }
    },

    render() {
        if (!this.container) return;

        // Clear existing markers
        this.container.innerHTML = '';

        // Render Orders (Blue Squares)
        const orders = Data.getOrders().filter(o => o.status === 'PENDING');
        orders.forEach(order => {
            const el = document.createElement('div');
            el.className = 'map-dot order';
            el.style.left = order.pickup.x + '%';
            el.style.top = order.pickup.y + '%';
            el.title = `訂單: ${order.id}`;
            el.onclick = () => UI.openOrderModal(order.id);
            this.container.appendChild(el);
        });

        // Render Drivers (Circles)
        const drivers = Data.getDrivers().filter(d => d.status !== 'OFFLINE');
        drivers.forEach(driver => {
            const el = document.createElement('div');
            el.className = `map-dot driver ${driver.status === 'BUSY' ? 'busy' : ''}`;
            el.style.left = driver.location.x + '%';
            el.style.top = driver.location.y + '%';
            el.title = `車手: ${driver.name} (${driver.status})`;

            // Simulate random movement for "Live" feel
            if (driver.status === 'BUSY') {
                driver.location.x += (Math.random() - 0.5) * 2;
                driver.location.y += (Math.random() - 0.5) * 2;
                // Keep within bounds
                driver.location.x = Math.max(0, Math.min(100, driver.location.x));
                driver.location.y = Math.max(0, Math.min(100, driver.location.y));
            }

            this.container.appendChild(el);
        });
    }
};

window.MapModule = MapModule;
