'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store the token
      localStorage.setItem('token', token);

      // Show success message
      toast.success('Successfully signed in!');

      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 500);
    } else {
      toast.error('Authentication failed');
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-4"
    >
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
      <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Completing sign in...
      </h2>
      <p className="text-muted-foreground">Please wait while we redirect you</p>
    </motion.div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <Suspense fallback={
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
          <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading...
          </h2>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
