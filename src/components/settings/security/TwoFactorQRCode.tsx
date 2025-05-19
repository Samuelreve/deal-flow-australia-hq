
import React from 'react';
import QRCode from 'qrcode.react';

interface TwoFactorQRCodeProps {
  otpAuthUrl: string;
  totpSecret: string;
}

const TwoFactorQRCode: React.FC<TwoFactorQRCodeProps> = ({
  otpAuthUrl,
  totpSecret,
}) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="mb-4 p-2 border rounded-md bg-white">
        <QRCode value={otpAuthUrl} size={160} level="H" />
      </div>
      
      <div className="w-full mt-2">
        <p className="text-xs mb-1">Secret key (for manual entry):</p>
        <p className="text-sm font-mono bg-muted p-2 rounded-md break-all text-center">
          {totpSecret}
        </p>
      </div>
    </div>
  );
};

export default TwoFactorQRCode;
