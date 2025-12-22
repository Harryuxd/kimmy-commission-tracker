import { useState } from 'react';

export default function CommissionCalculator({ staff, entries, onAddEntry, onDeleteEntry }) {
    const [selectedStaff, setSelectedStaff] = useState('');
    const [salesAmount, setSalesAmount] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // Default to Today
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedStaff || !salesAmount) return;

        const amount = parseFloat(salesAmount);
        if (isNaN(amount)) return;

        // Use selected date (noon) to avoid timezone shifts
        const [year, month, day] = selectedDate.split('-').map(Number);
        const localDate = new Date(year, month - 1, day, 12, 0, 0);

        onAddEntry({
            id: Date.now(),
            staffName: selectedStaff,
            salesAmount: amount,
            timestamp: localDate.toISOString()
        });
        setSalesAmount('');
    };

    // Filter entries based on View Mode
    const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        const today = new Date();

        if (viewMode === 'daily') {
            // "Daily" technically means "Today" in this context toggle.
            // But if we just added a backdated entry, it won't show up in "Today".
            // Implementation choice: Daily View = Today's date only.
            return entryDate.toDateString() === today.toDateString();
        } else {
            // Weekly: Show entries from the current week (Sunday to Saturday)
            const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            firstDayOfWeek.setHours(0, 0, 0, 0);
            return entryDate >= firstDayOfWeek;
        }
    });

    // Calculate totals based on FILTERED entries
    const total70 = filteredEntries.reduce((sum, entry) => sum + (entry.salesAmount * 0.7), 0);
    const total60 = filteredEntries.reduce((sum, entry) => sum + (entry.salesAmount * 0.6), 0);

    const exportToCSV = () => {
        if (filteredEntries.length === 0) return;

        // CSV Headers
        const headers = ['Staff Name', 'Sales Amount', '70% Commission', '60% Commission', 'Date'];

        // CSV Rows
        const rows = filteredEntries.map(entry => [
            entry.staffName,
            entry.salesAmount.toFixed(2),
            (entry.salesAmount * 0.7).toFixed(2),
            (entry.salesAmount * 0.6).toFixed(2),
            new Date(entry.timestamp).toLocaleDateString()
        ]);

        // Combine into CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `kimmys_commissions_${viewMode}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ margin: 0 }}>
                    {viewMode === 'daily' ? 'Daily Tracker' : 'Weekly Tracker'}
                </h2>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* View Toggle */}
                    <div style={{ background: '#f0f0f0', borderRadius: '50px', padding: '4px' }}>
                        <button
                            onClick={() => setViewMode('daily')}
                            style={{
                                background: viewMode === 'daily' ? 'var(--color-primary)' : 'transparent',
                                color: viewMode === 'daily' ? 'white' : '#666',
                                borderRadius: '50px',
                                padding: '6px 16px',
                                fontSize: '0.9rem'
                            }}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setViewMode('weekly')}
                            style={{
                                background: viewMode === 'weekly' ? 'var(--color-primary)' : 'transparent',
                                color: viewMode === 'weekly' ? 'white' : '#666',
                                borderRadius: '50px',
                                padding: '6px 16px',
                                fontSize: '0.9rem'
                            }}
                        >
                            This Week
                        </button>
                    </div>

                    {filteredEntries.length > 0 && (
                        <button
                            onClick={exportToCSV}
                            className="btn-secondary"
                            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                        >
                            Export
                        </button>
                    )}
                </div>
            </div>

            {staff.length === 0 ? (
                <p className="text-gold">⚠ Please add staff members first.</p>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'grid', gap: '8px', flex: 1, minWidth: '200px' }}>
                            <label style={{ fontWeight: 600 }}>Staff Member</label>
                            <select
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(e.target.value)}
                                style={{
                                    padding: '12px',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem',
                                    backgroundColor: 'white'
                                }}
                                required
                            >
                                <option value="">Select Staff...</option>
                                {staff.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gap: '8px', width: '150px' }}>
                            <label style={{ fontWeight: 600 }}>Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    padding: '12px',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '8px' }}>
                        <label style={{ fontWeight: 600 }}>Sales Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={salesAmount}
                            onChange={(e) => setSalesAmount(e.target.value)}
                            placeholder="0.00"
                            style={{
                                padding: '12px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid #ddd',
                                fontSize: '1.2rem',
                                fontWeight: 'bold'
                            }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                        Calculate Commission
                    </button>
                </form>
            )}

            {filteredEntries.length > 0 && (
                <div style={{ overflowX: 'auto', marginTop: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Staff</th>
                                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Sales</th>
                                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--color-primary)' }}>70%</th>
                                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--color-secondary)' }}>60%</th>
                                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '12px 8px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.slice().reverse().map(entry => (
                                <tr key={entry.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>{entry.staffName}</td>
                                    <td style={{ textAlign: 'left', padding: '12px 8px' }}>${entry.salesAmount.toFixed(2)}</td>
                                    <td style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                        ${(entry.salesAmount * 0.7).toFixed(2)}
                                    </td>
                                    <td style={{ textAlign: 'left', padding: '12px 8px', color: '#b8860b', fontWeight: 'bold' }}>
                                        ${(entry.salesAmount * 0.6).toFixed(2)}
                                    </td>
                                    <td style={{ textAlign: 'left', padding: '12px 8px', color: '#888', fontSize: '0.9rem' }}>
                                        {new Date(entry.timestamp).toLocaleDateString()}
                                    </td>
                                    <td style={{ textAlign: 'left', padding: '12px 8px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => onDeleteEntry(entry.id)}
                                            style={{ color: 'var(--color-text-light)', background: 'none', padding: '4px' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
                                <td style={{ textAlign: 'left', padding: '16px 8px' }}>TOTALS</td>
                                <td style={{ textAlign: 'left', padding: '16px 8px' }}>
                                    ${filteredEntries.reduce((acc, curr) => acc + curr.salesAmount, 0).toFixed(2)}
                                </td>
                                <td style={{ textAlign: 'left', padding: '16px 8px', color: 'var(--color-primary)' }}>
                                    ${total70.toFixed(2)}
                                </td>
                                <td style={{ textAlign: 'left', padding: '16px 8px', color: '#b8860b' }}>
                                    ${total60.toFixed(2)}
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginTop: '16px' }}>
                        Showing {viewMode === 'daily' ? "today's" : "this week's"} entries.
                    </p>
                </div>
            )}
        </div>
    );
}
