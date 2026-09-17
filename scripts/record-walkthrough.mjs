import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const VIDEOS_DIR = path.resolve(process.cwd(), 'docs/videos');
const RAW_DIR = path.resolve(VIDEOS_DIR, 'raw');

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

async function gotoPage(page, url, waitMs = 2500) {
  console.log(`🌐 Navigating to: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(waitMs);
}

async function cinematicScrollPage(page, pauseAtTop = 1500, pauseAtBottom = 2000) {
  // Center mouse pointer over main page content
  await page.mouse.move(1000, 500);
  await page.waitForTimeout(pauseAtTop);

  const scrollHeight = await page.evaluate(() => Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.querySelector('.main-content')?.scrollHeight || 0
  ));
  const viewportHeight = 1080;
  const distanceToScroll = scrollHeight - viewportHeight;

  if (distanceToScroll > 80) {
    const steps = Math.max(14, Math.floor(distanceToScroll / 140));
    const stepDistance = distanceToScroll / steps;

    // Smooth scroll down
    for (let i = 0; i < steps; i++) {
      await page.evaluate((d) => window.scrollBy(0, d), stepDistance);
      await page.waitForTimeout(70);
    }

    // Linger at bottom
    await page.waitForTimeout(pauseAtBottom);

    // Smooth scroll back up
    for (let i = 0; i < Math.floor(steps / 2); i++) {
      await page.evaluate((d) => window.scrollBy(0, -d * 2), stepDistance);
      await page.waitForTimeout(40);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(900);
  } else {
    await page.waitForTimeout(pauseAtBottom + 1000);
  }
}

async function record() {
  console.log('🎬 Starting Playwright Cinematic Full-Platform Walkthrough Recording...');

  // Clean raw directory before recording
  const existingFiles = fs.readdirSync(RAW_DIR);
  for (const f of existingFiles) {
    try { fs.unlinkSync(path.join(RAW_DIR, f)); } catch (_) {}
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: RAW_DIR,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    // ==========================================
    // 1. LANDING PAGE (Full scroll)
    // ==========================================
    console.log('🎥 1/17: Landing Page Showcase (Full Scroll)...');
    await gotoPage(page, 'http://localhost:3000/', 2500);
    await cinematicScrollPage(page, 2000, 2500);

    // ==========================================
    // 2. REGISTER PAGE (Full scroll)
    // ==========================================
    console.log('🎥 2/17: Register Onboarding Portal (Full Scroll)...');
    await gotoPage(page, 'http://localhost:3000/register', 2000);
    await cinematicScrollPage(page, 1500, 2000);

    // ==========================================
    // 3. LOGIN PAGE & AUTHENTICATION
    // ==========================================
    console.log('🎥 3/17: Glassmorphic Login Portal & Authentication...');
    await gotoPage(page, 'http://localhost:3000/login?callbackUrl=/dashboard', 1800);
    await page.type('input[type="email"]', 'aniketmeshram445@gmail.com', { delay: 50 });
    await page.waitForTimeout(300);
    await page.type('input[type="password"]', 'Aniket123@', { delay: 50 });
    await page.waitForTimeout(600);

    console.log('🔐 Submitting credentials and awaiting verified session token...');
    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/auth/callback/credentials')),
      page.click('button[type="submit"]')
    ]);
    await page.waitForTimeout(2500);

    // Verify session token
    const cookies = await context.cookies();
    const hasSession = cookies.some(c => c.name.includes('session-token'));
    console.log('Session established:', hasSession);

    // ==========================================
    // 4. DASHBOARD (Full scroll)
    // ==========================================
    console.log('🎥 4/17: Student Learning Command Center (Dashboard)...');
    await gotoPage(page, 'http://localhost:3000/dashboard', 3500);
    await cinematicScrollPage(page, 2500, 2500);

    // ==========================================
    // 5. GENERATE COURSE (Full scroll)
    // ==========================================
    console.log('🎥 5/17: Autonomous Course Generator Studio...');
    await gotoPage(page, 'http://localhost:3000/generate', 2500);
    // Smoothly type into the prompt box to showcase interactivity
    try {
      const promptInput = page.locator('textarea, input[placeholder*="topic"], input[placeholder*="learn"]').first();
      if (await promptInput.isVisible()) {
        await promptInput.click();
        await promptInput.type('Full-Stack Next.js 16 with Turbopack & Autonomous AI Agents', { delay: 35 });
        await page.waitForTimeout(1000);
      }
    } catch (_) {}
    await cinematicScrollPage(page, 1500, 2000);

    // ==========================================
    // 6. MY COURSES / ROADMAP (Full scroll)
    // ==========================================
    console.log('🎥 6/17: Course Curriculum Roadmap & Knowledge Architecture...');
    await gotoPage(page, 'http://localhost:3000/course/cmu41843n0001rfon6tw0dhdi', 3000);
    await cinematicScrollPage(page, 2500, 2500);

    // ==========================================
    // 7. LEARNING ROOM & MONACO CODE SANDBOX
    // ==========================================
    console.log('🎥 7/17: Immersive Learning Room & Monaco Code Sandbox...');
    await gotoPage(page, 'http://localhost:3000/course/cmu41843n0001rfon6tw0dhdi/module/cmu41843n0008rfon3dkjrmwp', 3500);
    
    // Bookmark module
    try {
      const bookmarkBtn = page.locator('button:has-text("Bookmark Module"), button:has-text("Bookmark")').first();
      if (await bookmarkBtn.isVisible()) {
        await bookmarkBtn.click();
        await page.waitForTimeout(600);
      }
    } catch (_) {}

    await cinematicScrollPage(page, 2000, 2000);

    // Switch to Examples tab to showcase code editor
    try {
      const examplesTab = page.locator('button:has-text("Examples")').first();
      if (await examplesTab.isVisible()) {
        await examplesTab.click();
        await page.waitForTimeout(2500);
        await cinematicScrollPage(page, 1500, 1500);
      }
    } catch (_) {}

    // ==========================================
    // 8. CONCEPT MINDMAP (ELK.js + React Flow)
    // ==========================================
    console.log('🎥 8/17: Interactive Concept Mindmap Flow...');
    try {
      const mindmapTab = page.locator('button:has-text("Mindmap")').first();
      if (await mindmapTab.isVisible()) {
        await mindmapTab.click();
        await page.waitForTimeout(3500);
        await cinematicScrollPage(page, 2000, 2500);
      }
    } catch (_) {}

    // ==========================================
    // 9. DISCOVER CATALOG (Full scroll)
    // ==========================================
    console.log('🎥 9/17: Global Course Discovery Catalog...');
    await gotoPage(page, 'http://localhost:3000/discover', 2500);
    await cinematicScrollPage(page, 2000, 2500);

    // ==========================================
    // 10. FLASHCARDS DECK (Full scroll)
    // ==========================================
    console.log('🎥 10/17: SuperMemo SM-2 Spaced Repetition Flashcards Deck...');
    await gotoPage(page, 'http://localhost:3000/flashcards', 3000);
    // Click flashcard to flip
    try {
      const flashcardEl = page.locator('.flashcard, .card, [role="button"]').first();
      if (await flashcardEl.isVisible()) {
        await flashcardEl.click();
        await page.waitForTimeout(1500);
      }
    } catch (_) {}
    await cinematicScrollPage(page, 2000, 2500);

    // ==========================================
    // 11. BOOKMARKS (Full scroll)
    // ==========================================
    console.log('🎥 11/17: Saved Bookmarks & Quick Notes...');
    await gotoPage(page, 'http://localhost:3000/bookmarks', 2500);
    await cinematicScrollPage(page, 2000, 2000);

    // ==========================================
    // 12. ACHIEVEMENTS & TROPHIES (Full scroll)
    // ==========================================
    console.log('🎥 12/17: Gamification Vault & Milestone Trophies...');
    await gotoPage(page, 'http://localhost:3000/achievements', 3000);
    await cinematicScrollPage(page, 2500, 2500);

    // ==========================================
    // 13. VERIFY CREDENTIAL SEARCH (Full scroll)
    // ==========================================
    console.log('🎥 13/17: Official Credential Verification Search...');
    await gotoPage(page, 'http://localhost:3000/verify', 2500);
    await cinematicScrollPage(page, 1500, 2000);

    // ==========================================
    // 14. CRYPTOGRAPHIC VERIFIED CERTIFICATE (Full scroll)
    // ==========================================
    console.log('🎥 14/17: Cryptographic Verifiable Academic Certificate...');
    await gotoPage(page, 'http://localhost:3000/certificate/NXL-JAVA-2026', 3500);
    await cinematicScrollPage(page, 2500, 3000);

    // ==========================================
    // 15. REPORTS / ACADEMIC TELEMETRY (Full scroll)
    // ==========================================
    console.log('🎥 15/17: Student Academic Analytics & Telemetry Reports...');
    await gotoPage(page, 'http://localhost:3000/reports', 4000);
    await cinematicScrollPage(page, 2500, 3000);

    // ==========================================
    // 16. STUDENT PROFILE (Full scroll)
    // ==========================================
    console.log('🎥 16/17: Student Profile & Academic Preferences...');
    await gotoPage(page, 'http://localhost:3000/profile', 2500);
    await cinematicScrollPage(page, 2000, 2500);

    // ==========================================
    // 17. SECURITY & SETTINGS (Full scroll)
    // ==========================================
    console.log('🎥 17/17: Security Settings & 2FA Vault...');
    await gotoPage(page, 'http://localhost:3000/settings', 2500);
    await cinematicScrollPage(page, 2000, 2500);

    console.log('🏁 All 17 platform scenes recorded with full cinematic page scrolls!');
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  // ==========================================
  // CONVERSION TO MP4 & WEBM WITH FFMPEG
  // ==========================================
  const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.webm'));
  if (rawFiles.length > 0) {
    const rawVideoPath = path.join(RAW_DIR, rawFiles[0]);
    const targetMp4Path = path.join(VIDEOS_DIR, 'nexlearn-walkthrough.mp4');
    const targetWebmPath = path.join(VIDEOS_DIR, 'nexlearn-walkthrough.webm');

    console.log('⚙️ Converting recorded walkthrough to pristine 1080p MP4 via ffmpeg...');
    // Copy WebM
    fs.copyFileSync(rawVideoPath, targetWebmPath);

    // Convert to MP4 with libx264 high profile and yuv420p
    const ffmpegCmd = `"${ffmpegPath}" -y -i "${rawVideoPath}" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart "${targetMp4Path}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });

    console.log(`🎉 Master 1080p MP4 Walkthrough saved: ${targetMp4Path}`);
    console.log(`🎉 Master 1080p WebM Walkthrough saved: ${targetWebmPath}`);
  }
}

record().catch(err => {
  console.error('❌ Error during full-platform recording:', err);
  process.exit(1);
});
