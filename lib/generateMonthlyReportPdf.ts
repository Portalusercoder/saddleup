import { jsPDF } from "jspdf";

export interface MonthlyReportData {
  stableName: string;
  year: number;
  month: number;
  monthLabel: string;
  bookings: {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    horseName: string;
    riderName: string;
    trainerName: string | null;
  }[];
  newMembers: {
    id: string;
    fullName: string | null;
    email: string | null;
    role: string;
    idCardUrl: string | null;
    createdAt: string;
  }[];
  newRiders: {
    id: string;
    name: string;
    email: string | null;
    level: string | null;
    idCardUrl: string | null;
    createdAt: string;
  }[];
  trainingSessions: {
    id: string;
    punchDate: string;
    punchType: string;
    durationMinutes: number;
    intensity: string | null;
    horseName: string;
    riderName: string | null;
  }[];
  newHorses: {
    id: string;
    name: string;
    breed: string | null;
    gender: string;
    age: number | null;
    createdAt: string;
  }[];
  incidents: {
    id: string;
    incidentDate: string;
    description: string;
    severity: string | null;
    horseName: string;
    riderName: string | null;
  }[];
  competitions: {
    id: string;
    eventName: string;
    eventDate: string;
    location: string | null;
    discipline: string | null;
    horseName: string;
  }[];
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  trainer: "Trainer",
  student: "Student",
  guardian: "Guardian",
};

const PUNCH_LABELS: Record<string, string> = {
  lesson: "Lesson",
  training: "Training",
  competition: "Competition",
  rest: "Rest",
  medical: "Medical",
  medical_rest: "Medical rest",
  free_ride: "Free ride",
};

const SEVERITY_LABELS: Record<string, string> = {
  minor: "Minor",
  moderate: "Moderate",
  serious: "Serious",
};

const REPORT = {
  forest: [14, 21, 18] as const,
  base: [12, 16, 14] as const,
  mist: [232, 236, 231] as const,
  paper: [244, 246, 243] as const,
  racing: [31, 77, 58] as const,
  brass: [184, 160, 122] as const,
  muted: [110, 118, 112] as const,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function orDash(val: string | number | null | undefined): string {
  return val != null && val !== "" ? String(val) : "—";
}

function addPageIfNeeded(doc: jsPDF, y: number, margin: number): number {
  if (y > 268) {
    doc.addPage();
    drawPageChrome(doc);
    return margin + 12;
  }
  return y;
}

function drawPageChrome(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...REPORT.brass);
  doc.setLineWidth(0.2);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
}

function drawFooter(doc: jsPDF, data: MonthlyReportData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...REPORT.muted);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Saddle Up · Monthly Report · ${data.stableName} · ${data.monthLabel} ${data.year} · Confidential · ${i}/${pageCount}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: "center" }
    );
  }
}

function drawKpiTile(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string
) {
  doc.setFillColor(...REPORT.paper);
  doc.setDrawColor(...REPORT.brass);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, w, h, 1.2, 1.2, "FD");
  doc.setFillColor(...REPORT.racing);
  doc.rect(x, y, 1.2, h, "F");
  doc.setTextColor(...REPORT.muted);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), x + 4, y + 5.5);
  doc.setTextColor(...REPORT.forest);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 4, y + 14);
}

function sectionTitle(doc: jsPDF, text: string, margin: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...REPORT.forest);
  doc.text(text, margin, y);
  return y + 7;
}

function emptyLine(doc: jsPDF, text: string, margin: number, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...REPORT.muted);
  doc.text(text, margin, y);
  doc.setTextColor(...REPORT.forest);
  return y + 6;
}

function tableHeader(
  doc: jsPDF,
  cols: { label: string; x: number }[],
  y: number,
  margin: number,
  pageWidth: number
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...REPORT.muted);
  for (const col of cols) {
    doc.text(col.label, col.x, y);
  }
  y += 3;
  doc.setDrawColor(...REPORT.brass);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  return y + 5;
}

function computeKpis(data: MonthlyReportData) {
  const bookings = data.bookings;
  const completed = bookings.filter((b) =>
    ["completed", "confirmed", "approved"].includes(b.status.toLowerCase())
  ).length;
  const cancelled = bookings.filter((b) =>
    ["cancelled", "canceled", "declined", "no_show", "no-show"].includes(
      b.status.toLowerCase()
    )
  ).length;
  const denom = completed + cancelled;
  const completedRate =
    denom > 0 ? `${Math.round((completed / denom) * 100)}%` : "—";

  const activeSessions = data.trainingSessions.filter(
    (s) => s.punchType !== "rest" && s.punchType !== "medical_rest" && s.punchType !== "medical"
  );
  const trainingMinutes = activeSessions.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );
  const seriousIncidents = data.incidents.filter(
    (i) => (i.severity || "").toLowerCase() === "serious"
  ).length;

  return [
    { label: "Bookings", value: String(bookings.length) },
    { label: "Completed rate", value: completedRate },
    { label: "Sessions logged", value: String(activeSessions.length) },
    {
      label: "Training minutes",
      value: trainingMinutes.toLocaleString("en-US"),
    },
    { label: "New members", value: String(data.newMembers.length) },
    { label: "New riders", value: String(data.newRiders.length) },
    { label: "New horses", value: String(data.newHorses.length) },
    {
      label: "Incidents",
      value:
        seriousIncidents > 0
          ? `${data.incidents.length} (${seriousIncidents} serious)`
          : String(data.incidents.length),
    },
  ];
}

