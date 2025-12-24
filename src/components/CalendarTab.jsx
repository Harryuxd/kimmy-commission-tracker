import { useState } from 'react';
import { Calendar, Modal, Descriptions } from 'antd';
import dayjs from 'dayjs';
import { getAvatarColor } from '../utils/colorUtils';

export default function CalendarTab({ entries = [] }) {
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getListData = (value) => {
        // Filter entries for this specific date
        const dateEntries = entries.filter(entry =>
            dayjs(entry.timestamp).isSame(value, 'day')
        );

        return dateEntries.map(entry => {
            const styles = getAvatarColor(entry.staffName);
            const commission = (entry.salesAmount * (entry.commissionRate || 0.7)).toFixed(2);

            return {
                type: 'success',
                content: `${entry.staffName} - $${commission}`,
                bgColor: styles.bg,     // Light background for event badge
                textColor: styles.text, // Dark text for event badge
                circleBg: styles.text,  // Dark background for circle  
                circleText: styles.bg,  // Light text for circle letter
                staffName: entry.staffName,
                amount: commission,
                rate: ((entry.commissionRate || 0.7) * 100).toFixed(0),
                entry: entry
            };
        });
    };

    const handleEventClick = (item) => {
        setSelectedEntry(item.entry);
        setIsModalOpen(true);
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.map((item, index) => (
                    <li key={index} style={{ marginBottom: '2px' }}>
                        <div
                            className="text-xs px-2 py-0.5 rounded flex items-center gap-1 truncate cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                                backgroundColor: item.bgColor,
                                color: item.textColor,
                                fontSize: '11px'
                            }}
                            onClick={() => handleEventClick(item)}
                        >
                            <div
                                className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                                style={{
                                    backgroundColor: item.circleBg,
                                    color: item.circleText
                                }}
                            >
                                {item.staffName?.charAt(0)}
                            </div>
                            <span className="truncate font-medium">{item.staffName}</span>
                            <span className="ml-auto font-bold text-[10px]">{item.rate}%</span>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    const monthCellRender = (value) => {
        // Get all entries for this month
        const monthEntries = entries.filter(entry =>
            dayjs(entry.timestamp).isSame(value, 'month')
        );

        const totalCommission = monthEntries.reduce((sum, entry) => {
            return sum + (entry.salesAmount * (entry.commissionRate || 0.7));
        }, 0);

        return (
            <div className="text-center p-2">
                {monthEntries.length > 0 && (
                    <div className="mt-1">
                        <div className="text-xs text-gray-500">{monthEntries.length} sales</div>
                        <div className="text-sm font-bold text-pink-600">${totalCommission.toFixed(2)}</div>
                    </div>
                )}
            </div>
        );
    };

    const cellRender = (current, info) => {
        if (info.type === 'date') {
            return dateCellRender(current);
        }
        if (info.type === 'month') {
            return monthCellRender(current);
        }
        return info.originNode;
    };

    return (
        <>
            <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-auto">
                <Calendar
                    cellRender={cellRender}
                    className="kimmy-calendar"
                />
            </div>

            <Modal
                title="Entry Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={500}
            >
                {selectedEntry && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Staff Member">
                            <span className="font-medium capitalize">{selectedEntry.staffName}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Service">
                            {selectedEntry.serviceType || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Date">
                            {dayjs(selectedEntry.timestamp).format('MMMM D, YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sales Amount">
                            <span className="font-medium">${selectedEntry.salesAmount?.toFixed(2)}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Commission Rate">
                            <span className="font-medium">{((selectedEntry.commissionRate || 0.7) * 100).toFixed(0)}%</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Commission Earned">
                            <span className="font-bold text-lg text-pink-600">
                                ${(selectedEntry.salesAmount * (selectedEntry.commissionRate || 0.7)).toFixed(2)}
                            </span>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </>
    );
}
