import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ALL_SIZES, GROUPS, groupLabel, type Order } from "./tshirt";

function countBySize(orders: Order[]) {
  return ALL_SIZES.map((size) => ({
    size,
    count: orders.filter((o) => o.size === size).length,
  }));
}

export function exportExcel(orders: Order[]) {
  const wb = XLSX.utils.book_new();

  const rows = orders.map((o) => ({
    Groupe: groupLabel(o.group_slug),
    Prénom: o.first_name,
    Initiales: o.initials,
    Taille: o.size,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "COMMANDES");

  const recap = countBySize(orders).map((r) => ({ Taille: r.size, Total: r.count }));
  recap.push({ Taille: "TOTAL", Total: orders.length });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recap), "RÉCAPITULATIF");

  for (const g of GROUPS) {
    const list = orders.filter((o) => o.group_slug === g.slug);
    const sheet = list.map((o) => ({
      Prénom: o.first_name,
      Initiales: o.initials,
      Taille: o.size,
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(sheet.length ? sheet : [{ Prénom: "", Initiales: "", Taille: "" }]),
      g.label.replace(/[^\w -]/g, "").slice(0, 31),
    );
  }

  XLSX.writeFile(wb, "Commande_Tshirts_ES_Doubs_2026-2027.xlsx");
}

export function exportPdf(orders: Order[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("ES DOUBS — COMMANDE T-SHIRTS 2026/2027", 14, 18);
  doc.setFontSize(11);
  doc.text(`Total : ${orders.length} t-shirts`, 14, 27);

  autoTable(doc, {
    startY: 33,
    head: [["Taille", "Quantité"]],
    body: countBySize(orders).map((r) => [r.size, String(r.count)]),
    theme: "grid",
    headStyles: { fillColor: [227, 30, 36] },
  });

  for (const g of GROUPS) {
    const list = orders.filter((o) => o.group_slug === g.slug);
    if (!list.length) continue;
    autoTable(doc, {
      head: [[`${g.label} — ${list.length} enfants`, "Initiales", "Taille"]],
      body: list.map((o) => [o.first_name, o.initials, o.size]),
      theme: "striped",
      headStyles: { fillColor: [30, 58, 138] },
    });
  }

  doc.save("Commande_Tshirts_ES_Doubs_2026-2027.pdf");
}
