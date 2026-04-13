import type { Metadata } from "next";
import Link from "next/link";
import { SeoArticle } from "@/components/landing/SeoArticle";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title:
    "How to run a modern riding stable — operations playbook | كيفية تشغيل إسطبل حديث",
  description:
    "Daily, weekly, and monthly checklist for professional stable operations at riding schools in KSA and GCC. | قائمة يومية وأسبوعية وشهرية لتشغيل احترافي لإسطبلات مدارس الفروسية في السعودية والخليج.",
  alternates: { canonical: `${appUrl}/blog/stable-operations-playbook` },
  openGraph: {
    title: "Stable operations playbook | Saddle Up | دليل تشغيل الإسطبل",
    description:
      "Rhythms for lessons, horse care, staff, and reporting. | إيقاع عملي للدروس ورعاية الخيل والطاقم والتقارير.",
    url: "/blog/stable-operations-playbook",
    type: "article",
  },
};

export default function StableOperationsPlaybookPage() {
  return (
    <main className="min-h-screen">
      <SeoArticle
        title="How to run a modern riding stable: an operations playbook"
        description="A lightweight framework for riding schools and training stables in the Gulf. Adapt cadence and roles to your barn size and discipline."
        arabicTitle="كيفية تشغيل إسطبل حديث: دليل عمليات"
        arabicDescription="إطار عملي خفيف لمدارس الفروسية والإسطبلات التدريبية في الخليج. اضبط الإيقاع والأدوار حسب حجم منشأتك."
        arabicChildren={
          <>
            <h2>الإيقاع اليومي</h2>
            <ul>
              <li>تأكيد دروس اليوم وتوزيع الخيول قبل وصول الفرسان.</li>
              <li>مراجعة سريعة للخيول في راحة طبية أو تجهيز للمنافسات.</li>
              <li>تسجيل جلسات التدريب يوميًا لضمان دقة بيانات الحمل الأسبوعي.</li>
              <li>توحيد الإشعارات العاجلة (إغلاق ساحة، سياسة حرارة) في قناة واحدة.</li>
            </ul>

            <h2>الإيقاع الأسبوعي</h2>
            <ul>
              <li>مراجعة مواعيد البيطري والحداد والتطعيمات.</li>
              <li>موازنة حمل الخيول وكشف الإفراط في الاستخدام مبكرًا.</li>
              <li>اجتماع فريق قصير حول السعة والحوادث وأسئلة أولياء الأمور.</li>
              <li>تنظيف قوائم الانتظار والطلبات المعلقة لتجنب الالتباس.</li>
            </ul>

            <h2>الإيقاع الشهري</h2>
            <ul>
              <li>ملخص للمالك: الاستغلال، حجم الدروس، وتكاليف الرعاية الرئيسية.</li>
              <li>تحديث مستويات الفرسان وملاحظات المدربين.</li>
              <li>مراجعة الصلاحيات والأدوار عند تغيّر الفريق.</li>
            </ul>

            <h2>أين تأتي فائدة البرمجيات</h2>
            <p>
              الجداول والرسائل المتفرقة تعمل مؤقتًا، لكنها تنهار مع زيادة الحجم.
              وجود نظام واحد للخيول والفرسان والحجوزات يقلل الإدخال المكرر ويرفع
              وضوح القرار.
            </p>

            <h2>تشغيل مناسب للسعودية والخليج</h2>
            <p>
              الحرارة والمواسم والعطلات تؤثر على ذروة الدروس. أضف هامشًا في
              الجدولة وتواصل مبكرًا بإشعارات واضحة لبناء ثقة العملاء.
            </p>
          </>
        }
      >
        <h2>Daily rhythm</h2>
        <ul>
          <li>
            Confirm today&apos;s lessons and assigned horses; resolve conflicts before riders arrive.
          </li>
          <li>
            Quick check: horses on medical rest, farrier hold, or competition prep.
          </li>
          <li>
            Log training sessions so workload data stays honest for the week.
          </li>
          <li>
            Surface urgent notices (arena closure, heat policy) in one channel staff and clients trust.
          </li>
        </ul>

        <h2>Weekly rhythm</h2>
        <ul>
          <li>Review farrier, vet, and vaccination follow-ups against your care log.</li>
          <li>
            Balance horse workload: rotate high-use horses and flag overtraining risk early.
          </li>
          <li>
            Short team huddle: capacity, incidents, and guardian questions.
          </li>
          <li>
            Tidy waitlists and pending booking requests so no slot sits ambiguous.
          </li>
        </ul>

        <h2>Monthly rhythm</h2>
        <ul>
          <li>
            Owner summary: utilization, lesson volume, and major care costs.
          </li>
          <li>
            Update rider levels and instructor notes; archive completed competition blocks if applicable.
          </li>
          <li>
            Review access and roles if staff changed.
          </li>
        </ul>

        <h2>Where software fits</h2>
        <p>
          Spreadsheets and group chats work until volume breaks them. One system for{" "}
          <Link href="/#features" className="text-accent underline underline-offset-2 hover:opacity-90">
            horses, riders, bookings, and schedule
          </Link>{" "}
          reduces duplicate entry.{" "}
          <Link href="/" className="text-accent underline underline-offset-2 hover:opacity-90">
            Saddle Up
          </Link>{" "}
          is built around that workflow.
        </p>

        <h2>GCC-friendly operations</h2>
        <p>
          Heat, seasonal events, and local holidays affect peak lesson times. Build buffer into scheduling and communicate early through structured notices. Customers trust predictable communication.
        </p>
      </SeoArticle>
    </main>
  );
}
