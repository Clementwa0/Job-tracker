"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { ResumeData, ResumeExperience } from "@/lib/resume/types";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

export const PAGE_W = 794;
export const PAGE_H = 1123;
export const PAGE_GAP = 28;

const INK = "#1f2328";
const SOFT = "#4b5563";
const FAINT = "#6b7280";

function fmt(v: string) {
  if (!v) return "";
  const d = new Date(`${v.length === 4 ? v + "-01" : v}-01`);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
export function range(s: string, e: string, current?: boolean) {
  return [fmt(s), current ? "Present" : fmt(e)].filter(Boolean).join(" – ");
}
const contacts = (d: ResumeData) =>
  [d.contact.email, d.contact.phone, d.contact.location, d.contact.website, d.contact.linkedin, d.contact.github].filter(Boolean);
const bulletsOf = (x: ResumeExperience) => x.bullets.filter((b) => b.trim());
const has = (a: unknown[]) => a.length > 0;

function Page({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="resume-page"
      style={{ width: PAGE_W, minHeight: PAGE_H, background: "#fff", color: INK, fontSize: 12.5, lineHeight: 1.45, boxSizing: "border-box", ...style }}
    >
      {children}
    </div>
  );
}

function Bullets({ items, color = SOFT, marker }: { items: string[]; color?: string; marker?: string }) {
  if (!items.length) return null;
  return (
    <ul style={{ margin: "5px 0 0", padding: 0, listStyle: "none", color }}>
      {items.map((b, i) => (
        <li key={i} style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <span style={{ color: marker ?? color, flexShrink: 0 }}>•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Aurora: modern single column ---------------- */
function Aurora({ d }: { d: ResumeData }) {
  const a = d.accent;
  const H = ({ children }: { children: ReactNode }) => (
    <h2 style={{ margin: "22px 0 10px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: a, display: "flex", alignItems: "center", gap: 12 }}>
      {children}
      <span style={{ flex: 1, height: 1, background: `${a}33` }} />
    </h2>
  );
  return (
    <Page style={{ padding: "52px 60px", fontFamily: "'Source Sans 3', sans-serif" }}>
      <header style={{ borderBottom: `3px solid ${a}`, paddingBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{d.contact.fullName || "Your Name"}</h1>
        {d.contact.title && <div style={{ marginTop: 6, fontSize: 16, color: a, fontWeight: 600 }}>{d.contact.title}</div>}
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 11.5, color: SOFT }}>
          {contacts(d).map((c) => <span key={c}>{c}</span>)}
        </div>
      </header>
      {d.summary && (<><H>Profile</H><p style={{ margin: 0, color: SOFT, fontSize: 13 }}>{d.summary}</p></>)}
      {has(d.experience) && (<><H>Experience</H>
        {d.experience.map((x) => (
          <article key={x.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div><strong style={{ fontSize: 14 }}>{x.role}</strong><span style={{ color: SOFT }}>{x.company && ` · ${x.company}`}{x.location && `, ${x.location}`}</span></div>
              <span style={{ fontSize: 11.5, color: FAINT, whiteSpace: "nowrap" }}>{range(x.startDate, x.endDate, x.current)}</span>
            </div>
            <Bullets items={bulletsOf(x)} marker={a} />
          </article>
        ))}</>)}
      {has(d.projects) && (<><H>Projects</H>
        {d.projects.map((p) => (
          <div key={p.id} style={{ marginBottom: 10 }}>
            <strong>{p.name}</strong>{p.url && <span style={{ color: a, fontSize: 11.5 }}> — {p.url}</span>}
            {p.description && <div style={{ color: SOFT }}>{p.description}</div>}
            {has(p.tech) && <div style={{ fontSize: 11, color: FAINT }}>{p.tech.join(" · ")}</div>}
          </div>
        ))}</>)}
      {has(d.skills) && (<><H>Skills</H>
        {d.skills.map((s) => (
          <div key={s.id} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "baseline" }}>
            <span style={{ width: 110, flexShrink: 0, fontWeight: 600, fontSize: 12 }}>{s.category}</span>
            <span style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {s.items.map((i) => <span key={i} style={{ background: `${a}12`, color: INK, borderRadius: 4, padding: "1px 8px", fontSize: 11.5 }}>{i}</span>)}
            </span>
          </div>
        ))}</>)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" }}>
        {has(d.education) && (<div><H>Education</H>
          {d.education.map((e) => (
            <div key={e.id} style={{ marginBottom: 8 }}>
              <strong>{e.school}</strong>
              <div style={{ color: SOFT }}>{[e.degree, e.field].filter(Boolean).join(", ")}</div>
              <div style={{ fontSize: 11, color: FAINT }}>{range(e.startDate, e.endDate)}{e.notes && ` · ${e.notes}`}</div>
            </div>
          ))}</div>)}
        {(has(d.certifications) || has(d.languages)) && (<div>
          {has(d.certifications) && (<><H>Certifications</H>{d.certifications.map((c) => <div key={c.id} style={{ marginBottom: 4 }}><strong>{c.name}</strong><span style={{ color: FAINT }}> {[c.issuer, c.date].filter(Boolean).join(", ")}</span></div>)}</>)}
          {has(d.languages) && (<><H>Languages</H><div style={{ color: SOFT }}>{d.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(" · ")}</div></>)}
        </div>)}
      </div>
    </Page>
  );
}

/* ---------------- Atlas: technical two-column with sidebar ---------------- */
function Atlas({ d }: { d: ResumeData }) {
  const a = d.accent;
  const SH = ({ children }: { children: ReactNode }) => (
    <h3 style={{ margin: "22px 0 8px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: a }}>{children}</h3>
  );
  const MH = ({ children }: { children: ReactNode }) => (
    <h2 style={{ margin: "24px 0 12px", fontSize: 15, fontWeight: 700, color: INK, borderBottom: `1.5px solid ${INK}`, paddingBottom: 4 }}>{children}</h2>
  );
  return (
    <Page style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}>
      <aside style={{ float: "left", width: 250, minHeight: PAGE_H, boxSizing: "border-box", background: `${a}10`, borderRight: `4px solid ${a}`, padding: "48px 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: 8, background: a, color: "#fff", display: "grid", placeItems: "center", fontSize: 24, fontWeight: 700 }}>
          {(d.contact.fullName || "YN").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <SH>Contact</SH>
        {contacts(d).map((c) => <div key={c} style={{ fontSize: 11, color: SOFT, wordBreak: "break-word", marginBottom: 4 }}>{c}</div>)}
        {has(d.skills) && (<><SH>Skills</SH>
          {d.skills.map((s) => (
            <div key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 11.5 }}>{s.category}</div>
              <div style={{ color: SOFT, fontSize: 11 }}>{s.items.join(", ")}</div>
            </div>
          ))}</>)}
        {has(d.education) && (<><SH>Education</SH>
          {d.education.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 11.5 }}>{[e.degree, e.field].filter(Boolean).join(" ")}</div>
              <div style={{ color: SOFT, fontSize: 11 }}>{e.school}</div>
              <div style={{ color: FAINT, fontSize: 10.5 }}>{range(e.startDate, e.endDate)}</div>
            </div>
          ))}</>)}
        {has(d.certifications) && (<><SH>Certifications</SH>{d.certifications.map((c) => <div key={c.id} style={{ fontSize: 11, marginBottom: 6 }}><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ color: FAINT }}>{[c.issuer, c.date].filter(Boolean).join(" · ")}</div></div>)}</>)}
        {has(d.languages) && (<><SH>Languages</SH>{d.languages.map((l) => <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}><span>{l.name}</span><span style={{ color: FAINT }}>{l.level}</span></div>)}</>)}
      </aside>
      <main style={{ padding: "48px 40px" }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.1 }}>{d.contact.fullName || "Your Name"}</h1>
        {d.contact.title && <div style={{ fontSize: 14, color: a, fontWeight: 500, marginTop: 4 }}>{d.contact.title}</div>}
        {d.summary && <p style={{ margin: "16px 0 0", color: SOFT }}>{d.summary}</p>}
        {has(d.experience) && (<><MH>Experience</MH>
          {d.experience.map((x) => (
            <article key={x.id} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{x.role}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: a, fontWeight: 500 }}>
                <span>{x.company}{x.location && <span style={{ color: FAINT, fontWeight: 400 }}> · {x.location}</span>}</span>
                <span style={{ color: FAINT, fontWeight: 400 }}>{range(x.startDate, x.endDate, x.current)}</span>
              </div>
              <Bullets items={bulletsOf(x)} marker={a} />
            </article>
          ))}</>)}
        {has(d.projects) && (<><MH>Projects</MH>
          {d.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${a}55` }}>
              <div style={{ fontWeight: 700 }}>{p.name} {p.url && <span style={{ fontWeight: 400, fontSize: 11, color: FAINT }}>{p.url}</span>}</div>
              {p.description && <div style={{ color: SOFT }}>{p.description}</div>}
              {has(p.tech) && <div style={{ fontSize: 10.5, color: a, marginTop: 2 }}>{p.tech.join(" / ")}</div>}
            </div>
          ))}</>)}
      </main>
    </Page>
  );
}

/* ---------------- Vertex: developer, terminal-flavoured ---------------- */
function Vertex({ d }: { d: ResumeData }) {
  const a = d.accent;
  const mono = "'JetBrains Mono', monospace";
  const H = ({ children }: { children: ReactNode }) => (
    <h2 style={{ margin: "22px 0 10px", fontFamily: mono, fontSize: 12.5, fontWeight: 700, color: INK }}>
      <span style={{ color: a }}>{">"}</span> {children}
    </h2>
  );
  return (
    <Page style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      <header style={{ background: "#0d1117", color: "#e6edf3", padding: "40px 52px 30px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: a }}>~/resume $ whoami</div>
        <h1 style={{ margin: "6px 0 0", fontFamily: mono, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>{d.contact.fullName || "your_name"}</h1>
        {d.contact.title && <div style={{ fontSize: 15, color: "#9da7b3", marginTop: 4 }}>{d.contact.title}</div>}
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: "4px 18px", fontFamily: mono, fontSize: 10.5, color: "#c9d1d9" }}>
          {contacts(d).map((c) => <span key={c}><span style={{ color: a }}>◦</span> {c}</span>)}
        </div>
      </header>
      <div style={{ padding: "8px 52px 44px" }}>
        {d.summary && (<><H>about</H><p style={{ margin: 0, color: SOFT }}>{d.summary}</p></>)}
        {has(d.skills) && (<><H>stack</H>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {d.skills.map((s) => (
              <div key={s.id} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: a, textTransform: "lowercase", marginBottom: 4 }}>{s.category}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.items.map((i) => <span key={i} style={{ fontFamily: mono, fontSize: 10, background: "#f3f4f6", padding: "1px 6px", borderRadius: 3 }}>{i}</span>)}
                </div>
              </div>
            ))}
          </div></>)}
        {has(d.experience) && (<><H>experience</H>
          {d.experience.map((x) => (
            <article key={x.id} style={{ marginBottom: 14, display: "grid", gridTemplateColumns: "118px 1fr", gap: 14 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: FAINT, paddingTop: 3 }}>{range(x.startDate, x.endDate, x.current)}</div>
              <div>
                <div><strong style={{ fontSize: 13.5 }}>{x.role}</strong> <span style={{ color: a, fontWeight: 600 }}>@ {x.company}</span></div>
                <Bullets items={bulletsOf(x)} marker={a} />
              </div>
            </article>
          ))}</>)}
        {has(d.projects) && (<><H>projects</H>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {d.projects.map((p) => (
              <div key={p.id} style={{ borderLeft: `3px solid ${a}`, background: "#f9fafb", padding: "8px 12px" }}>
                <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                {p.url && <div style={{ fontFamily: mono, fontSize: 9.5, color: FAINT }}>{p.url}</div>}
                {p.description && <div style={{ color: SOFT, fontSize: 11.5, marginTop: 3 }}>{p.description}</div>}
                {has(p.tech) && <div style={{ fontFamily: mono, fontSize: 9.5, color: a, marginTop: 3 }}>[{p.tech.join(", ")}]</div>}
              </div>
            ))}
          </div></>)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {has(d.education) && (<div><H>education</H>{d.education.map((e) => <div key={e.id} style={{ marginBottom: 6 }}><strong>{[e.degree, e.field].filter(Boolean).join(" ")}</strong><div style={{ color: SOFT, fontSize: 11.5 }}>{e.school} · {range(e.startDate, e.endDate)}</div></div>)}</div>)}
          {(has(d.certifications) || has(d.languages)) && (<div><H>extras</H>
            {d.certifications.map((c) => <div key={c.id} style={{ fontSize: 11.5 }}>{c.name} <span style={{ color: FAINT }}>{c.date}</span></div>)}
            {has(d.languages) && <div style={{ fontSize: 11.5, color: SOFT, marginTop: 4 }}>{d.languages.map((l) => `${l.name} (${l.level})`).join(", ")}</div>}
          </div>)}
        </div>
      </div>
    </Page>
  );
}

/* ---------------- Horizon: executive serif, centred ---------------- */
function Horizon({ d }: { d: ResumeData }) {
  const a = d.accent;
  const H = ({ children }: { children: ReactNode }) => (
    <h2 style={{ margin: "24px 0 12px", textAlign: "center", fontSize: 12, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: a }}>
      <span style={{ display: "inline-block", padding: "0 14px", background: "#fff", position: "relative", zIndex: 1 }}>{children}</span>
      <div style={{ height: 1, background: "#d1d5db", marginTop: -8 }} />
    </h2>
  );
  return (
    <Page style={{ padding: "56px 68px", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 12.5 }}>
      <header style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>{d.contact.fullName || "Your Name"}</h1>
        {d.contact.title && <div style={{ marginTop: 6, fontSize: 14, fontStyle: "italic", color: a }}>{d.contact.title}</div>}
        <div style={{ margin: "14px auto 0", borderTop: `2px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: "6px 0", fontSize: 11, color: SOFT, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2px 14px" }}>
          {contacts(d).map((c, i) => <span key={c}>{i > 0 && <span style={{ marginRight: 14, color: "#9ca3af" }}>|</span>}{c}</span>)}
        </div>
      </header>
      {d.summary && (<><H>Executive Summary</H><p style={{ margin: 0, textAlign: "justify", color: "#374151" }}>{d.summary}</p></>)}
      {has(d.skills) && (<><H>Core Competencies</H>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 20px", color: "#374151" }}>
          {d.skills.flatMap((s) => s.items).map((i) => <div key={i}>▪ {i}</div>)}
        </div></>)}
      {has(d.experience) && (<><H>Professional Experience</H>
        {d.experience.map((x) => (
          <article key={x.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>{x.company}</strong>
              <span style={{ fontSize: 11.5, color: FAINT }}>{x.location}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", color: a }}>
              <span>{x.role}</span><span style={{ color: FAINT }}>{range(x.startDate, x.endDate, x.current)}</span>
            </div>
            <Bullets items={bulletsOf(x)} color="#374151" />
          </article>
        ))}</>)}
      {has(d.education) && (<><H>Education</H>
        {d.education.map((e) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span><strong>{[e.degree, e.field].filter(Boolean).join(", ")}</strong>, {e.school}{e.notes && <em style={{ color: FAINT }}> — {e.notes}</em>}</span>
            <span style={{ color: FAINT, fontSize: 11.5 }}>{fmt(e.endDate)}</span>
          </div>
        ))}</>)}
      {(has(d.certifications) || has(d.languages) || has(d.projects)) && (<><H>Additional</H>
        {has(d.projects) && <div style={{ marginBottom: 4 }}><strong>Initiatives: </strong>{d.projects.map((p) => p.name + (p.description ? ` — ${p.description}` : "")).join("; ")}</div>}
        {has(d.certifications) && <div style={{ marginBottom: 4 }}><strong>Certifications: </strong>{d.certifications.map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(", ")).join("; ")}</div>}
        {has(d.languages) && <div><strong>Languages: </strong>{d.languages.map((l) => `${l.name} (${l.level})`).join(", ")}</div>}
      </>)}
    </Page>
  );
}

/* ---------------- Mono: minimal ATS-first ---------------- */
function Mono({ d }: { d: ResumeData }) {
  const H = ({ children }: { children: ReactNode }) => (
    <h2 style={{ margin: "18px 0 8px", fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #000", paddingBottom: 2 }}>{children}</h2>
  );
  return (
    <Page style={{ padding: "48px 58px", fontFamily: "Arial, Helvetica, sans-serif", color: "#000", fontSize: 12 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{d.contact.fullName || "Your Name"}</h1>
      {d.contact.title && <div style={{ fontSize: 13 }}>{d.contact.title}</div>}
      <div style={{ marginTop: 4, fontSize: 11.5 }}>{contacts(d).join(" | ")}</div>
      {d.summary && (<><H>Summary</H><p style={{ margin: 0 }}>{d.summary}</p></>)}
      {has(d.experience) && (<><H>Experience</H>
        {d.experience.map((x) => (
          <div key={x.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{x.role}</strong><span>{range(x.startDate, x.endDate, x.current)}</span></div>
            <div>{[x.company, x.location].filter(Boolean).join(", ")}</div>
            <ul style={{ margin: "3px 0 0", paddingLeft: 18 }}>{bulletsOf(x).map((b, i) => <li key={i}>{b}</li>)}</ul>
          </div>
        ))}</>)}
      {has(d.education) && (<><H>Education</H>
        {d.education.map((e) => (
          <div key={e.id} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{e.school}</strong><span>{range(e.startDate, e.endDate)}</span></div>
            <div>{[e.degree, e.field].filter(Boolean).join(", ")}{e.notes && `. ${e.notes}`}</div>
          </div>
        ))}</>)}
      {has(d.skills) && (<><H>Skills</H>{d.skills.map((s) => <div key={s.id}><strong>{s.category}:</strong> {s.items.join(", ")}</div>)}</>)}
      {has(d.projects) && (<><H>Projects</H>{d.projects.map((p) => <div key={p.id} style={{ marginBottom: 4 }}><strong>{p.name}</strong>{p.url && ` (${p.url})`}: {p.description}{has(p.tech) && ` Technologies: ${p.tech.join(", ")}.`}</div>)}</>)}
      {has(d.certifications) && (<><H>Certifications</H>{d.certifications.map((c) => <div key={c.id}>{[c.name, c.issuer, c.date].filter(Boolean).join(", ")}</div>)}</>)}
      {has(d.languages) && (<><H>Languages</H><div>{d.languages.map((l) => `${l.name} (${l.level})`).join(", ")}</div></>)}
    </Page>
  );
}

/* ---------------- Impact: achievement-first ---------------- */
function Impact({ d }: { d: ResumeData }) {
  const a = d.accent;
  const wins = d.experience.flatMap((x) => bulletsOf(x)).filter((b) => /\d/.test(b)).slice(0, 3);
  const H = ({ children }: { children: ReactNode }) => (
    <h2 style={{ margin: "22px 0 10px", fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
      <span style={{ background: `linear-gradient(transparent 60%, ${a}40 60%)` }}>{children}</span>
    </h2>
  );
  return (
    <Page style={{ fontFamily: "'Archivo', sans-serif", borderLeft: `14px solid ${a}` }}>
      <div style={{ padding: "44px 52px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-end" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em", textTransform: "uppercase" }}>{d.contact.fullName || "Your Name"}</h1>
            {d.contact.title && <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: a }}>{d.contact.title}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: SOFT, lineHeight: 1.6 }}>{contacts(d).slice(0, 4).map((c) => <div key={c}>{c}</div>)}</div>
        </header>
        {d.summary && <p style={{ margin: "16px 0 0", fontSize: 13.5, color: "#374151", borderLeft: `3px solid ${a}`, paddingLeft: 12 }}>{d.summary}</p>}
        {wins.length > 0 && (<><H>Key Achievements</H>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${wins.length}, 1fr)`, gap: 10 }}>
            {wins.map((w, i) => {
              const big = w.match(/[$€£]?\d[\d,.]*\s?(%|[kKmMbB]\b|x\b)?/)?.[0] ?? "";
              return (
                <div key={i} style={{ background: `${a}0f`, border: `1px solid ${a}30`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: a, lineHeight: 1 }}>{big}</div>
                  <div style={{ fontSize: 11, color: SOFT, marginTop: 6 }}>{w}</div>
                </div>
              );
            })}
          </div></>)}
        {has(d.experience) && (<><H>Experience</H>
          {d.experience.map((x) => (
            <article key={x.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div><strong style={{ fontSize: 14 }}>{x.role}</strong> <span style={{ color: SOFT }}>/ {x.company}</span></div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: INK, padding: "1px 8px", borderRadius: 999 }}>{range(x.startDate, x.endDate, x.current)}</span>
              </div>
              <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
                {bulletsOf(x).map((b, i) => (
                  <li key={i} style={{ display: "flex", gap: 8, marginTop: 3, color: "#374151" }}>
                    <span style={{ color: a, fontWeight: 900 }}>▸</span>
                    <span>{b.split(/(\d[\d,.%$kKmM+x]*)/).map((part, j) => (/^\d/.test(part) ? <strong key={j} style={{ color: INK }}>{part}</strong> : part))}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}</>)}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 32 }}>
          <div>
            {has(d.skills) && (<><H>Skills</H><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{d.skills.flatMap((s) => s.items).map((i) => <span key={i} style={{ border: `1.5px solid ${INK}`, borderRadius: 4, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>{i}</span>)}</div></>)}
            {has(d.projects) && (<><H>Projects</H>{d.projects.map((p) => <div key={p.id} style={{ marginBottom: 6 }}><strong>{p.name}</strong> <span style={{ color: SOFT }}>— {p.description}</span></div>)}</>)}
          </div>
          <div>
            {has(d.education) && (<><H>Education</H>{d.education.map((e) => <div key={e.id} style={{ marginBottom: 6 }}><strong>{[e.degree, e.field].filter(Boolean).join(" ")}</strong><div style={{ fontSize: 11.5, color: SOFT }}>{e.school}, {fmt(e.endDate)}</div></div>)}</>)}
            {has(d.certifications) && (<><H>Certified</H>{d.certifications.map((c) => <div key={c.id} style={{ fontSize: 11.5 }}>{c.name}</div>)}</>)}
            {has(d.languages) && <div style={{ fontSize: 11.5, color: SOFT, marginTop: 8 }}>{d.languages.map((l) => `${l.name} · ${l.level}`).join("  /  ")}</div>}
          </div>
        </div>
      </div>
    </Page>
  );
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  switch (data.template) {
    case "atlas": return <Atlas d={data} />;
    case "vertex": return <Vertex d={data} />;
    case "horizon": return <Horizon d={data} />;
    case "mono": return <Mono d={data} />;
    case "impact": return <Impact d={data} />;
    default: return <Aurora d={data} />;
  }
}

/** Scaled, fixed-width preview of a resume page. */
export function ScaledResume({ data, width }: { data: ResumeData; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(width);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => el.clientWidth && setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = w / PAGE_W;
  return (
    <div ref={ref} style={{ width: "100%", maxWidth: width, height: PAGE_H * scale, overflow: "hidden" }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_W }}>
        <ResumeDocument data={data} />
      </div>
    </div>
  );
}

/* ============================================================
 * ResumeStack — vertical scroll of multiple resume pages
 * Uses shadcn ScrollArea + up/down navigation buttons.
 * ============================================================ */

export interface ResumeStackProps {
  /** One entry per resume preview to render. */
  items: Array<{
    id: string;
    label: string;
    data: ResumeData;
  }>;
  /** Fixed preview width in px for each card (default 420). */
  cardWidth?: number;
  /** Max height of the scroll viewport in px (default 720). */
  viewportHeight?: number;
}

export function ResumeStack({
  items,
  cardWidth = 420,
  viewportHeight = 720,
}: ResumeStackProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: "up" | "down") => {
    const el = viewportRef.current;
    if (!el) return;
    const amount = cardWidth + PAGE_GAP; // step ~ one card + gap
    el.scrollBy({ top: dir === "up" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative w-full">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Resume previews</h2>
          <p className="text-sm text-muted-foreground">
            Scroll down to browse templates.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollBy("up")}
            aria-label="Scroll up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollBy("down")}
            aria-label="Scroll down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vertical scroll viewport */}
      <ScrollArea
        className="w-full rounded-xl border border-border bg-muted/20"
        style={{ height: viewportHeight }}
      >
        <div className="flex flex-col gap-7 p-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="mx-auto overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              style={{ width: cardWidth }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {item.data.template ?? "aurora"}
                </span>
              </div>
              <div className="flex justify-center bg-muted/30 p-4">
                <ScaledResume data={item.data} width={cardWidth - 32} />
              </div>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}