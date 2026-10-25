"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginSchemaType } from "@/resources/schemas/auth.schema";
import { useLoginMutation } from "@/hooks/mutations/use-auth-mutations";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AppApiError } from "@/lib/axios";

export function AdminLoginView() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      login(response);
      toast.success("Welcome back, " + response.user.name + "!");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      if (err instanceof AppApiError) toast.error(err.message);
      else toast.error("Failed to sign in. Verify your credentials.");
    }
  };

  const handleFillDemo = () => {
    setValue("email", "admin@platform.com", { shouldValidate: true });
    setValue("password", "Admin@123456", { shouldValidate: true });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0B0E] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white font-black shadow-xl shadow-rose-950/50">
            <span className="text-sm font-sans tracking-tight">BI</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Brothers IT Solution
          </h1>
          <p className="text-xs text-[#7D7E8B]">
            Platform Administration &amp; Multi-Tenant Control Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#1E1E26] bg-[#121217] p-7 shadow-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Sign in to Admin</h2>
            <p className="text-xs text-[#6F707E]">
              Enter authorized administrator credentials to proceed
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-[#A2A3B0]">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6F707E]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@platform.com"
                  className="pl-10 h-10 rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-[#A2A3B0]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6F707E]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10 rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#6F707E] hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-xl font-semibold bg-gradient-to-r from-[#E11D48] to-[#FF385C] hover:from-[#D01941] hover:to-[#EB3052] text-white shadow-lg shadow-rose-950/50 mt-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Credential helper */}
          <div className="rounded-2xl border border-dashed border-[#242432] bg-[#16161D]/70 p-3.5 text-center">
            <p className="text-[11px] text-[#7D7E8B]">
              Seeded Platform Super Admin:
            </p>
            <p className="text-xs font-mono font-semibold text-white mt-0.5">
              admin@platform.com / Admin@123456
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="mt-2.5 h-8 text-xs w-full rounded-xl bg-[#1C1C26] border-[#2A2A38] text-white hover:bg-[#252534]"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-rose-400" />
              Auto-fill Admin Credentials
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
