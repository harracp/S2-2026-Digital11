// ===================================================
// STUDENT TASK: Make a dashboard showing the required information for the fish
// ===================================================

// Replace this with your teacher's Cloudflare Worker URL:
const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";

// Toggle to true if you are working offline without network access
const USE_OFFLINE_MOCK = false;

const REFRESH_INTERVAL_MS = 300000; // 5 minutes

let aquariumData = null;
let connectionStatus = "connecting"; // "connected" | "connecting" | "error"
let lastUpdated = null;

// Safe operating ranges, plus gauge min/max for drawing the bar
const RANGES = {
  temp: { safeMin: 22.0, safeMax: 26.0, warnMin: 20.0, warnMax: 28.0, gaugeMin: 15, gaugeMax: 32 },
  ph:   { safeMin: 6.8,  safeMax: 7.8,  warnMin: 6.5,  warnMax: 8.2,  gaugeMin: 5,  gaugeMax: 9 },
  nh3:  { safeMin: 0.00, safeMax: 0.02, warnMin: 0,    warnMax: 0.05, gaugeMin: 0,  gaugeMax: 0.1 }
};

function preload() {
  // Load initial data before setup() runs
  let endpoint = USE_OFFLINE_MOCK ? "sample-data.json" : PROXY_URL;
  aquariumData = loadJSON(endpoint, onDataLoaded, onError);
}

function setup() {
  createCanvas(800, 500);
  textFont('Helvetica');

  // Refresh live data every 5 minutes
  if (!USE_OFFLINE_MOCK) {
    setInterval(() => {
      connectionStatus = "connecting";
      loadJSON(PROXY_URL, onDataLoaded, onError);
    }, REFRESH_INTERVAL_MS);
  }
}

function onDataLoaded(data) {
  aquariumData = data;
  connectionStatus = "connected";
  lastUpdated = new Date();
  console.log("Data refreshed successfully:", data);
}

function onError(err) {
  connectionStatus = "error";
  console.error("Failed to load aquarium data. Check proxy URL or network.", err);
}

function draw() {
  background(20, 30, 45); // Dark blue aquarium background

  drawHeader();

  if (aquariumData) {
    // Extract numbers safely from the data payload
    let temp = Number(aquariumData.temperature ?? 0);
    let ph   = Number(aquariumData.ph ?? 0);
    let nh3  = Number(aquariumData.nh3 ?? aquariumData.ammonia ?? 0);

    drawMetricCard(30, 110, 230, 340, "Temperature", temp, "°C", "temp");
    drawMetricCard(285, 110, 230, 340, "pH Level", ph, "", "ph");
    drawMetricCard(540, 110, 230, 340, "Ammonia (NH3)", nh3, "ppm", "nh3");
  } else {
    fill(200);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("Loading sensor data...", width / 2, height / 2);
  }
}

// ---------- Widget: Header ----------
function drawHeader() {
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(24);
  text("Aquarium Environment Dashboard", 30, 25);

  textSize(13);
  fill(150, 200, 255);
  let stamp = lastUpdated ? lastUpdated.toLocaleTimeString() : "Waiting for first reading...";
  text("Last updated: " + stamp, 30, 60);

  drawConnectionIndicator(width - 170, 30);
}

function drawConnectionIndicator(x, y) {
  let col, label;
  if (connectionStatus === "connected") { col = color(60, 200, 100); label = "Connected"; }
  else if (connectionStatus === "error") { col = color(220, 60, 60); label = "Connection Error"; }
  else { col = color(230, 180, 40); label = "Connecting..."; }

  noStroke();
  fill(col);
  ellipse(x, y + 6, 12, 12);
  fill(230);
  textSize(13);
  textAlign(LEFT, CENTER);
  text(label, x + 12, y + 6);
}

// ---------- Widget: Metric Card (temp / pH / ammonia) ----------
function drawMetricCard(x, y, w, h, label, value, unit, metricKey) {
  let status = getMetricStatus(metricKey, value);

  // Card background
  noStroke();
  fill(32, 44, 62);
  rect(x, y, w, h, 12);

  // Colored top strip shows status at a glance
  fill(status.col);
  rect(x, y, w, 8, 12, 12, 0, 0);

  // Label
  fill(200, 215, 230);
  textSize(15);
  textAlign(LEFT, TOP);
  text(label, x + 18, y + 25);

  // Warning icon if not optimal
  if (status.label !== "OPTIMAL") {
    drawWarningIcon(x + w - 42, y + 18, status.col);
  }

  // Big value display
  fill(255);
  textSize(34);
  let displayVal = (metricKey === "nh3") ? value.toFixed(3) : value.toFixed(1);
  text(displayVal + (unit ? " " + unit : ""), x + 18, y + 55);

  // Status badge
  fill(status.col);
  textSize(13);
  text(status.label, x + 18, y + 100);

  // Gauge / progress bar
  drawGauge(x + 18, y + 140, w - 36, 24, value, metricKey);

  // Safe range reference text
  fill(150, 165, 180);
  textSize(11);
  let r = RANGES[metricKey];
  text("Safe range: " + r.safeMin + " - " + r.safeMax, x + 18, y + 178);
}

// ---------- Widget: Gauge (progress bar) ----------
function drawGauge(x, y, w, h, val, metricKey) {
  let r = RANGES[metricKey];
  let pct = constrain(map(val, r.gaugeMin, r.gaugeMax, 0, 1), 0, 1);
  let status = getMetricStatus(metricKey, val);

  // Track
  noStroke();
  fill(15, 20, 30);
  rect(x, y, w, h, h / 2);

  // Fill
  fill(status.col);
  rect(x, y, w * pct, h, h / 2);

  // Border
  noFill();
  stroke(60, 80, 110);
  rect(x, y, w, h, h / 2);
  noStroke();
}

// ---------- Widget: Warning Icon ----------
function drawWarningIcon(x, y, col) {
  noStroke();
  fill(col);
  triangle(x + 12, y, x, y + 20, x + 24, y + 20);
  fill(20, 30, 45);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("!", x + 12, y + 14);
  textAlign(LEFT, TOP);
}

// ---------- Status Logic ----------
function getMetricStatus(type, val) {
  const r = RANGES[type];
  if (!r) return { col: color(150), label: "UNKNOWN" };

  if (type === "nh3") {
    if (val > r.warnMax) return { col: color(220, 50, 50), label: "WARNING" };
    if (val <= r.safeMax) return { col: color(40, 180, 90), label: "OPTIMAL" };
    return { col: color(230, 160, 30), label: "CAUTION" };
  }

  if (val < r.warnMin || val > r.warnMax) return { col: color(220, 50, 50), label: "WARNING" };
  if (val >= r.safeMin && val <= r.safeMax) return { col: color(40, 180, 90), label: "OPTIMAL" };
  return { col: color(230, 160, 30), label: "CAUTION" };
}