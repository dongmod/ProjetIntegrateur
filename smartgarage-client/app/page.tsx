'use client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-400">SmartGarage</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.open('http://localhost:5173', '_blank')}
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Espace Admin
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Se connecter
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              S'inscrire gratuitement
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-sm font-semibold mb-6">
            Système IoT de gestion de garage
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            Gérez votre garage <br />
            <span className="text-blue-400">intelligemment</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            SmartGarage connecte les clients, les employés et les gestionnaires 
            en temps réel grâce à l'IoT. Prenez des rendez-vous, suivez vos 
            réparations et payez en ligne — tout en un seul endroit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg transition flex items-center gap-2 justify-center"
            >
              Je crée mon compte gratuitement
              <img src="/assets/cliquez-sur.png" className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-lg transition"
            >
              J'ai déjà un compte
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-4 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><img src="/assets/verifier.png" className="w-4 h-4" /> Gratuit</span>
            <span className="flex items-center gap-1"><img src="/assets/verifier.png" className="w-4 h-4" /> Sans engagement</span>
            <span className="flex items-center gap-1"><img src="/assets/verifier.png" className="w-4 h-4" /> Accès immédiat</span>
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y border-gray-800 bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-400">38</p>
            <p className="text-gray-400 text-sm mt-1">Features développées</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">3</p>
            <p className="text-gray-400 text-sm mt-1">Développeurs</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">4</p>
            <p className="text-gray-400 text-sm mt-1">Semaines de développement</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">100%</p>
            <p className="text-gray-400 text-sm mt-1">Tests E2E réussis</p>
          </div>
        </div>
      </section>

      {/* BÉNÉFICES CLÉS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Une plateforme complète pour les clients, les employés et les gestionnaires
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-600 transition">
              <img src="/assets/ajouter-un-evenement.png" className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Rendez-vous en ligne</h3>
              <p className="text-gray-400">Choisissez votre véhicule, le service et un créneau disponible en quelques clics. Confirmation par email automatique.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-600 transition">
              <img src="/assets/traitement-des-commandes.png" className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Suivi en temps réel</h3>
              <p className="text-gray-400">Suivez l'avancement de votre réparation en direct grâce à Socket.IO. Soyez notifié dès que votre véhicule est prêt.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-600 transition">
              <img src="/assets/carte-bancaire.png" className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Paiement sécurisé</h3>
              <p className="text-gray-400">Payez vos factures en ligne via Stripe. Recevez votre reçu par email et téléchargez votre facture en PDF.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Toutes les fonctionnalités
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

            {/* Frontend Client */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <img src="/assets/interface-web.png" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h3 className="text-lg font-bold">Interface Client</h3>
                  <p className="text-blue-400 text-sm">Stéphanie Romero-Vasquez</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">- Authentification et profil</li>
                <li className="flex items-center gap-2">- Gestion des véhicules + scan VIN</li>
                <li className="flex items-center gap-2">- Prise de rendez-vous</li>
                <li className="flex items-center gap-2">- Créneaux disponibles</li>
                <li className="flex items-center gap-2">- Facturation et paiement Stripe</li>
                <li className="flex items-center gap-2">- Suivi en temps réel</li>
                <li className="flex items-center gap-2">- Notifications push</li>
                <li className="flex items-center gap-2">- Historique des services</li>
                <li className="flex items-center gap-2">- Évaluations et avis</li>
                <li className="flex items-center gap-2">- Photo de profil</li>
                <li className="flex items-center gap-2">- Interface responsive</li>
                <li className="flex items-center gap-2">- 38 tests E2E Playwright</li>
              </ul>
            </div>

            {/* Backend */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <img src="/assets/back-end.png" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h3 className="text-lg font-bold">Backend & IoT</h3>
                  <p className="text-blue-400 text-sm">Marios Dongmo Lemofouet</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">- API REST complète</li>
                <li className="flex items-center gap-2">- Authentification JWT</li>
                <li className="flex items-center gap-2">- Gestion des rôles</li>
                <li className="flex items-center gap-2">- Base de données Supabase</li>
                <li className="flex items-center gap-2">- Intégration MQTT IoT</li>
                <li className="flex items-center gap-2">- WebSocket Socket.IO</li>
                <li className="flex items-center gap-2">- Webhook Stripe</li>
                <li className="flex items-center gap-2">- Emails automatiques</li>
                <li className="flex items-center gap-2">- Planificateur de tâches</li>
                <li className="flex items-center gap-2">- Validation Zod</li>
                <li className="flex items-center gap-2">- Capteurs ESP32</li>
                <li className="flex items-center gap-2">- Upload d'images</li>
              </ul>
            </div>

            {/* Frontend Admin */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <img src="/assets/interface-web.png" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h3 className="text-lg font-bold">Interface Admin</h3>
                  <p className="text-blue-400 text-sm">Vaneza Castro Gaytan</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">- Connexion gestionnaire</li>
                <li className="flex items-center gap-2">- Gestion des employés</li>
                <li className="flex items-center gap-2">- Calendrier des RDV</li>
                <li className="flex items-center gap-2">- Glisser-déposer RDV</li>
                <li className="flex items-center gap-2">- Détection conflits créneaux</li>
                <li className="flex items-center gap-2">- Dashboard IoT temps réel</li>
                <li className="flex items-center gap-2">- Analytics IoT</li>
                <li className="flex items-center gap-2">- Liste tâches employé</li>
                <li className="flex items-center gap-2">- Vue Kanban tâches</li>
                <li className="flex items-center gap-2">- Commentaires employé</li>
                <li className="flex items-center gap-2">- Scan QR rendez-vous</li>
                <li className="flex items-center gap-2">- Dashboard analytique</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Technologies utilisées</h2>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Next.js', 'React', 'Node.js', 'Express', 'Supabase',
              'PostgreSQL', 'Socket.IO', 'Stripe', 'MQTT', 'JWT',
              'Tailwind CSS', 'Playwright', 'Tesseract.js', 'Zod',
              'Nodemailer', 'ESP32', 'Chart.js', 'Bcrypt'
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ÉQUIPE */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Notre équipe</h2>
          <p className="text-gray-400 mb-12">Collège Ahuntsic — 420-321-AH Projet Intégrateur</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">S</div>
              <h3 className="font-bold text-lg">Stéphanie Romero-Vasquez</h3>
              <p className="text-blue-400 text-sm mb-3">Frontend Client</p>
              <p className="text-gray-400 text-sm">Next.js · React · Socket.IO · Playwright · Stripe</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">M</div>
              <h3 className="font-bold text-lg">Marios Dongmo Lemofouet</h3>
              <p className="text-blue-400 text-sm mb-3">Backend & IoT</p>
              <p className="text-gray-400 text-sm">Node.js · Supabase · MQTT · WebSocket · JWT</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">V</div>
              <h3 className="font-bold text-lg">Vaneza Castro Gaytan</h3>
              <p className="text-blue-400 text-sm mb-3">Frontend Admin</p>
              <p className="text-gray-400 text-sm">Next.js · Chart.js · Socket.IO · Kanban</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Prêt à essayer SmartGarage?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Créez votre compte gratuitement et gérez votre expérience garage en toute simplicité.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl transition flex items-center gap-2 mx-auto"
          >
            Je m'inscris maintenant
            <img src="/assets/cliquez-sur.png" className="w-5 h-5" />
          </button>
          <p className="text-gray-500 text-sm mt-4 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><img src="/assets/verifier.png" className="w-4 h-4" /> Gratuit</span>
            <span className="flex items-center gap-1"><img src="/assets/verifier.png" className="w-4 h-4" /> Sans carte de crédit</span>
            <span className="flex items-center gap-1"><img src="/assets/verifier.png" className="w-4 h-4" /> Accès immédiat</span>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-500 text-sm">
        <p>© 2026 SmartGarage — Collège Ahuntsic · 420-321-AH Projet Intégrateur</p>
        <p className="mt-2">Stéphanie Romero-Vasquez · Marios Dongmo Lemofouet · Vaneza Castro Gaytan</p>
      </footer>

    </div>
  )
}