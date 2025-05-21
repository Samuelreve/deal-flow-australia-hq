
export class PermissionHandler {
  constructor(private supabaseAdmin: any) {}

  async checkDealParticipation(userId: string, dealId: string) {
    const { count: participantCount, error: participantError } = await this.supabaseAdmin
      .from('deal_participants')
      .select('*', { count: 'exact', head: true })
      .eq('deal_id', dealId)
      .eq('user_id', userId);

    if (participantError) {
      console.error('Error checking user participation:', participantError.message);
      throw new Error('Error verifying deal participation');
    }

    if (participantCount === 0) {
      throw new Error('Permission denied: You are not a participant in this deal');
    }
  }

  async getUserRole(userId: string, dealId: string) {
    const { data: participant, error: roleError } = await this.supabaseAdmin
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();

    if (roleError) {
      console.error('Error fetching user role:', roleError.message);
      throw new Error('Error verifying user role');
    }

    return participant.role;
  }

  async checkUploadPermission(userRole: string) {
    const authorizedUploaderRoles = ['admin', 'seller', 'lawyer'];
    if (!authorizedUploaderRoles.includes(userRole.toLowerCase())) {
      throw new Error(`Permission denied: Your role (${userRole}) cannot upload documents`);
    }
  }

  async checkDealStatus(dealId: string) {
    const { data: deal, error: dealError } = await this.supabaseAdmin
      .from('deals')
      .select('status')
      .eq('id', dealId)
      .single();

    if (dealError) {
      console.error('Error fetching deal status:', dealError.message);
      throw new Error('Error verifying deal status');
    }

    const dealStatus = deal.status;
    const allowedStatusesForUpload = ['draft', 'active', 'pending'];
    
    if (!allowedStatusesForUpload.includes(dealStatus)) {
      throw new Error(`Permission denied: Document uploads are not allowed when the deal status is "${dealStatus}"`);
    }
  }
}
