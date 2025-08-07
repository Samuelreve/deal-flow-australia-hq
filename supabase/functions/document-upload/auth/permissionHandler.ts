
export class PermissionHandler {
  constructor(private supabaseAdmin: any) {}

  /**
   * Check if user is a participant in the deal
   */
  async checkDealParticipation(userId: string, dealId: string): Promise<boolean> {
    // Check if the user is a participant in the deal
    const { data: participant, error } = await this.supabaseAdmin
      .from('deal_participants')
      .select('*')
      .eq('user_id', userId)
      .eq('deal_id', dealId)
      .single();

    if (error) {
      console.error('Error checking deal participation:', error.message);
      
      // Before throwing an error, check if this is a public or special deal
      const { data: deal } = await this.supabaseAdmin
        .from('deals')
        .select('deal_type, created_by')
        .eq('id', dealId)
        .single();
        
      // If the deal is of type 'analysis' or if the user created it, allow access
      if (deal && (deal.deal_type === 'analysis' || deal.created_by === userId)) {
        return true;
      }
      
      throw new Error('Permission denied: You are not a participant in this deal');
    }

    return true;
  }

  /**
   * Get user's role in the deal
   */
  async getUserRole(userId: string, dealId: string): Promise<string> {
    // Check if the user is a participant in the deal
    const { data: participant, error } = await this.supabaseAdmin
      .from('deal_participants')
      .select('role')
      .eq('user_id', userId)
      .eq('deal_id', dealId)
      .single();

    if (error) {
      // Before throwing an error, check if this is a public or special deal
      const { data: deal } = await this.supabaseAdmin
        .from('deals')
        .select('deal_type, created_by')
        .eq('id', dealId)
        .single();
        
      // If the deal is of type 'analysis' or if the user created it, assume admin role
      if (deal && (deal.deal_type === 'analysis' || deal.created_by === userId)) {
        return 'admin';
      }
      
      return 'viewer'; // Default role if not found
    }

    return participant.role;
  }

  /**
   * Check if user's role allows document uploads
   */
  async checkUploadPermission(userRole: string): Promise<boolean> {
    // All participants can upload documents
    return true;
  }

  /**
   * Check if deal status allows uploads
   */
  async checkDealStatus(dealId: string): Promise<boolean> {
    // Fetch the deal status
    const { data: deal, error } = await this.supabaseAdmin
      .from('deals')
      .select('status, deal_type')
      .eq('id', dealId)
      .single();

    if (error) {
      console.error('Error checking deal status:', error.message);
      throw new Error('Deal not found');
    }

    // List of statuses that allow uploads
    const allowedStatuses = ['draft', 'active', 'pending', null];
    
    // If this is an analysis deal, always allow uploads
    if (deal.deal_type === 'analysis') {
      return true;
    }
    
    if (!allowedStatuses.includes(deal.status)) {
      throw new Error(`Document uploads are not allowed when the deal is in ${deal.status} status`);
    }

    return true;
  }
}
