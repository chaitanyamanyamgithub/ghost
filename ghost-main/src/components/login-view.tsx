"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, KeyRound } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (password: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSecretPassword = password.toLowerCase() === 'libedu' || password.toLowerCase() === 'libedu';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    onLoginSuccess(password.trim());
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Secure Access
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the room password to join the encrypted chat
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              {isSecretPassword ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <KeyRound className="h-4 w-4 text-white" />
                </div>
              )}
              <CardTitle className="text-lg text-gray-900 dark:text-white">Room Access</CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enter the shared password to join the chat room.
              {isSecretPassword && (
                <span className="block mt-2 text-green-600 dark:text-green-400 font-medium text-sm">
                  🔐 Secret room detected
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Room Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 text-base bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all duration-200 hover:scale-[1.02]"
                disabled={!password.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  'Join Chat Room'
                )}
              </Button>
            </form>

            <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                🔒 All messages are end-to-end encrypted
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your privacy is protected with military-grade encryption
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              AES-256
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Zero-knowledge
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
