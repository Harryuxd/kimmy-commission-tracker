import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://smfqoscvlmgnnomadcjb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZnFvc2N2bG1nbm5vbWFkY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjI1MDksImV4cCI6MjA5NDE5ODUwOX0.4f2rck0dnanLGg6Yq94DmnFDbgzCNhbLlOcWLwhjwYk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
