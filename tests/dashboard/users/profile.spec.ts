import { expect } from '@playwright/test';
import { ProfilePage } from '../../../pom/dashboard/users/profile.page';
import { test } from '../../../fixtures/dashboard-fixture';

test.describe("Users - Profile", () => {
    let profilePage: ProfilePage;

    test("Click Profile tab", async ({ dashboardBasePage }) => {
        await test.step("Click Profile tab", async () => {
            profilePage = new ProfilePage(dashboardBasePage.page);
            await profilePage.clickUserTab();
            await profilePage.clickProfileTab();
            await expect(profilePage.profileHeadingLoc).toBeVisible();
        });
    });

    // Triển khai thêm các tests khác cho tab Profile
});