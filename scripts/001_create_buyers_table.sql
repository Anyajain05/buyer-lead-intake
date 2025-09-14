-- Create buyers table with all required fields
CREATE TABLE IF NOT EXISTS public.buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_locations TEXT[] DEFAULT '{}',
  property_type TEXT CHECK (property_type IN ('house', 'condo', 'townhouse', 'apartment', 'other')),
  bedrooms INTEGER,
  bathrooms DECIMAL(2,1),
  square_footage INTEGER,
  move_in_timeline TEXT CHECK (move_in_timeline IN ('immediate', '1-3 months', '3-6 months', '6+ months')),
  financing_status TEXT CHECK (financing_status IN ('pre-approved', 'pre-qualified', 'cash', 'needs-financing')),
  agent_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  lead_source TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'inactive', 'closed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "buyers_select_own" ON public.buyers 
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "buyers_insert_own" ON public.buyers 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "buyers_update_own" ON public.buyers 
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "buyers_delete_own" ON public.buyers 
  FOR DELETE USING (auth.uid() = owner_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_buyers_updated_at 
  BEFORE UPDATE ON public.buyers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
