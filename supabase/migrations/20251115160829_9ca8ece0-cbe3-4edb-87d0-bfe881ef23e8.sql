-- Add foreign key constraints to opportunity_favorites table
ALTER TABLE public.opportunity_favorites
ADD CONSTRAINT opportunity_favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.opportunity_favorites
ADD CONSTRAINT opportunity_favorites_opportunity_id_fkey 
FOREIGN KEY (opportunity_id) 
REFERENCES public.opportunities(id) 
ON DELETE CASCADE;