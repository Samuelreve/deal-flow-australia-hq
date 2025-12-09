-- Add category column to notifications table for proper filtering
ALTER TABLE public.notifications 
ADD COLUMN category TEXT DEFAULT 'deal_update';

-- Add a check constraint for valid categories
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_category_check 
CHECK (category IN ('deal_update', 'message', 'document_comment'));

-- Create index for faster filtering
CREATE INDEX idx_notifications_category ON public.notifications(category);

-- Update existing notifications based on title patterns
UPDATE public.notifications 
SET category = CASE
  WHEN LOWER(title) LIKE '%message%' THEN 'message'
  WHEN LOWER(title) LIKE '%comment%' THEN 'document_comment'
  ELSE 'deal_update'
END;