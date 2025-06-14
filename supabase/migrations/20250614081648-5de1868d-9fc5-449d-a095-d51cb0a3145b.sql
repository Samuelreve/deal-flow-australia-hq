-- Clean up policies from public.deal_participants
DROP POLICY IF EXISTS "Allow participants to view deal messages" ON public.deal_participants;
DROP POLICY IF EXISTS "Allow participants to send deal messages" ON public.deal_participants;
DROP POLICY IF EXISTS "Allow users to update read status" ON public.deal_participants;
DROP POLICY IF EXISTS "Allow senders to delete their own messages" ON public.deal_participants;
DROP POLICY IF EXISTS "deal_participants_select_policy" ON public.deal_participants;
DROP POLICY IF EXISTS "deal_participants_insert_policy" ON public.deal_participants;
DROP POLICY IF EXISTS "deal_participants_update_policy" ON public.deal_participants;
DROP POLICY IF EXISTS "deal_participants_delete_policy" ON public.deal_participants;
DROP POLICY IF EXISTS "Deal owners can add participants" ON public.deal_participants;
DROP POLICY IF EXISTS "Deal owners can view participants" ON public.deal_participants;

-- Clean up policies from public.deals
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.deals;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.deals;
DROP POLICY IF EXISTS "deals_select_policy" ON public.deals;
DROP POLICY IF EXISTS "deals_insert_policy" ON public.deals;
DROP POLICY IF EXISTS "deals_update_policy" ON public.deals;
DROP POLICY IF EXISTS "deals_delete_policy" ON public.deals;
DROP POLICY IF EXISTS "Deal participants can update deals" ON public.deals;
DROP POLICY IF EXISTS "Sellers can create deals" ON public.deals;

-- Clean up policies from public.documents (corrected table name)
DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;
DROP POLICY IF EXISTS "deal_documents_select_policy" ON public.documents;
DROP POLICY IF EXISTS "deal_documents_insert_policy" ON public.documents;
DROP POLICY IF EXISTS "deal_documents_update_policy" ON public.documents;
DROP POLICY IF EXISTS "deal_documents_delete_policy" ON public.documents;

-- Clean up policies from public.document_versions
DROP POLICY IF EXISTS "document_versions_select_policy" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_insert_policy" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_update_policy" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_delete_policy" ON public.document_versions;
DROP POLICY IF EXISTS "Only uploaders, sellers, or admins can delete versions" ON public.document_versions;

-- Clean up any other potentially conflicting policies
DROP POLICY IF EXISTS "Users can view deal documents" ON public.documents;
DROP POLICY IF EXISTS "Users can upload deal documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update deal documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete deal documents" ON public.documents;