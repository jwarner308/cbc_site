"use client";

import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import PartnershipTracker from "@/components/PartnershipTracker";

export default function Home() {
  const [loggedInPartner, setLoggedInPartner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedPartner = sessionStorage.getItem("cbc-logged-in-partner");
    if (savedPartner) {
      setLoggedInPartner(savedPartner);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (partnerName: string) => {
    sessionStorage.setItem("cbc-logged-in-partner", partnerName);
    setLoggedInPartner(partnerName);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cbc-logged-in-partner");
    setLoggedInPartner(null);
  };

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (loggedInPartner) {
    return (
      <PartnershipTracker
        loggedInPartner={loggedInPartner}
        onLogout={handleLogout}
      />
    );
  }

  return <LandingPage onLogin={handleLogin} />;
}
