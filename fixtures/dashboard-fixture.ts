import { test as base, expect } from '@playwright/test';
import { DashboardBasePage } from '../pom/dashboard/dashboard.base.page';


const test = base.extend<{ dashboardBasePage: DashboardBasePage }>({
    dashboardBasePage: async ({ page }, use) => {
        const userAdmin = process.env.ADMIN_USERNAME!;
        const pswAdmin = process.env.ADMIN_PASSWORD!;

        const dashboardBasePage = new DashboardBasePage(page);
        await dashboardBasePage.openPlaywrightPage();
        // await dashboardBasePage.fillUserNameLogin(userAdmin)
        // await dashboardBasePage.fillPasswordLogin(pswAdmin);
        // await dashboardBasePage.clickLoginButton();
        await dashboardBasePage.login(userAdmin, pswAdmin);

        await expect(page).toHaveURL("https://pw-practice-dev.playwrightvn.com/wp-admin/");
        await expect(dashboardBasePage.dashboardHeadingLoc).toHaveText("Dashboard");
        await expect(dashboardBasePage.atAGlanceHeadingLoc).toHaveText("At a Glance");
        await expect(dashboardBasePage.activityHeadingLoc).toHaveText("Activity");

        await use(dashboardBasePage);
    }
});

export { test };