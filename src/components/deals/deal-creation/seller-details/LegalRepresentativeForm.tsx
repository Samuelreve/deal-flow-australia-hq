
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface LegalRepresentativeFormProps {
  legalRepName: string;
  legalRepEmail: string;
  legalRepPhone: string;
  errors: Record<string, string>;
  onUpdateLegalRepName: (name: string) => void;
  onUpdateLegalRepEmail: (email: string) => void;
  onUpdateLegalRepPhone: (phone: string) => void;
}

export const LegalRepresentativeForm: React.FC<LegalRepresentativeFormProps> = ({
  legalRepName,
  legalRepEmail,
  legalRepPhone,
  errors,
  onUpdateLegalRepName,
  onUpdateLegalRepEmail,
  onUpdateLegalRepPhone
}) => (
  <div className="space-y-4 mt-4">
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        Adding a lawyer or advisor now streamlines the process. They can be invited to collaborate 
        on your deal once it's created, giving them secure access to documents and communications.
      </AlertDescription>
    </Alert>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="legalRepName">
          Representative Name
        </Label>
        <Input
          id="legalRepName"
          value={legalRepName}
          onChange={(e) => onUpdateLegalRepName(e.target.value)}
          placeholder="Sarah Johnson"
        />
        <p className="text-xs text-muted-foreground">
          Lawyer, advisor, or legal representative
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalRepEmail">
          Email
        </Label>
        <Input
          id="legalRepEmail"
          type="email"
          value={legalRepEmail}
          onChange={(e) => onUpdateLegalRepEmail(e.target.value)}
          placeholder="sarah@smithlegal.com"
          className={errors.legalRepEmail ? 'border-red-500' : ''}
        />
        {errors.legalRepEmail && (
          <p className="text-sm text-red-500">{errors.legalRepEmail}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalRepPhone">
          Phone
        </Label>
        <Input
          id="legalRepPhone"
          type="tel"
          value={legalRepPhone}
          onChange={(e) => onUpdateLegalRepPhone(e.target.value)}
          placeholder="(02) 9876 5432"
        />
      </div>
    </div>

    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-medium text-blue-900 mb-2">Why add a legal representative?</h4>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• They can review documents and provide legal guidance</li>
        <li>• Streamlines communication during negotiations</li>
        <li>• Helps ensure legal compliance throughout the process</li>
        <li>• Can be invited to collaborate securely on your deal</li>
      </ul>
    </div>
  </div>
);
