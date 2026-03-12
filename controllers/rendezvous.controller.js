import supabase from '../config/supabaseClient.js'
import { emitRdvUpdate,emitRdvDelete ,emitRdvCreate} from '../websocket/service.js';

import { confirmationEmail } from '../utils/confirmationrdv.js';
import { notificatiordvtermine } from '../utils/notificatiordvtermine.js';



// Controller pour gérer les rendez-vous











export const createRendezVous = async (req, res) => {
  const userId = req.user.user_id // modification pour user_id 

  const { vehicule_id, garage_id, date_rendezvous, type_service } = req.body
console.log("REQ.USER =", req.user);
  try {

    // véhicule appartient au client
    const { data: vehicule, error: vehiculeError } = await supabase
      .from('vehicules')
      .select('*')
      .eq('id', vehicule_id)
      .eq('client_id', userId)
      .single()
console.log("vehicule =", vehicule_id);
console.log("USER ID =", userId);
console.log("Résultat Supabase vehicule =", vehicule, vehiculeError);
    if (vehiculeError || !vehicule) {
      return res.status(403).json({ message: "Véhicule invalide pour ce client" })
    }

    //  conflit horaire
    const { data: conflit } = await supabase
      .from('rendez_vous')
      .select('*')
      .eq('garage_id', garage_id)
      .eq('date_rendezvous', date_rendezvous)

    if (conflit.length > 0) {
      return res.status(400).json({ message: "Créneau déjà réservé" })
    }

//verifier si rendez vous existe pour ce vehicule et ce garage à cette date
    const { data: existingRdv } = await supabase
      .from('rendez_vous')
      .select('*')
      .eq('vehicule_id', vehicule_id)
      //.eq('garage_id', garage_id)
      .eq("statut", "planifie")
      .eq('date_rendezvous', date_rendezvous)

    if (existingRdv && existingRdv.length > 0) {
      return res.status(400).json({ message: "Rendez-vous déjà existant pour ce véhicule et ce garage à cette date" })
    }
    // insérer rendez-vous
    const { data: rdvData, error: rdvError } = await supabase
      .from('rendez_vous')
      .insert([{  vehicule_id,  garage_id,  date_rendezvous,  type_service,  statut: 'planifie'}])
      .select()
    if (rdvError) {
      return res.status(400).json({ message: "Erreur lors de la création du rendez-vous", error: rdvError })
}
//image upload pour les rendez-vous
const files = req.files|| [];
let imageUrls = []
console.log("FILES =", req.files)
for (const file of files) {

  const fileName = `Avant_rdv-${Date.now()}-${file.originalname}`

  const { errorup } = await supabase.storage
    .from("rendezvous-images")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype
    })

  if (errorup) {
    return res.status(400).json(errorup)
  }

  const imageUrl =
  `${process.env.SUPABASE_URL}/storage/v1/object/public/rendezvous-images/${fileName}`

  imageUrls.push(imageUrl)
}

// insérer les images liées au rendez-vous
    for (const url of imageUrls) {

  await supabase
    .from("rendezvous_images")
    .insert([
      {
        rendezvous_id: rdvData[0].id,
        image_url: url
      }
    ])
}



//appel du socket pour mettre a jour le dashboard en temps réel
emitRdvCreate(rdvData[0].id, rdvData[0]); 


      //notifier client par email (à faire)
    const { data: userrdv } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('user_id', vehicule.client_id)
      .single()
      

  //if (error) return res.status(400).json(error)
await confirmationEmail(userrdv.email, type_service, date_rendezvous);

return res.status(201).json({
  message: "Rendez-vous créé avec succès",
  rendez_vous: rdvData
});

} catch (error) {
  console.error("Erreur serveur :", error);
  return res.status(500).json({
    message: "Erreur serveur",
    error: error.message
  });
}
};


export const getMesRendezVous = async (req, res) => {
  const userId = req.user.user_id
/*
  const { data, error } = await supabase
    .from('rendez_vous')
    .select(`
      *,
      vehicules (
        marque,
        modele,
        plaque
      )
    `)
    .in('vehicule_id',
      (
        await supabase
          .from('vehicules')
          .select('id')
          .eq('client_id', userId)
      ).data.map(v => v.id)
    )*/
//
const { data, error } = await supabase
  .from("rendez_vous")
  .select(`
    *,
    vehicules (
      marque,
      modele,
      plaque
    ),
    rendezvous_images (
      id,
      image_url,
      created_at
    )
  `)
  .in(
    "vehicule_id",
    (
      await supabase
        .from("vehicules")
        .select("id")
        .eq("client_id", userId)
    ).data.map(v => v.id)
  );


  if (error) return res.status(400).json(error)
 // si data est un tableau vide, retourner un message indiquant que le client n'a pas de rendez-vous
  if (data.length === 0) {
    return res.json({ message: "Vous n'avez aucun rendez-vous prévu." })
  }
  res.json(data)
}
export const deleteRendezVous = async (req, res) => {
  const rdvId = req.params.id



   //recuperer la date du rendez-vous pour la notification
   const { data: rdv, error: rdvError1 } = await supabase
   .from('rendez_vous')
   .select('date_rendezvous')
   .eq('id', rdvId)
   .single()
    if (rdvError1 || !rdv) {
      return res.status(404).json({ message: "Rendez-vous introuvable" })
    }
    const now = new Date()
    const rdvDate = new Date(rdv.date_rendezvous)

    if (rdvDate - now < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "Impossible d'annuler un rendez-vous à moins de 24h de l'heure prévue" })
    }


  const { error } = await supabase
    .from('rendez_vous')
    .delete()
    .eq('id', rdvId)
    
