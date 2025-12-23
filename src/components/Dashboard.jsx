
import { useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Radio, Tag, Row, Col, Space, Card, Progress, Segmented } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, DollarOutlined, CalendarOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAvatarColor } from '../utils/colorUtils';
import { serviceList } from '../data/serviceList';

const { Option } = Select;

export default function Dashboard({ staff, entries, onAddEntry, onEditEntry, onDeleteEntry }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [form] = Form.useForm();
    const [viewMode, setViewMode] = useState('daily');
    const [filterStaff, setFilterStaff] = useState([]);

    const openEditModal = (record) => {
        setEditingEntry(record);
        form.setFieldsValue({
            staffName: record.staffName,
            serviceType: record.serviceType,
            salesAmount: record.salesAmount,
            commissionRate: record.commissionRate || 0.7,
            date: dayjs(record.timestamp)
        });
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            const { staffName, serviceType, salesAmount, commissionRate, date } = values;
            const localDate = date.hour(12).minute(0).second(0);

            const entryData = {
                staffName,
                serviceType,
                salesAmount,
                commissionRate,
                timestamp: localDate.toISOString()
            };

            if (editingEntry) {
                onEditEntry({
                    id: editingEntry.id,
                    ...entryData
                });
            } else {
                onAddEntry({
                    id: Date.now(),
                    ...entryData
                });
            }

            form.resetFields();
            setIsModalOpen(false);
            setEditingEntry(null);
        });
    };

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            if (filterStaff.length > 0 && !filterStaff.includes(entry.staffName)) return false;

            const entryDate = dayjs(entry.timestamp);
            const today = dayjs();

            if (viewMode === 'daily') {
                return entryDate.isSame(today, 'day');
            } else if (viewMode === 'weekly') {
                return entryDate.isAfter(today.startOf('week').subtract(1, 'millisecond'));
            }
            return true;
        });
    }, [entries, filterStaff, viewMode]);

    const stats = useMemo(() => {
        const totalSales = filteredEntries.reduce((sum, entry) => sum + entry.salesAmount, 0);
        const totalCommission = filteredEntries.reduce((sum, entry) => {
            const rate = entry.commissionRate !== undefined ? entry.commissionRate : 0.7;
            return sum + (entry.salesAmount * rate);
        }, 0);
        return { totalSales, totalCommission };
    }, [filteredEntries]);

    const growthMetrics = useMemo(() => {
        if (viewMode === 'all') return null;

        const currentTotal = stats.totalCommission;
        let previousEntries = [];
        const today = dayjs();

        if (viewMode === 'daily') {
            const yesterday = today.subtract(1, 'day');
            previousEntries = entries.filter(e => {
                if (filterStaff.length > 0 && !filterStaff.includes(e.staffName)) return false;
                return dayjs(e.timestamp).isSame(yesterday, 'day');
            });
        } else if (viewMode === 'weekly') {
            const startOfLastWeek = today.subtract(1, 'week').startOf('week');
            const endOfLastWeek = today.startOf('week');
            previousEntries = entries.filter(e => {
                if (filterStaff.length > 0 && !filterStaff.includes(e.staffName)) return false;
                const d = dayjs(e.timestamp);
                return d.isAfter(startOfLastWeek) && d.isBefore(endOfLastWeek);
            });
        }

        const previousTotal = previousEntries.reduce((sum, entry) => {
            const rate = entry.commissionRate !== undefined ? entry.commissionRate : 0.7;
            return sum + (entry.salesAmount * rate);
        }, 0);

        if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;

        return ((currentTotal - previousTotal) / previousTotal) * 100;
    }, [entries, stats.totalCommission, viewMode, filterStaff]);

    const columns = [
        {
            title: 'Staff Member',
            dataIndex: 'staffName',
            key: 'staffName',
            filters: staff.map(s => ({ text: s, value: s })),
            onFilter: (value, record) => record.staffName.indexOf(value) === 0,
            sorter: (a, b) => a.staffName.localeCompare(b.staffName),
            render: (text) => {
                const avatarStyle = getAvatarColor(text);
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold border flex-shrink-0"
                            style={{
                                backgroundColor: avatarStyle.bg,
                                color: avatarStyle.text,
                                borderColor: avatarStyle.bg
                            }}
                        >
                            {text.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-700 capitalize">{text}</span>
                    </div>
                );
            },
        },
        {
            title: 'Service',
            dataIndex: 'serviceType',
            key: 'serviceType',
            width: 180,
            render: (text) => (
                <div style={{ maxWidth: 160 }} className="truncate" title={text}>
                    {text || <span className="text-gray-400">-</span>}
                </div>
            )
        },
        {
            title: 'Date',
            dataIndex: 'timestamp',
            key: 'timestamp',
            sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
            render: (text) => <span className="text-gray-500">{dayjs(text).format('MMM D, YYYY')}</span>,
        },
        {
            title: 'Rate',
            dataIndex: 'commissionRate',
            key: 'commissionRate',
            filters: [
                { text: '70%', value: 0.7 },
                { text: '60%', value: 0.6 },
            ],
            onFilter: (value, record) => {
                const r = record.commissionRate !== undefined ? record.commissionRate : 0.7;
                return r === value;
            },
            sorter: (a, b) => {
                const rateA = a.commissionRate !== undefined ? a.commissionRate : 0.7;
                const rateB = b.commissionRate !== undefined ? b.commissionRate : 0.7;
                return rateA - rateB;
            },
            render: (rate) => {
                const r = rate !== undefined ? rate : 0.7;
                return (
                    <Tag
                        color={r === 0.7 ? 'orange' : 'blue'}
                        className="rounded-full px-2 py-0.5 font-medium border-0"
                        style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                        <DollarOutlined style={{ fontSize: '10px' }} />
                        {(r * 100).toFixed(0)}%
                    </Tag>
                );
            },
        },
        {
            title: 'Sales',
            dataIndex: 'salesAmount',
            key: 'salesAmount',
            sorter: (a, b) => a.salesAmount - b.salesAmount,
            render: (amount) => <span className="font-medium">${amount.toFixed(2)}</span>,
        },
        {
            title: 'Commission',
            key: 'commission',
            sorter: (a, b) => {
                const rateA = a.commissionRate !== undefined ? a.commissionRate : 0.7;
                const rateB = b.commissionRate !== undefined ? b.commissionRate : 0.7;
                return (a.salesAmount * rateA) - (b.salesAmount * rateB);
            },
            render: (_, record) => {
                const r = record.commissionRate !== undefined ? record.commissionRate : 0.7;
                return <span className="font-bold text-gray-800">${(record.salesAmount * r).toFixed(2)}</span>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            render: (_, record) => (
                <div className="flex gap-1">
                    <Button
                        type="text"
                        size="small"
                        className="text-gray-400 hover:text-blue-500"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                    />
                    <Button
                        type="text"
                        size="small"
                        className="text-gray-400 hover:text-red-500"
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteEntry(record.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6 h-full font-sans">
            {/* Top Row: Stats & Team Activity */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Stats Card */}
                <div className="flex-1">
                    <Card
                        bordered={false}
                        className="shadow-sm rounded-xl overflow-hidden bg-white h-full"
                        title={
                            <span className="font-bold text-gray-800 text-lg">
                                {viewMode === 'daily' ? "Today's Performance" :
                                    viewMode === 'weekly' ? "This Week's Performance" :
                                        "All Time Performance"}
                            </span>
                        }
                    >
                        <div className="flex gap-8 items-center h-full">
                            <div className="flex-1">
                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Commission</div>
                                <div className="text-3xl font-bold text-gray-800">${stats.totalCommission.toFixed(2)}</div>
                                {growthMetrics !== null && (
                                    <div className={`${growthMetrics >= 0 ? 'text-green-500' : 'text-red-500'} text-xs mt-1 flex items-center gap-1`}>
                                        {growthMetrics >= 0 ? <ArrowUpOutlined /> : <ArrowUpOutlined rotate={180} />}
                                        <span className="font-medium">{Math.abs(growthMetrics).toFixed(1)}%</span>
                                        vs last {viewMode === 'daily' ? 'day' : 'week'}
                                    </div>
                                )}
                                {growthMetrics === null && (
                                    <div className="text-gray-400 text-xs mt-1">All time earnings</div>
                                )}
                            </div>
                            <div className="w-px h-12 bg-gray-100"></div>
                            <div className="flex-1">
                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Sales</div>
                                <div className="text-2xl font-bold text-gray-800">${stats.totalSales.toFixed(2)}</div>
                                <div className="text-gray-400 text-xs mt-1">{filteredEntries.length} services performed</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Team Activity Card */}
                <div className="flex-1">
                    <Card bordered={false} className="shadow-sm rounded-xl bg-white h-full" bodyStyle={{ padding: '12px 24px' }} title={<span className="font-bold text-gray-800 text-sm">Team Activity</span>}>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {staff.slice(0, 5).map((s, i) => (
                                <div key={s} className="flex flex-col items-center min-w-[60px]">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 mb-1 border border-white shadow-sm flex-shrink-0">
                                        {s.charAt(0)}
                                    </div>
                                    <span className="font-medium text-xs text-gray-700 truncate w-full text-center">{s.split(' ')[0]}</span>
                                </div>
                            ))}
                            {staff.length === 0 && <div className="text-gray-400 text-sm italic">No active staff</div>}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Main Table */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <h2 className="text-xl font-bold text-gray-800 m-0">Sales Log</h2>
                        <Segmented
                            options={[
                                { label: 'Today', value: 'daily' },
                                { label: 'Week', value: 'weekly' },
                                { label: 'All', value: 'all' },
                            ]}
                            value={viewMode}
                            onChange={setViewMode}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Select
                            mode="multiple"
                            placeholder="Filter Staff"
                            style={{ minWidth: 160 }}
                            allowClear
                            onChange={setFilterStaff}
                            size="middle"
                            bordered={false}
                            className="custom-select bg-gray-50 rounded-lg min-w-[160px] w-auto block"
                        >
                            {staff.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingEntry(null);
                                form.resetFields();
                                setIsModalOpen(true);
                            }}
                            className="bg-pink-500 hover:bg-pink-600 border-none shadow-md shadow-pink-100"
                        >
                            Add Service
                        </Button>
                    </div>
                </div>

                <div className="bg-white p-0 rounded-xl border border-gray-100 shadow-sm flex-1 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredEntries}
                        rowKey="id"
                        pagination={{ pageSize: 50, position: ['bottomCenter'], simple: true }}
                        className="custom-table h-full"
                        scroll={{ y: 'calc(100vh - 380px)' }}
                        rowSelection={{
                            type: 'checkbox',
                        }}
                        onChange={(pagination, filters, sorter, extra) => {
                            console.log('params', pagination, filters, sorter, extra);
                        }}
                    />
                </div>
            </div>

            <Modal
                title={editingEntry ? "Edit Service" : "Add New Service"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingEntry(null);
                    form.resetFields();
                }}
                okText={editingEntry ? "Update Service" : "Add Service"}
                okButtonProps={{ className: 'bg-black hover:bg-gray-800' }}
                centered
            >
                <Form form={form} layout="vertical" initialValues={{ commissionRate: 0.7, date: dayjs() }} className="mt-4">
                    <Form.Item name="staffName" label="Staff Member" rules={[{ required: true, message: 'Please select a staff member' }]}>
                        <Select placeholder="Select Staff" size="large">
                            {staff.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="serviceType" label="Service (Optional)">
                        <Select
                            placeholder="Select a service to auto-fill price"
                            size="large"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            onChange={(value) => {
                                const service = serviceList.find(s => s.label === value);
                                if (service) {
                                    form.setFieldsValue({ salesAmount: service.value });
                                }
                            }}
                        >
                            {serviceList.map(s => <Option key={s.label} value={s.label}>{s.label} (${s.value}+)</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
                        <DatePicker className="w-full" size="large" />
                    </Form.Item>

                    <Form.Item name="salesAmount" label="Sales Amount ($)" rules={[{ required: true, message: 'Please enter amount' }]}>
                        <InputNumber
                            className="w-full"
                            prefix="$"
                            precision={2}
                            min={0}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item name="commissionRate" label="Commission Rate">
                        <Radio.Group size="large" className="w-full flex">
                            <Radio.Button value={0.7} className="flex-1 text-center">70%</Radio.Button>
                            <Radio.Button value={0.6} className="flex-1 text-center">60%</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
