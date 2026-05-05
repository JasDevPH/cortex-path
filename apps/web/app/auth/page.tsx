'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cpu, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInFormSchema, SignupFormSchema } from '@/lib/zod/validation';
import { onSignIn } from '@/app/auth/actions';
import { authClient } from '@/lib/auth-client';
import { notification } from '@/components/ui/notification';
import type { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function GridBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }}
    />
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-widest text-cx-muted">
        {label}
      </label>
      {children}
      {error && <p className="font-mono text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-cx-border bg-background px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-cx-muted/50 outline-none transition-colors focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20';

function SubmitBtn({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-mono text-sm font-medium text-zinc-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

// ─── Sign In Form ─────────────────────────────────────────────────────────────

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof SignInFormSchema>) => {
    const res = await onSignIn(values);
    if (!res.success) {
      notification({ type: 'error', message: 'Incorrect email or password' });
      return;
    }
    notification({ type: 'success', message: 'Signed in successfully!' });
    onSuccess();
  };

  return (
    <div>
      <p className="mb-2 font-mono text-sm uppercase tracking-widest text-cyan-700">
        welcome back
      </p>
      <h2 className="mb-2 font-sans text-5xl font-bold text-foreground">Sign in</h2>
      <p className="mb-8 font-mono text-base text-cx-muted">
        Enter your credentials to access your codebase
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className={inputCls}
          />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted transition-colors hover:text-foreground"
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </FormField>
        <SubmitBtn loading={isSubmitting} label="Sign in" loadingLabel="Signing in..." />
      </form>
    </div>
  );
}

// ─── Sign Up Form ─────────────────────────────────────────────────────────────

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof SignupFormSchema>>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: { name: '', username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: z.infer<typeof SignupFormSchema>) => {
    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      username: values.username,
      callbackURL: '/app',
    });
    if (error) {
      notification({ type: 'error', message: error.message ?? 'Sign up failed' });
      return;
    }
    notification({ type: 'success', message: 'Account created! Please sign in.' });
    onSuccess();
  };

  return (
    <div>
      <p className="mb-2 font-mono text-sm uppercase tracking-widest text-cyan-700">
        new here?
      </p>
      <h2 className="mb-2 font-sans text-5xl font-bold text-foreground">Create account</h2>
      <p className="mb-8 font-mono text-base text-cx-muted">
        Start mapping your codebase in minutes
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Full Name" error={errors.name?.message}>
            <input {...register('name')} placeholder="Jane Doe" className={inputCls} />
          </FormField>
          <FormField label="Username" error={errors.username?.message}>
            <input {...register('username')} placeholder="janedoe" className={inputCls} />
          </FormField>
        </div>
        <FormField label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className={inputCls}
          />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted transition-colors hover:text-foreground"
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </FormField>
        <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPw ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPw(!showConfirmPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-muted transition-colors hover:text-foreground"
            >
              {showConfirmPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </FormField>
        <SubmitBtn
          loading={isSubmitting}
          label="Create account"
          loadingLabel="Creating account..."
        />
      </form>
    </div>
  );
}

// ─── Brand panel content ──────────────────────────────────────────────────────

function BrandContent({
  mode,
  onToggle,
}: {
  mode: 'signin' | 'signup';
  onToggle: () => void;
}) {
  return (
    <div className="max-w-[400px]">
      <Link href="/" className="mb-12 block">
        <Image
          src="/cortexpath_logo.png"
          alt="CortexPath"
          width={160}
          height={50}
          className="h-11 w-auto"
        />
      </Link>

      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-800/50 bg-cyan-950/30 px-4 py-1.5 font-mono text-xs text-cyan-400">
        <Cpu size={11} /> architectural intelligence
      </span>

      <h2 className="mb-4 mt-6 font-sans text-5xl font-bold leading-tight text-foreground">
        {mode === 'signin' ? (
          <>
            Mirror your code.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Master your architecture.
            </span>
          </>
        ) : (
          <>
            Start mapping
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              your codebase.
            </span>
          </>
        )}
      </h2>

      <p className="mb-10 font-mono text-sm leading-7 text-cx-muted">
        {mode === 'signin'
          ? "Don't have an account yet? Create one and start ingesting your codebase in minutes."
          : 'Already have an account? Sign in to continue where you left off.'}
      </p>

      <button
        onClick={onToggle}
        className="flex items-center gap-2 rounded-xl border border-cyan-500/40 px-6 py-3 font-mono text-sm text-cyan-300 transition-all hover:border-cyan-500 hover:bg-cyan-500/10"
      >
        {mode === 'signin' ? 'Create account' : 'Sign in instead'} <ArrowRight size={13} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/*
  Layout:
  - Two form halves always rendered behind the brand panel.
  - Brand panel is FULL WIDTH but clipped to a diagonal polygon.
  - clip-path animates between:
      signin  → left  side: polygon(0% 0%, 58% 0%, 42% 100%, 0% 100%)
      signup  → right side: polygon(42% 0%, 100% 0%, 100% 100%, 58% 100%)
  - Because both shapes have 4 points, Framer Motion smoothly interpolates
    through them — the slanted edge sweeps across the screen.
  - Brand content fades in after the sweep (delay 0.35s) on the correct side.
*/
export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();
  const isSignIn = mode === 'signin';
  const toggle = () => setMode(isSignIn ? 'signup' : 'signin');

  return (
    <div className="relative h-screen overflow-hidden bg-cx-surface text-foreground">

      {/* ── Form layer (static, always behind the brand panel) ── */}
      <div className="absolute inset-0 flex">
        {/* Left — Sign Up */}
        <div
          className="flex w-1/2 items-center justify-center px-16"
          style={{ pointerEvents: isSignIn ? 'none' : 'auto' }}
        >
          <div className="w-full max-w-sm">
            <SignUpForm onSuccess={() => setMode('signin')} />
          </div>
        </div>
        {/* Right — Sign In */}
        <div
          className="flex w-1/2 items-center justify-center px-16"
          style={{ pointerEvents: isSignIn ? 'auto' : 'none' }}
        >
          <div className="w-full max-w-sm">
            <SignInForm onSuccess={() => router.push('/app')} />
          </div>
        </div>
      </div>

      {/* ── Diagonal brand panel (full-width, clipped) ── */}
      <motion.div
        className="absolute inset-0 z-10 bg-background"
        initial={{ clipPath: 'polygon(0% 0%, 58% 0%, 42% 100%, 0% 100%)' }}
        animate={{
          clipPath: isSignIn
            ? 'polygon(0% 0%, 58% 0%, 42% 100%, 0% 100%)'
            : 'polygon(42% 0%, 100% 0%, 100% 100%, 58% 100%)',
        }}
        transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <GridBg />
        <div className="absolute left-1/4 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl" />

        {/* Brand content — left side (signin mode), slides in from the left */}
        <AnimatePresence initial={false}>
          {isSignIn && (
            <motion.div
              key="brand-left"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.32, duration: 0.28, ease: 'easeOut' } }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.12 } }}
              className="absolute inset-y-0 left-0 flex w-1/2 flex-col items-center justify-center px-8"
            >
              <BrandContent mode="signin" onToggle={toggle} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand content — right side (signup mode), slides in from the right */}
        <AnimatePresence initial={false}>
          {!isSignIn && (
            <motion.div
              key="brand-right"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.32, duration: 0.28, ease: 'easeOut' } }}
              exit={{ opacity: 0, x: 20, transition: { duration: 0.12 } }}
              className="absolute inset-y-0 right-0 flex w-1/2 flex-col items-center justify-center px-8"
            >
              <BrandContent mode="signup" onToggle={toggle} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
}
