
import { ShareLinkOptions } from './types.ts';

// Function to validate email addresses
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate share link inputs
export const validateShareLinkOptions = (options: ShareLinkOptions): { valid: boolean; error?: string } => {
  // Check required fields
  if (options.can_download === undefined) {
    return { valid: false, error: 'Missing required field: can_download' };
  }
  
  // Validate recipients if provided
  if (options.recipients && options.recipients.length > 0) {
    const invalidEmails = options.recipients.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return { 
        valid: false, 
        error: `Invalid email addresses: ${invalidEmails.join(', ')}` 
      };
    }
  }
  
  // Validate expires_at if provided
  if (options.expires_at) {
    try {
      const date = new Date(options.expires_at);
      if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date format for expires_at' };
      }
      
      if (date < new Date()) {
        return { valid: false, error: 'Expiry date must be in the future' };
      }
    } catch (error) {
      return { valid: false, error: 'Invalid date format for expires_at' };
    }
  }
  
  return { valid: true };
};
