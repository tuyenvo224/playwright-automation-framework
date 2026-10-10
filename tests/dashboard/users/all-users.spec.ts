import { expect } from '@playwright/test';
import { UserPage } from '@pages/dashboard/users/add-user.page';
import { test } from '@fixtures/dashboard-fixture';

test.describe("Users - all users", () => {
    let userPage: UserPage;

    test("Click Users tab", async ({ dashboardBasePage }) => {
        await test.step("Click Users tab", async () => {
            userPage = new UserPage(dashboardBasePage.page);
            await userPage.clickUserTab();
            await expect(userPage.usersHeadingLoc).toBeVisible();
            await expect(userPage.addUserButtonLoc).toBeEnabled();
        });
    });

    test("Click All Users tab", async ({ dashboardBasePage }) => {
        await test.step("Click All Users tab", async () => {
            userPage = new UserPage(dashboardBasePage.page);
            await userPage.clickUserTab();
            await userPage.clickAllUsersTab();
            await expect(userPage.usersHeadingLoc).toBeVisible();
            await expect(userPage.addUserButtonLoc).toBeEnabled();
        });
    });

    // Triển khai thêm các tests khác cho tab All Users
});