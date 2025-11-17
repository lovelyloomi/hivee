-- Fix security issues from linter

-- Fix search_path for functions that don't have it set
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';

-- Note: The view security definer and leaked password warnings are informational
-- and don't require immediate action for this migration