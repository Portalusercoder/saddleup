import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal/contact";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title: "Data protection & compliance (KSA) | حماية البيانات والامتثال (السعودية)",
  description:
    "PDPL-oriented compliance overview, retention, subprocessors, and security practices for Saddle Up. | نظرة عامة على الامتثال لنظام حماية البيانات الشخصية وسياسات الاحتفاظ والمعالِجين الفرعيين وممارسات الأمان في Saddle Up.",
  alternates: { canonical: `${appUrl}/legal/data-compliance` },
};

export default function DataCompliancePage() {
  const contact = LEGAL_CONTACT_EMAIL;

  return (
    <LegalPageShell
      titleKey="legal.dataComplianceDocumentTitle"
      lastUpdated="5 April 2026"
      arabicSummary={
        <>
          <p>
            يوضح هذا المستند نهجنا في حماية البيانات والامتثال في المملكة، بما
            يشمل مبادئ نظام حماية البيانات الشخصية (PDPL)، إدارة المخاطر، وحوكمة
            المعالجة مع العملاء والموردين.
          </p>
          <p>
            نطبق مبادئ المشروعية، تحديد الغرض، تقليل البيانات، الدقة، تحديد مدة
            الاحتفاظ، والأمان التقني والتنظيمي. كما نحتفظ بإجراءات للاستجابة
            للحوادث وطلبات أصحاب البيانات وفق المتطلبات النظامية.
          </p>
          <p>
            لطلبات الخصوصية أو الامتثال تواصل عبر{" "}
            <a href={`mailto:${contact}`}>{contact}</a>. هذا ملخص عربي تشغيلي،
            بينما تبقى الصياغة القانونية التفصيلية في النص الإنجليزي حتى اعتماد
            مراجعة قانونية عربية نهائية.
          </p>
        </>
      }
    >
      <section>
        <h2>1. Purpose of this page</h2>
        <p>
          This page summarizes how we approach <strong>personal data
          protection</strong> and <strong>compliance</strong> in the Kingdom of
          Saudi Arabia, in particular alignment with the{" "}
          <strong>Personal Data Protection Law (PDPL)</strong>. It supplements
          our <a href="/privacy">Privacy Policy</a> and does not replace legal
          review. A qualified Saudi lawyer should validate all statements against
          current law and SDAIA guidance.
        </p>
      </section>

      <section>
        <h2>2. Roles: controller and processor</h2>
        <p>
          We typically act as a <strong>data controller</strong> for platform
          operations (accounts, authentication metadata we control, security
          logs, billing relationship with us, and our own marketing to you).
        </p>
        <p>
          For data that a <strong>stable or enterprise customer</strong> enters
          about its members (trainers, students, horses, operational records), we
          often act as a <strong>processor</strong>, processing on documented
          instructions. That customer remains responsible for lawful collection
          from its users and for providing required notices and rights mechanisms
          where they are the controller.
        </p>
      </section>

      <section>
        <h2>3. Principles we apply (PDPL-oriented)</h2>
        <ul>
          <li>
            <strong>Lawfulness and fairness</strong> — processing has a valid
            basis and is described transparently;
          </li>
          <li>
            <strong>Purpose limitation</strong> — data is collected for specified,
            explicit purposes;
          </li>
          <li>
            <strong>Data minimization</strong> — we limit data to what is
            reasonably necessary;
          </li>
          <li>
            <strong>Accuracy</strong> — we enable correction where appropriate;
          </li>
          <li>
            <strong>Retention limits</strong> — data is kept no longer than
            necessary unless law requires otherwise;
          </li>
          <li>
            <strong>Security</strong> — appropriate technical and organizational
            measures;
          </li>
          <li>
            <strong>Accountability</strong> — internal policies, training, and
            vendor oversight (scaled to our size and risk).
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Records and impact assessments</h2>
        <p>
          We maintain internal documentation of processing activities and
          subprocessors. Where PDPL requires a{" "}
          <strong>data protection impact assessment</strong> (for example
          high-risk or large-scale processing of sensitive data), we conduct or
          require such assessments in cooperation with enterprise customers as
          appropriate.
        </p>
      </section>

      <section>
        <h2>5. Data subject requests (DSRs)</h2>
        <p>
          Individuals may contact <a href={`mailto:${contact}`}>{contact}</a> to
          exercise rights under PDPL (access, correction, destruction where
          applicable, withdrawal of consent, etc.). We respond within reasonable
          timelines required by law. Some requests about stable-held data may need
          to be fulfilled by the relevant stable administrator; we will direct you
          when that applies.
        </p>
      </section>

      <section>
        <h2>6. Breach management</h2>
        <p>
          We maintain procedures to detect, investigate, and remediate incidents.
          Where PDPL requires notification to the regulator (commonly discussed as
          a short window such as 72 hours in commentary—confirm exact obligation
          with counsel) and to affected individuals without undue delay, we follow
          those procedures once confirmed.
        </p>
      </section>

      <section>
        <h2>7. Cross-border transfers</h2>
        <p>
          Subprocessors may process data outside Saudi Arabia. We assess
          transfers and implement safeguards required under PDPL (for example
          contractual clauses, adequacy decisions, or other approved mechanisms)
          and document them as needed.
        </p>
      </section>

      <section>
        <h2>8. Subprocessors (illustrative)</h2>
        <p>
          The following categories of providers may process personal data on our
          behalf. Exact vendors and locations should be listed in your DPAs and
          kept current:
        </p>
        <ul>
          <li>Cloud hosting / CDN / edge security (e.g. Vercel, Cloudflare);</li>
          <li>Authentication and managed database (e.g. Supabase);</li>
          <li>Email delivery (e.g. Resend or equivalent);</li>
          <li>Payment processing (e.g. Stripe);</li>
          <li>Analytics or error monitoring if enabled.</li>
        </ul>
        <p>
          Enterprise customers may request a written subprocessor list and
          reasonable prior notice of changes where contractually agreed.
        </p>
      </section>

      <section>
        <h2>9. Retention summary</h2>
        <p>
          Retention depends on the data category and legal requirements. Indicative
          examples (finalize with counsel):
        </p>
        <ul>
          <li>
            <strong>Account data:</strong> life of account plus a defined period
            after closure for backups and legal claims;
          </li>
          <li>
            <strong>Stable operational data:</strong> per customer configuration
            or contract, subject to law;
          </li>
          <li>
            <strong>Security logs:</strong> rolling window (e.g. 30–180 days)
            unless longer needed for an investigation;
          </li>
          <li>
            <strong>Billing records:</strong> as required for tax and accounting
            in KSA.
          </li>
        </ul>
      </section>

      <section>
        <h2>10. Cybersecurity and organizational measures</h2>
        <p>
          We align with good practice compatible with Saudi expectations (including
          NCA-aligned guidance where applicable to your deployment): access
          control, least privilege, encryption in transit for standard web traffic,
          secrets management, dependency updates, and vendor review. Enterprise
          customers may request additional security documentation under NDA.
        </p>
      </section>

      <section>
        <h2>11. Training</h2>
        <p>
          Personnel with access to personal data receive appropriate confidentiality
          obligations and data-protection training commensurate with their role.
        </p>
      </section>

      <section>
        <h2>12. Regulatory cooperation</h2>
        <p>
          We cooperate with competent Saudi authorities in accordance with law when
          receiving lawful requests, and we assess the scope of disclosure to
          minimize unnecessary personal data.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          Compliance and privacy inquiries:{" "}
          <a href={`mailto:${contact}`}>{contact}</a>.
        </p>
        <p>
          If you appoint a <strong>Data Protection Officer</strong> or local
          representative where PDPL requires it, add their name and contact
          details here after legal advice.
        </p>
      </section>
    </LegalPageShell>
  );
}
