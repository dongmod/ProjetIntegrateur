import PDFDocument from "pdfkit"

export function generateInvoicePDFBuffer(facture, items) {

  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({ margin: 50 })
    const buffers = []

    doc.on("data", buffers.push.bind(buffers))
    doc.on("end", () => {
      resolve(Buffer.concat(buffers))
    })

    // 🔹 HEADER
    
    doc.text(`Facture No: ${facture.numero}`, { align: "right" })
    doc.fontSize(22).text("SMART GARAGE", { align: "center" })
    doc.moveDown()

    doc.fontSize(12)
    doc.text(`Facture #: ${facture.id}`)
    doc.text(`Date: ${new Date(facture.date_emission).toLocaleDateString()}`)
    doc.moveDown()

    // 🔹 TABLE HEADER
    doc.font("Helvetica-Bold")
    doc.text("Description", 50, doc.y)
    doc.text("Qté", 300, doc.y)
    doc.text("Prix", 350, doc.y)
    doc.text("Total", 450, doc.y)
    doc.moveDown()

    doc.font("Helvetica")

    let totalGeneral = 0

    items.forEach(item => {

      const ligneTotal = item.quantite * item.prix_unitaire
      totalGeneral += ligneTotal

      doc.text(item.description, 50)
      doc.text(item.quantite.toString(), 300)
      doc.text(item.prix_unitaire + " $", 350)
      doc.text(ligneTotal + " $", 450)
      doc.moveDown()
    })

    doc.moveDown()
    doc.font("Helvetica-Bold")
    doc.text(`TOTAL: ${totalGeneral} $`, 400)

    doc.end()
  })
}
