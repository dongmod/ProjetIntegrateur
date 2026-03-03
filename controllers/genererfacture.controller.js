import PDFDocument from "pdfkit"
import supabase from "../config/supabaseClient.js"
import { io } from "../server.js";
export const downloadFacture = async (req, res) => {

  try {

    const { id } = req.params

    // rechercher en bd la facture et ses items
    const { data: facture, error } = await supabase
      .from("factures")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !facture) {
      return res.status(404).json({ message: "Facture introuvable" })
    }

    // Récupérer items
    const { data: items } = await supabase
      .from("facture_items")
      .select("*")
      .eq("facture_id", id)

    // Générer PDF
    const doc = new PDFDocument()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=facture-${facture.id}.pdf`
    )

    doc.pipe(res)

    doc.fontSize(20).text("SMART GARAGE", { align: "center" })
    doc.moveDown()

    doc.text(`Facture ID: ${facture.id}`)
    doc.text(`Date: ${new Date(facture.date_emission).toLocaleDateString()}`)
    doc.moveDown()

    let total = 0

    items.forEach(item => {

      const ligneTotal = item.quantite * item.prix_unitaire
      total += ligneTotal

      doc.text(
        `${item.description} - ${item.quantite} x ${item.prix_unitaire}$ = ${ligneTotal}$`
      )
    })

    doc.moveDown()
    doc.text(`TOTAL: ${total}$`, { align: "right" })

    doc.end()

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" })
  }
}
