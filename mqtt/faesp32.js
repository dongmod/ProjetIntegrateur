

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
