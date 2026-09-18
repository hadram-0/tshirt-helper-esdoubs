import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ALL_SIZES, GROUPS, formatDate, groupLabel, type Order } from "./tshirt";

function countBySize(orders: Order[]) {
  return ALL_SIZES.map((size) => ({
    size,
    count: orders.filter((o) => o.size === size).length,
  }));
}

/** Une même demande enregistrée deux fois à l'identique ne doit compter qu'une fois. */
export function dedupe(orders: Order[]): Order[] {
  const seen = new Set<string>();
  return orders.filter((o) => {
    const key = [
      o.group_slug,
      o.first_name.trim().toLowerCase(),
      o.last_name.trim().toLowerCase(),
      o.initials.trim().toUpperCase(),
      o.size,
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sheetRows(orders: Order[], withGroup: boolean) {
  return orders.map((o) => ({
    ...(withGroup ? { Groupe: groupLabel(o.group_slug) } : {}),
    Prénom: o.first_name,
    Nom: o.last_name,
    Initiales: o.initials,
    Taille: o.size,
    Date: formatDate(o.created_at),
  }));
}

export function exportExcel(allOrders: Order[]) {
  const orders = dedupe(allOrders);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetRows(orders, true)), "COMMANDES");

  const recap = countBySize(orders).map((r) => ({ Taille: r.size, Total: r.count }));
  recap.push({ Taille: "TOTAL", Total: orders.length });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recap), "RÉCAPITULATIF");

  for (const g of GROUPS) {
    const list = orders.filter((o) => o.group_slug === g.slug);
    const rows = sheetRows(list, false);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        rows.length ? rows : [{ Prénom: "", Nom: "", Initiales: "", Taille: "", Date: "" }],
      ),
      g.label.replace(/[^\w -]/g, "").slice(0, 31),
    );
  }

  XLSX.writeFile(wb, "Commande_Tshirts_ES_Doubs_2026-2027.xlsx");
}

export function exportPdf(allOrders: Order[]) {
  const orders = dedupe(allOrders);
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
      head: [[`${g.label} — ${list.length} enfants`, "Nom", "Initiales", "Taille", "Date"]],
      body: list.map((o) => [
        o.first_name,
        o.last_name,
        o.initials,
        o.size,
        formatDate(o.created_at),
      ]),
      theme: "striped",
      headStyles: { fillColor: [30, 58, 138] },
    });
  }

  doc.save("Commande_Tshirts_ES_Doubs_2026-2027.pdf");
}
