require('dotenv').config();
const { chromium } = require('playwright');

const CONCURRENT_USERS = parseInt(process.env.USER_COUNT);
const TARGET_URL = process.env.TARGET_URL;

async function simulateUser(userId) {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();

	let resourceCount = 0;
	let failedResources = 0;

	// Event listener untuk log setiap request/response
	page.on('requestfinished', () => resourceCount++);
	page.on('requestfailed', () => failedResources++);

	const startTime = Date.now();
	console.log(`🔹 User ${userId} starting: ${TARGET_URL}`);

	try {
		const response = await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
		const status = response?.status?.() ?? 'NO RESPONSE';

		const duration = Date.now() - startTime;
		console.log(`✅ User ${userId} finished in ${duration} ms — HTTP ${status}`);
		console.log(`   ↳ Resources loaded: ${resourceCount}, Failed: ${failedResources}`);
	} catch (err) {
		console.error(`❌ User ${userId} error: ${err.message}`);
	}

	await browser.close();
}

(async () => {
	console.log(`\n🌐 Starting load test: ${CONCURRENT_USERS} users → ${TARGET_URL}\n`);
	const tasks = [];

	for (let i = 1; i <= CONCURRENT_USERS; i++) {
		tasks.push(simulateUser(i));
	}

	await Promise.all(tasks);
	console.log('\n✅ Load test completed.\n');
})();
