import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal/contact";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title: "Terms & Conditions | الشروط والأحكام",
  description:
    "Terms of use for the Saddle Up stable management platform, governed by the laws of the Kingdom of Saudi Arabia. | شروط استخدام منصة Saddle Up لإدارة الإسطبلات وفق أنظمة المملكة العربية السعودية.",
  alternates: { canonical: `${appUrl}/terms` },
};

export default function TermsPage() {
  const contact = LEGAL_CONTACT_EMAIL;

  return (
    <LegalPageShell
      titleKey="legal.termsDocumentTitle"
      lastUpdated="5 April 2026"
      arabicSummary={
        <>
          <p>
            باستخدامك للمنصة فإنك توافق على شروط الاستخدام. الخدمة مخصصة لإدارة
            عمليات الإسطبلات ومدارس الفروسية، ويجب استخدام الحسابات بطريقة نظامية
            وآمنة.
          </p>
          <p>
            يلتزم المستخدم بصحة البيانات المدخلة واحترام صلاحيات الأدوار داخل
            المنصة. نحن نحتفظ بحق تعليق أو إنهاء الوصول عند إساءة الاستخدام أو
            مخالفة الشروط.
          </p>
          <p>
            للاستفسارات القانونية أو التعاقدية تواصل معنا عبر{" "}
            <a href={`mailto:${contact}`}>{contact}</a>. النسخة الإنجليزية هي
            المرجع الأساسي إلى حين اعتماد ترجمة قانونية رسمية كاملة.
          </p>
        </>
      }
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          These Terms and Conditions govern access to and use of the website,
          application, and related services offered by Saddle Up (the Service). By
          creating an account, accepting electronically, or using the Service,
          you agree. If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Operator</h2>
        <p>
          The Service is operated by the entity identified on the website or in
          your enterprise agreement. Legal notices:{" "}
          <a href={`mailto:${contact}`}>{contact}</a>. Insert your Commercial
          Registration (CR), VAT number, and registered address where required for
          Saudi e-commerce and consumer disclosure rules.
        </p>
      </section>

      <section>
        <h2>3. Eligibility and accounts</h2>
        <p>
          Provide accurate registration information and keep it current. You are
          responsible for credentials and activity under your account. Notify us
          of unauthorized use. We may suspend or terminate for breach or security
          risk.
        </p>
      </section>

      <section>
        <h2>4. The Service</h2>
        <p>
          The Service provides software tools for stable and equestrian
          operations. Features vary by plan. We may modify features with
          reasonable notice where practicable.
        </p>
      </section>

      <section>
        <h2>5. Your content and licenses</h2>
        <p>
          You retain rights to content you submit. You grant us a non-exclusive
          license to host, process, display, and transmit your content solely to
          provide, secure, and improve the Service and to comply with law. You
          represent you have rights and required consents (including for minors
          where applicable).
        </p>
      </section>

      <section>
        <h2>6. Acceptable use</h2>
        <p>You agree not to violate Saudi law or others rights, upload malware,
          attack systems, scrape without permission, send unlawful content, or
          misrepresent identity.</p>
      </section>

      <section>
        <h2>7. Fees and payment</h2>
        <p>
          Paid plans are billed as described at checkout or in your order.
          Payments may be processed by a third party (for example Stripe). VAT in
          KSA may apply. Subscriptions renew until cancelled as stated in the
          plan.
        </p>
      </section>

      <section>
        <h2>8. Intellectual property</h2>
        <p>
          We own the Service, branding, and software except for your content.
          Feedback you give may be used without obligation.
        </p>
      </section>

      <section>
        <h2>9. Third parties</h2>
        <p>
          Third-party links and integrations are governed by their terms. We are
          not responsible for third-party content.
        </p>
      </section>

      <section>
        <h2>10. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED AS IS AND AS AVAILABLE TO THE MAXIMUM EXTENT
          PERMITTED BY APPLICABLE LAW IN THE KINGDOM OF SAUDI ARABIA. IMPLIED
          WARRANTIES ARE DISCLAIMED WHERE PERMITTED. THE SERVICE DOES NOT REPLACE
          PROFESSIONAL VETERINARY, TRAINING, OR LEGAL ADVICE.
        </p>
      </section>

      <section>
        <h2>11. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY SAUDI LAW, OUR TOTAL LIABILITY FOR
          CLAIMS ARISING OUT OF THE SERVICE OR THESE TERMS SHALL NOT EXCEED THE
          FEES YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM (OR SAR 100 IF NO
          FEES APPLIED). WE ARE NOT LIABLE FOR INDIRECT OR CONSEQUENTIAL DAMAGES
          EXCEPT WHERE PROHIBITED BY LAW.
        </p>
      </section>

      <section>
        <h2>12. Indemnity</h2>
        <p>
          You will defend and indemnify us against third-party claims arising from
          your content, your breach, or your violation of law, except for our
          willful misconduct as finally determined by a competent court.
        </p>
      </section>

      <section>
        <h2>13. Suspension and termination</h2>
        <p>
          We may suspend or terminate for breach, risk, or legal requirement. You
          may stop using the Service. Survival clauses (law, liability limits,
          indemnity) continue where applicable.
        </p>
      </section>

      <section>
        <h2>14. Governing law and disputes</h2>
        <p>
          These Terms are governed by the laws of the Kingdom of Saudi Arabia.
          Subject to mandatory protections, jurisdiction shall be the competent
          courts of [INSERT CITY, KSA] after legal advice.
        </p>
      </section>

      <section>
        <h2>15. Language</h2>
        <p>
          This English text may be for convenience. Where Saudi law requires an
          Arabic version for consumers or B2B, follow your counsel on which
          language prevails.
        </p>
      </section>

      <section>
        <h2>16. E-commerce and consumer rules (KSA)</h2>
        <p>
          If you sell to consumers in Saudi Arabia, comply with the E-Commerce
          Law and regulations: disclose seller identity, pricing, VAT, complaint
          handling, and applicable cancellation or refund rules. Insert specifics
          after legal review.
        </p>
      </section>

      <section>
        <h2>17. Changes</h2>
        <p>
          We may update these Terms and the Last updated date. Continued use may
          constitute acceptance where permitted; paid customers may require
          additional notice.
        </p>
      </section>

      <section>
        <h2>18. Contact</h2>
        <p>
          <a href={`mailto:${contact}`}>{contact}</a>
        </p>
      </section>
    </LegalPageShell>
  );
}
