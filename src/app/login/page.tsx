import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-white text-text-dark font-sans antialiased">
            <div className="w-full pt-12 px-6 space-y-6">
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
            <div className="flex-1 w-full max-w-[400px] px-6 flex flex-col justify-center pb-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Welcome back</h1>
                    <p className="text-text-muted text-lg font-medium">Log in to your wedding dashboard</p>
                </div>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                    <div className="pt-4">
                        <button className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-extrabold text-lg rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                            Continue
                        </button>
                    </div>
                </form>
                <div className="mt-12">
                    <div className="relative mb-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or login with</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 h-14 rounded-lg border border-border-light hover:bg-gray-50 transition-colors font-bold text-text-dark">
                            <Image alt="Google" width={20} height={20} src="https://lh3.googleusercontent.com/aida-public/AB6AXuA77G-jr-fQmlWe5cbv4D6DpARzPw-b_mMI2bm6RGEg4LKssPqiGVCGD9w4qjk8QTzuT25faWPVuEtEIjkZxRAbd7Je8CvWnwb1i4CIvU_mD-cmp5xVtBmcDCJqITm_ASN6TEGxf8NQjHViI6wPVp6kF_HjK85LQQPpkaBHMqhb3MUUWSk64SIuQcFEgMWaZrqBikVzAqnlZit6lsQv7UpeQKQvtCoikZBSmF-OIUcamtxDTCg3H2ujzoz7fuXM9iHLo8hjYMEIV5L4" />
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-3 h-14 rounded-lg border border-border-light hover:bg-gray-50 transition-colors font-bold text-text-dark">
                            <span className="material-symbols-outlined text-2xl">ios</span>
                            Apple
                        </button>
                    </div>
                </div>
                <div className="mt-auto pt-10 text-center">
                    <p className="text-text-muted font-medium">
                        New to the platform?
                        <Link href="#" className="font-extrabold text-primary ml-1">Create Account</Link>
                    </p>
                </div>
            </div>
            <div className="h-8 w-full"></div>
        </div>
    );
}
