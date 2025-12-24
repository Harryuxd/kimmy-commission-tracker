import { useState, useEffect } from 'react';
import { Button, Input, Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';

const { TextArea } = Input;

const COLORS = [
    { name: 'yellow', bg: '#fef08a', border: '#fbbf24', shadow: 'rgba(251, 191, 36, 0.3)' },
    { name: 'pink', bg: '#fbcfe8', border: '#ec4899', shadow: 'rgba(236, 72, 153, 0.3)' },
    { name: 'blue', bg: '#bfdbfe', border: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.3)' },
    { name: 'green', bg: '#bbf7d0', border: '#10b981', shadow: 'rgba(16, 185, 129, 0.3)' },
    { name: 'purple', bg: '#e9d5ff', border: '#a855f7', shadow: 'rgba(168, 85, 247, 0.3)' },
    { name: 'orange', bg: '#fed7aa', border: '#f97316', shadow: 'rgba(249, 115, 22, 0.3)' },
];

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNoteText, setNewNoteText] = useState('');
    const [newNoteColor, setNewNoteColor] = useState('yellow');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

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
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">My Notes</h1>
                <p className="text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Add Note Card */}
            <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Note</h3>

                {/* Color Picker */}
                <div className="flex gap-2 mb-4">
                    {COLORS.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => setNewNoteColor(color.name)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${newNoteColor === color.name ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                                }`}
                            style={{ backgroundColor: color.bg }}
                            title={color.name}
                        />
                    ))}
                </div>

                {/* Text Input */}
                <TextArea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onPressEnter={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                            addNote();
                        }
                    }}
                    placeholder="What's on your mind? (Ctrl+Enter to save)"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    className="mb-4"
                    style={{ fontSize: '15px' }}
                />

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addNote}
                    disabled={!newNoteText.trim()}
                    size="large"
                    className="bg-pink-500 hover:bg-pink-600 border-none"
                >
                    Add Note
                </Button>
            </div>

            {/* Notes Grid */}
            <div className="flex-1 overflow-y-auto">
                {notes.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-300 mb-4">
                            <EditOutlined style={{ fontSize: '64px' }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No notes yet</h3>
                        <p className="text-gray-400">Create your first note above to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
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
                                    <div className="p-6 min-h-[200px] flex flex-col">
                                        {/* Action Buttons */}
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isEditing ? (
                                                <>
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<CheckOutlined />}
                                                        onClick={() => updateNote(note.id, editText)}
                                                        className="bg-white hover:bg-green-50"
                                                        style={{ color: '#10b981' }}
                                                    />
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<CloseOutlined />}
                                                        onClick={cancelEdit}
                                                        className="bg-white hover:bg-gray-50"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<EditOutlined />}
                                                        onClick={() => startEdit(note)}
                                                        className="bg-white hover:bg-blue-50"
                                                        style={{ color: '#3b82f6' }}
                                                    />
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => deleteNote(note.id)}
                                                        className="bg-white hover:bg-red-50"
                                                        danger
                                                    />
                                                </>
                                            )}
                                        </div>

                                        {/* Note Content */}
                                        <div className="flex-1 mb-4">
                                            {isEditing ? (
                                                <TextArea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    onPressEnter={(e) => {
                                                        if (e.ctrlKey || e.metaKey) {
                                                            updateNote(note.id, editText);
                                                        }
                                                    }}
                                                    autoSize={{ minRows: 4, maxRows: 8 }}
                                                    className="bg-white bg-opacity-50"
                                                    autoFocus
                                                />
                                            ) : (
                                                <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap break-words">
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
