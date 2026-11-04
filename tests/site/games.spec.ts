import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("failed game covers preserve the frame on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/minecraft/");
  const frame = page.locator(".game-info .game-cover");
  const before = await frame.boundingBox();
  await frame.locator("img").evaluate((img: HTMLImageElement) => {
    img.src = "/missing-game-cover.jpg";
  });
  await expect(frame.locator("img")).toHaveAttribute("data-failed", "");
  const after = await frame.boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  await expect(page.locator("body")).toHaveAttribute("data-banner-visible", "true");
});
test.describe("游戏内容库", () => {
	for (const width of [360, 390, 1280])
		test("横向卡片 " + width, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto("/games/product/");
			await expect(page.locator(".library-card")).toHaveCount(1);
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
			if (width !== 390) return;
			await card.locator("h2 a").click();
			await expect(page).toHaveURL(/games\/minecraft\//);
			await expect(page.locator("#swup-container h1")).toContainText(
				"Minecraft",
			);
			await expect(page.locator("[data-game-no-review]")).toBeVisible();
			await expect(page.locator("#banner-wrapper")).toHaveAttribute(
				"data-copy-mode",
				"context",
			);
		});
	test("category links preserve tag filters", async ({ page }) => {
		await page.goto("/games/all/?gameTag=" + encodeURIComponent("沙盒"));
		await expect(page.locator("[data-game-entry]:visible")).toHaveCount(1);
		await page.locator('[data-games-nav] a[href*="/categories/"]').click();
		await page.locator('.taxonomy [data-game-category][href*="/service/"]').click();
		await expect(page).toHaveURL(new RegExp("service.*gameTag="));
		await expect(page.locator("[data-game-empty]")).toBeVisible();
		await page.locator('[data-games-nav] a[href*="/categories/"]').click();
		await page.locator('.taxonomy [data-game-category][href*="/product/"]').click();
		await expect(page.locator("[data-game-entry]:visible")).toHaveCount(1);
	});
	test("compact tiers and tag filtering", async ({ page }) => {
		await page.goto("/games/");
		await expect(page.locator(".tier")).toHaveCount(2);
		await expect(page.locator(".game-tile")).toHaveCount(4);
		await expect(page.locator(".game-tile .grade")).toHaveCount(0);
		await page.goto("/games/product/?gameTag=" + encodeURIComponent("沙盒"));
		await expect(page.locator("[data-game-entry]:visible")).toHaveCount(1);
		await expect(
			page.locator("#swup-container input[type=search]"),
		).toHaveCount(0);
		await page.goto("/games/product/?gameTag=missing");
		await expect(page.locator("[data-game-entry]:visible")).toHaveCount(0);
		await expect(page.locator("[data-game-empty]")).toBeVisible();
	});
	for (const theme of ["light", "dark"])
		test("无障碍 " + theme, async ({ page }) => {
			await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
			for (const route of ["/games/service/", "/games/minecraft/"]) {
				await page.goto(route);
				await page.waitForFunction(() =>
					getComputedStyle(document.documentElement)
						.getPropertyValue("--mc-primary")
						.trim()
						.startsWith("#"),
				);
				await page.waitForFunction(() =>
					[...document.querySelectorAll(".onload-animation")].every(
						(el) =>
							(el as HTMLElement).offsetParent === null ||
							getComputedStyle(el).opacity === "1",
					),
				);
				const results = await new AxeBuilder({ page })
					.withTags(["wcag2a", "wcag2aa", "wcag21aa"])
					.analyze();
				expect(results.violations).toEqual([]);
			}
		});
});
test("game detail banner follows article navigation", async ({
	page,
	request,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	const response = await request.get("/games/minecraft/");
	expect(await response.text()).toContain('data-copy-mode="context"');
	await page.goto("/games/");
	await expect(page.locator("#banner-wrapper")).toHaveAttribute(
		"data-copy-mode",
		"none",
	);
	// Real anchors use Swup; an injected test link avoids depending on demo navigation configuration.
	await page.locator("#swup-container").evaluate((el) => {
		const a = document.createElement("a");
		a.href = "/posts/guide/";
		a.textContent = "Review test article";
		el.prepend(a);
	});
	await page.getByRole("link", { name: "Review test article" }).click();
	await expect(page).toHaveURL(/posts\/guide/);
	await expect(page.locator("#swup-container")).toHaveAttribute("data-current-page", "post");
	await page.locator("#swup-container").evaluate((el) => {
		const a = document.createElement("a");
		a.href = "/games/minecraft/";
		a.textContent = "Review test game";
		el.prepend(a);
	});
	await page.getByRole("link", { name: "Review test game" }).click();
	await expect(page.locator("[data-game-no-review]")).toBeVisible();
	await expect(page.locator("#banner-wrapper")).toHaveAttribute(
		"data-copy-mode",
		"context",
	);
});
