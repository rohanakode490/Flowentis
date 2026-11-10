"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Error from "@/components/globals/form-error";
import Navbar from "@/components/globals/navbar";
import api from "@/lib/api";
import { FcGoogle } from "react-icons/fc";
import { SiGithub } from "react-icons/si";
import { BACKEND_URL } from "@/lib/config";
import useStore from "@/lib/store";

export default function SignUp() {
  const router = useRouter();
  const {
    ui: { addToast },
  } = useStore();

  // SignUp Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Error handler
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // clear previous errors
    setIsLoading(true);

    // Postel's law: sanitize user input
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();

    try {
      const response = await api.post("/user/signup", {
        name: sanitizedName,
        email: sanitizedEmail,
        password,
      });

      if (response) {
        addToast("Account created successfully! Please sign in.", "success");
        router.push("/login");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Registration failed");
      } else {
        setError("Something went wrong. Please try again after some time");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  return (
    <>
      <Navbar OnlyLogo={true} />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-[420px] bg-card border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Create an Account
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Start building powerful automations with Flowentis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display if Error Present */}
            {error && <Error errorMessage={error} />}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border text-foreground h-11"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border text-foreground h-11"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5 text-left">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border text-foreground h-11"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Von Restorff effect & Fitts's law: One standout primary action */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium transition-all"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>

            {/* Hick's Law: Visual separator for secondary options */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-11 justify-center gap-3 text-sm"
                variant="outline"
                disabled={isLoading}
              >
                <FcGoogle className="text-lg" />
                <span>Sign up with Google</span>
              </Button>
              <Button
                type="button"
                onClick={handleGithubLogin}
                className="w-full h-11 justify-center gap-3 text-sm"
                variant="outline"
                disabled={isLoading}
              >
                <SiGithub className="text-lg" />
                <span>Sign up with GitHub</span>
              </Button>
            </div>

            <div className="pt-2 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
