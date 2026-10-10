import { expect } from '@playwright/test';
import { StroreFrontHomePage } from '../../pom/storefront/home.page';
import { test } from '../../fixtures/dashboard-fixture';


test.describe("Dashboard - Home", () => {
    let homePage: StroreFrontHomePage;

    test("Click Dashboard tab", async ({ dashboardBasePage }) => {
        await test.step("Click Dashboard tab", async () => {
            homePage = new StroreFrontHomePage(dashboardBasePage.page);
            await homePage.clickstoreFrontPage();

            await expect(dashboardBasePage.page).toHaveURL('https://pw-practice-dev.playwrightvn.com/');
            await expect(homePage.titleStoreFrontLoc).toBeVisible();
            await expect(homePage.titleStoreFrontLoc).toHaveText("Playwright practice site - Dev environment");
        });
    });

    // Triển khai thêm các tests khác cho tab Home - StoreFront

});