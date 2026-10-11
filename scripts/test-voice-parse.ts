import { parseVoiceTranscript } from "../src/lib/voice-parse";

const sample =
  "客戶係新里程製造，來自 Partner A，用緊 ERP 同 SCM，需求係整合庫存同多廠區，數量三個模組，budget 大約四十五萬";

const result = parseVoiceTranscript(sample);
console.log(JSON.stringify(result, null, 2));

const checks = [
  !!result.customerName?.includes("新里程"),
  result.partner === "Partner A",
  result.systems?.includes("ERP") && result.systems?.includes("SCM"),
  (result.budget || 0) >= 450000,
];

if (checks.every(Boolean)) {
  console.log("OK: voice parse heuristics look good");
  process.exit(0);
}

console.error("FAIL: unexpected parse", checks);
process.exit(1);
