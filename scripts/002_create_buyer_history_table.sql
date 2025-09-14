-- Create buyer_history table for tracking changes
CREATE TABLE IF NOT EXISTS public.buyer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'note_added')),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.buyer_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "buyer_history_select_own" ON public.buyer_history 
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "buyer_history_insert_own" ON public.buyer_history 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Create index for better performance
CREATE INDEX idx_buyer_history_buyer_id ON public.buyer_history(buyer_id);
CREATE INDEX idx_buyer_history_created_at ON public.buyer_history(created_at DESC);
