-- Run this in your Supabase SQL Editor to add the service_type column

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS service_type text;

-- Optional: You can check if it worked by running:
-- SELECT * FROM entries LIMIT 1;
