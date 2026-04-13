import type { Metadata } from "next";
import LegalPageShell, { legalContactEmail } from "@/components/legal/LegalPageShell";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Saddle Up collects, uses, and protects personal data in line with Saudi PDPL expectations.",
  alternates: { canonical: `${appUrl}/privacy` },
};

export default function PrivacyPage() {
  const contact = legalContactEmail();

  return (
    <LegalPageShell titleKey="legal.privacyDocumentTitle" lastUpdated="5 April 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          &quot;Saddle Up&quot;, &quot;we&quot;, &quot;us&quot; refers to the
          operator of this website and related application (the{" "}
          <strong>Service</strong>). Contact for privacy matters:{" "}
          <a href={`mailto:${contact}`}>{contact}</a>.
        </p>
        <p>
          Depending on how you use the Service, we may process personal data as a{" "}
          <strong>data controller</strong> (for example: platform accounts,
          authentication, billing where applicable, security, and support) and,
          in some cases, as a <strong>processor</strong> on documented
          instructions of a stable, business customer, or organization that uses
          enterprise features. Your stable or employer may also process personal
          data about you under their own policies.
        </p>
      </section>

      <section>
        <h2>2. Saudi law framework</h2>
        <p>
          We aim to comply with the{" "}
          <strong>Kingdom of Saudi Arabia Personal Data Protection Law (PDPL)</strong>{" "}
          and implementing regulations and guidance issued by the competent
          authorities (including the Saudi Data and Artificial Intelligence
          Authority and related frameworks, as applicable).
        </p>
        <p>
          Where other laws apply in addition (for example cross-border payment
          rules), we apply appropriate safeguards and disclose them when
          material.
        </p>
      </section>

      <section>
        <h2>3. Personal data we collect</h2>
        <p>We may collect:</p>
        <ul>
          <li>
            <strong>Account and identity:</strong> name, email, role (owner,
            trainer, student, guardian), password credentials (stored via our
            authentication provider), profile details you choose to provide.
          </li>
          <li>
            <strong>Stable and operations data:</strong> stable name, join codes,
            scheduling, horse and rider records, training logs, bookings,
            competitions, notices, incident reports, and similar content you or
            your stable enters into the Service.
          </li>
          <li>
            <strong>Verification and compliance:</strong> ID or document uploads
            where a feature requires them (for example ID cards for riders or
            trainers as configured by your stable).
          </li>
          <li>
            <strong>Payments:</strong> limited billing data processed by our
            payment processor (we do not store full card numbers on our servers).
          </li>
          <li>
            <strong>Technical and usage:</strong> IP address, device and browser
            type, approximate location derived from IP, logs, cookies or similar
            technologies, and diagnostics to secure and improve the Service.
          </li>
          <li>
            <strong>Communications:</strong> messages you send via contact forms,
            support channels, or email.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Why we use personal data (purposes)</h2>
        <p>We use personal data to:</p>
        <ul>
          <li>Provide, operate, and improve the Service;</li>
          <li>Create and manage accounts and stables;</li>
          <li>Authenticate users and prevent fraud and abuse;</li>
          <li>Process subscriptions and payments where offered;</li>
          <li>Send service-related messages (security alerts, transactional email);</li>
          <li>Respond to support requests and legal inquiries;</li>
          <li>Meet legal, regulatory, and law-enforcement requirements in KSA and
            elsewhere where applicable;</li>
          <li>Analyze aggregated or de-identified usage to improve the product.</li>
        </ul>
        <p>
          We do not sell your personal data. Marketing communications, if any,
          are sent only with consent or another lawful basis permitted under
          PDPL, with an easy opt-out where required.
        </p>
      </section>

      <section>
        <h2>5. Lawful basis under PDPL</h2>
        <p>
          We rely on one or more of the following, as appropriate: your{" "}
          <strong>consent</strong>; processing necessary to{" "}
          <strong>perform a contract</strong> with you or take steps at your
          request; <strong>legitimate interests</strong> that are not overridden
          by your rights (for example security and product integrity); or{" "}
          <strong>legal obligation</strong>. Sensitive personal data is processed
          only where permitted by PDPL and, where required, with additional
          safeguards or assessments.
        </p>
      </section>

      <section>
        <h2>6. Sharing and subprocessors</h2>
        <p>We may share personal data with:</p>
        <ul>
          <li>
            <strong>Infrastructure and hosting</strong> (for example application
            hosting, DNS, and security providers such as Cloudflare where used);
          </li>
          <li>
            <strong>Authentication and database</strong> (for example Supabase);
          </li>
          <li>
            <strong>Email and communications</strong> (for example transactional
            email providers);
          </li>
          <li>
            <strong>Payment processing</strong> (for example Stripe);
          </li>
          <li>
            <strong>Professional advisers</strong> (lawyers, accountants) when
            required;
          </li>
          <li>
            <strong>Authorities</strong> when required by applicable law or a
            lawful request.
          </li>
        </ul>
        <p>
          We use written arrangements with processors where required and expect
          them to implement appropriate technical and organizational measures.
        </p>
      </section>

      <section>
        <h2>7. International transfers</h2>
        <p>
          Your data may be processed in the Kingdom of Saudi Arabia and in other
          countries where our subprocessors operate. Where PDPL requires it, we
          implement appropriate transfer mechanisms (for example adequacy,
          assessments, or contractual safeguards) and document them as required.
        </p>
      </section>

      <section>
        <h2>8. Retention</h2>
        <p>
          We retain personal data only as long as necessary for the purposes
          described, unless a longer period is required by law, dispute resolution,
          or legitimate business needs (for example backups). When retention ends,
          we delete or anonymize data in line with our internal schedules and
          technical capabilities.
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          We implement administrative, technical, and physical safeguards
          appropriate to the risk, including access controls, encryption in
          transit where standard for the Service, monitoring, and vendor review.
          No method of transmission or storage is completely secure; we
          encourage strong passwords and protecting your devices.
        </p>
      </section>

      <section>
        <h2>10. Your rights (PDPL)</h2>
        <p>
          Subject to PDPL and applicable exceptions, you may have the right to:
        </p>
        <ul>
          <li>Be informed about processing;</li>
          <li>Access your personal data;</li>
          <li>Request correction or updating;</li>
          <li>Request destruction or anonymization when no longer needed for the
            purpose, unless retention is required by law;</li>
          <li>Withdraw consent where processing is consent-based;</li>
          <li>Lodge a complaint with the competent authority in Saudi Arabia.</li>
        </ul>
        <p>
          To exercise rights, contact{" "}
          <a href={`mailto:${contact}`}>{contact}</a>. We may need to verify your
          identity. Some requests about stable-held operational data may need to
          be routed through your stable administrator.
        </p>
      </section>

      <section>
        <h2>11. Breach notification</h2>
        <p>
          If we become aware of a personal data breach that requires notification
          under PDPL, we will follow applicable timelines and procedures,
          including notifying the regulator and affected individuals where
          required.
        </p>
      </section>

      <section>
        <h2>12. Children and guardians</h2>
        <p>
          The Service may be used in contexts involving minors (for example
          students). Where consent or guardian involvement is required under
          PDPL or school/stable policy, the stable or guardian account is
          responsible for ensuring appropriate authorization. If you believe we
          have collected a child&apos;s data improperly, contact us at{" "}
          <a href={`mailto:${contact}`}>{contact}</a>.
        </p>
      </section>

      <section>
        <h2>13. Changes</h2>
        <p>
          We may update this Privacy Policy. We will post the new version on this
          page and update the &quot;Last updated&quot; date. Material changes may
          require additional notice under PDPL or our contract with you.
        </p>
      </section>

      <section>
        <h2>14. Annex – Data processing summary (enclosure)</h2>
        <p>
          This summary is a non-exhaustive record for transparency. Your counsel
          should align it with PDPL record-keeping obligations.
        </p>
        <ul>
          <li>
            <strong>Categories of data subjects:</strong> stable owners,
            trainers, students, guardians, stable staff, newsletter subscribers,
            website visitors.
          </li>
          <li>
            <strong>Categories of personal data:</strong> identifiers, account
            data, operational stable data, health-adjacent or incident-related
            content if entered by users, financial transaction metadata, technical
            logs.
          </li>
          <li>
            <strong>Purposes:</strong> provide the Service, security, support,
            billing, legal compliance, product improvement.
          </li>
          <li>
            <strong>Typical retention:</strong> account and stable data for the
            life of the account and a reasonable period thereafter; logs on a
            shorter rolling basis unless longer retention is required.
          </li>
          <li>
            <strong>Recipients / processors:</strong> hosting, auth/database,
            email, payments, analytics as described in section 6.
          </li>
        </ul>
      </section>
    </LegalPageShell>
  );
}
