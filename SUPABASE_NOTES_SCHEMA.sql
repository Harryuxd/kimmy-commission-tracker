-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    color VARCHAR(20) DEFAULT 'yellow',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own notes
CREATE POLICY "Users can view own notes"
    ON notes FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can insert their own notes
CREATE POLICY "Users can insert own notes"
    ON notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own notes
CREATE POLICY "Users can update own notes"
    ON notes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes"
    ON notes FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);
