import { jsPDF } from "jspdf";

interface HealthLog {
  id: string | number;
  type: string;
  date: string;
  description: string | null;
  cost: number | null;
  nextDue: string | null;
  recoveryStatus: string | null;
}

interface Horse {
  id: string | number;
  name: string;
  gender: string;
  age: number | null;
  breed: string | null;
  owner: string | null;
  color: string | null;
  markings: string | null;
  height: number | null;
  microchip: string | null;
  ueln: string | null;
  dateOfBirth: string | null;
  registeredName?: string | null;
  passportNumber?: string | null;
  feiId?: string | null;
  studbook?: string | null;
  horseCategory?: string | null;
  sireName?: string | null;
  damName?: string | null;
  countryOfBirth?: string | null;
  temperament: string | null;
  skillLevel: string | null;
  trainingStatus: string | null;
  ridingSuitability: string | null;
  healthLogs: HealthLog[];
}

const HEALTH_LABELS: Record<string, string> = {
  vet: "Vet Visit",
  vaccination: "Vaccination",
  deworming: "Deworming",
  farrier: "Farrier",
  injury: "Injury",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}

function orDash(val: string | number | null | undefined): string {
  return val != null && val !== "" ? String(val) : "—";
}

export function generateHorsePassportPdf(horse: Horse): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // Colors
  const headerBg = [139, 90, 43]; // amber-800
  const textDark = [41, 37, 36]; // amber-950
  const textMuted = [120, 113, 108]; // amber-700
  const borderColor = [180, 160, 120]; // amber-200

  // Header
  doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(254, 252, 232); // amber-50
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("HORSE PASSPORT", margin, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Digital identification document • Saddle Up", margin, 18);
  const passportId = typeof horse.id === "string" ? horse.id.slice(0, 8).toUpperCase() : String(horse.id).padStart(6, "0");
  doc.text(`Passport ID: #${passportId}`, pageWidth - margin, 12, { align: "right" });
  if (horse.ueln) {
    doc.text(`UELN: ${horse.ueln}`, pageWidth - margin, 18, { align: "right" });
  }

  y = 35;
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  // Section I: Identification
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Section I — Identification of the animal", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const idFields: [string, string | number | null | undefined][] = [
    ["1. Barn name", horse.name],
    ["2. Registered name", horse.registeredName],
    ["3. Horse type", horse.horseCategory],
    ["4. Sex", horse.gender],
    ["5. UELN", horse.ueln],
    ["6. Microchip", horse.microchip],
    ["7. Passport №", horse.passportNumber],
    ["8. FEI ID", horse.feiId],
    ["9. Studbook", horse.studbook],
    ["10. Breed", horse.breed],
    ["11. Colour", horse.color],
    ["12. Markings", horse.markings],
    [
      "13. Date of birth",
      horse.dateOfBirth
        ? formatDate(horse.dateOfBirth)
        : horse.age != null
          ? `~${new Date().getFullYear() - horse.age}`
          : null,
    ],
    ["14. Height (cm)", horse.height],
    ["15. Sire", horse.sireName],
    ["16. Dam", horse.damName],
    ["17. Country / place of birth", horse.countryOfBirth],
  ];

  idFields.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(String(label), margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(orDash(value), margin + 45, y);
    y += 6;
  });

  y += 5;

  // Owner section
  doc.setFont("helvetica", "bold");
  doc.text("Owner & Registration", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  const ownerFields = [
    ["Registered owner", horse.owner],
    ["Temperament", horse.temperament],
    ["Skill level", horse.skillLevel],
    ["Training status", horse.trainingStatus?.replace(/_/g, " ")],
    ["Riding suitability", horse.ridingSuitability],
  ];

  ownerFields.forEach(([label, value]) => {
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(String(label), margin, y);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(orDash(value), margin + 45, y);
    y += 6;
  });

  y += 10;

  // Section II: Vaccinations & Health Records
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Section II — Vaccinations & veterinary treatments", margin, y);
  y += 10;

  if (horse.healthLogs && horse.healthLogs.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("Date", margin, y);
    doc.text("Type", margin + 35, y);
    doc.text("Description", margin + 70, y);
    doc.text("Cost", margin + 130, y);
    doc.text("Next due", margin + 155, y);
    y += 6;

    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    horse.healthLogs.forEach((log) => {
      if (y > 265) {
        doc.addPage();
        y = 15;
      }

      const typeLabel = HEALTH_LABELS[log.type] || log.type;
      const desc = (log.description || "—").length > 50
        ? (log.description || "").slice(0, 47) + "…"
        : log.description || "—";
      const cost = log.cost != null ? `$${log.cost}` : "—";
      const nextDue = log.nextDue ? formatDate(log.nextDue) : "—";

      doc.text(formatDate(log.date), margin, y);
      doc.text(typeLabel, margin + 35, y);
      doc.text(desc, margin + 70, y, { maxWidth: 55 });
      doc.text(cost, margin + 130, y);
      doc.text(nextDue, margin + 155, y);
      y += 8;
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("No health records on file.", margin, y);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `Generated by Saddle Up • ${new Date().toLocaleDateString()} • This document is for record-keeping purposes only.`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  doc.save(`horse-passport-${horse.name.replace(/\s+/g, "-")}-health-records.pdf`);
}
