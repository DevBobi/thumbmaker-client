"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Page() {
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");

  useEffect(() => {
    // Check if there's a stored redirect from sessionStorage
    if (typeof window !== 'undefined') {
      const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
      if (storedRedirect) {
        setRedirectUrl(storedRedirect);
        // Clear it so it doesn't persist
        sessionStorage.removeItem('redirectAfterLogin');
      }
    }
  }, []);

  return <SignIn forceRedirectUrl={redirectUrl} />;
}
