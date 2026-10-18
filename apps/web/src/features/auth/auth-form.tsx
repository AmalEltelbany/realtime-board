"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { loginSchema, registerSchema } from "@board/shared";
import { Button, Field, Input, Logo } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { authApi } from "./auth-api";
import { DemoButton } from "./demo-button";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const submit = useMutation({
    mutationFn: (values: Record<string, string>) => {
      // Same schemas the API uses, so the user sees the same rules before and after the round trip.
      if (mode === "register") {
        const parsed = registerSchema.safeParse(values);
        if (!parsed.success) throw parsed.error;
        return authApi.register(parsed.data);
      }
      const parsed = loginSchema.safeParse(values);
      if (!parsed.success) throw parsed.error;
      return authApi.login(parsed.data);
    },
    onSuccess: () => router.replace(next),
    onError: (error) => {
      if (error instanceof z.ZodError) {
        const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
        setFieldErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])));
      }
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    submit.mutate(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>);
  }

  const serverError = submit.error instanceof ApiError ? submit.error.message : null;

  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-10" aria-label="Realtime Board home">
          <Logo />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-muted">
          {mode === "login" ? "Sign in to see your boards." : "Boards are free. Invite your team after."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
          {mode === "register" && (
            <Field label="Name" error={fieldErrors.name}>
              <Input name="name" autoComplete="name" required />
            </Field>
          )}
          <Field label="Email" error={fieldErrors.email}>
            <Input name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Password" error={fieldErrors.password}>
            <Input
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </Field>
          {serverError && <p className="text-sm text-danger" role="alert">{serverError}</p>}
          <Button type="submit" disabled={submit.isPending}>
            {submit.isPending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <DemoButton variant="secondary" />

        <p className="mt-8 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              New here? <Link className="text-accent hover:underline" href="/register">Create an account</Link>
            </>
          ) : (
            <>
              Already have an account? <Link className="text-accent hover:underline" href="/login">Sign in</Link>
            </>
          )}
        </p>
      </div>
      <AuthAside />
    </div>
  );
}

const asideNotes = [
  { text: "Ship v1 🎉", color: "bg-note-yellow", rotate: "-rotate-3" },
  { text: "Record walkthrough", color: "bg-note-sky", rotate: "rotate-2" },
  { text: "Pricing page", color: "bg-note-mint", rotate: "-rotate-1" },
  { text: "Design review", color: "bg-note-pink", rotate: "rotate-3" },
];

function AuthAside() {
  return (
    <aside aria-hidden className="dot-grid relative hidden overflow-hidden bg-ink text-ink-foreground lg:flex lg:flex-col lg:justify-center lg:px-16">
      <div className="grid max-w-md grid-cols-2 gap-4">
        {asideNotes.map((note) => (
          <div key={note.text} className={`rounded-2xl ${note.color} ${note.rotate} p-5 font-bold text-note-ink shadow-xl`}>
            {note.text}
          </div>
        ))}
      </div>
      <p className="mt-12 max-w-md text-2xl font-bold leading-snug">
        &ldquo;Drag a card in one window and watch it move in the other.&rdquo;
      </p>
      <p className="mt-3 text-sm opacity-60">Live updates over WebSockets, conflict-safe edits, roles that hold.</p>
    </aside>
  );
}

/** Only allow same-site paths, so ?next= can't be used as an open redirect. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/boards";
}
