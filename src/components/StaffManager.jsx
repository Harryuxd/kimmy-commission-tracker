import { useState } from 'react';

export default function StaffManager({ staff, onAddStaff, onRemoveStaff, onEditStaff }) {
    const [name, setName] = useState('');
    const [editingName, setEditingName] = useState(null); // The name being edited
    const [tempName, setTempName] = useState(''); // The new text while editing

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onAddStaff(name.trim());
            setName('');
        }
    };

    const startEditing = (currentName) => {
        setEditingName(currentName);
        setTempName(currentName);
    };

    const saveEdit = () => {
        if (tempName.trim() && tempName.trim() !== editingName) {
            onEditStaff(editingName, tempName.trim());
        }
        setEditingName(null);
        setTempName('');
    };

    const cancelEdit = () => {
        setEditingName(null);
        setTempName('');
    };

    return (
        <div className="card">
            <h2>Staff Management</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter staff name..."
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid #ddd',
                        fontSize: '1rem'
                    }}
                />
                <button type="submit" className="btn-primary">
                    Add
                </button>
            </form>

            {staff.length === 0 ? (
                <p style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                    No staff added yet. Add someone to start tracking!
                </p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {staff.map((member) => (
                        <div
                            key={member}
                            style={{
                                background: '#f0f0f0',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                border: editingName === member ? '2px solid var(--color-primary)' : '2px solid transparent'
                            }}
                        >
                            {editingName === member ? (
                                <>
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                            width: '100px',
                                            borderBottom: '1px solid var(--color-primary)'
                                        }}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                    />
                                    <button onClick={saveEdit} style={{ color: 'green', padding: '0 4px', background: 'none' }} title="Save">✓</button>
                                    <button onClick={cancelEdit} style={{ color: 'gray', padding: '0 4px', background: 'none' }} title="Cancel">✕</button>
                                </>
                            ) : (
                                <>
                                    <span
                                        onClick={() => startEditing(member)}
                                        style={{ fontWeight: 600, cursor: 'text' }}
                                        title="Click to edit name"
                                    >
                                        {member}
                                    </span>
                                    <button
                                        onClick={() => onRemoveStaff(member)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-error)',
                                            padding: 0,
                                            fontSize: '1.2rem',
                                            lineHeight: 1,
                                            cursor: 'pointer',
                                            marginLeft: '4px'
                                        }}
                                        aria-label={`Remove ${member}`}
                                    >
                                        &times;
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#999' }}>
                Tip: Click a name to fix spelling.
            </p>
        </div>
    );
}
