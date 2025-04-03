-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create websites table
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  domain TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_traffic table
CREATE TABLE ai_traffic (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id),
  source TEXT,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_ai_traffic_website_id ON ai_traffic(website_id);
CREATE INDEX idx_ai_traffic_timestamp ON ai_traffic(timestamp);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_traffic ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY users_policy ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY websites_policy ON websites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY ai_traffic_policy ON ai_traffic
  FOR ALL USING (
    website_id IN (
      SELECT id FROM websites WHERE user_id = auth.uid()
    )
  );
