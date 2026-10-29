import {expect,test} from '@playwright/test';
test('article tools follow direct loads and persistent-shell navigation',async({page})=>{
 await page.goto('/games/');
 await page.waitForFunction(()=>Boolean(window.swup));
 await expect(page.locator('#category-bar-region')).toBeHidden();
 await page.evaluate(()=>window.swup.navigate('/archive/'));
 await expect(page.locator('#swup-container')).toHaveAttribute('data-current-page','archive');
 await expect(page.locator('#category-bar-region')).toBeVisible();
 await page.locator('#category-bar-region').getByRole('link',{name:'Categories',exact:true}).click();
 await expect(page.locator('#swup-container')).toHaveAttribute('data-current-page','categories');
 await expect(page.locator('#category-bar-region').getByRole('link',{name:'Categories',exact:true})).toHaveAttribute('aria-current','page');
 await page.evaluate(()=>window.swup.navigate('/games/'));
 await expect(page.locator('#swup-container')).toHaveAttribute('data-current-page','games');
 await expect(page.locator('#category-bar-region')).toBeHidden();
});
