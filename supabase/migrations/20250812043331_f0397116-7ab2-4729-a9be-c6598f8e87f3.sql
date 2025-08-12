-- Tighten RLS to prevent unintended public/unauthenticated access to confidential deal data

-- 1) Documents: remove unconditional temp-deal access and ensure actor binding on INSERT
DROP POLICY IF EXISTS "Users can create documents for deals they participate in" ON public.documents;
DROP POLICY IF EXISTS "Users can view documents they can access" ON public.documents;

-- Recreate INSERT with strict checks: must be uploader and either temp-deal or participant/owner
CREATE POLICY "Participants can upload documents they own"
ON public.documents
FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid() AND (
    (deal_id::text LIKE 'temp-%')
    OR EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = documents.deal_id AND (d.seller_id = auth.uid() OR d.buyer_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.deal_participants dp
      WHERE dp.deal_id = documents.deal_id AND dp.user_id = auth.uid()
    )
  )
);

-- Recreate SELECT without public temp-deal access; only uploader/owner/participants/milestone assignees
CREATE POLICY "Users can view documents they can access (no public temp access)"
ON public.documents
FOR SELECT
USING (
  (uploaded_by = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id = documents.deal_id AND (d.seller_id = auth.uid() OR d.buyer_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.deal_participants dp
    WHERE dp.deal_id = documents.deal_id AND dp.user_id = auth.uid()
  )
  OR (
    milestone_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.milestones m
      WHERE m.id = documents.milestone_id AND m.assigned_to = auth.uid()
    )
  )
);

-- 2) Deal participants: restrict INSERT; previously was overly permissive
DROP POLICY IF EXISTS "Users can be added as participants" ON public.deal_participants;

CREATE POLICY "Admins or Sellers can add participants"
ON public.deal_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deal_participants dp
    WHERE dp.deal_id = deal_participants.deal_id
      AND dp.user_id = auth.uid()
      AND dp.role IN ('admin', 'seller')
  )
  OR EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id = deal_participants.deal_id AND d.seller_id = auth.uid()
  )
);

-- Ensure RLS is enabled on critical tables (idempotent)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;