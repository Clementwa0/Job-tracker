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

const sections = [
  {
    id: "about-jobtrail",
    title: "1. About JobTrail",
    body: "JobTrail is a technology platform that connects job seekers with employers and provides tools for discovering opportunities, managing applications, publishing vacancies, and managing recruitment activities. JobTrail does not guarantee employment, interviews, candidate selection, hiring outcomes, or the suitability of any particular job or candidate. Employers are responsible for their recruitment decisions, job postings, candidate communications, and compliance with applicable employment laws.",
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    body: "You must provide accurate information when creating or using a JobTrail account. By using the Service, you confirm that the information you provide is accurate and reasonably up to date, that you are legally permitted to use the Service, and that you will use JobTrail only for lawful purposes. You must not impersonate another person or organization or create an account on behalf of another person without authorization.",
  },
  {
    id: "job-seeker-accounts",
    title: "3. Job Seeker Accounts",
    body: "Job seekers may use JobTrail to create profiles, discover job opportunities, submit applications, and communicate with employers through available platform features. You are responsible for the accuracy of your profile, CV, qualifications, employment history, contact information, and other information you submit. You must not submit false qualifications, fraudulent documents, misleading employment history, or information belonging to another person.",
  },
  {
    id: "employer-accounts",
    title: "4. Employer Accounts",
    body: "Employers may use JobTrail to publish vacancies, review applicants, manage recruitment activities, and use other employer features made available through the Service. Employers are responsible for ensuring that job descriptions are accurate, vacancies represent genuine opportunities, recruitment practices comply with applicable laws, candidate information is handled appropriately, and job postings do not contain unlawful discrimination or prohibited requirements.",
  },
  {
    id: "job-listings",
    title: "5. Job Listings and Recruitment Content",
    body: "JobTrail may display job advertisements and recruitment information submitted by employers or obtained through permitted integrations. We do not guarantee that every job listing is accurate, current, available, or suitable for a particular applicant. Employers are responsible for job requirements, compensation information, company information, application instructions, and closing dates. JobTrail may review, modify, reject, suspend, or remove job listings that violate these Terms, applicable policies, or applicable law.",
  },
  {
    id: "applications",
    title: "6. Applications",
    body: "Submitting an application through JobTrail does not guarantee that an employer will review, respond to, interview, or hire you. Employers independently determine which candidates to contact, interview, reject, or hire. JobTrail is not a party to any employment relationship created between a job seeker and an employer. You are responsible for reviewing the information you provide before submitting an application.",
  },
  {
    id: "user-content",
    title: "7. User Content",
    body: "You retain ownership of the information and content you submit to JobTrail, including your CV, profile information, job listings, descriptions, and other materials. By submitting User Content, you grant JobTrail a non-exclusive, worldwide, royalty-free license to host, store, reproduce, process, display, and distribute that content as reasonably necessary to provide, maintain, secure, and improve the Service. You remain responsible for ensuring that you have the necessary rights and permissions to submit your content.",
  },
  {
    id: "prohibited-activities",
    title: "8. Prohibited Activities",
    body: "You may not use JobTrail to commit fraud, facilitate fraudulent recruitment, impersonate another person or organization, post fake or misleading job opportunities, submit false qualifications, harass or abuse other users, gain unauthorized access to accounts or systems, circumvent security mechanisms, introduce malicious software, scrape or systematically collect platform data without authorization, send spam, misuse candidate information, or violate applicable laws or the rights of another person or organization.",
  },
  {
    id: "account-security",
    title: "9. Account Security",
    body: "You are responsible for maintaining the security of your account and for activities performed through your account. Where authentication is provided through a third-party identity provider such as Google, you are responsible for maintaining the security of that associated account. Notify JobTrail promptly if you believe your account has been accessed without authorization.",
  },
  {
    id: "privacy",
    title: "10. Privacy and Personal Information",
    body: "JobTrail processes personal information in accordance with its Privacy Policy. Job seekers should understand that information included in their profiles, applications, CVs, or other recruitment materials may be made available to relevant employers as part of the recruitment process. Employers are responsible for handling candidate information appropriately and using it only for legitimate recruitment purposes.",
  },
  {
    id: "third-party-services",
    title: "11. Third-Party Services",
    body: "JobTrail may integrate with third-party services, including authentication, communication, hosting, analytics, payment, or other technology providers. Your use of third-party services may be subject to their own terms and privacy policies. JobTrail is not responsible for the independent operation, availability, or policies of third-party services.",
  },
  {
    id: "communications",
    title: "12. Communications",
    body: "JobTrail may send service-related communications, including account notifications, application updates, security messages, and important changes to the Service. Where applicable, users may also receive optional communications such as product updates or recruitment-related notifications. You may manage available communication preferences through your account or applicable unsubscribe controls.",
  },
  {
    id: "intellectual-property",
    title: "13. Intellectual Property",
    body: "The JobTrail name, branding, logos, interface, software, design, and other original materials provided by JobTrail are owned by or licensed to JobTrail and are protected by applicable intellectual property laws. Except as expressly permitted by these Terms, you may not copy, modify, reproduce, distribute, sell, license, reverse engineer, or create derivative works from the Service or its proprietary components.",
  },
  {
    id: "feedback",
    title: "14. Feedback",
    body: "If you provide suggestions, ideas, recommendations, or other feedback about JobTrail, you agree that we may use that feedback without restriction or compensation, provided that doing so does not disclose your confidential information.",
  },
  {
    id: "service-availability",
    title: "15. Service Availability",
    body: "We aim to keep JobTrail reliable and available, but we do not guarantee that the Service will always be uninterrupted, secure, error-free, or available at all times. The Service may occasionally be unavailable because of maintenance, upgrades, technical problems, security incidents, third-party failures, or circumstances beyond our reasonable control.",
  },
  {
    id: "no-employment-guarantee",
    title: "16. No Employment Guarantee",
    body: "JobTrail is a recruitment technology platform. We do not guarantee that you will find employment, that an employer will contact you, that an application will be reviewed, that a job listing will remain available, that a candidate will be suitable for an employer, or that information provided by another user is accurate. Any employment relationship is between the relevant employer and employee.",
  },
  {
    id: "disclaimers",
    title: "17. Disclaimers",
    body: 'To the fullest extent permitted by applicable law, the Service is provided on an "as is" and "as available" basis. JobTrail does not warrant that information available through the Service will always be complete, accurate, current, or error-free. Users should independently verify important information, including employer identity, job requirements, compensation, interview arrangements, and recruitment communications before relying on them.',
  },
  {
    id: "limitation-of-liability",
    title: "18. Limitation of Liability",
    body: "To the fullest extent permitted by applicable law, JobTrail and its affiliates, officers, employees, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from or related to your use of the Service. This includes losses arising from employment decisions, recruitment interactions, inaccurate user-submitted information, third-party services, or interruptions to the Service. Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by applicable law.",
  },
  {
    id: "indemnification",
    title: "19. Indemnification",
    body: "To the extent permitted by applicable law, you agree to defend, indemnify, and hold harmless JobTrail and its affiliates, officers, employees, and service providers from claims, liabilities, damages, losses, and expenses arising from your violation of these Terms, unlawful use of the Service, User Content, violation of another person's rights, or misuse of information obtained through the Service.",
  },
  {
    id: "termination",
    title: "20. Suspension and Termination",
    body: "You may stop using JobTrail at any time. JobTrail may suspend or terminate access to an account or the Service where reasonably necessary, including where we believe a user has violated these Terms, engaged in fraudulent or harmful activity, compromised platform security, or created a significant risk to other users. Where appropriate, we may provide notice before taking action. Immediate action may be taken where necessary to protect users, the Service, or our legal rights.",
  },
  {
    id: "changes",
    title: "21. Changes to the Service",
    body: "We may introduce, modify, or remove features from JobTrail as the platform develops. We may also update these Terms from time to time. When material changes are made, we will update the Last Updated date and may provide additional notice where appropriate. Your continued use of JobTrail after updated Terms become effective constitutes acceptance of the revised Terms.",
  },
  {
    id: "governing-law",
    title: "22. Governing Law",
    body: "These Terms shall be interpreted and applied in accordance with applicable laws. Where applicable, disputes relating to the Service shall be subject to the jurisdiction of the appropriate courts and dispute-resolution mechanisms in Kenya, unless otherwise required by applicable law.",
  },
  {
    id: "severability",
    title: "23. Severability",
    body: "If any provision of these Terms is found to be invalid, unlawful, or unenforceable, that provision will be limited or removed to the minimum extent necessary, while the remaining provisions will continue in effect.",
  },
  {
    id: "entire-agreement",
    title: "24. Entire Agreement",
    body: "These Terms, together with the JobTrail Privacy Policy and any other policies expressly incorporated into them, constitute the agreement between you and JobTrail regarding your use of the Service. They supersede prior agreements or understandings concerning the same subject matter, except where otherwise expressly stated.",
  },
  {
    id: "contact",
    title: "25. Contact Us",
    body: "If you have questions, concerns, or complaints regarding these Terms or the JobTrail Service, please contact us through the official contact channels provided on the JobTrail platform.",
  },
];

