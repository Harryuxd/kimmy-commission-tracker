const colors = [
    { bg: '#e0f2fe', text: '#0369a1' }, // Sky Blue
    { bg: '#dcfce7', text: '#15803d' }, // Green
    { bg: '#fef9c3', text: '#a16207' }, // Yellow
    { bg: '#fee2e2', text: '#b91c1c' }, // Red
    { bg: '#f3e8ff', text: '#7e22ce' }, // Purple
    { bg: '#ffedd5', text: '#c2410c' }, // Orange
    { bg: '#fce7f3', text: '#be185d' }, // Pink
    { bg: '#ccfbf1', text: '#0f766e' }, // Teal
];

export const getAvatarColor = (name) => {
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};