// mise a jou du socket dasboard rendez-vous
emitRdvDelete(rdvId, { deleted: true });

  if (error) return res.status(400).json(error)

  res.json({ message: "Rendez-vous supprimé" })
}


/// ===== Nouveau funtion pour obtenir toutes les rendez-vous d'un garage (pour le dashboard du garage)
export const getAllRendezVous = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rendez_vous')
      .select(`
      *,
        vehicules (
          marque,
          modele,
          plaque,
          client_id
        )
      `)
      .order('date_rendezvous', { ascending: true })  

    if (error) {
      console.log("SUPASE ERROR getAllRendezVous:", error);
      return res.status(400).json(error)
    }
      res.json(data)
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", err })  
  }
} 

export const updateRendezVous = async (req, res) => {
  const rdvId = req.params.id
  const { date_rendezvous, type_service, statut } = req.body


const { data: rdvupdate } = await supabase 
   .from('rendez_vous')
   .select('date_rendezvous')
   .eq('id', rdvId)
   .single()
    if ( !rdvupdate) {
      return res.status(404).json({ message: "Rendez-vous introuvable" })
    }
    const now = new Date()
    const rdvDateupdate = new Date(rdvupdate.date_rendezvous)

    if (rdvDateupdate - now < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "Impossible de modifier un rendez-vous à moins de 24h de l'heure prévue" })
    }


  const { data, error } = await supabase
    .from('rendez_vous')
    .update({ date_rendezvous, type_service, statut })
    .eq('id', rdvId)
    .select()
// mise a jou du socket dasboard rendez-vous
emitRdvUpdate(rdvId, data[0]);

  if (error) return res.status(400).json(error)

  res.json(data[0])
}


/// NOUVEAU -- Chercher de craneaux dispo pour un service donne 
export const getCreaneauxDisponibles = async (req,res) => {
  const {garage_id,id,date_debut, date_fin} = req.query 

  try{
    //Obtenir duration du service 
    const {data:service} =await supabase 
    .from ('services')
    .select('duree')
    .eq('id',id)
    .single()

    const time = service?.duree || 60

    // 2. Obtenir horaires du garage 
    const {data:horaires} = await supabase
    .from('horaires_garages')
    .select('*')
    .eq('garage_id',garage_id)
    .eq('actif'.true)

    //3. Obtener RDV existens en periode 
    const {data:rdvExistants} =await supabase 
    .from('rendez-vous') 
    .select('employe_id, poste_travail_id, heure_debut, heure_fin, date_rendez')
    .gte ('date_rendez-vous', date_debut)
    .lte ('date_rendezvous',date_fin)
    .neq('statut', 'annule')

    //4. Obtener employes disponibles 
    const { data: employes }  = await supabase
    .from ('utilisateurs')
    .select ('user_id, nom,prenom')
    .eq('role','employe')

    //5. Obtener postes de travail 
    const {data:postes} = await supabse 
    .from('postes_travail')
    .select('*')

    //Generate slots dispo 
    const slots = genererSlots({
      horaires, rdvExistants, employes, postes,duree, date_debut,date_fin}) 
      res.json({slots, duree:time})
    }catch (err) {
      res.status(500).json({message: "ERREUR SERVEUR", err})
    }
  }
  
  //HELPER -GENERA LOS SLOTS DISPONIBLES 
