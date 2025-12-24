import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, Button, Form, Input, Alert, Typography } from 'antd';
import { MailOutlined, SendOutlined } from '@ant-design/icons';
import kimmyLogo from '../assets/Kimmy_logo.png';

const { Title, Text } = Typography;

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const onFinish = async (values) => {
        setLoading(true);
        setMessage('');
        const { email } = values;

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: 'Magic link sent! Check your email.' });
        }
        setLoading(false);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '20px'
            }}
        >
            {/* Login Card */}
            <Card
                style={{
                    width: '100%',
                    maxWidth: 450,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    borderRadius: '20px',
                    border: 'none',
                    overflow: 'hidden'
                }}
                bodyStyle={{ padding: '48px 40px' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <img
                        src={kimmyLogo}
                        alt="Kimmy Logo"
                        style={{
                            height: '80px',
                            display: 'block',
                            margin: '0 auto 24px auto',
                            filter: 'drop-shadow(0 4px 12px rgba(236, 85, 152, 0.3))'
                        }}
                    />
                    <Title level={2} style={{ margin: '0 0 8px 0', color: '#1f2937', fontWeight: 700 }}>
                        Welcome Back
                    </Title>
                    <Text style={{ fontSize: '15px', color: '#6b7280' }}>
                        Sign in to manage your commissions
                    </Text>
                </div>

                {message && (
                    <Alert
                        message={message.text}
                        type={message.type}
                        showIcon
                        style={{
                            marginBottom: 28,
                            borderRadius: '12px',
                            border: 'none'
                        }}
                    />
                )}

                <Form
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        label={<span style={{ fontWeight: 600, color: '#374151' }}>Email Address</span>}
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                            placeholder="your.email@example.com"
                            size="large"
                            style={{
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '15px'
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            icon={!loading && <SendOutlined />}
                            style={{
                                background: 'linear-gradient(135deg, #EC5598 0%, #D946A6 100%)',
                                borderColor: 'transparent',
                                borderRadius: '12px',
                                height: '52px',
                                fontSize: '16px',
                                fontWeight: 600,
                                boxShadow: '0 4px 20px rgba(236, 85, 152, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 24px rgba(236, 85, 152, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(236, 85, 152, 0.4)';
                            }}
                        >
                            {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
                        </Button>
                    </Form.Item>
                </Form>

                {/* Footer Text */}
                <div style={{ textAlign: 'center', marginTop: 28 }}>
                    <Text style={{ fontSize: '13px', color: '#9ca3af' }}>
                        We'll send you a magic link to sign in securely
                    </Text>
                </div>
            </Card>
        </div>
    );
}
