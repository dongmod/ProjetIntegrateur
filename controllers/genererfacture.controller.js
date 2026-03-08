import PDFDocument from "pdfkit"
import supabase from "../config/supabaseClient.js"
import { io } from "../server.js";
import { fa } from "zod/v4/locales";
import path from "path"
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
    const doc = new PDFDocument({ size: "A4", margin: 50 })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=facture-${facture.id}.pdf`
    )

    doc.pipe(res)

    //doc.fontSize(20).text("SMART GARAGE", { align: "center" })
    //doc.moveDown()

const logoPath = path.join("assets", "logo.png")
  doc.image(logoPath, 50, 45, { width: 120 })




  //  Titre facture
  doc
    .fontSize(20)
    //.text("FACTURE", 400, 50)

    doc.text(`Facture No: ${facture.numero}`, { align: "right" })
  //  Infos Garage
  doc
    .fontSize(12)
    .text("SmartGarage Inc.", 50, 150)
    .text("123 Rue Industrielle")
    .text("Montréal, QC")
    .text("Téléphone: 514-438-514")
 doc
    .moveDown()
    .text(`Client: ${facture.client_id}`, { align: "right" })
    .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" })

  //  Ligne séparation
  //doc.moveTo(50, 250).lineTo(550, 250).stroke()

doc.text(`Facture ID: ${facture.id}`, { align: "right" })
    doc.text(`Date: ${new Date(facture.date_emission).toLocaleDateString()}`, { align: "right" })
    doc.moveDown()
    .moveDown()    .moveDown()
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