function genererSlots ({horaires, rdvExistants,employes,postes,time,date_debut,date_fin}) {
  const slots= []
  const start = new Date(date_debut)
  const end= new Date(date_fin)

  for (let d= new Date(start); d <= end; d.setDate(d.getDate() +1)) {
    const jourSemaine = (d.getDay()+6) %7 //0=lundi 
    const horaire = horaire.find(h =>h.jour ===jourSemaine)
    if (!horaire) continue 

    const dateStr=d.toISOString().split('T')[0]
    const[hOuvre,mOuvre] =horaire.heure_ouverture.split(':').map(Number)
    const[hFerme,mFerme]=horaire.heure_fermeture.split(':').map(Number)
    // Generer slots de duree minutos dans l'horaire 
    let current=hOuvre*60 +mOuvre
    const fermeture=hFerme *60 +mFerme

    while (current +time <= fermeture){
      const heureDebut= `${String(Math.floor(current/60)).padStart(2,'0')}:${String(current%60).padStart(2,'0')}`
      const heureFin   = `${String(Math.floor((current+time)/60)).padStart(2,'0')}:${String((current+time)%60).padStart(2,'0')}`

      // Verificar empleado disponible
    const employeLibre = employes.find(emp => {
        return !rdvExistants.some(rdv =>
          rdv.employe_id === emp.user_id &&
          rdv.date_rendezvous?.slice(0,10) === dateStr &&
          heuresSeSuperposent(rdv.heure_debut, rdv.heure_fin, heureDebut, heureFin)
        )
      })

      // Verificar poste disponible
      const posteLibre = postes.find(p => {
        return !rdvExistants.some(rdv =>
          rdv.poste_travail_id === p.id &&
          rdv.date_rendezvous?.slice(0,10) === dateStr &&
          heuresSeSuperposent(rdv.heure_debut, rdv.heure_fin, heureDebut, heureFin)
        )
      })
      if (employeLibre && posteLibre) {
        slots.push({
          date: dateStr,
          heure_debut: heureDebut,
          heure_fin: heureFin,
          employe_suggere: employeLibre,
          poste_suggere: posteLibre,
        })
      }

      current += 30 // intervalo de 30 min entre slots
    }
  }

  return slots.slice(0, 10) // máximo 10 slots sugeridos
}
function heuresSeSuperposent(debut1, fin1, debut2, fin2) {
  if (!debut1 || !fin1) return false
  return debut1 < fin2 && fin1 > debut2
}

////// NOUVEAU FONCTION pour gestionnaire assigner les rendez-vous a employes 
export const assignerRendezVous = async (req,res) => {
  const rdvId=req.params.id 
  const {employe_id, 
    poste_travail_id,
    date_rendezvous} = req.body
  console.log("ASSIGNER RDV - body:", req.body)  // ← Nouveau pour verifier si le rdv est modiffie 
  console.log("ASSIGNER RDV - id:", rdvId) 
  
  const {data,error} =await supabase 
    .from('rendez_vous')
    .update({employe_id, poste_travail_id,date_rendezvous})
    .eq('id,rdvId')
    .select()
  console.log("ASSIGNER ERROR:", error)  // ← New 
  console.log("ASSIGNER DATA:", data)    // ← New 

    if (error) return res.status(400).json(error)
      res.json(data[0])
}



export const RendezVousAll = async (req, res) => {

  const { data, error } = await supabase
    .from('rendez_vous')
    .select(`
      *,
      vehicules (
        marque,
        modele,
        plaque
      )
    `)
    .in('vehicule_id',
      (
        await supabase
          .from('vehicules')
          .select('id')
      ).data.map(v => v.id)
    )

  if (error) return res.status(400).json(error)
  if (data.length === 0) {
    return res.json({ message: "Vous n'avez aucun rendez-vous prévu." })
  }
  res.json(data)
}


//////terminer rendez-vous

export async function terminerRendezVous(rendezvous_id) {
  try {
console.log(" transmission pour notif:", rendezvous_id);
    // 1) Vérifier que le rendez-vous existe 
    const { data: rdv, error } = await supabase
      .from("rendez_vous")
      .select("id, statut,vehicule_id")
      .eq("id", rendezvous_id)
      .single();

    if (error || !rdv) {
      return { success: false, code: 404, message: "Rendez-vous n'existe pas" };
}
/*
    // 2) Vérifier que le statut permet la transition
    if (rdv.statut == "planifie") {
          return { success: false, code: 400, message: "Ce rendez-vous ne peut pas être terminé" };
    }else 
      if (rdv.statut == "termine") {      return { success: false, code: 400, message: "Ce rendez-vous est déjà terminé" };
    }

*/
    // Récupérer les infos du client pour la notification
    const { data: userrdv } = await supabase
      .from('vehicules')
      .select('id, client_id')
      .eq('id', rdv.vehicule_id)
      .single()
   // Récupérer les infos du client pour la notification
    const { data: userrdv2 } = await supabase
      .from('utilisateurs')
      .select('email')
      .eq('user_id', userrdv.client_id)
      .single()
    //inserer date derniere maintenance dans la table des vehicules
    const { error: updateError } = await supabase
      .from("vehicules")
      .update({ date_derniere_maint: new Date().toISOString().split('T')[0] })
      .eq("id", rdv.vehicule_id);
if (updateError) {
      return res.status(500).json({ message: "Erreur lors de la mise à jour de la date de dernière maintenance du véhicule" });
     }
    // 4) Notification (email, MQTT, etc.)
    await notificatiordvtermine(userrdv2.email)
   // mettre a jour la table des notifications pour le client
    await supabase
      .from("notifications")
      .insert({
        utilisateur_id: userrdv.client_id,
        message: "Votre rendez-vous est terminé. Vous pouvez venir récupérer votre véhicule.",
        type: "mail",
        created_at: new Date().toISOString()
      })
    return { success: true, message: "Rendez-vous marqué comme terminé" };


  } catch (err) {
    console.log("ERREUR SERVEUR:", err);
    return { success: false, code: 500, message: "Erreur serveur" };

  }
} 
