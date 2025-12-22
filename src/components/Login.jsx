import { useState } from 'react'
import { supabase } from '../supabaseClient'
import kimmyLogo from '../assets/Kimmy_logo.png'

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!email) {
            alert("Please enter an email address.")
            return
        }

        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })

        if (error) {
            alert(error.error_description || error.message)
        } else {
            setMessage('Check your email for the login link!')
        }
        setLoading(false)
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <img
                    src={kimmyLogo}
                    alt="Kimmy's Beauty Bar Logo"
                    style={{ width: '150px', marginBottom: '20px' }}
                />
                <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Welcome Kimmy</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Sign in to manage commissions</p>

                {message ? (
                    <div style={{
                        background: '#e6fffa',
                        color: '#2c7a7b',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '16px'
                    }}>
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleLogin}>
                        <input
                            className="inputField"
                            type="email"
                            placeholder="Your email"
                            value={email}
                            required={true}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '16px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '12px' }}
                        >
                            {loading ? 'Sending link...' : 'Send Magic Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
