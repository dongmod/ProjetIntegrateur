/*import mqtt from "mqtt"

const client = mqtt.connect("mqtt://localhost:1883", {
  reconnectPeriod: 3000
})

let simulatedDistance = 100
let vehiclePresent = false

function simulateUltrasonic() {
  // La voiture approche progressivement
  if (vehiclePresent) {
    simulatedDistance -= Math.random() * 10
    if (simulatedDistance < 5) simulatedDistance = 5
  } else {
    simulatedDistance += Math.random() * 10
    if (simulatedDistance > 120) simulatedDistance = 120
  }

  return Number(simulatedDistance.toFixed(2))
}

function simulateMagnetic(distance) {
  // Le magnétisme est détecté seulement si la voiture est très proche
  return distance < 30 ? 1 : 0
}

function calculateStatus(distance, magnetic) {
  // Double validation pour éviter faux positifs
  if (distance < 25 && magnetic === 1) {
    return "closed"
  }
  return "open"
}

client.on("connect", () => {
  console.log("🚗 Fake ESP32 connecté au broker MQTT")

  setInterval(() => {

    // Toutes les 30 secondes on change état (voiture arrive / part)
    if (Math.random() > 0.8) {
      vehiclePresent = !vehiclePresent
      console.log("🔄 Changement présence véhicule :", vehiclePresent)
    }

    const distance = simulateUltrasonic()
    const magnetic = simulateMagnetic(distance)
    const statut = calculateStatus(distance, magnetic)

    const fakeData = {
      poste_id: "7fd86b6c-128a-4437-ae14-e32fbd4d4e74",
      distance_cm: distance,
      magnetic_detected: magnetic,
      statut,
      timestamp: new Date().toISOString()
    }

    client.publish("garage/poste", JSON.stringify(fakeData))

    console.log("📡 Données envoyées →", fakeData)

  }, 5000)
})

client.on("error", (err) => {
  console.error(" MQTT Error:", err)
})
*/


import mqtt from "mqtt"

const client = mqtt.connect("mqtt://localhost:1883", {
  reconnectPeriod: 3000
})

const SENSOR_ID = "2c51a9a6-6e18-468d-baab-76f35cd85776" // distance + magnétisme
const SENSORVIN_ID = "af3979a0-791e-4cfe-bcc1-67b795de8c24" // distance + magnétisme


function randomDistance() {
  return Math.floor(Math.random() * 51); 
}
function randomBinary() {
  return Math.random() < 0.5 ? 0 : 1;
}


client.on("connect", () => {
  console.log("Simulateur ESP32 connecté")

  setInterval(() => {
 
    const distance = randomDistance()
    const magnetic = randomBinary()

    

    const payload = { 
      sensor_id: SENSOR_ID,
      valeurmagnetic: magnetic,
      timestamp: new Date().toISOString(),
      distance: distance,
      type: "capteurmagnétique",

    }

    client.publish("garage/capteur", JSON.stringify(payload))
    console.log("distance et magnetisme Envoyé →", payload)

    const payloadVin = { 
      sensor_id: SENSORVIN_ID,
      vin: "LOK-251",
      type: "lecteur_vin",
      timestamp: new Date().toISOString()

    }
    client.publish("garage/capteur", JSON.stringify(payloadVin));
    console.log("VIN envoyé →", payloadVin)


  }, 15000)
})

client.on("error", (err) => {
  console.error(" MQTT Error:", err)
})
