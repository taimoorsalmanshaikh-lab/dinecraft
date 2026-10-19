-- Migration: 002_slug_uniqueness_and_availability
-- Normalizes existing slugs to lowercase, adds unique index on lower(slug),
-- adds custom_domain column with index, and defines atomic check_slug_availability RPC.

-- Normalize existing slugs to lowercase
UPDATE public.restaurants 
SET slug = lower(trim(slug)) 
WHERE slug <> lower(trim(slug));

-- Create lower(slug) unique index if not already present
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_slug_lower 
ON public.restaurants (lower(slug));

-- Add custom_domain column for future custom domain routing support
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS custom_domain text;

-- Add index on custom_domain
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_custom_domain_lower 
ON public.restaurants (lower(custom_domain)) 
WHERE (custom_domain IS NOT NULL AND custom_domain <> '');

-- RPC Function for safe, atomic slug availability checking
CREATE OR REPLACE FUNCTION public.check_slug_availability(proposed_slug text, exclude_id text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_slug text;
  is_taken boolean;
BEGIN
  clean_slug := lower(trim(proposed_slug));
  
  -- Reject empty slugs
  IF clean_slug IS NULL OR clean_slug = '' THEN
    RETURN false;
  END IF;

  -- Validate format: 3-30 chars, lowercase alphanumeric and hyphens, no leading/trailing hyphens
  IF NOT (clean_slug ~ '^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$') THEN
    RETURN false;
  END IF;

  -- Check reserved routes and subdomains
  IF clean_slug = ANY(ARRAY[
    'app', 'admin', 'api', 'dashboard', 'login', 'signup', 'register', 
    'settings', 'auth', 'onboarding', 'storefront', 'product', 'order', 
    'orders', 'cart', 'checkout', 'account', 'reviews', 'deals', 'menu', 
    'about', 'contact', 'terms', 'privacy', 'help', 'support', 'static', 
    'assets', 'cdn', 'saas', 'www', 'mail', 'dinecraft', 'null', 'undefined'
  ]) THEN
    RETURN false;
  END IF;

  -- Check against restaurants table (both slug and subdomain)
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE (lower(slug) = clean_slug OR lower(coalesce(subdomain, '')) = clean_slug)
      AND (exclude_id IS NULL OR id <> exclude_id)
  ) INTO is_taken;

  RETURN NOT is_taken;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.check_slug_availability(text, text) TO anon, authenticated, service_role;
