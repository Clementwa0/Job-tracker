"use client";

import Link from "next/link";
import { ArrowLeft, FileText, List } from "lucide-react";
import { SectionWrapper } from "@/components/shared/public/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const lastUpdated = "September 2026";

type Section = {
  id: string;
  title: string;
  body: string[];
};

const sections: Section[] = [
  {
    id: "overview",
    title: "1. Overview",
    body: [
      "JobTrail is a technology platform that helps job seekers discover opportunities, organize applications, and manage their job search while helping employers publish vacancies and manage recruitment activities.",
      "This Privacy Policy explains what personal information we collect, how we use and protect it, when we may share it, how long we retain it, and the choices and rights available to you.",
      "By using JobTrail, you acknowledge that your information may be processed as described in this Privacy Policy.",
    ],
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    body: [
      "Account information may include your name, email address, profile information, authentication information, and other details you provide when creating or accessing an account.",
      "Job seeker information may include your CV or resume, cover letters, education, skills, work experience, career preferences, applications, saved jobs, interview information, and other information you choose to provide.",
      "Employer information may include your name, company name, business information, contact details, job descriptions, recruitment requirements, and other information submitted when using employer features.",
      "Application information may include information you submit when applying for a position, including documents and information contained in your application materials.",
      "Technical and usage information may include browser type, device information, IP address, pages visited, features used, approximate activity times, and other technical information collected automatically when you interact with JobTrail.",
      "We may also collect information you provide when contacting customer support, reporting an issue, providing feedback, or communicating with us.",
    ],
  },
  {
    id: "how-we-collect",
    title: "3. How We Collect Information",
    body: [
      "We collect information directly from you when you create an account, complete your profile, upload a CV, submit an application, publish a job, contact us, or otherwise provide information through JobTrail.",
      "Some information is collected automatically when you use the platform, including technical, device, security, and usage information.",
      "Where you choose to authenticate using a third-party identity provider, such as Google, we may receive information that the provider makes available to us in accordance with your authorization and that provider's policies.",
    ],
  },
  {
    id: "how-we-use",
    title: "4. How We Use Your Information",
    body: [
      "To provide and operate JobTrail, including account management, job discovery, application tracking, job publishing, recruitment workflows, and related features.",
      "To process and manage job applications and make relevant application information available to the employer associated with the position you apply for.",
      "To personalize your experience, including helping surface relevant job opportunities and improving the usefulness of platform features.",
      "To authenticate users, protect accounts, detect suspicious activity, prevent fraud, and maintain the security of JobTrail.",
      "To provide customer support, respond to inquiries, troubleshoot problems, and communicate with you about your account.",
      "To analyze usage patterns and improve the performance, functionality, reliability, and design of JobTrail. Where practical, we use aggregated or otherwise non-identifying information for product analysis.",
      "To comply with applicable laws, regulations, legal processes, and legitimate requests from competent authorities.",
    ],
  },
  {
    id: "job-seeker-information",
    title: "5. Job Seeker Information",
    body: [
      "If you create a job seeker profile, the information you choose to include may be used to support job discovery, applications, and interactions with employers.",
      "When you apply for a position through JobTrail, information contained in your application may be shared with the employer responsible for that vacancy so that the employer can evaluate and process your application.",
      "You are responsible for reviewing the information in your profile and application materials before submitting them and should avoid including information that you do not want an employer to receive.",
    ],
  },
  {
    id: "employer-information",
    title: "6. Employer Information",
    body: [
      "If you use JobTrail as an employer, we may process your personal and company information to provide employer account functionality, publish vacancies, manage candidates, and support recruitment activities.",
      "Information contained in job postings may be publicly visible or accessible to job seekers depending on the features and settings available on JobTrail.",
      "Employers are responsible for ensuring that information they publish and the way they handle candidate information complies with applicable laws and their own privacy obligations.",
    ],
  },
  {
    id: "how-we-share",
    title: "7. How We Share Information",
    body: [
      "We do not sell your personal information.",
      "When you apply for a job through JobTrail, relevant application information is shared with the employer associated with that job so the employer can review and process your application.",
      "We may share information with trusted service providers that help us operate JobTrail, such as hosting, database, authentication, email, analytics, security, and infrastructure providers. These providers are expected to process information only as necessary to provide their services to us.",
      "We may disclose information when required by law, legal process, court order, or a valid request from an authorized public authority.",
      "We may also disclose information where reasonably necessary to protect the rights, safety, property, security, or integrity of JobTrail, our users, or the public.",
      "If JobTrail is involved in a merger, acquisition, restructuring, financing, sale of assets, or similar transaction, information may be transferred as part of that transaction, subject to applicable legal requirements.",
    ],
  },
  {
    id: "third-party-services",
    title: "8. Third-Party Services",
    body: [
      "JobTrail may rely on third-party services for authentication, hosting, infrastructure, communications, analytics, security, and other technical functions.",
      "When you interact with a third-party service through JobTrail, that service may process information according to its own terms and privacy policy.",
      "We encourage you to review the privacy practices of third-party services before providing information directly to them.",
    ],
  },
  {
    id: "cookies",
    title: "9. Cookies and Similar Technologies",
    body: [
      "JobTrail may use cookies and similar technologies to keep you signed in, maintain security, remember preferences, support essential functionality, and understand how the platform is used.",
      "Some cookies may be necessary for the Service to function correctly, while others may help us understand performance and improve the user experience.",
      "You can control cookies through your browser settings. Disabling certain cookies may affect the availability or functionality of some JobTrail features.",
    ],
  },
  {
    id: "data-security",
    title: "10. Data Security",
    body: [
      "We use reasonable technical and organizational safeguards designed to protect personal information against unauthorized access, alteration, disclosure, loss, or destruction.",
      "These safeguards may include encryption in transit, access controls, authentication mechanisms, monitoring, security practices, and restricted access to personal information.",
      "No method of transmission, storage, or electronic security is completely secure. Therefore, while we work to protect your information, we cannot guarantee absolute security.",
    ],
  },
  {
    id: "data-retention",
    title: "11. Data Retention",
    body: [
      "We retain personal information for as long as reasonably necessary to provide the Service, maintain your account, fulfill legitimate business purposes, comply with legal obligations, resolve disputes, and enforce our agreements.",
      "When information is no longer required for these purposes, we may delete it, anonymize it, or securely dispose of it in accordance with our retention practices and applicable law.",
      "Some information may remain in backups or records for a limited period after deletion where necessary for security, legal, or operational purposes.",
    ],
  },
  {
    id: "your-rights",
    title: "12. Your Choices and Privacy Rights",
    body: [
      "You can review and update certain account information through the available JobTrail account settings.",
      "You may request access to personal information we hold about you, subject to applicable legal requirements and limitations.",
      "You may request correction of inaccurate or incomplete personal information.",
      "You may request deletion of your account or personal information where applicable, subject to information we are required or permitted to retain by law.",
      "Depending on where you live and applicable privacy laws, you may have additional rights concerning your personal information, including rights relating to objection, restriction, portability, or withdrawal of consent.",
      "To exercise a privacy right or make a privacy-related request, contact us through the official contact information provided on the JobTrail platform.",
    ],
  },
  {
    id: "children",
    title: "13. Children's Privacy",
    body: [
      "JobTrail is intended for individuals who are legally permitted to use employment and recruitment services.",
      "We do not knowingly collect personal information from children where such collection is prohibited by applicable law.",
      "If you believe that a child has provided personal information to JobTrail in circumstances where it should not have been collected, please contact us so that we can review and take appropriate action.",
    ],
  },
  {
    id: "international-transfers",
    title: "14. International Data Transfers",
    body: [
      "Some service providers that support JobTrail may process or store information in countries other than the country where you live.",
      "Where personal information is transferred across borders, we take reasonable steps to ensure that the information receives appropriate protection consistent with applicable privacy requirements.",
    ],
  },
  {
    id: "legal-basis",
    title: "15. Legal Basis for Processing",
    body: [
      "Where applicable, we process personal information based on one or more lawful grounds, including providing services you request, fulfilling contractual obligations, complying with legal obligations, protecting legitimate interests, preventing fraud and abuse, and obtaining consent where consent is required.",
      "The appropriate legal basis may depend on the nature of the information, the purpose of processing, and the applicable law.",
    ],
  },
  {
    id: "data-controller",
    title: "16. Data Responsibility",
    body: [
      "Depending on the particular activity, JobTrail may determine how and why certain personal information is processed, while employers may independently determine how they process candidate information received through the platform.",
      "Once information is provided to an employer, that employer may have separate privacy responsibilities and policies governing its processing of your information.",
    ],
  },
  {
    id: "changes",
    title: "17. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time as JobTrail develops, our practices change, or applicable legal requirements change.",
      "When we make material changes, we will update the Last Updated date and may provide additional notice where reasonably appropriate.",
      "We encourage you to review this page periodically to stay informed about how we handle personal information.",
    ],
  },
  {
    id: "contact",
    title: "18. Contact Us",
    body: [
      "If you have questions, concerns, requests, or complaints about this Privacy Policy or how your personal information is handled, please contact us through the official contact channels provided by JobTrail.",
      "For privacy-related requests, please provide enough information for us to understand and respond to your request appropriately.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Decorative blurs isolated so sticky positioning is not broken */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      <SectionWrapper
        className="relative z-10"
        containerClassName="mx-auto max-w-6xl"
        spacingClassName="py-8 sm:py-12 lg:py-16"
      >
        <Button
          variant="ghost"
          className="mb-6 h-8 gap-1.5 px-2 text-[13px] font-medium text-[#1762d8] hover:bg-blue-50 hover:text-[#1258d7]"
        >
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </Button>

        {/* Mobile table of contents */}
        <Card className="mb-6 rounded-2xl border-white/70 bg-white/80 shadow-lg shadow-indigo-500/5 backdrop-blur-xl lg:hidden">
          <CardHeader className="px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#071437]">
              <List className="h-4 w-4 text-blue-600" />
              Table of contents
            </CardTitle>
          </CardHeader>

          <CardContent className="px-5 pb-5">
            <ScrollArea className="h-[220px] pr-3">
              <nav aria-label="Table of contents" className="grid gap-0.5">
                {sections.map(({ id, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="rounded-md px-2.5 py-1.5 text-[12px] leading-5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {title}
                  </a>
                ))}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          {/* Desktop sticky table of contents */}
          <aside className="sticky top-6 hidden self-start lg:block">
            <Card className="rounded-2xl border-white/70 bg-white/75 shadow-lg shadow-indigo-500/5 backdrop-blur-xl">
              <CardHeader className="px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-[12px] font-semibold text-[#071437]">
                  <List className="h-4 w-4 text-blue-600" />
                  Contents
                </CardTitle>
              </CardHeader>

              <Separator className="bg-slate-100" />

              <CardContent className="p-3">
                <ScrollArea className="h-[calc(100vh-220px)] pr-3">
                  <nav aria-label="Table of contents" className="grid gap-0.5">
                    {sections.map(({ id, title }) => (
                      <a
                        key={id}
                        href={`#${id}`}
                        className="rounded-md px-2 py-1.5 text-[11px] leading-4 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        {title}
                      </a>
                    ))}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Policy document */}
          <Card className="rounded-2xl border-white/70 bg-white/85 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100/80 px-5 py-6 sm:px-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                  <FileText className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <CardTitle className="text-xl font-semibold tracking-[-0.5px] text-[#071437] sm:text-2xl">
                    Privacy Policy
                  </CardTitle>

                  <p className="mt-1 text-[12px] text-slate-500">
                    Last updated: {lastUpdated}
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="mt-4 w-fit rounded-full border-blue-100 bg-blue-50/60 text-[11px] font-medium text-blue-700"
              >
                Your privacy matters
              </Badge>
            </CardHeader>

            <CardContent className="px-5 py-7 sm:px-7 sm:py-8">
              {/* Introduction */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[13px] leading-6 text-slate-600">
                  At JobTrail, we understand that your personal information is
                  important. We aim to be transparent about the information we
                  collect and how it is used to provide a secure and useful
                  recruitment platform.
                </p>

                <p className="mt-3 text-[13px] leading-6 text-slate-600">
                  This Privacy Policy applies to information processed through
                  JobTrail and explains your choices and rights regarding that
                  information.
                </p>
              </div>

              {/* Sections */}
              <div className="mt-8">
                {sections.map((section, index) => (
                  <div key={section.id}>
                    <section id={section.id} className="scroll-mt-24 pt-2">
                      <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0f1830] sm:text-[15px]">
                        {section.title}
                      </h2>

                      <div className="mt-2 space-y-2.5">
                        {section.body.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-[13px] leading-6 text-slate-600"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>

                    {index < sections.length - 1 && (
                      <Separator className="my-6 bg-slate-100" />
                    )}
                  </div>
                ))}
              </div>

              {/* Privacy acknowledgement */}
              <div className="mt-10 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4">
                <p className="text-[12px] leading-5 text-slate-600">
                  By using JobTrail, you acknowledge that you have read and
                  understood this Privacy Policy and how we handle personal
                  information as described above.
                </p>
              </div>

              {/* Back to top */}
              <div className="mt-5 flex justify-end">
                <Button
                  variant="link"
                  className="h-auto p-0 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                >
                  <a href="#">Back to top</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </main>
  );
}