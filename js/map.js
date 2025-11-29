/**
 * Map Module (Leaflet / OpenStreetMap Version)
 * Uses Leaflet.js which is free and doesn't require an API Key
 */

const MapModule = {
    map: null,
    markers: [],
    containerId: null,

    // Taipei Bounding Box for Mock Data Mapping
    bounds: {
        minLat: 25.0000,
        maxLat: 25.1000,
        minLng: 121.4500,
        maxLng: 121.6000
    },

    init(containerId) {
        this.containerId = containerId;

        // Wait for Leaflet to load
        if (typeof L === 'undefined') {
            console.warn('Leaflet not loaded yet. Retrying in 500ms...');
            setTimeout(() => this.init(containerId), 500);
            return;
        }

        this.renderMap();
    },

    renderMap() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Initialize Map centered on Taipei
        this.map = L.map(this.containerId).setView([25.0478, 121.5319], 13);

        // Add Dark Mode Tiles (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);

        this.updateMarkers();

        // Auto-refresh markers every 3 seconds
        if (!this.interval) {
            this.interval = setInterval(() => this.updateMarkers(), 3000);
        }
    },

    // Convert Mock (0-100) to LatLng
    getLatLng(x, y) {
        const lat = this.bounds.minLat + ((100 - y) / 100) * (this.bounds.maxLat - this.bounds.minLat);
        const lng = this.bounds.minLng + (x / 100) * (this.bounds.maxLng - this.bounds.minLng);
        return [lat, lng]; // Leaflet uses array [lat, lng]
    },

    updateMarkers() {
        if (!this.map) return;

        // Clear existing markers
        this.markers.forEach(m => this.map.removeLayer(m));
        this.markers = [];

        // Render Orders (Blue Markers)
        const orders = Data.getOrders().filter(o => o.status === 'PENDING');
        orders.forEach(order => {
            const pos = this.getLatLng(order.pickup.x, order.pickup.y);

            // Custom Icon for Order
            const orderIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #0099ff; width: 12px; height: 12px; transform: rotate(45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            const marker = L.marker(pos, { icon: orderIcon })
                .addTo(this.map)
                .bindPopup(`<b>訂單: ${order.id}</b><br>${order.pickup.address}`);

            marker.on('click', () => UI.openOrderModal(order.id));
            this.markers.push(marker);
        });

        // Render Drivers (Circles)
        const drivers = Data.getDrivers().filter(d => d.status !== 'OFFLINE');
        drivers.forEach(driver => {
            // Simulate movement
            if (driver.status === 'BUSY') {
                driver.location.x += (Math.random() - 0.5) * 2;
                driver.location.y += (Math.random() - 0.5) * 2;
                driver.location.x = Math.max(0, Math.min(100, driver.location.x));
                driver.location.y = Math.max(0, Math.min(100, driver.location.y));
            }

            const pos = this.getLatLng(driver.location.x, driver.location.y);
            const color = driver.status === 'BUSY' ? '#ff3333' : '#00b300';

            const marker = L.circleMarker(pos, {
                radius: 8,
                fillColor: color,
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            })
                .addTo(this.map)
                .bindPopup(`<b>夥伴: ${driver.name}</b><br>狀態: ${driver.status}`);

            this.markers.push(marker);
        });
    }
};

window.MapModule = MapModule;
