"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, ChevronDown, AlertCircle } from "lucide-react";

interface LandingPageProps {
  onLogin: (partnerName: string) => void;
}

const partners = [
  "Juanny Smit",
  "Lezmond Dayhee",
  "RickDa Stick",
  "HoganHoss Bierwirth",
  "Buff Wocket Warner",
];

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedPartner) {
      setError("Please select your name");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    // Simulate a brief loading state
    setTimeout(() => {
      if (password === "wheaton") {
        onLogin(selectedPartner);
      } else {
        setError("Incorrect password. Please try again.");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="text-center mb-6">
            <div className="relative w-full h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <Image
                src="/cbc_logo.png"
                alt="Covered Bridge Capital"
                fill
                className="object-contain p-0"
                priority
              />
            </div>
            <p className="text-slate-400 text-lg mt-4">Partner Portal</p>
          </div>

          {/* Login card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/20 rounded-full mb-4">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
              <p className="text-slate-400 text-sm mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Partner dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Partner
                </label>
                <div className="relative">
                  <select
                    value={selectedPartner}
                    onChange={(e) => {
                      setSelectedPartner(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="" className="bg-slate-800">
                      Select your name...
                    </option>
                    {partners.map((partner) => (
                      <option
                        key={partner}
                        value={partner}
                        className="bg-slate-800"
                      >
                        {partner}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Password input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-amber-500/25"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-8">
            © {new Date().getFullYear()} Covered Bridge Capital. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
