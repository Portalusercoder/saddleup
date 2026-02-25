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
};

const SEVERITY_LABELS: Record<string, string> = {
  minor: "Minor",
  moderate: "Moderate",
  serious: "Serious",
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
  if (y > 270) {
    doc.addPage();
    return margin + 15;
  }
  return y;
}

export function generateMonthlyReportPdf(data: MonthlyReportData): ArrayBuffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  const headerBg = [41, 37, 36];
  const textDark = [41, 37, 36];
  const textMuted = [120, 113, 108];
  const borderColor = [180, 160, 120];

  // Header
  doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(254, 252, 232);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MONTHLY REPORT", margin, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.stableName, margin, 20);
  doc.text(`${data.monthLabel} ${data.year}`, margin, 26);
  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}`,
    pageWidth - margin,
    14,
    { align: "right" }
  );

  y = 40;
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  // 1. Classes / Bookings
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Classes & Lessons", margin, y);
  y += 8;

  if (data.bookings.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Date", margin, y);
    doc.text("Time", margin + 35, y);
    doc.text("Horse", margin + 55, y);
    doc.text("Rider", margin + 90, y);
    doc.text("Trainer", margin + 130, y);
    doc.text("Status", margin + 170, y);
    y += 6;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    for (const b of data.bookings) {
      y = addPageIfNeeded(doc, y, margin);
      const timeStr = `${String(b.startTime).slice(0, 5)}–${String(b.endTime).slice(0, 5)}`;
      doc.text(formatDate(b.bookingDate), margin, y);
      doc.text(timeStr, margin + 35, y);
      doc.text(orDash(b.horseName).slice(0, 12), margin + 55, y);
      doc.text(orDash(b.riderName).slice(0, 12), margin + 90, y);
      doc.text(orDash(b.trainerName).slice(0, 12), margin + 130, y);
      doc.text(orDash(b.status), margin + 170, y);
      y += 6;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("No bookings this month.", margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  }
  y += 12;

  // 2. New Members
  y = addPageIfNeeded(doc, y, margin);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. New Members", margin, y);
  y += 8;

  if (data.newMembers.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Name", margin, y);
    doc.text("Email", margin + 50, y);
    doc.text("Role", margin + 110, y);
    doc.text("ID on file", margin + 145, y);
    y += 6;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    for (const m of data.newMembers) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(orDash(m.fullName).slice(0, 18), margin, y);
      doc.text(orDash(m.email).slice(0, 22), margin + 50, y);
      doc.text(ROLE_LABELS[m.role] || m.role, margin + 110, y);
      doc.text(m.idCardUrl ? "Yes" : "—", margin + 145, y);
      y += 6;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("No new members this month.", margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  }
  y += 12;

  // 3. New Riders
  y = addPageIfNeeded(doc, y, margin);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. New Riders", margin, y);
  y += 8;

  if (data.newRiders.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Name", margin, y);
    doc.text("Email", margin + 55, y);
    doc.text("Level", margin + 110, y);
    doc.text("ID on file", margin + 145, y);
    y += 6;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    for (const r of data.newRiders) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(orDash(r.name).slice(0, 20), margin, y);
      doc.text(orDash(r.email).slice(0, 22), margin + 55, y);
      doc.text(orDash(r.level), margin + 110, y);
      doc.text(r.idCardUrl ? "Yes" : "—", margin + 145, y);
      y += 6;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("No new riders this month.", margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  }
  y += 12;

  // 4. Training Sessions
  y = addPageIfNeeded(doc, y, margin);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. Training Sessions", margin, y);
  y += 8;

  if (data.trainingSessions.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Date", margin, y);
    doc.text("Type", margin + 35, y);
    doc.text("Duration", margin + 65, y);
    doc.text("Horse", margin + 90, y);
    doc.text("Rider", margin + 130, y);
    y += 6;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    for (const s of data.trainingSessions) {
      y = addPageIfNeeded(doc, y, margin);
      const typeLabel = PUNCH_LABELS[s.punchType] || s.punchType;
      doc.text(formatDate(s.punchDate), margin, y);
      doc.text(typeLabel, margin + 35, y);
      doc.text(`${s.durationMinutes} min`, margin + 65, y);
      doc.text(orDash(s.horseName).slice(0, 15), margin + 90, y);
      doc.text(orDash(s.riderName).slice(0, 15), margin + 130, y);
      y += 6;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("No training sessions logged this month.", margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  }
  y += 12;

  // 5. New Horses
  y = addPageIfNeeded(doc, y, margin);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("5. New Horses", margin, y);
  y += 8;

  if (data.newHorses.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Name", margin, y);
    doc.text("Breed", margin + 50, y);
    doc.text("Gender", margin + 90, y);
    doc.text("Age", margin + 115, y);
    y += 6;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    for (const h of data.newHorses) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(orDash(h.name).slice(0, 18), margin, y);
      doc.text(orDash(h.breed).slice(0, 15), margin + 50, y);
      doc.text(orDash(h.gender), margin + 90, y);
      doc.text(orDash(h.age), margin + 115, y);
      y += 6;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("No new horses added this month.", margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  }
  y += 12;

  // 6. Incidents
  y = addPageIfNeeded(doc, y, margin);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("6. Incident Reports", margin, y);
  y += 8;

  if (data.incidents.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Date", margin, y);
    doc.text("Severity", margin + 35, y);
    doc.text("Horse", margin + 65, y);
    doc.text("Rider", margin + 100, y);
    doc.text("Description", margin + 135, y);
    y += 6;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    for (const i of data.incidents) {
      y = addPageIfNeeded(doc, y, margin);
      const sev = i.severity ? SEVERITY_LABELS[i.severity] || i.severity : "—";
      const desc = (i.description || "—").slice(0, 25);
      doc.text(formatDate(i.incidentDate), margin, y);
      doc.text(sev, margin + 35, y);
      doc.text(orDash(i.horseName).slice(0, 12), margin + 65, y);
      doc.text(orDash(i.riderName).slice(0, 10), margin + 100, y);
      doc.text(desc + (i.description && i.description.length > 25 ? "…" : ""), margin + 135, y);
      y += 6;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("No incidents reported this month.", margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  }
  y += 12;

  // 7. Competitions
  y = addPageIfNeeded(doc, y, margin);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("7. Competitions", margin, y);
  y += 8;

  if (data.competitions.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Date", margin, y);
    doc.text("Event", margin + 35, y);
    doc.text("Location", margin + 90, y);
    doc.text("Horse", margin + 130, y);
    y += 6;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    for (const c of data.competitions) {
      y = addPageIfNeeded(doc, y, margin);
      doc.text(formatDate(c.eventDate), margin, y);
      doc.text(orDash(c.eventName).slice(0, 20), margin + 35, y);
      doc.text(orDash(c.location).slice(0, 18), margin + 90, y);
      doc.text(orDash(c.horseName).slice(0, 15), margin + 130, y);
      y += 6;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("No competitions this month.", margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  }

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `Saddle Up • Monthly Report • ${data.stableName} • ${data.monthLabel} ${data.year} • Confidential`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  return doc.output("arraybuffer") as ArrayBuffer;
}
