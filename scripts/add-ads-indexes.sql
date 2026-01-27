-- Create index on user_id for faster lookups of user's ads
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON public.ads (user_id);

-- Create index on status for faster filtering of active ads
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads (status);

-- Create composite index for the specific count query (user_id + status)
-- This covers: select count(*) from ads where user_id = ? and status = ?
CREATE INDEX IF NOT EXISTS idx_ads_user_id_status ON public.ads (user_id, status);
