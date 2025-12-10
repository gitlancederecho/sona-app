CREATE TABLE IF NOT EXISTS public.streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    playback_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('live', 'ended', 'scheduled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_streams_user_id ON public.streams(user_id);
CREATE INDEX IF NOT EXISTS idx_streams_status ON public.streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_started_at ON public.streams(started_at DESC);

ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Streams are viewable by everyone"
    ON public.streams FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own streams"
    ON public.streams FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams"
    ON public.streams FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streams"
    ON public.streams FOR DELETE
    USING (auth.uid() = user_id);

GRANT SELECT ON public.streams TO authenticated;
GRANT INSERT ON public.streams TO authenticated;
GRANT UPDATE ON public.streams TO authenticated;
GRANT DELETE ON public.streams TO authenticated;
