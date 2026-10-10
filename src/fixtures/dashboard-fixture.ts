import { test as base, expect } from '@playwright/test';
import { DashboardBasePage } from '@pages/dashboard/dashboard.base.page';
import { LoginPage } from '@pages/login/login.page';


const test = base.extend<{ dashboardBasePage: DashboardBasePage }>({
    dashboardBasePage: async ({ page }, use) => {
        const userAdmin = process.env.ADMIN_USERNAME!;
        const pswAdmin = process.env.ADMIN_PASSWORD!;

        const loginPage = new LoginPage(page);
        await loginPage.openPlaywrightPage();
        await loginPage.login(userAdmin,pswAdmin);

        const dashboardBasePage = new DashboardBasePage(page);

        //await expect(page).toHaveURL("https://pw-practice-dev.playwrightvn.com/wp-admin/");
        //await expect(page).toHaveURL(/wp-admin/);
        await expect(page).toHaveURL(/\/wp-admin\/$/);
        //await expect(page).toHaveURL(new RegExp("/wp-admin/$"));

        await expect(dashboardBasePage.dashboardHeadingLoc).toHaveText("Dashboard");
        await expect(dashboardBasePage.atAGlanceHeadingLoc).toHaveText("At a Glance");
        await expect(dashboardBasePage.activityHeadingLoc).toHaveText("Activity");

        await use(dashboardBasePage);
    }
});

export { test };