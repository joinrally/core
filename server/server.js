const WebSocket = require("ws")
const dotenv = require("dotenv")
const crypto = require("crypto")

dotenv.config()

const port = process.env.WEBSOCKET_PORT || 8080

const wss = new WebSocket.Server({ port })

const vehicles = {
  1: { id: "1", name: "My Tesla Model S", model: "Model S", status: "active" },
  2: { id: "2", name: "Family Model Y", model: "Model Y", status: "inactive" },
  3: { id: "3", name: "Work Model 3", model: "Model 3", status: "active" },
}

function generateMetrics(vehicleId) {
  return {
    type: "metrics",
    metrics: {
      speed: crypto.randomInt(0, 120),
      packVoltage: 350 + Math.random() * 50,
      packCurrent: -100 + Math.random() * 400,
      acceleration: -0.3 + Math.random() * 0.6,
      brakePedal: Math.random(),
      timestamp: new Date().toISOString(),
    },
  }
}

function generateScore(vehicleId) {
  return {
    type: "score",
    score: {
      energyScore: 60 + Math.random() * 40,
      safetyScore: 60 + Math.random() * 40,
      usageScore: 60 + Math.random() * 40,
      total: 60 + Math.random() * 40,
      timestamp: new Date().toISOString(),
    },
  }
}

wss.on("connection", (ws, req) => {
  const vehicleId = req.url.split("/").pop()
  console.log(`New connection for vehicle ${vehicleId}`)

  if (!vehicles[vehicleId]) {
    ws.close(1008, "Vehicle not found")
    return
  }

  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(generateMetrics(vehicleId)))

      if (Math.random() < 0.2) {
        // Send score update less frequently
        ws.send(JSON.stringify(generateScore(vehicleId)))
      }
    }
  }, 1000)

  ws.on("close", () => {
    console.log(`Connection closed for vehicle ${vehicleId}`)
    clearInterval(interval)
  })
})

console.log(`WebSocket server is running on ws://localhost:${port}`)

