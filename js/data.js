/**
 * Data Module
 * Acts as the centralized "Database" and State Management
 */

const Data = {
    // Mock Orders
    orders: [
        {
            id: "ORD-2023001",
            status: "PENDING",
            customer: { name: "Alice Chen", phone: "0912-345-678" },
            pickup: { address: "台北市信義區市府路1號", x: 20, y: 30 },
            dropoff: { address: "台北市大安區忠孝東路四段", x: 45, y: 55 },
            driverId: null,
            price: 150,
            estimatedTime: "15 mins",
            createdAt: "2023-11-29T10:00:00"
        },
        {
            id: "ORD-2023002",
            status: "ASSIGNED",
            customer: { name: "Bob Lin", phone: "0922-123-456" },
            pickup: { address: "新北市板橋區縣民大道", x: 10, y: 80 },
            dropoff: { address: "台北市萬華區西門町", x: 30, y: 70 },
            driverId: "DRV-001",
            price: 220,
            estimatedTime: "25 mins",
            createdAt: "2023-11-29T10:05:00"
        },
        {
            id: "ORD-2023003",
            status: "COMPLETED",
            customer: { name: "Charlie Wang", phone: "0933-987-654" },
            pickup: { address: "台北市松山區南京東路", x: 60, y: 20 },
            dropoff: { address: "台北市內湖區瑞光路", x: 80, y: 15 },
            driverId: "DRV-002",
            price: 180,
            estimatedTime: "20 mins",
            createdAt: "2023-11-29T09:30:00"
        },
        {
            id: "ORD-2023004",
            status: "PENDING",
            customer: { name: "David Wu", phone: "0944-555-666" },
            pickup: { address: "台北市中正區重慶南路", x: 35, y: 60 },
            dropoff: { address: "新北市永和區中正路", x: 38, y: 85 },
            driverId: null,
            price: 135,
            estimatedTime: "12 mins",
            createdAt: "2023-11-29T10:15:00"
        }
    ],

    // Mock Drivers
    drivers: [
        {
            id: "DRV-001",
            name: "王小明",
            status: "BUSY", // IDLE, BUSY, OFFLINE
            location: { x: 25, y: 75 },
            vehicle: "機車",
            stats: { todayOrders: 5, rating: 4.8 }
        },
        {
            id: "DRV-002",
            name: "李大華",
            status: "IDLE",
            location: { x: 55, y: 40 },
            vehicle: "貨車",
            stats: { todayOrders: 3, rating: 4.9 }
        },
        {
            id: "DRV-003",
            name: "張志豪",
            status: "IDLE",
            location: { x: 40, y: 50 },
            vehicle: "機車",
            stats: { todayOrders: 8, rating: 4.7 }
        },
        {
            id: "DRV-004",
            name: "陳淑芬",
            status: "OFFLINE",
            location: { x: 90, y: 90 },
            vehicle: "機車",
            stats: { todayOrders: 0, rating: 5.0 }
        }
    ],

    // System Settings
    settings: {
        baseFare: 80,
        perKmRate: 15,
        currency: "TWD"
    },

    // Methods
    getOrders() {
        return this.orders;
    },

    getDrivers() {
        return this.drivers;
    },

    getSummary() {
        const today = new Date().toISOString().split('T')[0];
        const completed = this.orders.filter(o => o.status === 'COMPLETED').length;
        const total = this.orders.length;
        
        return {
            totalOrders: total,
            activeDrivers: this.drivers.filter(d => d.status !== 'OFFLINE').length,
            completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
            revenue: this.orders
                .filter(o => o.status === 'COMPLETED')
                .reduce((sum, o) => sum + o.price, 0)
        };
    },

    assignDriver(orderId, driverId) {
        const order = this.orders.find(o => o.id === orderId);
        const driver = this.drivers.find(d => d.id === driverId);
        
        if (order && driver) {
            order.status = 'ASSIGNED';
            order.driverId = driverId;
            driver.status = 'BUSY';
            return true;
        }
        return false;
    }
};

// Expose to global scope for simplicity in this vanilla JS project
window.Data = Data;
