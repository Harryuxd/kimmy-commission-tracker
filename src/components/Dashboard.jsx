
import { useState, useMemo, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Radio, Tag, Row, Col, Space, Card, Progress, Segmented } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, DollarOutlined, CalendarOutlined, EditOutlined, DownloadOutlined, ExclamationCircleOutlined, DashboardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAvatarColor } from '../utils/colorUtils';
import { serviceList } from '../data/serviceList';

const { Option } = Select;

export default function Dashboard({ entries, setEntries, staff }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [form] = Form.useForm();
    const [viewMode, setViewMode] = useState('all');
    const [filterStaff, setFilterStaff] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [mobilePage, setMobilePage] = useState(1);
    const mobilePageSize = 10;

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    const handleDelete = (entry) => {
        Modal.confirm({
            title: 'Delete Entry',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Are you sure you want to delete this entry?</p>
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm"><strong>Staff:</strong> {entry.staffName}</p>
                        {entry.serviceType && <p className="text-sm"><strong>Service:</strong> {entry.serviceType}</p>}
                        <p className="text-sm"><strong>Amount:</strong> ${entry.salesAmount.toFixed(2)}</p>
                    </div>
                </div>
            ),
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            okButtonProps: {
                danger: true,
                type: 'primary'
            },
            cancelButtonProps: {
                type: 'default'
            },
            onOk() {
                onDeleteEntry(entry.id);
            },
        });
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

    const handleExport = () => {
        const headers = ["Date", "Staff Name", "Service", "Sales Amount", "Commission Rate", "Commission"];
        const csvRows = [
            headers.join(","),
            ...filteredEntries.map(entry => {
                const commission = (entry.salesAmount * (entry.commissionRate || 0.7)).toFixed(2);
                return [
                    dayjs(entry.timestamp).format('YYYY-MM-DD'),
                    `"${entry.staffName}"`,
                    `"${entry.serviceType || '-'}"`,
                    entry.salesAmount.toFixed(2),
                    `${((entry.commissionRate || 0.7) * 100).toFixed(0)}% `,
                    commission
                ].join(",");
            })
        ];
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `commission_report_${dayjs().format('YYYY-MM-DD')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            width: 200,
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
            width: 140,
            sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
            render: (text) => <span className="text-gray-500">{dayjs(text).format('MMM D, YYYY')}</span>,
        },
        {
            title: 'Rate',
            dataIndex: 'commissionRate',
            key: 'commissionRate',
            width: 100,
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
            width: 120,
            sorter: (a, b) => a.salesAmount - b.salesAmount,
            render: (amount) => <span className="font-medium">${amount.toFixed(2)}</span>,
        },
        {
            title: 'Commission',
            key: 'commission',
            width: 130,
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
                        onClick={() => handleDelete(record)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4 md:gap-6 h-full font-sans">
            {/* Top Row: Stats & Staff Members - Stack on mobile */}
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
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
                                    <div className={`${growthMetrics >= 0 ? 'text-green-500' : 'text-red-500'} text - xs mt - 1 flex items - center gap - 1`}>
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

                {/* Staff Members Card */}
                <div className="flex-1">
                    <Card bordered={false} className="shadow-sm rounded-xl bg-white h-full" bodyStyle={{ padding: '12px 24px' }} title={<span className="font-bold text-gray-800 text-lg">Staff Members</span>}>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {(() => {
                                // Calculate commission per staff member for filtered period
                                const staffStats = staff.map(s => {
                                    const staffEntries = filteredEntries.filter(e => e.staffName === s);
                                    const commission = staffEntries.reduce((sum, e) => {
                                        const rate = e.commissionRate !== undefined ? e.commissionRate : 0.7;
                                        return sum + (e.salesAmount * rate);
                                    }, 0);
                                    return { name: s, commission, count: staffEntries.length };
                                }).sort((a, b) => b.commission - a.commission); // Sort by commission

                                const topPerformer = staffStats.length > 0 ? staffStats[0].name : null;

                                return staffStats.slice(0, 5).map((s, i) => {
                                    const avatarStyle = getAvatarColor(s.name);
                                    const isTop = s.name === topPerformer && s.commission > 0;

                                    return (
                                        <div key={s.name} className="flex flex-col items-center min-w-[80px] relative">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-1 border-2 shadow-sm flex-shrink-0"
                                                style={{
                                                    backgroundColor: avatarStyle.bg,
                                                    color: avatarStyle.text,
                                                    borderColor: avatarStyle.bg
                                                }}
                                            >
                                                {s.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-xs text-gray-700 truncate w-full text-center capitalize">{s.name.split(' ')[0]}</span>
                                            <span className="font-bold text-[11px] text-pink-600">${s.commission.toFixed(0)}</span>
                                            <span className="text-[10px] text-gray-400">{s.count} service{s.count !== 1 ? 's' : ''}</span>
                                        </div>
                                    );
                                });
                            })()}
                            {staff.length === 0 && <div className="text-gray-400 text-sm italic">No active staff</div>}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Main Table */}
            <div className="flex-1 flex flex-col gap-3 md:gap-4 overflow-hidden" style={{ marginTop: '32px' }}>
                {/* Controls - Stack on mobile */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full sm:w-auto">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 m-0">Sales Log</h2>
                        <Segmented
                            options={[
                                { label: 'Today', value: 'daily' },
                                { label: 'Week', value: 'weekly' },
                                { label: 'All Time', value: 'all' },
                            ]}
                            value={viewMode}
                            onChange={setViewMode}
                            size="middle"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                            className="flex-1 sm:flex-initial"
                        >
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Select
                            mode="multiple"
                            placeholder="Filter Staff"
                            style={{ minWidth: 120, flex: '1 1 auto' }}
                            allowClear
                            onChange={setFilterStaff}
                            size="middle"
                            bordered={false}
                            className="custom-select bg-gray-50 rounded-lg sm:min-w-[160px]"
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

                {/* Mobile Card View */}
                {isMobile ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-auto space-y-3 pb-4">
                            {filteredEntries
                                .slice((mobilePage - 1) * mobilePageSize, mobilePage * mobilePageSize)
                                .map((entry) => {
                                    const avatarStyle = getAvatarColor(entry.staffName);
                                    const commission = (entry.salesAmount * (entry.commissionRate || 0.7)).toFixed(2);
                                    const rate = entry.commissionRate !== undefined ? entry.commissionRate : 0.7;

                                    return (
                                        <Card key={entry.id} className="shadow-sm" bodyStyle={{ padding: '16px' }}>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                                        style={{
                                                            backgroundColor: avatarStyle.bg,
                                                            color: avatarStyle.text
                                                        }}
                                                    >
                                                        {entry.staffName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800 capitalize">{entry.staffName}</div>
                                                        <div className="text-xs text-gray-500">{dayjs(entry.timestamp).format('MMM D, YYYY')}</div>
                                                    </div>
                                                </div>
                                                <Tag
                                                    color={rate === 0.7 ? 'orange' : 'blue'}
                                                    className="rounded-full px-2 py-0.5 font-medium"
                                                >
                                                    {(rate * 100).toFixed(0)}%
                                                </Tag>
                                            </div>

                                            {entry.serviceType && (
                                                <div className="mb-2">
                                                    <span className="text-xs text-gray-500">Service:</span>
                                                    <span className="ml-2 text-sm text-gray-700">{entry.serviceType}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <div>
                                                    <div className="text-xs text-gray-500">Sales</div>
                                                    <div className="text-lg font-semibold text-gray-800">${entry.salesAmount.toFixed(2)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500">Commission</div>
                                                    <div className="text-lg font-bold text-pink-600">${commission}</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => openEditModal(entry)}
                                                    className="flex-1"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleDelete(entry)}
                                                    className="flex-1"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            {filteredEntries.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    No entries found
                                </div>
                            )}
                        </div>

                        {/* Mobile Pagination */}
                        {filteredEntries.length > mobilePageSize && (
                            <div className="flex justify-center py-3 border-t border-gray-100 bg-white">
                                <Space>
                                    <Button
                                        size="small"
                                        disabled={mobilePage === 1}
                                        onClick={() => setMobilePage(mobilePage - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {mobilePage} of {Math.ceil(filteredEntries.length / mobilePageSize)}
                                    </span>
                                    <Button
                                        size="small"
                                        disabled={mobilePage >= Math.ceil(filteredEntries.length / mobilePageSize)}
                                        onClick={() => setMobilePage(mobilePage + 1)}
                                    >
                                        Next
                                    </Button>
                                </Space>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Desktop Table View */
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-hidden">
                            <Table
                                columns={columns}
                                dataSource={filteredEntries}
                                rowKey="id"
                                pagination={{
                                    pageSize: 50,
                                    position: ['bottomCenter'],
                                    showSizeChanger: false,
                                    showTotal: (total, range) => `${range[0]} -${range[1]} of ${total} entries`,
                                    className: 'sticky-pagination'
                                }}
                                className="custom-table"
                                scroll={{ y: 'calc(100vh - 450px)', x: 'max-content' }}
                                rowSelection={{
                                    type: 'checkbox',
                                }}
                                onChange={(pagination, filters, sorter, extra) => {
                                    console.log('params', pagination, filters, sorter, extra);
                                }}
                            />
                        </div>
                    </div>
                )}
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
