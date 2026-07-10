import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { signIn, useSession } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";

import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Bot,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { data: session, isPending } = useSession();

  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");

    const { error } = await signIn.email(data);

    if (error) {
      setServerError(error.message ?? "Login failed");
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 lg:p-10">
      {/* Background Glow */}
      <div className="absolute left-20 top-10 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute right-20 bottom-10 h-80 w-80 rounded-full bg-chart-2/15 blur-[140px]" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[160px]" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating Card */}
      <div className="relative h-[600px] w-full max-w-6xl overflow-hidden rounded-[32px] border border-border/60 bg-card/85 shadow-2xl backdrop-blur-3xl">
        <div className="grid h-full lg:grid-cols-2">
          {/* ================= LEFT PANEL ================= */}
          <div className="relative hidden h-full overflow-hidden bg-gradient-to-br from-primary/10 via-sidebar to-sidebar lg:flex">
            {/* Glow */}
            <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-chart-2/15 blur-[120px]" />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-8">
              {/* Eyebrow + Heading */}
              <div>
                <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/70 backdrop-blur-xl">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI-Powered Helpdesk
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold leading-tight text-sidebar-foreground">
                    Smart Support,
                    <span className="block bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                      Resolved Instantly
                    </span>
                  </h1>

                  <p className="max-w-md text-sm leading-6 text-sidebar-foreground/70">
                    Every ticket routed, answered and closed by AI that
                    never sleeps.
                  </p>
                </div>
              </div>

              {/* Signature: orbiting resolution graphic */}
              <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
                {/* rotating rings */}
                <div className="absolute inset-0 animate-[spin_22s_linear_infinite] rounded-full border border-dashed border-sidebar-foreground/15" />
                <div className="absolute inset-6 animate-[spin_16s_linear_infinite_reverse] rounded-full border border-dashed border-primary/25" />

                {/* glow behind hub */}
                <div className="absolute h-16 w-16 animate-pulse rounded-full bg-primary/40 blur-xl" />

                {/* center hub */}
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 shadow-xl">
                  <Bot className="h-7 w-7 text-primary-foreground" />
                </div>

                {/* orbit node: incoming ticket */}
                <div className="absolute -top-1 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-lg backdrop-blur-xl">
                  <MessageCircle className="h-4 w-4 text-sidebar-foreground/80" />
                </div>

                {/* orbit node: AI reply */}
                <div className="absolute bottom-2 left-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-lg backdrop-blur-xl">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>

                {/* orbit node: resolved */}
                <div className="absolute bottom-2 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-lg backdrop-blur-xl">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>

              {/* Stat strip */}
              <div>
                <div className="flex divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="flex-1 px-3 py-3 text-center">
                    <p className="text-lg font-bold text-sidebar-foreground">
                      2m 18s
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-sidebar-foreground/60">
                      Avg. Response
                    </p>
                  </div>
                  <div className="flex-1 px-3 py-3 text-center">
                    <p className="text-lg font-bold text-sidebar-foreground">
                      98%
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-sidebar-foreground/60">
                      Resolved
                    </p>
                  </div>
                  <div className="flex-1 px-3 py-3 text-center">
                    <p className="text-lg font-bold text-sidebar-foreground">
                      24/7
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-sidebar-foreground/60">
                      Coverage
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs text-sidebar-foreground/70">
                    Intelligent • Secure • Enterprise Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="flex h-full items-center justify-center overflow-y-auto bg-background p-8 lg:p-12">
            <div className="w-full max-w-sm">
              {/* Heading */}
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Sign In
              </p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-foreground">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your credentials to access your dashboard.
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="mt-8 space-y-4"
              >
                {serverError && (
                  <ErrorAlert message={serverError} className="mb-2" />
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium text-foreground/80"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      className="h-11 rounded-xl border-border/70 bg-transparent pl-10 text-sm shadow-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <ErrorMessage message={errors.email.message} />
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs font-medium text-foreground/80"
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 rounded-xl border-border/70 bg-transparent pl-10 pr-10 text-sm shadow-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <ErrorMessage message={errors.password.message} />
                  )}
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-chart-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              {/* Bottom Text */}
              <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected with enterprise-grade authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}