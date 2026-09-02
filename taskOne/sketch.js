// ===================================================
// STUDENT TASK: Build a graphical dashboard for Seneye
// ===================================================

// Replace this with your teacher's Cloudflare Worker URL:
const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";

// Toggle to true if you are working offline without network access
const USE_OFFLINE_MOCK = false;

let aquariumData = null;
let lastUpdated = "";

function preload() {
  // Load initial data before setup() runs
  let endpoint = USE_OFFLINE_MOCK ? "sample-data.json" : PROXY_URL;
  aquariumData = loadJSON(endpoint, onDataLoaded, onError);
}

function setup() {
  createCanvas(800, 500);
  
  // Refresh live data every 5 minutes (300,000 ms)
  if (!USE_OFFLINE_MOCK) {
    setInterval(() => {
      loadJSON(PROXY_URL, onDataLoaded, onError);
    }, 300000);
  }
}

function onDataLoaded(data) {
  aquariumData = data;
  lastUpdated = new Date().toLocaleTimeString();
  console.log("Data refreshed successfully:", data);
}

function onError(err) {
  console.error("Failed to load aquarium data. Check proxy URL or network.", err);
}

function draw() {
  background(20, 30, 45); // Dark blue aquarium background

  // 1. Draw Title Header
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Fish Environment Dashboard", 30, 30);

  // Display connection status
  textSize(12);
  fill(150, 200, 255);
  text("Last updated: " + (lastUpdated || "Loading..."), 30, 65);

  // 2. Render Dashboard Graphics
function draw() {
  background(245);
  
  // Call the header
  drawHeader();

  if (dashboardData) {
    // Extract numbers safely from data payload
    let temp = dashboardData.temperature || 0;
    let ph = dashboardData.ph || 0;
    let nh3 = dashboardData.nh3 || 0;

    // Call the card draw functions
    drawMetricCard(50, 130, 230, 320, "Temperature", temp.toFixed(1) + " °C", getMetricStatus("temp", temp));
    drawMetricCard(310, 130, 230, 320, "pH Level", ph.toFixed(2), getMetricStatus("ph", ph));
    drawMetricCard(570, 130, 230, 320, "Ammonia (NH3)", nh3.toFixed(3) + " ppm", getMetricStatus("nh3", nh3));
  } else {
    // Message displayed while waiting for data
    fill(100);
    textSize(18);
    text("Loading sensor data...", width / 2, height / 2);
  }
}

// Example Widget Function: Temperature Card
function drawTempWidget(x, y, tempVal) {
  // Background Card
  fill(35, 48, 68);
  stroke(60, 80, 110);
  rect(x, y, 200, 150, 10);

  // Label
  noStroke();
  fill(180, 200, 220);
  textSize(14);
  text("Water Temp", x + 15, y + 15);

  // Value Display
  fill(100, 220, 255);
  textSize(36);
  text(tempVal + "°C", x + 15, y + 50);
}

// Example Widget Function: Simple Bar Gauge
function drawGaugeWidget(x, y, label, val, minVal, maxVal) {
  fill(35, 48, 68);
  stroke(60, 80, 110);
  rect(x, y, 200, 150, 10);

  noStroke();
  fill(180, 200, 220);
  textSize(14);
  text(label, x + 15, y + 15);

  fill(255);
  textSize(28);
  text(val, x + 15, y + 50);
}

// Dynamic status and visual alerts
function getMetricStatus(type, val) {
  if (type === "temp") {
    if (val < 20.0 || val > 28.0) return { col: color(220, 50, 50), label: "WARNING" };
    if (val >= 22.0 && val <= 26.0) return { col: color(40, 180, 90), label: "OPTIMAL" };
    return { col: color(230, 160, 30), label: "CAUTION" };
  }
  
  if (type === "ph") {
    if (val < 6.5 || val > 8.2) return { col: color(220, 50, 50), label: "WARNING" };
    if (val >= 6.8 && val <= 7.8) return { col: color(40, 180, 90), label: "OPTIMAL" };
    return { col: color(230, 160, 30), label: "CAUTION" };
  }
  
  if (type === "nh3") {
    if (val > 0.05) return { col: color(220, 50, 50), label: "WARNING" };
    if (val <= 0.02) return { col: color(40, 180, 90), label: "OPTIMAL" };
    return { col: color(230, 160, 30), label: "CAUTION" };
  }

  return { col: color(150), label: "UNKNOWN" };
}

}