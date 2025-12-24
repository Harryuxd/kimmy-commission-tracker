import { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Avatar, theme, Button, Drawer } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, TeamOutlined, MenuFoldOutlined, MenuUnfoldOutlined, CalendarOutlined, MenuOutlined, EditOutlined } from '@ant-design/icons';
import kimmyLogo from '../assets/Kimmy_logo.png';

const { Header, Sider, Content } = AntLayout;

export default function Layout({ children, activeTab, setActiveTab, handleLogout, userEmail }) {
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const items = [
        {
            key: 'tracker',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => {
                setActiveTab('tracker');
                if (isMobile) setMobileDrawerOpen(false);
            },
        },
        {
            key: 'calendar',
            icon: <CalendarOutlined />,
            label: 'Calendar',
            onClick: () => {
                setActiveTab('calendar');
                if (isMobile) setMobileDrawerOpen(false);
            },
        },
        {
            key: 'notes',
            icon: <EditOutlined />,
            label: 'Notes',
            onClick: () => {
                setActiveTab('notes');
                if (isMobile) setMobileDrawerOpen(false);
            },
        },
        {
            key: 'staff',
            icon: <TeamOutlined />,
            label: 'Staff',
            onClick: () => {
                setActiveTab('staff');
                if (isMobile) setMobileDrawerOpen(false);
            },
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

    const SidebarContent = () => (
        <>
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
        </>
    );

    return (
        <AntLayout style={{ height: '100vh', overflow: 'hidden' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={260}
                    style={{
                        background: '#111827',
                        borderRight: '1px solid #1f2937'
                    }}
                >
                    <SidebarContent />
                </Sider>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setMobileDrawerOpen(false)}
                    open={mobileDrawerOpen}
                    styles={{
                        body: { padding: 0, background: '#111827' },
                        header: { background: '#111827', borderBottom: '1px solid #1f2937' }
                    }}
                    width={260}
                >
                    <SidebarContent />
                </Drawer>
            )}

            <AntLayout>
                <Header
                    className="mobile-header"
                    style={{
                        padding: isMobile ? '0 16px' : '0 24px',
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f0f0f0',
                        height: isMobile ? '56px' : '64px'
                    }}
                >
                    {isMobile ? (
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setMobileDrawerOpen(true)}
                            style={{
                                fontSize: '18px',
                                width: 48,
                                height: 48,
                            }}
                        />
                    ) : (
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
                    )}

                    <div className="flex items-center gap-4">
                        <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
                            <span className="cursor-pointer font-medium hover:text-pink-500 transition-colors" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                                {isMobile ? userEmail.split('@')[0] : userEmail}
                            </span>
                        </Dropdown>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: isMobile ? '12px 8px' : '8px 16px',
                        padding: isMobile ? 12 : 24,
                        overflow: 'hidden',
                        height: isMobile ? 'calc(100vh - 80px)' : 'calc(100vh - 96px)'
                    }}
                >
                    {children}
                </Content>
            </AntLayout>
        </AntLayout>
    );
}
