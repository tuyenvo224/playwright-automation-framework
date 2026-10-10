import { expect } from '@playwright/test';
import { HomePage } from '@pages/dashboard/dashboard/home.page';
import { test } from '@fixtures/dashboard-fixture';

test.describe("Dashboard - Home", () => {
    let homePage: HomePage;

    test("Click Dashboard tab", async ({ dashboardBasePage }) => {
        await test.step("Click Dashboard tab", async () => {
            homePage = new HomePage(dashboardBasePage.page);
            await homePage.clickDashboardTab();

            await expect(homePage.dashboardHeadingLoc).toBeVisible();
            await expect(homePage.atAGlanceHeadingLoc).toBeVisible();
            await expect(homePage.activityHeadingLoc).toBeVisible();

            await expect(homePage.dashboardHeadingLoc).toHaveText("Dashboard");
            await expect(homePage.atAGlanceHeadingLoc).toHaveText("At a Glance");
            await expect(homePage.activityHeadingLoc).toHaveText("Activity");
        });
    });

    test("Click Home tab", async ({ dashboardBasePage }) => {
        await test.step("Click Home tab", async () => {
            homePage = new HomePage(dashboardBasePage.page);
            await homePage.clickDashboardTab();
            await homePage.clickHomeTab();

            await expect(homePage.dashboardHeadingLoc).toBeVisible();
            await expect(homePage.atAGlanceHeadingLoc).toBeVisible();
            await expect(homePage.activityHeadingLoc).toBeVisible();

            await expect(homePage.dashboardHeadingLoc).toHaveText("Dashboard");
            await expect(homePage.atAGlanceHeadingLoc).toHaveText("At a Glance");
            await expect(homePage.activityHeadingLoc).toHaveText("Activity");
        });
    });

    // Triển khai thêm các tests khác cho tab Home
    
});