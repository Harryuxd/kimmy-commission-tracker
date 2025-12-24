import { useState, useEffect } from 'react';
import { Button, Input, Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';

const { TextArea } = Input;

const COLORS = [
    { name: 'yellow', bg: '#fef08a', border: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.3)', circle: '#fbbf24' },
    { name: 'pink', bg: '#fbcfe8', border: '#db2777', shadow: 'rgba(219, 39, 119, 0.3)', circle: '#ec4899' },
    { name: 'blue', bg: '#bfdbfe', border: '#2563eb', shadow: 'rgba(37, 99, 235, 0.3)', circle: '#3b82f6' },
    { name: 'green', bg: '#bbf7d0', border: '#16a34a', shadow: 'rgba(22, 163, 74, 0.3)', circle: '#22c55e' },
    { name: 'purple', bg: '#e9d5ff', border: '#9333ea', shadow: 'rgba(147, 51, 234, 0.3)', circle: '#a855f7' },
    { name: 'orange', bg: '#fed7aa', border: '#ea580c', shadow: 'rgba(234, 88, 12, 0.3)', circle: '#f97316' },
];

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNoteText, setNewNoteText] = useState('');
    const [newNoteColor, setNewNoteColor] = useState('yellow');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            message.error('Failed to load notes');
            console.error(error);
        } else {
            setNotes(data || []);
        }
        setLoading(false);
    };

    const addNote = async () => {
        if (!newNoteText.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('notes')
            .insert([{
                text: newNoteText.trim(),
                color: newNoteColor,
                user_id: user.id
            }])
            .select()
            .single();

        if (error) {
            message.error('Failed to add note');
            console.error(error);
        } else {
            setNotes([data, ...notes]);
            setNewNoteText('');
            setNewNoteColor('yellow');
            setIsModalOpen(false);
            message.success('Note added!');
        }
    };

    const updateNote = async (id, text) => {
        if (!text.trim()) return;

        const { error } = await supabase
            .from('notes')
            .update({ text: text.trim(), updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            message.error('Failed to update note');
            console.error(error);
        } else {
            setNotes(notes.map(note =>
                note.id === id ? { ...note, text: text.trim(), updated_at: new Date().toISOString() } : note
            ));
            setEditingId(null);
            setEditText('');
            message.success('Note updated!');
        }
    };

    const deleteNote = async (id) => {
        Modal.confirm({
            title: 'Delete Note',
            content: 'Are you sure you want to delete this note?',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                const { error } = await supabase
                    .from('notes')
                    .delete()
                    .eq('id', id);

                if (error) {
                    message.error('Failed to delete note');
                    console.error(error);
                } else {
                    setNotes(notes.filter(note => note.id !== id));
                    message.success('Note deleted!');
                }
            },
        });
    };

    const startEdit = (note) => {
        setEditingId(note.id);
        setEditText(note.text);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const getColorStyle = (colorName) => {
        const color = COLORS.find(c => c.name === colorName) || COLORS[0];
        return color;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading notes...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
                    <p className="text-sm text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    size="large"
                    className="bg-pink-500 hover:bg-pink-600 border-none"
                >
                    New Note
                </Button>
            </div>

            {/* Add Note Modal */}
            <Modal
                title="Create New Note"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setNewNoteText('');
                    setNewNoteColor('yellow');
                }}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={addNote}
                        disabled={!newNoteText.trim()}
                        className="bg-pink-500 hover:bg-pink-600 border-none"
                    >
                        Add Note
                    </Button>,
                ]}
            >
                {/* Color Picker */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose Color</label>
                    <div className="flex gap-2">
                        {COLORS.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => setNewNoteColor(color.name)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${newNoteColor === color.name ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
                                    }`}
                                style={{ backgroundColor: color.circle }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Text Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note Text</label>
                    <TextArea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onPressEnter={(e) => {
                            if (e.ctrlKey || e.metaKey) {
                                addNote();
                            }
                        }}
                        placeholder="What's on your mind? (Ctrl+Enter to save)"
                        autoSize={{ minRows: 4, maxRows: 10 }}
                        style={{ fontSize: '15px' }}
                        autoFocus
                    />
                </div>
            </Modal>

            {/* Notes Grid */}
            <div className="flex-1 overflow-y-auto overflow-x-visible pt-6 px-6" style={{ overflowX: 'visible' }}>
                {notes.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-300 mb-4">
                            <EditOutlined style={{ fontSize: '64px' }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No notes yet</h3>
                        <p className="text-gray-400">Create your first note above to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6 pb-6" style={{ overflow: 'visible' }}>
                        {notes.map((note) => {
                            const colorStyle = getColorStyle(note.color);
                            const isEditing = editingId === note.id;

                            return (
                                <div
                                    key={note.id}
                                    className="group relative"
                                    style={{
                                        backgroundColor: colorStyle.bg,
                                        borderLeft: `4px solid ${colorStyle.border}`,
                                        boxShadow: `0 4px 12px ${colorStyle.shadow}`,
                                        transform: 'rotate(-1deg)',
                                        transition: 'all 0.3s ease',
                                        overflow: 'visible',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
                                        e.currentTarget.style.boxShadow = `0 8px 24px ${colorStyle.shadow}`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'rotate(-1deg)';
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${colorStyle.shadow}`;
                                    }}
                                >
                                    <div className="p-8 min-h-[250px] flex flex-col">
                                        {/* Action Buttons */}
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={() => deleteNote(note.id)}
                                                className="bg-white hover:bg-opacity-80"
                                                style={{ color: colorStyle.border }}
                                            />
                                        </div>

                                        {/* Note Content */}
                                        <div className="flex-1 mb-4 mt-2">
                                            {isEditing ? (
                                                <TextArea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    onBlur={() => {
                                                        if (editText.trim() && editText !== note.text) {
                                                            updateNote(note.id, editText);
                                                        } else {
                                                            cancelEdit();
                                                        }
                                                    }}
                                                    onPressEnter={(e) => {
                                                        if (e.ctrlKey || e.metaKey) {
                                                            updateNote(note.id, editText);
                                                        }
                                                    }}
                                                    autoSize={{ minRows: 4, maxRows: 8 }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        padding: 0,
                                                        resize: 'none',
                                                        fontSize: '16px',
                                                        fontWeight: 500,
                                                        lineHeight: '1.6',
                                                        color: '#1f2937'
                                                    }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <p
                                                    className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap break-words cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => startEdit(note)}
                                                >
                                                    {note.text}
                                                </p>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className="text-xs text-gray-600 flex items-center justify-between border-t pt-3" style={{ borderColor: colorStyle.border + '40' }}>
                                            <span>{dayjs(note.created_at).format('MMM D, YYYY')}</span>
                                            <span>{dayjs(note.created_at).format('h:mm A')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
