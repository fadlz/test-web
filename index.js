require('dotenv').config();

const { chromium } = require('playwright');

const CONCURRENT_USERS = parseInt(process.env.USER_COUNT) || 10;
const TARGET_URL = process.env.TARGET_URL || 'https://example.com';

async function simulateUser(userId) {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();

	const start = Date.now();
	try {
		await page.goto(TARGET_URL, { waitUntil: "networkidle" });
		console.log(`User ${userId} loaded page in ${Date.now() - start} ms`);
	} catch (err) {
		console.error(`User ${userId} failed:`, err.message);
	}

	await browser.close();
}

(async () => {
	const tasks = [];
	for (let i = 1; i <= CONCURRENT_USERS; i++) {
		tasks.push(simulateUser(i));
	}

	await Promise.all(tasks);
})();
