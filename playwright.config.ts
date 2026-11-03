import { defineConfig } from "@playwright/test";

/**
 * 组件质量专项 — Playwright 配置
 * 说明：测试针对 Astro 开发服务器上的 atoms-*-test 页面（组件库验证页）。
 * 复用系统 Chrome（channel: chrome），避免额外下载浏览器。
 */
const port = Number(process.env.SHIRONE_TEST_PORT || 4321);
export default defineConfig({
	testDir: "./tests",
	timeout: 30_000,
	expect: { timeout: 5_000 },
	// 截图命名去掉平台/项目后缀（-win32），且随 spec 文件旁存放
	snapshotPathTemplate:
		"{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}",
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: [["list"]],
	use: {
		baseURL: `http://localhost:${port}`,
		channel: "chrome",
		viewport: { width: 1280, height: 900 },
		trace: "retain-on-failure",
	},
	webServer: {
		command:
			process.platform === "win32"
				? `pnpm.cmd astro dev --port ${port} --host`
				: `pnpm astro dev --port ${port} --host`,
		url: `http://localhost:${port}`,
		reuseExistingServer: true,
		timeout: 120_000,
		env: {
			ASTRO_DEV_BACKGROUND: "false",
		},
	},
});
