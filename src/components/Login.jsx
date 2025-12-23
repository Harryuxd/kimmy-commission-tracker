import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, Button, Form, Input, Alert, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '16px' }}>
            <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0, color: '#EC5598' }}>Welcome Back</Title>
                    <Text type="secondary">Sign in to manage commissions</Text>
                </div>

                {message && (
                    <Alert
                        message={message.text}
                        type={message.type}
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Enter your email" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ backgroundColor: '#EC5598', borderColor: '#EC5598' }}>
                            {loading ? 'Sending...' : 'Send Magic Link'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
