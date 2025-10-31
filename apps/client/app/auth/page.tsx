"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // By default, redirect to sign-in page
    router.replace('/auth/signin');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
