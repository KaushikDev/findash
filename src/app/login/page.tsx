"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Login() {
  const [userDetails, setUserDetails] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: userDetails.email,
        password: userDetails.password,
      });

      if (error) {
        throw error;
      }
      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to log in";

      toast.error("Login Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email to log into your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              name="email"
              value={userDetails.email}
              onChange={handleCredentialChange}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              name="password"
              value={userDetails.password}
              onChange={handleCredentialChange}
              required
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
