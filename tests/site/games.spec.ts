import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.describe("游戏内容库", () => {
	for (const width of [360, 390, 1280])
		test("横向卡片 " + width, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto("/games/product/");
			await expect(page.locator(".library-card")).toHaveCount(1);
			await page.waitForTimeout(1500);
			const card = page.locator(".library-card");
			const image = await card.locator("img").boundingBox();
			const copy = await card.locator(".copy").boundingBox();
			expect(image!.x + image!.width).toBeLessThanOrEqual(copy!.x);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= innerWidth,
				),
			).toBeTruthy();
			await page.screenshot({
				path: "test-results/games-" + width + ".png",
				fullPage: true,
			});
			await card.click();
			await expect(page).toHaveURL(/games\/minecraft\//);
			await expect(page.locator("#swup-container h1")).toContainText("Minecraft");
			await expect(page.locator(".markdown-content")).toHaveText("");
		});
	test("排序、导航和搜索", async ({ page }) => {
		await page.goto("/games/");
		const sections = page
			.locator("section")
			.filter({ has: page.locator(".game-grid") });
		await expect(
			sections.nth(0).locator(".library-card").first(),
		).toHaveAttribute("href", /nte/);
		await expect(
			sections.nth(1).locator(".library-card").first(),
		).toHaveAttribute("href", /minecraft/);
		await page.locator('nav a[href="/games/service/"]').last().click();
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			"games",
		);
		await page.locator("[data-game-search]").fill("no-result");
		await expect(page.locator("[data-game-entry]:visible")).toHaveCount(0);
		await page.locator("[data-game-search]").fill("异环");
		await expect(page.locator("[data-game-entry]:visible")).toHaveCount(1);
		await page.goto("/blog/");
		await page.goto("/games/product/");
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			"games",
		);
	});
	for (const theme of ["light", "dark"])
		test("无障碍 " + theme, async ({ page }) => {
			await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
			for (const route of ["/games/", "/games/service/", "/games/minecraft/"]) {
				await page.goto(route);
				await page.waitForTimeout(1800);
				const results = await new AxeBuilder({ page })
					.withTags(["wcag2a", "wcag2aa", "wcag21aa"])
					.analyze();
				expect(results.violations).toEqual([]);
			}
		});
});
