
// Shared validation utilities for Edge Functions

// Validate invitation request data
export function validateInviteRequest(requestData: any): { 
  isValid: boolean; 
  error?: string; 
  dealId?: string;
  inviteeEmail?: string;
  inviteeRole?: string;
} {
  const { dealId, inviteeEmail, inviteeRole } = requestData;
  
  // Check required fields
  if (!dealId || !inviteeEmail || !inviteeRole) {
    return { 
      isValid: false, 
      error: "Missing required fields" 
    };
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inviteeEmail)) {
    return { 
      isValid: false, 
      error: "Invalid email format" 
    };
  }
  
  // Validate role
  const validRoles = ["buyer", "lawyer", "admin"];
  if (!validRoles.includes(inviteeRole)) {
    return { 
      isValid: false, 
      error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
    };
  }
  
  return { 
    isValid: true, 
    dealId,
    inviteeEmail: inviteeEmail.toLowerCase(), // Normalize email
    inviteeRole
  };
}
