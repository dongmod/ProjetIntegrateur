import supabase from '../config/supabaseClient.js'

export const getProfil = async (req, res) => {
    const { user_id } = req.params
    try {
    const { data, error } = await supabase
        .from('profils')
        .select(`*, utilisateurs:user_id (nom, prenom, email, role)`)
        .eq('user_id', user_id)
        .single()

    if (error && error.code !== 'PGRST116') return res.status(400).json(error)
    res.json(data || { user_id })
} catch (err) {
    res.status(500).json({ message: "Erreur serveur", err })
}
}

export const upsertProfil = async (req, res) => {
    const user_id = req.user.user_id
    const { telephone, adresse, date_naissance, photo_url, bio } = req.body


    try {
    const { data, error } = await supabase
        .from('profils')
        .upsert([{
        user_id,
        telephone:      telephone      || null,
        adresse:        adresse        || null,
        date_naissance: date_naissance || null,  
        photo_url:      photo_url      || null,
        bio:            bio            || null,
        updated_at:     new Date().toISOString()
    }], { onConflict: 'user_id' })
        .select()
    
    console.log("UPSERT ERROR:", error)
    console.log("UPSERT DATA:", data)

    if (error) return res.status(400).json(error)
    res.json(data[0])
} catch (err) {
    res.status(500).json({ message: "Erreur serveur", err })
}
}