export default function TermsofService() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Decorative blurs isolated in their own clipped wrapper so sticky positioning works */}
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
              <nav aria-label="Table of contents" className="grid gap-1">
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

          {/* Main document */}
          <Card className="rounded-2xl border-white/70 bg-white/85 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100/80 px-5 py-6 sm:px-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                  <FileText className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <CardTitle className="text-xl font-semibold tracking-[-0.5px] text-[#071437] sm:text-2xl">
                    Terms of Service
                  </CardTitle>

                  <p className="mt-1 text-[12px] text-slate-500">
                    Last updated: September 2026
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="mt-4 w-fit rounded-full border-blue-100 bg-blue-50/60 text-[11px] font-medium text-blue-700"
              >
                Please read carefully
              </Badge>
            </CardHeader>

            <CardContent className="px-5 py-7 sm:px-7 sm:py-8">
              {/* Introduction */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[13px] leading-6 text-slate-600">
                  Welcome to JobTrail. These Terms of Service govern your
                  access to and use of the JobTrail website, applications,
                  features, and related services. JobTrail connects job
                  seekers with employers and provides tools for discovering
                  opportunities, submitting applications, publishing
                  vacancies, and managing recruitment activities.
                </p>

                <p className="mt-3 text-[13px] leading-6 text-slate-600">
                  By creating an account, accessing, or using JobTrail, you
                  agree to these Terms and our Privacy Policy. If you do not
                  agree with these Terms, you should not use the Service.
                </p>
              </div>

              {/* Sections */}
              <div className="mt-8">
                {sections.map(({ id, title, body }, index) => (
                  <div key={id}>
                    <section
                      id={id}
                      className="scroll-mt-24 pt-2"
                    >
                      <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0f1830] sm:text-[15px]">
                        {title}
                      </h2>

                      <p className="mt-2 text-[13px] leading-6 text-slate-600">
                        {body}
                      </p>
                    </section>

                    {index < sections.length - 1 && (
                      <Separator className="my-6 bg-slate-100" />
                    )}
                  </div>
                ))}
              </div>

              {/* Closing acknowledgement */}
              <div className="mt-10 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4">
                <p className="text-[12px] leading-5 text-slate-600">
                  By accessing or using JobTrail, you acknowledge that you have
                  read, understood, and agree to these Terms of Service.
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