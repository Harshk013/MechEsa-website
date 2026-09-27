// scripts/verifyRoutes.mjs
// Verifies HTTP 200 responses across all Lab routes on dev server

const routes = [
  'http://localhost:5173/lab',
  'http://localhost:5173/lab/thermodynamics',
  'http://localhost:5173/lab/thermodynamics?mode=explore',
  'http://localhost:5173/lab/thermodynamics?mode=challenge',
  'http://localhost:5173/lab/robotics',
  'http://localhost:5173/lab/robotics?mode=explore',
  'http://localhost:5173/lab/robotics?mode=challenge',
  'http://localhost:5173/lab/design',
  'http://localhost:5173/lab/design?mode=explore',
  'http://localhost:5173/lab/design?mode=challenge',
  'http://localhost:5173/lab/materials',
  'http://localhost:5173/lab/materials?mode=explore',
  'http://localhost:5173/lab/materials?mode=challenge',
  'http://localhost:5173/lab/manufacturing',
  'http://localhost:5173/lab/manufacturing?mode=explore',
  'http://localhost:5173/lab/manufacturing?mode=challenge',
  'http://localhost:5173/lab/mechatronics',
  'http://localhost:5173/lab/mechatronics?mode=explore',
  'http://localhost:5173/lab/mechatronics?mode=challenge',
  'http://localhost:5173/lab/automotive',
  'http://localhost:5173/lab/automotive?mode=explore',
  'http://localhost:5173/lab/automotive?mode=challenge',
  'http://localhost:5173/lab/fluid',
  'http://localhost:5173/lab/fluid?mode=explore',
  'http://localhost:5173/lab/fluid?mode=challenge',
];

console.log('=== VERIFYING HTTP RESPONSES FOR ALL LAB ROUTES ===\n');

async function testRoutes() {
  let allOk = true;
  for (const url of routes) {
    try {
      const res = await fetch(url);
      console.log(`[${res.status}] ${url}`);
      if (res.status !== 200) {
        allOk = false;
      }
    } catch (err) {
      console.error(`[ERROR] Failed to fetch ${url}:`, err.message);
      allOk = false;
    }
  }

  if (allOk) {
    console.log(`\n✓ ALL ${routes.length} LAB ROUTES RETURNED HTTP 200 OK`);
  } else {
    console.error('\n✗ Some routes failed');
    process.exit(1);
  }
}

testRoutes();
