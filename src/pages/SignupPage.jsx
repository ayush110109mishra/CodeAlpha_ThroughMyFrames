import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { Camera, ArrowRight, Lock, Mail, User } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Welcome to Through My Frames, ${data.name}!`, 'success');
      navigate('/u/ayushmisra');
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left Column: Visual Photo Split */}
      <div className="hidden lg:block lg:w-1/2 relative bg-surface overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85"
          alt="Vrindavan Temple Devotion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 text-white">
          <p className="font-handwritten text-3xl leading-snug max-w-lg mb-2">
            "A quiet, curious art-journal where moments are treated with the gentleness they deserve."
          </p>
          <span className="text-2xs tracking-widest uppercase font-mono text-accent">
            Through My Frames Community
          </span>
        </div>
      </div>

      {/* Right Form Column */}
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
              Join the Journal
            </h1>
            <p className="text-xs text-muted">
              Create an account to curate collections, record quiet reflections, and follow fellow wanderers.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Maya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="maya@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-2xs font-mono uppercase tracking-wider text-muted block font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register('password')}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-pill text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
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
              Create Account
            </Button>
          </form>

          <p className="text-xs text-center text-muted pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-2xs text-muted pt-6">
          By joining, you agree to respectful dialogue and slow observation.
        </div>
      </div>
    </div>
  );
}

