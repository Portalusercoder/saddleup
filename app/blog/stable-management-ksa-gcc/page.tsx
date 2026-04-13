import type { Metadata } from "next";
import Link from "next/link";
import { SeoArticle } from "@/components/landing/SeoArticle";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title:
    "Stable management software for riding schools in KSA and GCC | برنامج إدارة الإسطبلات لمدارس الفروسية في السعودية والخليج",
  description:
    "How stables in Saudi Arabia and the Gulf run operations: horses, riders, bookings, and team coordination with Saddle Up. | كيف تدير الإسطبلات في السعودية والخليج العمليات: الخيول، الفرسان، الحجوزات، وتنسيق الفريق عبر Saddle Up.",
  alternates: { canonical: `${appUrl}/blog/stable-management-ksa-gcc` },
  openGraph: {
    title:
      "Stable management software for KSA and GCC | Saddle Up | إدارة الإسطبلات",
    description:
      "Modern stable operations for riding schools across Saudi Arabia and the GCC. | تشغيل حديث للإسطبلات في مدارس الفروسية بالسعودية والخليج.",
    url: "/blog/stable-management-ksa-gcc",
    type: "article",
  },
};

export default function StableManagementKsaGccPage() {
  return (
    <main className="min-h-screen">
      <SeoArticle
        title="Stable management software for riding schools in Saudi Arabia and the GCC"
        description="Riding schools and equestrian stables in KSA and the wider Gulf region juggle horses, trainers, students, guardians, and schedules every day. The right software keeps everyone aligned without replacing the craft of horsemanship."
        arabicTitle="برنامج إدارة الإسطبلات لمدارس الفروسية في السعودية والخليج"
        arabicDescription="تدير مدارس الفروسية والإسطبلات في السعودية والخليج يوميًا الخيول والمدربين والطلاب وأولياء الأمور والجداول. النظام المناسب يوحّد الفريق دون أن يلغي خبرة الفروسية."
        arabicChildren={
          <>
            <h2>لمن هذا الدليل</h2>
            <p>
              هذا الدليل موجّه لمالكي الإسطبلات ومديري الحظائر وكبار المدربين في
              مدارس الفروسية أو مراكز التدريب. إذا كنت تدير عدة خيول ودروسًا
              منتظمة وفريق عمل، فأنت الفئة الأساسية لمنصات إدارة الإسطبل.
            </p>

            <h2>أكثر التحديات شيوعًا في الإسطبلات المزدحمة</h2>
            <ul>
              <li>طلبات الدروس وتغييرات الجدول موزّعة بين واتساب والهاتف والورق.</li>
              <li>متابعة عبء عمل الخيل وأيام الراحة بشكل غير منتظم.</li>
              <li>تشتت ملاحظات التقدم أو الصحة أو الحوادث في أماكن متعددة.</li>
              <li>مطالبات أولياء الأمور والمالكين بالوضوح دون زيادة عبء الفريق.</li>
            </ul>

            <h2>ما الذي يجب أن يغطيه نظام إدارة الإسطبل</h2>
            <p>
              المنصة الجيدة تجمع ملفات الخيول وسجل الرعاية، سجلات الفرسان،
              الحجوزات، الجدولة، إدارة الأدوار (مالك، مدرب، طالب، ولي أمر)،
              والإشعارات. الهدف هو مصدر تشغيلي واحد للبيانات بدلًا من ملفات متفرقة.
            </p>

            <h2>خصوصية السوق السعودي والخليجي</h2>
            <p>
              كثير من المنشآت تخدم عائلات محلية ومقيمين وفرسانًا تنافسيين معًا،
              لذلك التواصل الثنائي اللغة ونقاط المتابعة الخاصة بأولياء الأمور مهمان
              جدًا.
            </p>

            <h2>كيف يساعدك Saddle Up</h2>
            <p>
              <Link href="/" className="text-accent underline underline-offset-2 hover:opacity-90">
                Saddle Up
              </Link>{" "}
              مصمم لمدارس الفروسية والإسطبلات: ملفات خيول، جلسات تدريب، حجوزات،
              إغلاقات الجدول، إدارة الفريق، إشعارات، وخطط تتوسع مع نمو الإسطبل.
            </p>

            <h2>الخطوات التالية</h2>
            <ul>
              <li>احسب حجم الدروس الأسبوعي وعدد الخيول النشطة.</li>
              <li>حدّد من يحتاج صلاحية دخول: مالكون، مدربون، إداريون، أولياء أمور.</li>
              <li>ابدأ بوحدة واحدة (الحجوزات والجدول) قبل التوسع الكامل.</li>
            </ul>
          </>
        }
      >
        <h2>Who this is for</h2>
        <p>
          This guide is for stable owners, barn managers, and head trainers who run commercial riding schools or training yards. If you operate multiple horses, regular lessons, and a team, you are the core audience for purpose-built stable management tools.
        </p>

        <h2>Common pain points at busy stables</h2>
        <ul>
          <li>
            Lesson requests and schedule changes scattered across WhatsApp, calls, and paper.
          </li>
          <li>
            Horse workload and rest days tracked informally, increasing risk of overuse or missed care.
          </li>
          <li>
            Rider progress and health or incident notes living in different places.
          </li>
          <li>
            Guardians and owners asking for visibility without overloading staff.
          </li>
        </ul>

        <h2>What stable management software should cover</h2>
        <p>
          A serious platform for stables usually combines horse profiles and care history, rider or student records, booking or lesson flows, scheduling and availability, team roles (owner, trainer, student, guardian), and notices or announcements. The goal is one operational source of truth, not another spreadsheet.
        </p>

        <h2>KSA and GCC context</h2>
        <p>
          Facilities across the Gulf often serve mixed audiences: local families, expat communities, and competitive riders. Bilingual communication and clear guardian-facing touchpoints matter. Software should adapt to how your stable already speaks to customers.
        </p>

        <h2>How Saddle Up helps</h2>
        <p>
          <Link href="/" className="text-accent underline underline-offset-2 hover:opacity-90">
            Saddle Up
          </Link>{" "}
          is built for riding schools, trainers, and owners: horse profiles, training sessions, bookings, schedule blocks, team management, notices, and plans that scale with stable size. See{" "}
          <Link href="/#features" className="text-accent underline underline-offset-2 hover:opacity-90">
            features
          </Link>
          , then{" "}
          <Link href="/signup" className="text-accent underline underline-offset-2 hover:opacity-90">
            get started
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-accent underline underline-offset-2 hover:opacity-90">
            contact us
          </Link>
          .
        </p>

        <h2>Next steps</h2>
        <ul>
          <li>Map your weekly lesson volume and number of active horses.</li>
          <li>List who needs access: owners, trainers, office staff, guardians.</li>
          <li>Pilot one module (bookings and schedule) before rolling out everything.</li>
        </ul>
      </SeoArticle>
    </main>
  );
}
