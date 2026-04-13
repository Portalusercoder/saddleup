import type { Metadata } from "next";
import Link from "next/link";
import { SeoArticle } from "@/components/landing/SeoArticle";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title:
    "Lesson scheduling & horse workload for stables | جدولة الدروس وحمل عمل الخيول",
  description:
    "Why lesson scheduling and workload tracking matter for horse welfare and stable reputation — and how to structure it for riding schools in KSA & GCC. | لماذا تهم جدولة الدروس وتتبع حمل العمل لرفاه الخيل وسمعة الإسطبل، وكيف تُنظَّم لمدارس الفروسية في السعودية والخليج.",
  alternates: { canonical: `${appUrl}/blog/lesson-scheduling-horse-workload` },
  openGraph: {
    title:
      "Lesson scheduling & horse workload | Saddle Up | جدولة الدروس وحمل العمل",
    description:
      "Reduce overtraining risk with clearer scheduling and workload visibility. | تقليل مخاطر الإفراط في التدريب عبر وضوح الجدولة ورؤية حمل العمل.",
    url: "/blog/lesson-scheduling-horse-workload",
    type: "article",
  },
};

export default function LessonSchedulingHorseWorkloadPage() {
  return (
    <main className="min-h-screen">
      <SeoArticle
        title="Lesson scheduling and horse workload management for stables"
        description="Busy lesson programs can push the same horses repeatedly through the week. Transparent scheduling and workload habits protect equine athletes and your stable’s reputation."
        arabicTitle="جدولة الدروس وإدارة حمل عمل الخيول في الإسطبل"
        arabicDescription="برامج الدروس المكثفة قد تضغط على نفس الخيول أسبوعيًا. الجدولة الواضحة ومتابعة الحمل تحمي الخيل وتحافظ على سمعة الإسطبل."
        arabicChildren={
          <>
            <h2>لماذا حمل العمل مهم</h2>
            <p>
              الخيول ليست وحدات درس متطابقة. تكرار الجلسات الشديدة دون راحة كافية
              يزيد خطر الإصابة وتراجع الأداء، وهذا ينعكس مباشرة على رضا العملاء
              وتكاليف الرعاية.
            </p>

            <h2>مبادئ الجدولة</h2>
            <ul>
              <li>مواءمة الحصان مع مستوى الفارس ونوع الحصة.</li>
              <li>تقليل الجلسات عالية الشدة المتتالية للحصان نفسه.</li>
              <li>حجز فترات الصيانة أو الراحة دون تعارضات.</li>
              <li>إبقاء الطلبات المعلقة مرئية لتجنب وعود متكررة لنفس الموعد.</li>
            </ul>

            <h2>ماذا تتابع أسبوعيًا</h2>
            <ul>
              <li>إجمالي الدقائق أو الجلسات لكل حصان حسب النوع.</li>
              <li>الخيول التي تقترب من أيام شديدة متتالية دون راحة.</li>
              <li>المدربون الذين يحتاجون توزيعًا أفضل للخيول.</li>
            </ul>

            <h2>الأدوات التي تساعد</h2>
            <p>
              الجمع بين الجدول والحجوزات وتسجيل الجلسات يعطي رؤية فعلية لعبء
              العمل بدل الاعتماد على التقدير. هذا يسهّل قرارات التدوير والراحة.
            </p>

            <h2>اعتبارات السعودية والخليج</h2>
            <p>
              حرارة الصيف قد تضغط المواعيد في نوافذ زمنية أقصر، ما يجعل التدوير
              الدقيق والبيانات الصادقة لحمل الخيول أكثر أهمية.
            </p>

            <h2>ابدأ بشكل عملي</h2>
            <p>
              ابدأ بتجربة لمدة أسبوعين: سجّل كل حصة وجلسة، ثم راجع أي الخيول
              حملت العبء الأكبر وعدّل قواعد الجدولة قبل مواسم الذروة.
            </p>
          </>
        }
      >
        <h2>Why workload matters</h2>
        <p>
          Horses are not interchangeable lesson units. Repeated hard sessions without adequate rest increase injury risk, sour behavior, and long-term soundness issues. For a riding school, that translates into unhappy clients, vet bills, and trainer burnout.
        </p>

        <h2>Scheduling principles</h2>
        <ul>
          <li>
            Match horse assignment to rider level and lesson type (schooling vs. jump vs. lunge).
          </li>
          <li>
            Cap back-to-back high-intensity use per horse where possible; use your schedule grid to see conflicts.
          </li>
          <li>
            Block arena or facility maintenance without double-booking horses that need those windows.
          </li>
          <li>
            Keep pending requests visible so trainers do not verbally promise the same slot twice.
          </li>
        </ul>

        <h2>What to track weekly</h2>
        <ul>
          <li>Total minutes or sessions per horse by type (training, lesson, rest).</li>
          <li>Horses approaching consecutive heavy days without a rest marker.</li>
          <li>Trainers who need more balanced horse rotation across their roster.</li>
        </ul>

        <h2>Tools that help</h2>
        <p>
          A combined{" "}
          <Link href="/#features" className="text-accent underline underline-offset-2 hover:opacity-90">
            schedule and booking
          </Link>{" "}
          view lets you see lessons alongside blocked time. Session logging ties actual work to each horse so analytics reflect reality, not assumptions.{" "}
          <Link href="/" className="text-accent underline underline-offset-2 hover:opacity-90">
            Saddle Up
          </Link>{" "}
          includes scheduling, bookings, sessions, and workload-oriented views for trainers and owners.
        </p>

        <h2>KSA & GCC considerations</h2>
        <p>
          Summer heat and midday restrictions may compress lesson windows into tighter peaks — which makes rotation and honest workload data even more important. Plan density where your facility can still rest its lesson string.
        </p>

        <h2>Get started</h2>
        <p>
          If you are evaluating software, start with a two-week pilot: log every lesson and session, then review which horses carried the load. Adjust rules before peak season.{" "}
          <Link href="/signup" className="text-accent underline underline-offset-2 hover:opacity-90">
            Sign up
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-accent underline underline-offset-2 hover:opacity-90">
            talk to us
          </Link>{" "}
          about a structured rollout.
        </p>
      </SeoArticle>
    </main>
  );
}
