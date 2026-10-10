import { expect } from '@playwright/test';
import { StoreFrontHomePage } from '@pages/storefront/home.page';
import { test } from '@fixtures/dashboard-fixture';


test.describe("StoreFront - Home", () => {
    let homePage: StoreFrontHomePage;

    test("Click StoreFront tab", async ({ dashboardBasePage }) => {
        await test.step("Click StoreFront tab", async () => {
            homePage = new StoreFrontHomePage(dashboardBasePage.page);
            await homePage.clickStoreFrontPage();

            await expect(dashboardBasePage.page).toHaveURL('https://pw-practice-dev.playwrightvn.com/');
            await expect(homePage.titleStoreFrontLoc).toBeVisible();
            await expect(homePage.titleStoreFrontLoc).toHaveText("Playwright practice site - Dev environment");
        });
    });

    // Triển khai thêm các tests khác cho tab Home - StoreFront

});