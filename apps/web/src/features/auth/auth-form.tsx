"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { loginSchema, registerSchema } from "@board/shared";
import { Button, Field, Input, Logo } from "@/components/ui";
import { Ribbon, Sticker } from "../landing/stickers";
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
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center px-5 py-12">
        <Link href="/" className="mb-10" aria-label="Realtime Board home">
          <Logo />
        </Link>
        <h1 className="display text-5xl">{mode === "login" ? "Welcome back" : "Join the board"}</h1>
        <p className="mt-4 text-muted">
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

        <div className="label my-6 flex items-center gap-3 text-xs uppercase">
          <span className="h-px flex-1 bg-carbon" /> or <span className="h-px flex-1 bg-carbon" />
        </div>
        <DemoButton variant="secondary" />

        <p className="mt-8 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              New here? <Link className="font-bold underline underline-offset-4" href="/register">Create an account</Link>
            </>
          ) : (
            <>
              Already have an account? <Link className="font-bold underline underline-offset-4" href="/login">Sign in</Link>
            </>
          )}
        </p>
      </div>
      <AuthAside />
    </div>
  );
}

function AuthAside() {
  return (
    <aside aria-hidden className="relative hidden overflow-hidden border-s border-carbon bg-sky-wash lg:flex lg:flex-col lg:justify-center lg:px-16">
      <Ribbon className="inset-x-0 top-[45%] h-[40%] w-full" />
      <p className="display relative z-10 text-[clamp(4rem,7vw,7.5rem)]">
        Drag it.
        <br />
        Everyone
        <br />
        sees it.
      </p>
      <Sticker className="end-12 top-16 rotate-6 bg-sunburst px-4 py-3">
        <span className="block text-sm font-bold">Ship v1</span>
        <span className="text-xs">moved to Doing</span>
      </Sticker>
      <Sticker className="bottom-16 start-16 -rotate-6 bg-ember px-4 py-2">
        <span className="label flex items-center gap-2 text-sm uppercase">
          <span className="size-2.5 rounded-full border border-carbon bg-paper" /> Live
        </span>
      </Sticker>
      <Sticker className="bottom-28 end-20 rotate-[8deg] bg-lavender px-3 py-2">
        <span className="text-sm font-bold">Omar is here</span>
      </Sticker>
    </aside>
  );
}

/** Only allow same-site paths, so ?next= can't be used as an open redirect. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/boards";
}
