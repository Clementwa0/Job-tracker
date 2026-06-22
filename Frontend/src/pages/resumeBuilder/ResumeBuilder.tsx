import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Eye, Sparkles, ChevronDown, ChevronUp, Sliders,
  Menu, X, Download,
  Edit3, Columns, Check
} from "lucide-react";

import { useResumeEditor, useResumesIndex } from "@/hooks/useResumes";
import { uid, type ResumeData, type ResumeExperience, type ResumeProject } from "@/types/resume-builder";
import { ExperienceEditor, ResumePreview, ResumeToolbar, SectionCard } from "@/components";
import { Field, inputCls } from "@/features/resume/SectionCard";
import AIImproveButton from "@/features/resume/AIImproveButton";
import ATSScorePanel from "@/features/resume/ATSScorePanel";
import JobMatchPanel from "@/features/resume/JobMatchPanel";
import { CertificationsEditor, LanguagesEditor } from "@/features/resume/MoreEditors";
import { ProjectsEditor, EducationEditor, SkillsEditor } from "@/features/resume/SimpleEditors";
import { cn } from "@/lib/utils";


function SaveStatus({ savedAt }: { savedAt: number | null | undefined }) {
  const [, force] = useState(0);
  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(i);
  }, []);

  if (!savedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
        Not saved yet
      </span>
    );
  }
  const seconds = Math.max(1, Math.floor((Date.now() - savedAt) / 1000));
  const label =
    seconds < 60 ? `Saved ${seconds}s ago` :
    seconds < 3600 ? `Saved ${Math.floor(seconds / 60)}m ago` :
    `Saved ${new Date(savedAt).toLocaleTimeString()}`;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
      <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
      {label}
    </span>
  );
}

