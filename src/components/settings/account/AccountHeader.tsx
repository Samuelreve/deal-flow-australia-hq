
import React from 'react';

const AccountHeader: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium">Account Information</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Manage your personal account details
      </p>
    </div>
  );
};

export default AccountHeader;
