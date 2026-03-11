import PDFDocument from "pdfkit";

export async function genererRecuPDF(facture, paiement) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // --- Contenu du reçu ---
      doc.fontSize(20).text("Reçu de paiement", { align: "center" });
      doc.moveDown();

      doc.fontSize(14).text(`Facture ID :`);
      doc.text(`Client : `);
      doc.text(`Montant payé : CAD`);
      doc.text(`Date : ${new Date().toLocaleString()}`);
      doc.moveDown();

      doc.text("Merci pour votre paiement !", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}