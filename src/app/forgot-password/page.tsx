'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    email: z.string().email('Invalid email address.'),
});

export default function ForgotPasswordPage() {
    const { auth } = useFirebase();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!auth) return;
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, values.email);
            toast({
                variant: 'success',
                title: 'Password Reset Email Sent',
                description: 'Check your email for a link to reset your password.',
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
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-white text-text-dark font-sans antialiased">
            <div className="w-full pt-8 px-6">
                <div className="flex justify-center items-center max-w-[400px] mx-auto h-10">
                    <div className="text-primary font-extrabold text-xl tracking-tight">
                        <span className="material-symbols-outlined align-middle mr-1">favorite</span>
                        WEDDING
                    </div>
                </div>
            </div>
            <div className="w-full max-w-[400px] px-6 flex flex-col pb-8">
                <div className="my-8">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Forgot Password</h1>
                    <p className="text-text-muted text-lg font-medium">Enter your email to receive a password reset link.</p>
                </div>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold uppercase tracking-wider text-text-dark">Email Address</FormLabel>
                                    <FormControl>
                                        <Input className="border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 outline-none w-full h-14 px-5 rounded-lg text-base font-medium placeholder:text-gray-400 border" placeholder="e.g. name@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="pt-2">
                             <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-extrabold text-lg rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                        </div>
                    </form>
                </Form>

                <div className="mt-8 text-center">
                    <p className="text-text-muted font-medium">
                        Remember your password?
                        <Link href="/login" className="font-extrabold text-primary ml-1">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
