"use client";

import { Button, Field, Input, Spinner } from "@aback-ui/ui";
import { IconArrowLeft, IconBrandGoogle, IconMail } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

const RESEND_SECONDS = 60;

function errorMessage(error: { status?: number; message?: string; code?: string } | null | undefined): string {
  if (!error) return "Something went wrong. Try again.";
  if (error.status === 429) return error.message || "Too many attempts. Wait a minute and try again.";
  if (error.code === "INVALID_OTP" || error.code === "OTP_EXPIRED") {
    return "That code is not right or has expired. Check the email, or ask for a new code.";
  }
  if (error.code === "TOO_MANY_ATTEMPTS") return "Too many wrong codes. Ask for a new code.";
  return error.message || "Something went wrong. Try again.";
}

export function SignInForm({
  next,
  googleEnabled,
  initialError,
}: {
  next: string;
  googleEnabled: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, setPending] = useState<"email" | "code" | "google" | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError("Enter a valid email address, like you@example.com.");
      return;
    }
    setError(null);
    setPending("email");
    const result = await authClient.emailOtp.sendVerificationOtp({ email: address, type: "sign-in" });
    setPending(null);
    if (result.error) {
      setError(errorMessage(result.error));
      return;
    }
    setEmail(address);
    setCode("");
    setStep("code");
    setCooldown(RESEND_SECONDS);
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    const otp = code.replace(/\D/g, "");
    if (otp.length !== 6) {
      setError("Enter the 6 digit code from the email.");
      return;
    }
    setError(null);
    setPending("code");
    const result = await authClient.signIn.emailOtp({ email, otp });
    if (result.error) {
      setPending(null);
      setError(errorMessage(result.error));
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function google() {
    setError(null);
    setPending("google");
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      errorCallbackURL: "/sign-in?error=google",
    });
    if (result.error) {
      setPending(null);
      setError(errorMessage(result.error));
    }
  }

  const errorBox = error ? (
    <p role="alert" className="border-l-2 border-danger bg-danger-soft px-3 py-2 text-sm text-danger-strong">
      {error}
    </p>
  ) : null;

  if (step === "code") {
    return (
      <form onSubmit={verify} className="flex flex-col gap-5" noValidate>
        <p className="text-[0.9375rem] leading-relaxed text-foreground">
          We sent a 6 digit code to <span className="font-medium">{email}</span>. It expires in 10 minutes.
        </p>
        <Field htmlFor={`${id}-code`} label="Sign-in code">
          <Input
            ref={codeRef}
            id={`${id}-code`}
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-12 text-center font-mono text-2xl tracking-[0.5em]"
            aria-invalid={error ? true : undefined}
          />
        </Field>
        {errorBox}
        <Button type="submit" variant="brand" size="lg" disabled={pending !== null} className="h-12">
          {pending === "code" ? <Spinner size="sm" /> : null}
          {pending === "code" ? "Signing in…" : "Sign in"}
        </Button>
        <div className="flex items-center justify-between gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className="link-quiet inline-flex items-center gap-1"
          >
            <IconArrowLeft aria-hidden="true" className="size-4" />
            Different email
          </button>
          <button
            type="button"
            onClick={() => sendCode()}
            disabled={cooldown > 0 || pending !== null}
            className="link-inline font-medium disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {googleEnabled ? (
        <>
          <Button type="button" variant="outline" size="lg" onClick={google} disabled={pending !== null} className="h-12">
            {pending === "google" ? <Spinner size="sm" /> : <IconBrandGoogle aria-hidden="true" />}
            Continue with Google
          </Button>
          <div className="type-meta flex items-center gap-3 text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      ) : null}
      <form onSubmit={sendCode} className="flex flex-col gap-5" noValidate>
        <Field htmlFor={`${id}-email`} label="Email address">
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={error ? true : undefined}
            required
            className="h-11"
          />
        </Field>
        {errorBox}
        <Button
          type="submit"
          size="lg"
          variant={googleEnabled ? "default" : "brand"}
          disabled={pending !== null}
          className="h-12"
        >
          {pending === "email" ? <Spinner size="sm" /> : <IconMail aria-hidden="true" />}
          {pending === "email" ? "Sending…" : "Email me a code"}
        </Button>
      </form>
    </div>
  );
}
