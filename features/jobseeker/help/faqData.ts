export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

// ---------------------------------------------------------------------------
// Dummy help content - foundation only, no backend involved. Rewording or
// adding articles later doesn't need any code changes elsewhere on the page.
// ---------------------------------------------------------------------------
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "applications",
    title: "Applications",
    items: [
      {
        question: "How do I add a job application I found elsewhere?",
        answer:
          "Go to Applications and select \"Add Application.\" You can fill in the company, role, and status yourself, or paste a job link and let JobTrail pull in the details.",
      },
      {
        question: "Can I track applications I submitted before joining JobTrail?",
        answer:
          "Yes - add them the same way as a new application, and set the applied date to whenever you actually applied. Your stats and timeline will reflect the real date.",
      },
      {
        question: "What do the different application statuses mean?",
        answer:
          "Statuses move from Applied through Interviewing to either Offer or Rejected, with Ghosted available for roles that have gone quiet. You can change a status any time from the application's detail view.",
      },
    ],
  },
  {
    id: "interviews",
    title: "Interviews & calendar",
    items: [
      {
        question: "How do I schedule an interview?",
        answer:
          "Open the application, choose \"Schedule Interview,\" and set the date, time, and format. It will appear on both your Interviews list and your Calendar automatically.",
      },
      {
        question: "Will I get a reminder before an interview?",
        answer:
          "Reminders depend on your notification settings. Check Settings to confirm which alerts are turned on for your account.",
      },
    ],
  },
  {
    id: "resumes",
    title: "Resumes & CV review",
    items: [
      {
        question: "How many resumes can I create?",
        answer:
          "You can build multiple resume versions from the Resumes page, which is useful for tailoring your CV to different roles or industries.",
      },
      {
        question: "What does CV Review check for?",
        answer:
          "CV Review looks at formatting, clarity, and common gaps (like missing contact details or vague bullet points) and gives you suggestions you can apply directly.",
      },
      {
        question: "Can I export my resume as a PDF?",
        answer:
          "Yes, from the resume editor's toolbar you can export to PDF or download an image of the current version.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & privacy",
    items: [
      {
        question: "How do I change my email or password?",
        answer: "Head to Settings to update your account details, including your email and password.",
      },
      {
        question: "Who can see my applications and resumes?",
        answer:
          "Your applications, interviews, and resumes are private to your account. Employers only see what you actively submit through a job application.",
      },
      {
        question: "How do I delete my account?",
        answer: "Account deletion is handled from Settings, under your account details.",
      },
    ],
  },
];
