import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('🚀 Starting Playwright Showcase Capture Suite...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // 1. Landing Page (Public Hero)
  console.log('📸 1/16 Capturing Landing Page...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-landing-hero.png'), fullPage: false });

  // 2. Auth / Login Page
  console.log('📸 2/16 Capturing Auth / Login Page...');
  await page.goto('http://localhost:3000/login?callbackUrl=/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-auth-login.png'), fullPage: false });

  // Authenticate as Aniket Meshram
  console.log('🔐 Authenticating as Aniket Meshram (aniketmeshram445@gmail.com)...');
  await page.fill('input[type="email"]', 'aniketmeshram445@gmail.com');
  await page.fill('input[type="password"]', 'Aniket123@');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Navigate explicitly to dashboard to ensure loaded state
  console.log('📸 3/16 Capturing Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-dashboard.png'), fullPage: false });

  // 4. Autonomous Course Generator Studio
  console.log('📸 4/16 Capturing Course Generator...');
  await page.goto('http://localhost:3000/generate', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-course-generator.png'), fullPage: false });

  // 5. Course Curriculum & Roadmap
  console.log('📸 5/16 Capturing Course Curriculum & Roadmap...');
  await page.goto('http://localhost:3000/course/cmu41843n0001rfon6tw0dhdi', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-course-curriculum.png'), fullPage: false });

  // 6. Immersive Learning Room (Module)
  console.log('📸 6/16 Capturing Immersive Learning Room...');
  await page.goto('http://localhost:3000/course/cmu41843n0001rfon6tw0dhdi/module/cmu41843n0008rfon3dkjrmwp', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-learning-module.png'), fullPage: false });

  // 7. Interactive Concept Mindmap
  console.log('📸 7/16 Capturing Concept Mindmap...');
  try {
    const mindmapBtn = page.locator('button:has-text("Mindmap")').first();
    if (await mindmapBtn.isVisible()) {
      await mindmapBtn.click();
      await page.waitForTimeout(3500);
    }
  } catch (e) {
    console.log('Mindmap tab notice:', e.message);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-concept-mindmap.png'), fullPage: false });

  // 8. Adaptive Quiz Assessment
  console.log('📸 8/16 Capturing Quiz Assessment...');
  await page.goto('http://localhost:3000/course/cmu41843n0001rfon6tw0dhdi/module/cmu41843n0008rfon3dkjrmwp/quiz', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-quiz-assessment.png'), fullPage: false });

  // 9. Quiz Result
  console.log('📸 9/16 Capturing Quiz Result...');
  await page.goto('http://localhost:3000/course/cmu41843n0001rfon6tw0dhdi/module/cmu41843n0008rfon3dkjrmwp/result', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-quiz-result.png'), fullPage: false });

  // 10. Spaced Repetition Flashcards Deck
  console.log('📸 10/16 Capturing Flashcards Deck...');
  await page.goto('http://localhost:3000/flashcards', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-flashcards-deck.png'), fullPage: false });

  // 11. Student Academic Analytics & Telemetry
  console.log('📸 11/16 Capturing Academic Analytics & Reports...');
  await page.goto('http://localhost:3000/reports', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-academic-analytics.png'), fullPage: false });

  // 12. Gamification Vault & Achievements
  console.log('📸 12/16 Capturing Achievements & Badges...');
  await page.goto('http://localhost:3000/achievements', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-achievements-trophies.png'), fullPage: false });

  // 13. Verifiable Academic Certificate
  console.log('📸 13/16 Capturing Verifiable Academic Certificate...');
  await page.goto('http://localhost:3000/certificate/NXL-JAVA-2026', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-verifiable-certificate.png'), fullPage: false });

  // 14. Course Discovery Catalog
  console.log('📸 14/16 Capturing Discovery Catalog...');
  await page.goto('http://localhost:3000/discover', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-discover-catalog.png'), fullPage: false });

  // 15. Student Profile
  console.log('📸 15/16 Capturing Student Profile...');
  await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-user-profile.png'), fullPage: false });

  // 16. Security & Settings Vault
  console.log('📸 16/16 Capturing Settings & Security...');
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-settings-security.png'), fullPage: false });

  await browser.close();
  console.log('🎉 All 16 showcase screenshots successfully captured into docs/screenshots/!');
}

capture().catch(err => {
  console.error('❌ Error during capture:', err);
  process.exit(1);
});
