import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Sparkles, ChevronDown, ChevronUp, Sliders } from "lucide-react";

import { useResumeEditor, useResumesIndex } from "@/hooks/useResumes";
import { uid, type ResumeData, type ResumeExperience, type ResumeProject } from "@/types/resume-builder";
import { ExperienceEditor, ResumePreview, ResumeToolbar, SectionCard } from "@/components";
import { Field, inputCls } from "@/features/resume/SectionCard";
import AIImproveButton from "@/features/resume/AIImproveButton";
import ATSScorePanel from "@/features/resume/ATSScorePanel";
import JobMatchPanel from "@/features/resume/JobMatchPanel";
import { CertificationsEditor, LanguagesEditor } from "@/features/resume/MoreEditors";
import { ProjectsEditor, EducationEditor, SkillsEditor } from "@/features/resume/SimpleEditors";

export default function ResumeBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, createBlank } = useResumesIndex();

  // Core State — Panels now default to false (collapsed on initialization)
  const [jdKeywords, setJdKeywords] = useState<string[]>([]);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  useEffect(() => {
    if (id) return;
    if (items.length === 0) {
      const meta = createBlank("Untitled resume");
      navigate(`/resume-builder/${meta.id}`, { replace: true });
    } else {
      navigate(`/resumes`, { replace: true });
    }
  }, [id, items.length, createBlank, navigate]);

  const editor = useResumeEditor(id);
  const { data } = editor;

  const addExperience = () =>
    editor.addItem("experience", {
      id: uid(),
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    });
  const addEducation = () =>
    editor.addItem("education", { id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", notes: "" });
  const addProject = () => editor.addItem("projects", { id: uid(), name: "", url: "", description: "", tech: [] });
  const addSkillGroup = () => editor.addItem("skills", { id: uid(), category: "", items: [] });
  const addCert = () => editor.addItem("certifications", { id: uid(), name: "", issuer: "", date: "", url: "" });
  const addLang = () => editor.addItem("languages", { id: uid(), name: "", level: "" });

  if (!id) return null;

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Workspace Top Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate("/resumes")}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> 
              My Resumes
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {data.meta?.name || "Untitled Resume"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time compilation and automatic sync.
              </p>
            </div>
          </div>
        </header>

        {/* Dynamic Multi-Column Canvas */}
        <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-[1fr_1fr] items-start relative">
          
          {/* Left Form: Data Entry Section */}
          <div className="space-y-5 print:hidden pb-24">
            <SectionCard title="Contact" description="Basic coordinates and platform presence handles">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input className={inputCls} value={data.contact.fullName} onChange={(e) => editor.updateContact("fullName", e.target.value)} placeholder="Jane Doe" />
                </Field>
                <Field label="Headline / Title">
                  <input className={inputCls} value={data.contact.title} onChange={(e) => editor.updateContact("title", e.target.value)} placeholder="Full Stack Developer" />
                </Field>
                <Field label="Email">
                  <input type="email" className={inputCls} value={data.contact.email} onChange={(e) => editor.updateContact("email", e.target.value)} placeholder="jane.doe@domain.com" />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={data.contact.phone} onChange={(e) => editor.updateContact("phone", e.target.value)} placeholder="+254 700 000000" />
                </Field>
                <Field label="Location">
                  <input className={inputCls} value={data.contact.location} onChange={(e) => editor.updateContact("location", e.target.value)} placeholder="Nairobi, Kenya" />
                </Field>
                <Field label="Website">
                  <input className={inputCls} value={data.contact.website} onChange={(e) => editor.updateContact("website", e.target.value)} placeholder="janedoe.dev" />
                </Field>
                <Field label="LinkedIn">
                  <input className={inputCls} value={data.contact.linkedin} onChange={(e) => editor.updateContact("linkedin", e.target.value)} placeholder="linkedin.com/in/janedoe" />
                </Field>
                <Field label="GitHub">
                  <input className={inputCls} value={data.contact.github} onChange={(e) => editor.updateContact("github", e.target.value)} placeholder="github.com/janedoe" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              title="Professional Summary"
              actions={
                <AIImproveButton
                  kind="summary"
                  text={data.summary}
                  context={data.contact.title}
                  onPick={(v) => editor.patch("summary", v)}
                />
              }
            >
              <textarea
                rows={4}
                className={`${inputCls} resize-y min-h-[110px] focus:ring-2`}
                value={data.summary}
                onChange={(e) => editor.patch("summary", e.target.value)}
                placeholder="A high-impact hook framing your primary technological toolkit and historical performance value."
              />
            </SectionCard>

            <SectionCard title="Experience" onAdd={addExperience} addLabel="Add role">
              <ExperienceEditor
                items={data.experience}
                update={(id: string, p: Partial<ResumeExperience>) => editor.updateItem("experience", id, p)}
                remove={(id: string) => editor.removeItem("experience", id)}
              />
            </SectionCard>

            <SectionCard title="Projects" onAdd={addProject} addLabel="Add project">
              <ProjectsEditor
                items={data.projects}
                update={(id: string, p: Partial<ResumeProject>) => editor.updateItem("projects", id, p)}
                remove={(id: string) => editor.removeItem("projects", id)}
              />
            </SectionCard>

            <SectionCard title="Education" onAdd={addEducation} addLabel="Add school">
              <EducationEditor
                items={data.education}
                update={(id, p) => editor.updateItem("education", id, p)}
                remove={(id) => editor.removeItem("education", id)}
              />
            </SectionCard>

            <SectionCard title="Skills" onAdd={addSkillGroup} addLabel="Add group">
              <SkillsEditor
                items={data.skills}
                update={(id, p) => editor.updateItem("skills", id, p)}
                remove={(id) => editor.removeItem("skills", id)}
              />
            </SectionCard>

            <SectionCard title="Certifications" onAdd={addCert} addLabel="Add certification">
              <CertificationsEditor
                items={data.certifications}
                update={(id, p) => editor.updateItem("certifications", id, p)}
                remove={(id) => editor.removeItem("certifications", id)}
                move={(id, dir) => editor.moveItem("certifications", id, dir)}
              />
            </SectionCard>

            <SectionCard title="Languages" onAdd={addLang} addLabel="Add language">
              <LanguagesEditor
                items={data.languages}
                update={(id, p) => editor.updateItem("languages", id, p)}
                remove={(id) => editor.removeItem("languages", id)}
                move={(id, dir) => editor.moveItem("languages", id, dir)}
              />
            </SectionCard>
          </div>

          {/* Right Live Preview Canvas */}
          <div className="xl:sticky xl:top-6 pb-24 xl:pb-0">
            <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-900/40 print:bg-transparent print:p-0">
              
              <div className="mb-3 flex items-center justify-between px-1 print:hidden">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="ml-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 inline-flex items-center gap-1.5">
                    <Eye className="h-3 w-3" /> Realtime Page Layout Canvas
                  </span>
                </div>
              </div>

              <div className="overflow-auto rounded-xl bg-white shadow-xl dark:bg-slate-950 print:overflow-visible print:bg-transparent print:shadow-none">
                <div className="origin-top scale-[0.70] sm:scale-[0.80] md:scale-[0.88] xl:scale-[0.70] 2xl:scale-[0.85] print:scale-100 transition-transform duration-200 ease-out">
                  <ResumePreview data={data} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Canvas Configurations Panel (Left Anchor) */}
      <div className={`fixed bottom-6 left-6 z-50 print:hidden transition-all duration-300 ${isToolbarOpen ? "w-[540px]" : "w-56"} max-w-[calc(100vw-32px)]`}>
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800/90 dark:bg-slate-900 backdrop-blur-xl">
          
          <button
            type="button"
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="w-full flex items-center justify-between bg-slate-900 px-3.5 py-2.5 text-white dark:bg-slate-950 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20 p-1 text-indigo-400">
                <Sliders className="h-3 w-3" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider">Configure Canvas</span>
            </div>
            {isToolbarOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
          </button>

          <div 
            className={`transition-all duration-300 ease-in-out ${
              isToolbarOpen ? "max-h-[300px] opacity-100 border-t border-slate-100 dark:border-slate-800" : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="p-3 bg-white/50 dark:bg-slate-900/50">
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

      {/* Floating ATS Optimization Panel Overlay (Right Anchor) */}
      <div className={`fixed bottom-6 right-6 z-50 print:hidden transition-all duration-300 ${isAIPanelOpen ? "w-[350px]" : "w-48"} max-w-[calc(100vw-32px)]`}>
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800/90 dark:bg-slate-900 backdrop-blur-xl">
          
          <button
            type="button"
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            className="w-full flex items-center justify-between bg-slate-900 px-3.5 py-2.5 text-white dark:bg-slate-950 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                <Sparkles className="h-3 w-3 fill-current" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider">ATS Metrics</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              {!isAIPanelOpen && (
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md uppercase tracking-tight">
                  Live
                </span>
              )}
              {isAIPanelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </div>
          </button>

          <div 
            className={`transition-all duration-300 ease-in-out ${
              isAIPanelOpen ? "max-h-[520px] opacity-100 border-t border-slate-100 dark:border-slate-800" : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="p-4 space-y-4 overflow-y-auto max-h-[460px] custom-scrollbar">
              <ATSScorePanel data={data} jdKeywords={jdKeywords} />
              <div className="border-t border-slate-100 dark:border-slate-800/60 my-2" />
              <JobMatchPanel data={data} onKeywordsChange={setJdKeywords} />
            </div>
          </div>

        </div>
      </div>

      {/* Styled Micro Scrollbars and Print Directives */}
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