export function generateMonthlyReportPdf(data: MonthlyReportData): ArrayBuffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  // Cover band
  doc.setFillColor(...REPORT.base);
  doc.rect(0, 0, pageWidth, 34, "F");
  doc.setTextColor(...REPORT.mist);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Report", margin, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.stableName, margin, 21);
  doc.setFontSize(9);
  doc.text(`${data.monthLabel} ${data.year}`, margin, 27);
  doc.setFontSize(8);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}`,
    pageWidth - margin,
    13,
    { align: "right" }
  );

  y = 42;
  doc.setTextColor(...REPORT.forest);

  // KPI strip
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("At a glance", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...REPORT.muted);
  doc.text(
    "Key metrics for this period. Detail tables follow.",
    margin,
    y
  );
  y += 6;

  const kpis = computeKpis(data);
  const gap = 3;
  const tileW = (pageWidth - margin * 2 - gap * 3) / 4;
  const tileH = 18;
  kpis.forEach((kpi, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = margin + col * (tileW + gap);
    const ty = y + row * (tileH + gap);
    drawKpiTile(doc, x, ty, tileW, tileH, kpi.label, kpi.value);
  });
  y += tileH * 2 + gap + 12;

  // 1. Bookings
  y = sectionTitle(doc, "1. Classes & lessons", margin, y);
  if (data.bookings.length > 0) {
    y = tableHeader(
      doc,
      [
        { label: "Date", x: margin },
        { label: "Time", x: margin + 32 },
        { label: "Horse", x: margin + 58 },
        { label: "Rider", x: margin + 92 },
        { label: "Trainer", x: margin + 128 },
        { label: "Status", x: margin + 162 },
      ],
      y,
      margin,
      pageWidth
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT.forest);
    for (const b of data.bookings) {
      y = addPageIfNeeded(doc, y, margin);
      const timeStr = `${String(b.startTime).slice(0, 5)}–${String(b.endTime).slice(0, 5)}`;
      doc.text(formatDate(b.bookingDate), margin, y);
      doc.text(timeStr, margin + 32, y);
      doc.text(orDash(b.horseName).slice(0, 14), margin + 58, y);
      doc.text(orDash(b.riderName).slice(0, 14), margin + 92, y);
      doc.text(orDash(b.trainerName).slice(0, 12), margin + 128, y);
      doc.text(orDash(b.status), margin + 162, y);
      y += 6;
    }
  } else {
    y = emptyLine(doc, "No bookings this month.", margin, y);
  }
  y += 10;

  // 2. Training
  y = addPageIfNeeded(doc, y, margin);
  y = sectionTitle(doc, "2. Training sessions", margin, y);
  if (data.trainingSessions.length > 0) {
    y = tableHeader(
      doc,
      [
        { label: "Date", x: margin },
        { label: "Type", x: margin + 32 },
        { label: "Duration", x: margin + 62 },
        { label: "Horse", x: margin + 90 },
        { label: "Rider", x: margin + 130 },
      ],
      y,
      margin,
      pageWidth
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT.forest);
    for (const s of data.trainingSessions) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(formatDate(s.punchDate), margin, y);
      doc.text(PUNCH_LABELS[s.punchType] || s.punchType, margin + 32, y);
      doc.text(`${s.durationMinutes} min`, margin + 62, y);
      doc.text(orDash(s.horseName).slice(0, 15), margin + 90, y);
      doc.text(orDash(s.riderName).slice(0, 15), margin + 130, y);
      y += 6;
    }
  } else {
    y = emptyLine(doc, "No training sessions logged this month.", margin, y);
  }
  y += 10;

  // 3. New members
  y = addPageIfNeeded(doc, y, margin);
  y = sectionTitle(doc, "3. New members", margin, y);
  if (data.newMembers.length > 0) {
    y = tableHeader(
      doc,
      [
        { label: "Name", x: margin },
        { label: "Email", x: margin + 48 },
        { label: "Role", x: margin + 112 },
        { label: "ID on file", x: margin + 150 },
      ],
      y,
      margin,
      pageWidth
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT.forest);
    for (const m of data.newMembers) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(orDash(m.fullName).slice(0, 18), margin, y);
      doc.text(orDash(m.email).slice(0, 24), margin + 48, y);
      doc.text(ROLE_LABELS[m.role] || m.role, margin + 112, y);
      doc.text(m.idCardUrl ? "Yes" : "—", margin + 150, y);
      y += 6;
    }
  } else {
    y = emptyLine(doc, "No new members this month.", margin, y);
  }
  y += 10;

  // 4. New riders
  y = addPageIfNeeded(doc, y, margin);
  y = sectionTitle(doc, "4. New riders", margin, y);
  if (data.newRiders.length > 0) {
    y = tableHeader(
      doc,
      [
        { label: "Name", x: margin },
        { label: "Email", x: margin + 52 },
        { label: "Level", x: margin + 112 },
        { label: "ID on file", x: margin + 150 },
      ],
      y,
      margin,
      pageWidth
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT.forest);
    for (const r of data.newRiders) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(orDash(r.name).slice(0, 20), margin, y);
      doc.text(orDash(r.email).slice(0, 24), margin + 52, y);
      doc.text(orDash(r.level), margin + 112, y);
      doc.text(r.idCardUrl ? "Yes" : "—", margin + 150, y);
      y += 6;
    }
  } else {
    y = emptyLine(doc, "No new riders this month.", margin, y);
  }
  y += 10;

  // 5. New horses
  y = addPageIfNeeded(doc, y, margin);
  y = sectionTitle(doc, "5. New horses", margin, y);
  if (data.newHorses.length > 0) {
    y = tableHeader(
      doc,
      [
        { label: "Name", x: margin },
        { label: "Breed", x: margin + 50 },
        { label: "Gender", x: margin + 100 },
        { label: "Age", x: margin + 130 },
      ],
      y,
      margin,
      pageWidth
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT.forest);
    for (const h of data.newHorses) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(orDash(h.name).slice(0, 18), margin, y);
      doc.text(orDash(h.breed).slice(0, 18), margin + 50, y);
      doc.text(orDash(h.gender), margin + 100, y);
      doc.text(orDash(h.age), margin + 130, y);
      y += 6;
    }
  } else {
    y = emptyLine(doc, "No new horses added this month.", margin, y);
  }
  y += 10;

  // 6. Incidents
  y = addPageIfNeeded(doc, y, margin);
  y = sectionTitle(doc, "6. Incident reports", margin, y);
  if (data.incidents.length > 0) {
    y = tableHeader(
      doc,
      [
        { label: "Date", x: margin },
        { label: "Severity", x: margin + 32 },
        { label: "Horse", x: margin + 62 },
        { label: "Rider", x: margin + 98 },
        { label: "Description", x: margin + 128 },
      ],
      y,
      margin,
      pageWidth
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT.forest);
    for (const i of data.incidents) {
      y = addPageIfNeeded(doc, y, margin);
      const sev = i.severity ? SEVERITY_LABELS[i.severity] || i.severity : "—";
      const desc = (i.description || "—").slice(0, 28);
      doc.text(formatDate(i.incidentDate), margin, y);
      doc.text(sev, margin + 32, y);
      doc.text(orDash(i.horseName).slice(0, 12), margin + 62, y);
      doc.text(orDash(i.riderName).slice(0, 10), margin + 98, y);
      doc.text(
        desc + (i.description && i.description.length > 28 ? "…" : ""),
        margin + 128,
        y
      );
      y += 6;
    }
  } else {
    y = emptyLine(doc, "No incidents reported this month.", margin, y);
  }
  y += 10;

  // 7. Competitions
  y = addPageIfNeeded(doc, y, margin);
  y = sectionTitle(doc, "7. Competitions", margin, y);
  if (data.competitions.length > 0) {
    y = tableHeader(
      doc,
      [
        { label: "Date", x: margin },
        { label: "Event", x: margin + 32 },
        { label: "Location", x: margin + 95 },
        { label: "Horse", x: margin + 140 },
      ],
      y,
      margin,
      pageWidth
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT.forest);
    for (const c of data.competitions) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(formatDate(c.eventDate), margin, y);
      doc.text(orDash(c.eventName).slice(0, 22), margin + 32, y);
      doc.text(orDash(c.location).slice(0, 18), margin + 95, y);
      doc.text(orDash(c.horseName).slice(0, 14), margin + 140, y);
      y += 6;
    }
  } else {
    y = emptyLine(doc, "No competitions this month.", margin, y);
  }

  y += 8;
  y = addPageIfNeeded(doc, y, margin);
  doc.setFontSize(7);
  doc.setTextColor(...REPORT.muted);
  doc.text(
    "Bookings dated in local calendar days. Generation timestamps are UTC.",
    margin,
    y
  );

  drawFooter(doc, data);
  return doc.output("arraybuffer") as ArrayBuffer;
}
