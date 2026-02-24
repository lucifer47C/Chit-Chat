
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export const KeyBackupPrompt: React.FC = () => {
  const { backupKey, skipKeyBackup } = useAuth();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Secure Your Account</CardTitle>
          <CardDescription>Your encryption key is not backed up. This is essential for account recovery.</CardDescription>
        </CardHeader>
        <CardContent>
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Critical: Backup Required</AlertTitle>
                <AlertDescription>
                    If you lose access to this device or its data, you will permanently lose access to your account and all your encrypted conversations. There is no other way to recover your data.
                </AlertDescription>
            </Alert>
          <p className="mt-4 text-sm text-muted-foreground">
            We will generate a secure backup phrase for you. Please store it somewhere safe.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={skipKeyBackup}>
            Remind Me Later
          </Button>
          <Button onClick={backupKey}>Backup Key Now</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
