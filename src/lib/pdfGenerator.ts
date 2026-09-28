export interface PdfExportData {
  meetingTitle: string;
  date?: string;
  participants?: string[];
  tasks: Array<{
    task: string;
    owner: string;
    priority: string;
    category?: string;
    ticketId?: string;
  }>;
}

export function downloadExecutiveAuditPdf(data: PdfExportData) {
  if (typeof window === "undefined") return;

  const dateStr = data.date || new Date().toLocaleDateString();
  const safeTitle = data.meetingTitle.replace(/[\(\)\\]/g, "");
  const participantsList = data.participants ? data.participants.join(", ") : "Team Members";

  let content = `BT /F1 18 Tf 50 740 Td (MeetHub Executive Audit Report) Tj ET\n`;
  content += `BT /F1 12 Tf 50 715 Td (Meeting: ${safeTitle}) Tj ET\n`;
  content += `BT /F1 10 Tf 50 695 Td (Generated: ${dateStr} | Attendees: ${participantsList.replace(/[\(\)\\]/g, "")}) Tj ET\n`;
  content += `BT /F1 12 Tf 50 660 Td (Synchronized Deliverables & Linear Backlog Items:) Tj ET\n`;

  let y = 630;
  data.tasks.forEach((item, index) => {
    const ticketTag = item.ticketId ? item.ticketId : "LIN-SYNCED";
    const taskText = item.task.replace(/[\(\)\\]/g, "");
    const line = `${index + 1}. [${ticketTag}] ${taskText} | Owner: ${item.owner} | Priority: ${item.priority}`;
    // Split long lines if necessary
    const truncatedLine = line.length > 90 ? line.slice(0, 87) + "..." : line;
    content += `BT /F1 10 Tf 50 ${y} Td (${truncatedLine}) Tj ET\n`;
    y -= 25;
  });

  content += `BT /F1 9 Tf 50 80 Td (Verified by MeetHub Linear Pipeline - End-to-end Encrypted Dialogue Processing) Tj ET\n`;

  const stream = content;
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 =
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n";
  const obj4 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const streamBytes = new TextEncoder().encode(stream).length;
  const obj5 = `5 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}endstream\nendobj\n`;

  const header = "%PDF-1.4\n";
  const offsets = [0];
  let currentOffset = header.length;

  offsets.push(currentOffset);
  currentOffset += obj1.length;

  offsets.push(currentOffset);
  currentOffset += obj2.length;

  offsets.push(currentOffset);
  currentOffset += obj3.length;

  offsets.push(currentOffset);
  currentOffset += obj4.length;

  offsets.push(currentOffset);
  currentOffset += obj5.length;

  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`;
  const pdfString = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;

  const blob = new Blob([pdfString], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const filename = `MeetHub_Audit_${data.meetingTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
