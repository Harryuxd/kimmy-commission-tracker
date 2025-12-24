import { useState, useEffect } from 'react';
import { Button, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, CalendarOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function Notes() {
    const [notes, setNotes] = useState(() => {
        // Load notes array from localStorage on initial mount
        try {
            const savedNotes = localStorage.getItem('kimmy-dashboard-notes');
            return savedNotes ? JSON.parse(savedNotes) : [];
        } catch (error) {
            // If parsing fails (corrupted data), clear it and return empty array
            console.warn('Failed to parse notes from localStorage, resetting:', error);
            localStorage.removeItem('kimmy-dashboard-notes');
            return [];
        }
    });
    const [newNoteText, setNewNoteText] = useState('');

    // Save notes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('kimmy-dashboard-notes', JSON.stringify(notes));
    }, [notes]);

    const addNote = () => {
        if (newNoteText.trim()) {
            const newNote = {
                id: Date.now(),
                text: newNoteText.trim(),
                timestamp: new Date().toISOString()
            };
            setNotes([newNote, ...notes]); // Add to beginning
            setNewNoteText('');
        }
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            <Card
                bordered={false}
                className="shadow-sm rounded-xl bg-white flex-1 flex flex-col overflow-hidden h-full"
                bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
                title={
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 text-lg">My Notes</span>
                        <span className="text-sm text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
                    </div>
                }
            >
                {/* Add Note Input */}
                <div className="flex gap-3 mb-4">
                    <input
                        type="text"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addNote()}
                        placeholder="Add a new note..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addNote}
                        disabled={!newNoteText.trim()}
                        size="large"
                        className="bg-pink-500 hover:bg-pink-600 border-none px-6"
                    >
                        Add Note
                    </Button>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                    {notes.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center py-12">
                                <div className="text-gray-300 mb-4">
                                    <EditOutlined style={{ fontSize: '48px' }} />
                                </div>
                                <div className="text-gray-400 text-lg font-medium mb-2">No notes yet</div>
                                <div className="text-gray-400 text-sm">Add your first note above to get started</div>
                            </div>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base text-gray-700 mb-2 break-words leading-relaxed">{note.text}</p>
                                        <div className="flex items-center gap-2">
                                            <CalendarOutlined className="text-gray-400 text-xs" />
                                            <span className="text-xs text-gray-400">
                                                {dayjs(note.timestamp).format('MMM D, YYYY')}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-400">
                                                {dayjs(note.timestamp).format('h:mm A')}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => deleteNote(note.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
