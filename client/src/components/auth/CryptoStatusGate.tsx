
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { KeyBackupPrompt } from './KeyBackupPrompt';
import KeyUnlockPrompt  from './KeyUnlockPrompt'; // Import the new component
import { Loader2 } from 'lucide-react';

interface CryptoStatusGateProps {
  children: React.ReactNode;
}

export const CryptoStatusGate: React.FC<CryptoStatusGateProps> = ({ children }) => {
  const { isCryptoReady, needsKeyBackup, needsKeyUnlock, isCryptoLoading, cryptoError } = useAuth();

  if (needsKeyUnlock) {
    return <KeyUnlockPrompt />;
  }

  if (needsKeyBackup) {
    return <KeyBackupPrompt />;
  }

  if (isCryptoLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Initializing secure session...</p>
      </div>
    );
  }

  if (cryptoError) {
      // A more sophisticated error display could be used here
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <p className='text-destructive'>A critical cryptographic error occurred: {cryptoError}</p>
        </div>
      )
  }

  if (!isCryptoReady) {
    // This is a fallback state, in case auto-load fails for an unexpected reason
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Waiting for cryptographic engine...</p>
        </div>
      );
  }

  return <>{children}</>;
};
