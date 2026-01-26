'use client';

import Link from 'next/link';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
);


export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-white text-text-dark font-sans antialiased">
            <div className="w-full pt-8 px-6 space-y-4">
                <div className="flex gap-2 max-w-[400px] mx-auto">
                    <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
                    <div className="h-1.5 flex-1 rounded-full bg-gray-100"></div>
                    <div className="h-1.5 flex-1 rounded-full bg-gray-100"></div>
                </div>
                <div className="flex justify-between items-center max-w-[400px] mx-auto">
                    <button className="p-2 -ml-2 text-text-dark">
                        <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                    </button>
                    <div className="text-primary font-extrabold text-xl tracking-tight">
                        <span className="material-symbols-outlined align-middle mr-1">favorite</span>
                        WEDDING
                    </div>
                    <div className="w-10"></div>
                </div>
            </div>
            <div className="flex-1 w-full max-w-[400px] px-6 flex flex-col pb-8">
                <div className="mt-8 mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Welcome back</h1>
                    <p className="text-text-muted text-lg font-medium">Log in to your wedding dashboard</p>
                </div>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-text-dark">Email Address</label>
                        <div className="relative">
                            <input className="border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 outline-none w-full h-14 px-5 rounded-lg text-base font-medium placeholder:text-gray-400 border" placeholder="e.g. name@email.com" type="email" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold uppercase tracking-wider text-text-dark">Password</label>
                        </div>
                        <div className="relative">
                            <input className="border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 outline-none w-full h-14 px-5 rounded-lg text-base font-medium placeholder:text-gray-400 border" placeholder="••••••••" type="password" />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" type="button">
                                <span className="material-symbols-outlined">visibility</span>
                            </button>
                        </div>
                        <div className="flex justify-end pt-1">
                            <Link href="#" className="text-sm font-bold text-primary hover:underline">Forgot Password?</Link>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-extrabold text-lg rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                            Continue
                        </button>
                    </div>
                </form>
                <div className="mt-10">
                    <div className="relative mb-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or login with</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 h-14 rounded-lg border border-border-light hover:bg-gray-50 transition-colors font-bold text-text-dark">
                            <GoogleIcon />
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-3 h-14 rounded-lg border border-border-light hover:bg-gray-50 transition-colors font-bold text-text-dark">
                            <span className="material-symbols-outlined text-2xl">ios</span>
                            Apple
                        </button>
                    </div>
                </div>
                <div className="mt-auto pt-8 text-center">
                    <p className="text-text-muted font-medium">
                        New to the platform?
                        <Link href="#" className="font-extrabold text-primary ml-1">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
