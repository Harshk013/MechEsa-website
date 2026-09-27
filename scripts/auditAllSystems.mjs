// scripts/auditAllSystems.mjs
import fs from 'fs';

const content = fs.readFileSync('src/pages/MechLab/MechLabSystemPage.tsx', 'utf8');

const systems = [
  'ActiveThermodynamicsLab',
  'ActiveRoboticsLab',
  'ActiveFluidLab',
  'ActiveAutomotiveLab',
  'ActiveDesignLab',
  'ActiveMaterialsLab',
  'ActiveManufacturingLab',
  'ActiveMechatronicsLab'
];

for (let i = 0; i < systems.length; i++) {
  const current = systems[i];
  const next = systems[i+1] ? 'function ' + systems[i+1] : 'export function MechLabSystemPage';
  const startIdx = content.indexOf('function ' + current);
  const endIdx = content.indexOf(next, startIdx);
  const block = content.slice(startIdx, endIdx);
  
  console.log(`\n========================================`);
  console.log(`=== ${current} ===`);
  console.log(`========================================`);

  // Check WHAT'S HAPPENING section
  const hasDynamicGrid = block.includes('thermo-dynamic-grid');
  const hasDynamicReaction = block.includes('thermo-dynamic-reaction');
  const hasCardsGrid = block.includes('thermo-dynamic-cards');
  const hasCardsReaction = block.includes('thermo-dynamic-reaction__cards');

  console.log(`WHAT'S HAPPENING CONTAINER:`);
  console.log(`  thermo-dynamic-grid: ${hasDynamicGrid}`);
  console.log(`  thermo-dynamic-reaction: ${hasDynamicReaction}`);
  console.log(`  Cards container: ${hasCardsGrid ? 'thermo-dynamic-cards' : hasCardsReaction ? 'thermo-dynamic-reaction__cards' : 'NONE'}`);

  // Card labels
  const labelMatches = [...block.matchAll(/__label["'][^>]*>([^<]+)<\/span>/g)].map(m => m[1].trim());
  console.log(`  Card Labels:`, labelMatches);

  // Check Hint implementation
  const hintMatches = [...block.matchAll(/<MechLabHint\s+hint=\{([^}]+)\}/g)].map(m => m[1].trim());
  console.log(`HINTS:`, hintMatches.length > 0 ? hintMatches : 'NONE FOUND');

  // Check Challenge Level count & Switcher
  const levelBtns = [...block.matchAll(/thermo-challenge-level-btn/g)].length;
  console.log(`CHALLENGE LEVEL BUTTONS:`, levelBtns > 0 ? 'YES' : 'NONE');

  // Check Success Banner
  const successBanners = [...block.matchAll(/complete-banner["'][^>]*>([^<]+)<\/div>/g)].map(m => m[1].trim());
  console.log(`SUCCESS BANNER:`, successBanners.length > 0 ? successBanners[0] : 'NONE FOUND');

  // Check LaTeX / Formulas
  const rawLatex = [...block.matchAll(/\\(frac|cdot|times|sigma|tau|omega|zeta|Delta|alpha|theta|pi|approx)/g)].map(m => m[0]);
  if (rawLatex.length > 0) {
    console.log(`⚠️ RAW LATEX DETECTED:`, rawLatex);
  } else {
    console.log(`FORMULAS: Clean (No raw LaTeX commands detected)`);
  }
}
