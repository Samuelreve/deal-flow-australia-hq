
import React from 'react';
import QRCode from 'qrcode.react';
import { Card } from "@/components/ui/card";

interface TwoFactorQRCodeProps {
  otpAuthUrl: string;
  totpSecret: string;
}

const TwoFactorQRCode: React.FC<TwoFactorQRCodeProps> = ({
  otpAuthUrl,
  totpSecret,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Card className="p-4 border-2 border-border bg-white shadow-sm">
        <QRCode 
          value={otpAuthUrl} 
          size={180} 
          level="H" 
          includeMargin={true}
          className="rounded-md"
        />
      </Card>
      
      <div className="w-full space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Secret key (for manual entry):</p>
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm font-mono tracking-wider text-center break-all select-all">
            {totpSecret}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter this code manually if you can't scan the QR code.
        </p>
      </div>
    </div>
  );
};

export default TwoFactorQRCode;
