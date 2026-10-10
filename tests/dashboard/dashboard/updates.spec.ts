import { expect } from '@playwright/test';
import { UpdatesPage } from '../../../pom/dashboard/dashboard/updates.page';
import { test } from '../../../fixtures/dashboard-fixture';


test.describe("Dashboard - Updates", () => {
    let updatesPage: UpdatesPage;

    test("Click Updates tab", async ({ dashboardBasePage }) => {
        await test.step("Click Updates tab", async () => {
            updatesPage = new UpdatesPage(dashboardBasePage.page);
            await updatesPage.clickDashboardTab();
            await updatesPage.clickUpdatesTab();

            await expect(updatesPage.wordPressUpdatesHeadingLoc).toBeVisible();
            await expect(updatesPage.wordPressUpdatesHeadingLoc).toHaveText("WordPress Updates");
        });
    });

    // Triển khai thêm các tests khác cho tab Updates

});