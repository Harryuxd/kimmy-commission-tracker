import { useState } from 'react';
import { Card, Input, Button, List, Tag, Form, Popconfirm, Avatar, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';

import { getAvatarColor } from '../utils/colorUtils';

export default function StaffManager({ staff, onAddStaff, onRemoveStaff, onEditStaff }) {
    const [form] = Form.useForm();
    const [editingStaff, setEditingStaff] = useState(null);
    const [editName, setEditName] = useState('');

    const toTitleCase = (str) => {
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const onFinish = (values) => {
        if (values.newStaffName && values.newStaffName.trim()) {
            onAddStaff(toTitleCase(values.newStaffName.trim()));
            form.resetFields();
        }
    };

    const startEdit = (name) => {
        setEditingStaff(name);
        setEditName(name);
    };

    const saveEdit = () => {
        if (editName.trim() && editName !== editingStaff) {
            onEditStaff(editingStaff, toTitleCase(editName.trim()));
        }
        setEditingStaff(null);
        setEditName('');
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold m-0 text-gray-800">Kimmy's Beauty Bar team</h2>
                    <p className="text-gray-400 text-sm m-0 mt-1">Manage your stylists and team members</p>
                </div>

                <Form form={form} layout="inline" onFinish={onFinish} className="flex gap-4">
                    <Form.Item name="newStaffName" className="m-0" rules={[{ required: true, message: 'Please enter a name' }]}>
                        <Input size="large" placeholder="Add staff name" prefix={<UserOutlined className="text-gray-400" />} className="min-w-[240px] rounded-lg" />
                    </Form.Item>
                    <Form.Item className="m-0">
                        <Button type="primary" htmlType="submit" icon={<PlusOutlined />} size="large" className="bg-black hover:bg-gray-800 border-none rounded-lg shadow-lg shadow-gray-200">
                            Add Staff
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex-1 overflow-y-auto">
                {staff.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Empty description="No staff members found. Add one above!" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {staff.map(member => {
                            const avatarStyle = getAvatarColor(member);
                            return (
                                <div key={member} className="group border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow bg-gray-50 hover:bg-white hover:border-pink-100">
                                    {editingStaff === member ? (
                                        <div className="flex flex-1 gap-2">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onPressEnter={saveEdit}
                                                autoFocus
                                                className="rounded-md"
                                            />
                                            <Button type="primary" size="small" onClick={saveEdit} className="bg-green-500">Save</Button>
                                            <Button size="small" onClick={() => setEditingStaff(null)}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 w-full">
                                                <Avatar
                                                    size="large"
                                                    style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text, border: `1px solid ${avatarStyle.bg}` }}
                                                    className="flex-shrink-0 font-bold"
                                                >
                                                    {member.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <span className="font-semibold text-gray-700 text-lg break-words leading-tight flex-1 capitalize">{member}</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    className="text-gray-400 hover:text-blue-500"
                                                    onClick={() => startEdit(member)}
                                                />
                                                <Popconfirm title="Remove staff?" onConfirm={() => onRemoveStaff(member)} okText="Yes" cancelText="No">
                                                    <Button
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        className="text-gray-400 hover:text-red-500"
                                                    />
                                                </Popconfirm>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
