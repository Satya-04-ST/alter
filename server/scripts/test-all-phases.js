const { execSync } = require('child_process');

console.log('===============================================================');
console.log('🚀 ALTER PLATFORM FULL END-TO-END MASTER REGRESSION SUITE');
console.log('===============================================================\n');

const testScripts = [
  { name: 'Phase 1: Database, Auth, Ingestion & AppShell', script: 'node server/scripts/test-phase1.js' },
  { name: 'Phase 2: RAG Pipeline & Multi-Persona Engine', script: 'node server/scripts/test-phase2.js' },
  { name: 'Phase 3: Dynamic Planner & Academic Triaging', script: 'node server/scripts/test-phase3.js' },
  { name: 'Phase 4: Synthesis, Quizzing & Research Hub', script: 'node server/scripts/test-phase4.js' },
  { name: 'Phase 5: Visualizers, Aggregators & Integrations', script: 'node server/scripts/test-phase5.js' },
];

let allPassed = true;

for (let i = 0; i < testScripts.length; i++) {
  const { name, script } = testScripts[i];
  console.log(`\n▶️ Executing [${i + 1}/5] ${name}...`);
  try {
    const output = execSync(script, { encoding: 'utf-8' });
    console.log(output);
    console.log(`✅ [${i + 1}/5] ${name} PASSED.`);
  } catch (err) {
    console.error(`❌ [${i + 1}/5] ${name} FAILED:`, err.stdout || err.message);
    allPassed = false;
    break;
  }
}

if (allPassed) {
  console.log('\n===============================================================');
  console.log('🎉 ALL 5 PHASES OF THE ALTER PLATFORM ARE 100% VERIFIED & GREEN! ✅');
  console.log('===============================================================\n');
} else {
  process.exit(1);
}