export default function ResumeBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, createBlank } = useResumesIndex();

  const [jdKeywords, setJdKeywords] = useState<string[]>([]);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"split" | "preview" | "edit">("split");

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile && previewMode === "split") setPreviewMode("edit");
  }, [isMobile]);

  useEffect(() => {
    if (id) return;
    if (items.length === 0) {
      (async () => {
        const meta = await createBlank("Untitled resume");
        if (meta) navigate(`/resume-builder/${meta.id}`, { replace: true });
      })();
    } else {
      navigate(`/resumes`, { replace: true });
    }
  }, [id, items.length, createBlank, navigate]);

  const editor = useResumeEditor(id);
  const { data } = editor;

  const addExperience = () =>
    editor.addItem("experience", {
      id: uid(), company: "", role: "", location: "",
      startDate: "", endDate: "", current: false, bullets: [""],
    });
  const addEducation = () =>
    editor.addItem("education", { id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", notes: "" });
  const addProject = () => editor.addItem("projects", { id: uid(), name: "", url: "", description: "", tech: [] });
  const addSkillGroup = () => editor.addItem("skills", { id: uid(), category: "", items: [] });
  const addCert = () => editor.addItem("certifications", { id: uid(), name: "", issuer: "", date: "", url: "" });
  const addLang = () => editor.addItem("languages", { id: uid(), name: "", level: "" });

  if (!id) return null;

  const previewScaleClass = isMobile
    ? "scale-[0.45] sm:scale-[0.55]"
    : isTablet
      ? "scale-[0.65]"
      : "scale-[0.60] xl:scale-[0.70] 2xl:scale-[0.80]";

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
      <div className="mx-auto max-w-[1800px] h-dvh flex flex-col">

        {/* Top header */}
        <header className="flex-shrink-0 z-40 bg-white/80 dark:bg-gray-900 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-3 sm:px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => navigate("/resumes")}
                aria-label="Back to resumes"
                className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 h-10 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Resumes</span>
              </button>

              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {data.meta?.name || "Untitled Resume"}
                </h1>
                <SaveStatus savedAt={editor.savedAt} />
              </div>
            </div>

            {/* Center: view mode */}
            <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0" role="tablist" aria-label="View mode">
              {([
                { key: "edit", icon: Edit3, label: "Edit" },
                { key: "split", icon: Columns, label: "Split" },
                { key: "preview", icon: Eye, label: "Preview" },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={previewMode === key}
                  onClick={() => setPreviewMode(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium transition-all",
                    previewMode === key
                      ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>

              {/* Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                className="sm:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 sm:hidden">
              <div className="mb-3">
                <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {data.meta?.name || "Untitled Resume"}
                </h1>
                <div className="mt-1"><SaveStatus savedAt={editor.savedAt} /></div>
              </div>
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 mb-3">
                <button
                  onClick={() => { setPreviewMode("edit"); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-2 h-10 rounded-md text-sm font-medium transition-all",
                    previewMode === "edit" && "bg-white dark:bg-slate-700 shadow-sm"
                  )}
                >
                  <Edit3 className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => { setPreviewMode("preview"); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-2 h-10 rounded-md text-sm font-medium transition-all",
                    previewMode === "preview" && "bg-white dark:bg-slate-700 shadow-sm"
                  )}
                >
                  <Eye className="h-4 w-4" /> Preview
                </button>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main */}
        <div className="flex-1 overflow-hidden dark:bg-gray-900">
          {previewMode === "split" && !isMobile && (
            <div className="h-full grid grid-cols-2 gap-0 divide-x divide-slate-200 dark:divide-slate-800">
              <div className="h-full overflow-y-auto">
                <div className="p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
                  <ResumeFormContent
                    data={data} editor={editor}
                    addExperience={addExperience} addEducation={addEducation}
                    addProject={addProject} addSkillGroup={addSkillGroup}
                    addCert={addCert} addLang={addLang}
                  />
                </div>
              </div>

              <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                <div className="h-full flex flex-col">
                  <div className="flex-shrink-0 flex items-center justify-end px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Live Preview
                    </span>
                  </div>
                  <div className="flex-1 overflow-auto p-4 md:p-6 flex items-start justify-center">
                    <div className="bg-white dark:bg-slate-950 shadow-xl rounded-lg overflow-hidden w-full max-w-[850px]">
                      <div className={cn("origin-top transition-transform duration-200 ease-out", previewScaleClass, "print:scale-100")}>
                        <ResumePreview data={data} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewMode === "edit" && (
            <div className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <ResumeFormContent
                  data={data} editor={editor}
                  addExperience={addExperience} addEducation={addEducation}
                  addProject={addProject} addSkillGroup={addSkillGroup}
                  addCert={addCert} addLang={addLang}
                />
              </div>
            </div>
          )}

          {previewMode === "preview" && (
            <div className="h-full overflow-auto bg-slate-50 dark:bg-slate-900/50">
              <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="bg-white dark:bg-slate-950 shadow-2xl rounded-xl overflow-hidden">
                  <div className={cn(
                    "origin-top transition-transform duration-200 ease-out",
                    isMobile ? "scale-[0.55]" : "scale-[0.70] lg:scale-[0.85]",
                    "print:scale-100"
                  )}>
                    <ResumePreview data={data} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isMobile && previewMode !== "split" && (
            <div className="h-full overflow-y-auto">
              {previewMode === "edit" ? (
                <div className="p-3 space-y-4">
                  <ResumeFormContent
                    data={data} editor={editor}
                    addExperience={addExperience} addEducation={addEducation}
                    addProject={addProject} addSkillGroup={addSkillGroup}
                    addCert={addCert} addLang={addLang}
                  />
                </div>
              ) : (
                <div className="h-full overflow-auto bg-slate-50 dark:bg-slate-900/50 p-2">
                  <div className="bg-white dark:bg-slate-950 shadow-lg rounded-lg overflow-hidden">
                    <div className="scale-[0.45] origin-top transition-transform duration-200">
                      <ResumePreview data={data} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop floating panels */}
      <div className="hidden md:block">
        <div className={`fixed bottom-6 left-6 z-50 print:hidden transition-all duration-300 ${isToolbarOpen ? "w-[480px]" : "w-56"}`}>
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800/90 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setIsToolbarOpen(!isToolbarOpen)}
              aria-expanded={isToolbarOpen}
              className="w-full flex items-center justify-between bg-slate-900 px-4 py-2.5 text-white hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Canvas Settings</span>
              </div>
              {isToolbarOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <div className={cn("transition-all duration-300", isToolbarOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0")}>
              <div className="p-4">
                <ResumeToolbar
                  data={data}
                  onChangeTemplate={(t) => editor.patch("template", t)}
                  onChangeAccent={(a: string) => editor.patch("accent", a)}
                  onReset={() => editor.replaceAll({})}
                  onImport={(d: ResumeData) => editor.replaceAll(d)}
                  onUndo={editor.undo}
                  onRedo={editor.redo}
                  canUndo={editor.canUndo}
                  canRedo={editor.canRedo}
                  savedAt={editor.savedAt}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`fixed bottom-6 right-6 z-50 print:hidden transition-all duration-300 ${isAIPanelOpen ? "w-[380px]" : "w-48"}`}>
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800/90 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
              aria-expanded={isAIPanelOpen}
              className="w-full flex items-center justify-between bg-slate-900 px-4 py-2.5 text-white hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400 fill-current" />
                <span className="text-sm font-semibold">ATS Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isAIPanelOpen && (
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                    LIVE
                  </span>
                )}
                {isAIPanelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </button>
            <div className={cn("transition-all duration-300", isAIPanelOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[460px] custom-scrollbar">
                <ATSScorePanel data={data} jdKeywords={jdKeywords} />
                <div className="border-t border-slate-100 dark:border-slate-800/60" />
                <JobMatchPanel data={data} onKeywordsChange={setJdKeywords} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FABs */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden flex flex-col gap-2">
        <button
          onClick={() => setIsToolbarOpen(!isToolbarOpen)}
          aria-label="Canvas settings"
          className="h-12 w-12 inline-flex items-center justify-center rounded-full bg-slate-900 text-white shadow-lg"
        >
          <Sliders className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
          aria-label="ATS score"
          className="h-12 w-12 inline-flex items-center justify-center rounded-full bg-amber-500 text-white shadow-lg"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      </div>

      {isMobile && (isToolbarOpen || isAIPanelOpen) && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => { setIsToolbarOpen(false); setIsAIPanelOpen(false); }}
          />
          {isToolbarOpen && (
            <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-h-[60vh] overflow-y-auto p-4">
              <ResumeToolbar
                data={data}
                onChangeTemplate={(t) => editor.patch("template", t)}
                onChangeAccent={(a: string) => editor.patch("accent", a)}
                onReset={() => editor.replaceAll({})}
                onImport={(d: ResumeData) => editor.replaceAll(d)}
                onUndo={editor.undo}
                onRedo={editor.redo}
                canUndo={editor.canUndo}
                canRedo={editor.canRedo}
                savedAt={editor.savedAt}
              />
            </div>
          )}
          {isAIPanelOpen && (
            <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-h-[60vh] overflow-y-auto p-4 space-y-4">
              <ATSScorePanel data={data} jdKeywords={jdKeywords} />
              <div className="border-t border-slate-100 dark:border-slate-800/60" />
              <JobMatchPanel data={data} onKeywordsChange={setJdKeywords} />
            </div>
          )}
        </>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }

        @media print {
          @page { size: Letter; margin: 0; }
          html, body { background: #fff !important; color: #000 !important; }
          body > * { visibility: hidden !important; }
          #resume-print-area, #resume-print-area * { visibility: visible !important; }
          #resume-print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 8.5in !important;
            min-height: 11in !important;
            box-shadow: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Extracted form content (unchanged behavior)
function ResumeFormContent({ data, editor, addExperience, addEducation, addProject, addSkillGroup, addCert, addLang }: any) {
  return (
    <>
      <SectionCard title="Contact" description="Basic contact info and online profiles" itemCount={Object.values(data.contact).filter(Boolean).length}>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <Field label="Full name"><input className={inputCls} value={data.contact.fullName} onChange={(e) => editor.updateContact("fullName", e.target.value)} placeholder="Jane Doe" /></Field>
          <Field label="Headline / Title"><input className={inputCls} value={data.contact.title} onChange={(e) => editor.updateContact("title", e.target.value)} placeholder="Full Stack Developer" /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={data.contact.email} onChange={(e) => editor.updateContact("email", e.target.value)} placeholder="jane.doe@domain.com" /></Field>
          <Field label="Phone"><input className={inputCls} value={data.contact.phone} onChange={(e) => editor.updateContact("phone", e.target.value)} placeholder="+254 700 000000" /></Field>
          <Field label="Location"><input className={inputCls} value={data.contact.location} onChange={(e) => editor.updateContact("location", e.target.value)} placeholder="Nairobi, Kenya" /></Field>
          <Field label="Website"><input className={inputCls} value={data.contact.website} onChange={(e) => editor.updateContact("website", e.target.value)} placeholder="janedoe.dev" /></Field>
          <Field label="LinkedIn"><input className={inputCls} value={data.contact.linkedin} onChange={(e) => editor.updateContact("linkedin", e.target.value)} placeholder="linkedin.com/in/janedoe" /></Field>
          <Field label="GitHub"><input className={inputCls} value={data.contact.github} onChange={(e) => editor.updateContact("github", e.target.value)} placeholder="github.com/janedoe" /></Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Professional Summary"
        actions={<AIImproveButton kind="summary" text={data.summary} context={data.contact.title} onPick={(v) => editor.patch("summary", v)} />}
      >
        <textarea
          rows={4}
          className={`${inputCls} resize-y min-h-[110px] sm:min-h-[130px]`}
          value={data.summary}
          onChange={(e) => editor.patch("summary", e.target.value)}
          placeholder="A short hook that frames what you do and the impact you've had."
        />
      </SectionCard>

      <SectionCard title="Experience" onAdd={addExperience} addLabel="Add role" itemCount={data.experience.length}>
        <ExperienceEditor items={data.experience}
          update={(id: string, p: Partial<ResumeExperience>) => editor.updateItem("experience", id, p)}
          remove={(id: string) => editor.removeItem("experience", id)} />
      </SectionCard>

      <SectionCard title="Projects" onAdd={addProject} addLabel="Add project" itemCount={data.projects.length}>
        <ProjectsEditor items={data.projects}
          update={(id: string, p: Partial<ResumeProject>) => editor.updateItem("projects", id, p)}
          remove={(id: string) => editor.removeItem("projects", id)} />
      </SectionCard>

      <SectionCard title="Education" onAdd={addEducation} addLabel="Add school" itemCount={data.education.length}>
        <EducationEditor items={data.education}
          update={(id, p) => editor.updateItem("education", id, p)}
          remove={(id) => editor.removeItem("education", id)} />
      </SectionCard>

      <SectionCard title="Skills" onAdd={addSkillGroup} addLabel="Add group" itemCount={data.skills.length}>
        <SkillsEditor items={data.skills}
          update={(id, p) => editor.updateItem("skills", id, p)}
          remove={(id) => editor.removeItem("skills", id)} />
      </SectionCard>

      <SectionCard title="Certifications" onAdd={addCert} addLabel="Add certification" itemCount={data.certifications.length}>
        <CertificationsEditor items={data.certifications}
          update={(id, p) => editor.updateItem("certifications", id, p)}
          remove={(id) => editor.removeItem("certifications", id)}
          move={(id, dir) => editor.moveItem("certifications", id, dir)} />
      </SectionCard>

      <SectionCard title="Languages" onAdd={addLang} addLabel="Add language" itemCount={data.languages.length}>
        <LanguagesEditor items={data.languages}
          update={(id, p) => editor.updateItem("languages", id, p)}
          remove={(id) => editor.removeItem("languages", id)}
          move={(id, dir) => editor.moveItem("languages", id, dir)} />
      </SectionCard>
    </>
  );
}