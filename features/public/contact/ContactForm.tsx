"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { CheckCircle2, Loader2, LockKeyhole, Send } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MESSAGE_MAX = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type Status = "idle" | "submitting" | "success";

const initialValues: FormValues = { name: "", email: "", subject: "", message: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Please add a short subject.";
  }

  if (!values.message.trim()) {
    errors.message = "Please write a message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Message should be at least 10 characters.";
  }

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const update = (field: keyof FormValues) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    window.setTimeout(() => {
      setStatus("success");
    }, 700);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setStatus("idle");
  };

  if (status === "success") {
    return (
      <Card className="rounded-2xl border-white/60 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-slate-900">Message captured</p>
            <p className="mt-1 max-w-[300px] text-[13px] leading-5 text-slate-500">
              This is a demo form, so it isn&apos;t connected to a live inbox yet. For a
              real reply, email us directly using one of the addresses on the left.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="mt-2 h-9 rounded-md text-[13px] font-medium"
          >
            Send another message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-white/60 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
      <CardHeader className="border-b border-slate-100/80 px-4 py-3">
        <CardTitle className="text-[15px] font-semibold">
          Send us a message
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-3">
        <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              id="name"
              label="Name"
              error={errors.name}
              input={
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={values.name}
                  onChange={update("name")}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className="h-9 rounded-md border-slate-200 bg-white/70 text-[13px] focus-visible:border-[#226de8] focus-visible:ring-1 focus-visible:ring-[#226de8]/30"
                />
              }
            />

            <Field
              id="email"
              label="Email"
              error={errors.email}
              input={
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={update("email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="h-9 rounded-md border-slate-200 bg-white/70 text-[13px] focus-visible:border-[#226de8] focus-visible:ring-1 focus-visible:ring-[#226de8]/30"
                />
              }
            />
          </div>

          <Field
            id="subject"
            label="Subject"
            error={errors.subject}
            input={
              <Input
                id="subject"
                name="subject"
                placeholder="What is this regarding?"
                value={values.subject}
                onChange={update("subject")}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "subject-error" : undefined}
                className="h-9 rounded-md border-slate-200 bg-white/70 text-[13px] focus-visible:border-[#226de8] focus-visible:ring-1 focus-visible:ring-[#226de8]/30"
              />
            }
          />

          <div className="grid gap-1.5">
            <Field
              id="message"
              label="Message"
              error={errors.message}
              input={
                <Textarea
                  id="message"
                  name="message"
                  placeholder="How can we help you?"
                  value={values.message}
                  maxLength={MESSAGE_MAX}
                  onChange={update("message")}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className="min-h-20 resize-y rounded-md border-slate-200 bg-white/70 text-[13px] focus-visible:border-[#226de8] focus-visible:ring-1 focus-visible:ring-[#226de8]/30"
                />
              }
            />
            <p
              className={`text-right text-[10px] ${
                values.message.length >= MESSAGE_MAX
                  ? "font-medium text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {values.message.length} / {MESSAGE_MAX}
            </p>
          </div>

          <Button
            type="submit"
            disabled={status === "submitting"}
            className="h-10 w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-[13px] font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="mr-2 h-3.5 w-3.5" />
                Send message
              </>
            )}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <LockKeyhole className="h-3 w-3 shrink-0" />
            Your info is only used to respond to this message.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  error,
  input,
}: {
  id: string;
  label: string;
  error?: string;
  input: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[12px] font-medium">
        {label}
      </Label>
      {input}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}