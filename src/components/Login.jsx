import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, Button, Form, Input, Alert, Typography, Checkbox } from 'antd';
import { MailOutlined, SendOutlined, LockOutlined } from '@ant-design/icons';
import kimmyLogo from '../assets/Kimmy_logo.png';

const { Title, Text } = Typography;
const SITE_URL = 'https://kimmystracker.netlify.app';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);

    const handleSendCode = async (values) => {
        setLoading(true);
        setMessage('');
        const { email: emailValue, rememberMe } = values;
        setEmail(emailValue);

        // Store remember me preference
        if (rememberMe) {
            localStorage.setItem('kimmy_remember_me', 'true');
        } else {
            localStorage.removeItem('kimmy_remember_me');
        }

        const { error } = await supabase.auth.signInWithOtp({
            email: emailValue,
            options: {
                emailRedirectTo: SITE_URL,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
            setLoading(false);
        } else {
            setCodeSent(true);
            setMessage({ type: 'success', text: 'Magic link sent! Check your email. You can also enter the code below.' });
            setLoading(false);
        }
    };

    const handleVerifyCode = async (values) => {
        setVerifyingCode(true);
        setMessage('');
        const { token } = values;

        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'magiclink',
        });

        if (error) {
            setMessage({ type: 'error', text: `Invalid code: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: 'Successfully signed in!' });
        }
        setVerifyingCode(false);
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

                {!codeSent ? (
                    <Form
                        name="login_form"
                        onFinish={handleSendCode}
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

                        <Form.Item name="rememberMe" valuePropName="checked" initialValue={true}>
                            <Checkbox style={{ color: '#6b7280', fontSize: '14px' }}>
                                Keep me signed in for 30 days
                            </Checkbox>
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
                ) : (
                    <div>
                        <div style={{ marginBottom: 24, padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                            <Text style={{ fontSize: '14px', color: '#0369a1' }}>
                                ✨ Magic link sent to <strong>{email}</strong>
                            </Text>
                        </div>

                        <Form
                            name="verify_form"
                            onFinish={handleVerifyCode}
                            layout="vertical"
                            style={{ marginTop: 24 }}
                        >
                            <Form.Item
                                label={<span style={{ fontWeight: 600, color: '#374151' }}>Or enter code from email</span>}
                                style={{ marginBottom: 16 }}
                            >
                                <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    Copy the code from the magic link URL or email body and paste it here
                                </Text>
                            </Form.Item>

                            <Form.Item
                                name="token"
                                rules={[
                                    { required: true, message: 'Please enter the code from your email' },
                                    { min: 20, message: 'Code is too short' }
                                ]}
                            >
                                <Input
                                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                                    placeholder="Paste code here"
                                    size="large"
                                    style={{
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        fontSize: '14px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={verifyingCode}
                                    block
                                    size="large"
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
                                    {verifyingCode ? 'Verifying...' : 'Verify Code'}
                                </Button>
                            </Form.Item>

                            <Button
                                type="text"
                                block
                                style={{ marginTop: 12, color: '#9ca3af' }}
                                onClick={() => {
                                    setCodeSent(false);
                                    setMessage('');
                                }}
                            >
                                ← Send a new code
                            </Button>
                        </Form>
                    </div>
                )}

                {/* Footer Text */}
                <div style={{ textAlign: 'center', marginTop: 28 }}>
                    {!codeSent ? (
                        <Text style={{ fontSize: '13px', color: '#9ca3af' }}>
                            We'll send you a magic link to sign in securely
                        </Text>
                    ) : (
                        <Text style={{ fontSize: '13px', color: '#9ca3af' }}>
                            Use the magic link or paste the code to sign in on any device
                        </Text>
                    )}
                </div>
            </Card>
        </div>
    );
}
