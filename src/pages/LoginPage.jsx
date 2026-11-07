import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { Camera, ArrowRight, Lock, User, AlertCircle } from 'lucide-react';
import { MetaSEO } from '../components/seo/MetaSEO';

const loginSchema = z.object({
  identifier: z
    .string()
    .min(2, 'Please enter your email address or username')
    .trim(),
  password: z.string().min(1, 'Please enter your password'),
});

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { login } = useAuth();

  const redirectTarget =
    location.state?.from?.pathname || searchParams.get('redirect') || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await login(data.identifier, data.password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      navigate(redirectTarget || `/u/${user.username}`, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Invalid credentials. Please verify your username/email and password.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch">
      <MetaSEO
        title="Sign In — Through My Frames"
        description="Sign in to Through My Frames to curate your journals, collect photographs, and share reflections."
        path="/login"
      />
      {/* Left Form Column */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 pt-24 max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-pill bg-accent/15 flex items-center justify-center text-accent">
            <Camera className="w-4 h-4" />
          </div>
          <span className="font-serif text-lg font-medium">Through My Frames</span>
        </Link>

        <div className="space-y-6 my-auto">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink">
              Welcome back
            </h1>
            <p className="text-xs text-muted">
              Enter your credentials to access your saved frames, curate journals, and share reflections.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Identifier (Email or Username) */}
            <div className="space-y-1">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Email or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoComplete="username"
                  {...register('identifier')}
                  placeholder="ayushmishra or user@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent shadow-warm-sm"
                />
              </div>
              {errors.identifier && (
                <p className="text-[11px] text-red-500 mt-1">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent shadow-warm-sm"
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isLoading}
              iconRight={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          <div className="p-3 bg-surface border border-line rounded-2xl text-[11px] text-muted space-y-1">
            <p className="font-semibold text-ink font-mono uppercase text-2xs">Demo accounts:</p>
            <p><span className="font-mono text-accent">ayushmishra</span> (owner) or <span className="font-mono text-accent">aman</span> / <span className="font-mono text-accent">Demo@12345</span></p>
          </div>

          <p className="text-xs text-center text-muted pt-2">
            Don't have an account yet?{' '}
            <Link
              to={redirectTarget ? `/signup?redirect=${encodeURIComponent(redirectTarget)}` : '/signup'}
              className="text-accent font-medium hover:underline"
            >
              Join the journal
            </Link>
          </p>
        </div>

        <div className="text-2xs text-muted pt-6">
          Slow observation and genuine human reflections.
        </div>
      </div>

      {/* Right Column: Visual Photo Split */}
      <div className="hidden lg:block lg:w-1/2 relative bg-surface overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85"
          alt="Atmospheric Mist"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-12 text-white">
          <p className="font-handwritten text-3xl leading-snug max-w-lg mb-2">
            "We do not take photographs with our cameras alone; we take them with our hearts and minds."
          </p>
          <span className="text-2xs tracking-widest uppercase font-mono text-accent">
            Through My Frames Sanctuary
          </span>
        </div>
      </div>
    </div>
  );
}
