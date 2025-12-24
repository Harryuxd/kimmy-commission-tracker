
import { useState } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Avatar, theme, Button } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, TeamOutlined, MenuFoldOutlined, MenuUnfoldOutlined, CalendarOutlined } from '@ant-design/icons';
import kimmyLogo from '../assets/Kimmy_logo.png';

const { Header, Sider, Content } = AntLayout;

export default function Layout({ children, activeTab, setActiveTab, handleLogout, userEmail }) {
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const [collapsed, setCollapsed] = useState(false);

    const items = [
        {
            key: 'tracker',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => setActiveTab('tracker'),
        },
        {
            key: 'calendar',
            icon: <CalendarOutlined />,
            label: 'Calendar',
            onClick: () => setActiveTab('calendar'),
        },
        {
            key: 'staff',
            icon: <TeamOutlined />,
            label: 'Staff',
            onClick: () => setActiveTab('staff'),
        },
    ];

    const userMenu = [
        {
            key: '1',
            label: (
                <div className="flex flex-col">
                    <span className="font-semibold text-xs text-gray-400">Signed in as</span>
                    <span className="font-medium">{userEmail}</span>
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: 'Log Out',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <AntLayout style={{ height: '100vh', overflow: 'hidden' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                style={{
                    background: '#111827', // Dark sidebar like the screenshot
                    borderRight: '1px solid #1f2937'
                }}
            >
                <div className="flex flex-row items-center gap-4 p-5 mb-4 text-left">
                    <img src={kimmyLogo} alt="Logo" className="w-12 h-12 object-contain" />
                    {!collapsed && <h1 className="text-lg font-bold text-white m-0 tracking-wide leading-tight">Kimmy's Commission Tracker</h1>}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[activeTab]}
                    items={items}
                    style={{ background: 'transparent', fontSize: '15px' }}
                />

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    {!collapsed && (
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#EC5598' }} />
                            <span className="truncate">{userEmail}</span>
                        </div>
                    )}
                </div>
            </Sider>

            <AntLayout>
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />

                    <div className="flex items-center gap-4">
                        <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
                            <span className="cursor-pointer font-medium hover:text-pink-500 transition-colors">
                                {userEmail}
                            </span>
                        </Dropdown>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        overflow: 'hidden',
                        height: 'calc(100vh - 112px)' // 64px header + 24px top margin + 24px bottom margin
                    }}
                >
                    {children}
                </Content>
            </AntLayout>
        </AntLayout>
    );
}
