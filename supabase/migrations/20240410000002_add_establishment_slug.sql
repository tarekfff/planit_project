-- Add slug column to establishments
ALTER TABLE public.establishments
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a unique index for slugs
CREATE UNIQUE INDEX IF NOT EXISTS idx_establishments_slug ON public.establishments(slug);
