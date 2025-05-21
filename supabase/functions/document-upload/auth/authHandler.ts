
// Helper function for authentication
export async function authenticateUser(request: Request, supabaseClient: any) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

  if (authError || !user) {
    console.error('Auth Error:', authError?.message);
    throw new Error('Unauthorized: Invalid or expired token');
  }

  return user;
}
