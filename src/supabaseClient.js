import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iomqzagfoejqiybuagiq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbXF6YWdmb2VqcWl5YnVhZ2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNzU2MzksImV4cCI6MjA4MTk1MTYzOX0.3GyYCGkpVBhjDddkPZUi6T1hhvAhNB6CWhhKmokcwl4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
