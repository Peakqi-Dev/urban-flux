/**
 * Render Module
 * Pure functions to generate HTML strings or DOM elements
 */

const Render = {
    // Helper: Escape HTML to prevent XSS (basic)
    escape(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // Generate a Status Badge
    badge(status) {
        const lowerStatus = status.toLowerCase();
        let className = 'badge';

        if (['completed', 'online', 'idle'].includes(lowerStatus)) className += ' completed'; // Green
        else if (['pending', 'busy'].includes(lowerStatus)) className += ' pending'; // Yellow
        else if (['assigned'].includes(lowerStatus)) className += ' assigned'; // Blue
        else className += ' secondary'; // Gray/Default

        return `<span class="${className}">${this.escape(status)}</span>`;
    },

    // Generate a Dashboard Stat Card
    statCard(title, value, icon = '📊') {
        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <span style="color: var(--text-gray); font-size: 14px;">${this.escape(title)}</span>
                    <span style="font-size: 20px;">${icon}</span>
                </div>
                <div style="font-size: 28px; font-weight: 700; color: var(--text-dark);">${this.escape(String(value))}</div>
            </div>
        `;
    },

    // Generate a Data Table
    // columns: [{ key: 'id', label: 'ID' }, { key: 'status', label: 'Status', render: (val) => ... }]
    table(columns, data) {
        if (!data || data.length === 0) {
            return '<div style="padding: 20px; text-align: center; color: var(--text-gray);">無資料</div>';
        }

        const headers = columns.map(col => `<th>${this.escape(col.label)}</th>`).join('');

        const rows = data.map(row => {
            const cells = columns.map(col => {
                const val = row[col.key];
                // Use custom render function if provided, otherwise default text
                const content = col.render ? col.render(row) : this.escape(String(val));
                return `<td>${content}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `
            <div class="card" style="padding: 0; overflow: hidden;">
                <table class="data-table">
                    <thead>
                        <tr>${headers}</tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Generate Order List Item (for Dispatch Panel)
    orderListItem(order) {
        return `
            <div class="card" style="margin-bottom: 12px; cursor: pointer; border: 1px solid transparent; transition: border-color 0.2s;" 
                 onclick="UI.openOrderModal('${order.id}')"
                 onmouseover="this.style.borderColor='var(--primary-color)'"
                 onmouseout="this.style.borderColor='transparent'">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600;">${order.id}</span>
                    ${this.badge(order.status)}
                </div>
                <div style="font-size: 13px; color: var(--text-gray); margin-bottom: 4px;">
                    📍 ${this.escape(order.pickup.address)}
                </div>
                <div style="font-size: 13px; color: var(--text-gray);">
                    🏁 ${this.escape(order.dropoff.address)}
                </div>
            </div>
        `;
    }
};

window.Render = Render;
