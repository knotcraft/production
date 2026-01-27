'use client';

import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MailCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
    const { auth } = useFirebase();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    useEffect(() => {
        const interval = setInterval(async () => {
            if (auth?.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    clearInterval(interval);
                    toast({
                        variant: 'success',
                        title: 'Email Verified!',
                        description: "You're all set. Welcome to your dashboard!",
                    });
                    router.push('/');
                }
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, [auth, router, toast]);

    const handleResendVerification = async () => {
        if (!auth?.currentUser) {
            toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'Please log in to resend the verification email.',
            });
            router.push('/login');
            return;
        }
        setIsLoading(true);
        try {
            await sendEmailVerification(auth.currentUser);
            toast({
                variant: 'success',
                title: 'Email Sent',
                description: 'A new verification email has been sent to your inbox.',
            });
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white text-text-dark font-sans antialiased p-6">
            <div className="w-full max-w-[400px] text-center">
                <div className="flex justify-center items-center mb-6">
                    <MailCheck className="h-16 w-16 text-primary" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-3">Verify Your Email</h1>
                <p className="text-text-muted text-lg font-medium">
                    We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
                </p>
                {email && <p className="text-primary font-bold mt-2">{email}</p>}
                
                <div className="mt-8 space-y-4">
                    <Button onClick={handleResendVerification} className="w-full h-14" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Resend Verification Email'}
                    </Button>
                    <Button variant="outline" className="w-full h-14" asChild>
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>

                <p className="text-text-muted text-sm mt-8">
                    Didn't receive the email? Check your spam folder or try resending.
                </p>
            </div>
        </div>
    );
}
