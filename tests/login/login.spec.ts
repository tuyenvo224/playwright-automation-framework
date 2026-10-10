import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login/login.page';
import { DashboardBasePage } from '@pages/dashboard/dashboard.base.page';

test.describe("AUTH-Authentication", () => { 
    let loginPage: LoginPage;

    test.beforeEach("Go to practice page", async ({ page }) => { 
        loginPage = new LoginPage(page); 
        await loginPage.openPlaywrightPage();
    });

    test("@AUTH_001:Login fail", async ({ page }) => { 
        const userName = "test123456";
        const psw = "test111";

        await test.step("Input incorrect user name - password", async () => { 

            await loginPage.fillUserNameLogin(userName);
            await expect(loginPage.userNameLogin).toHaveValue(userName);

            await loginPage.fillPasswordLogin(psw);
            await expect(loginPage.passwordLogin).toHaveValue(psw);
        });

        await test.step("Click Login button", async () => {  
            await loginPage.clickLoginButton();

            const errorMsg = await loginPage.getErrorMessage(userName);
            await expect(errorMsg).toBeVisible();
        });
    });

    test("@AUTH_002:Login success", async ({ page }) => { 
        const userName = process.env.ADMIN_USERNAME!;
        const psw = process.env.ADMIN_PASSWORD!;

        await test.step("Input correct user name - password", async () => { 
            await loginPage.fillUserNameLogin(userName);
            await expect(loginPage.userNameLogin).toHaveValue(userName);

            await loginPage.fillPasswordLogin(psw);
            await expect(loginPage.passwordLogin).toHaveValue(psw);
        });

        await test.step("Click login button", async () => {  
            await loginPage.clickLoginButton()

            const dashboardBasePage = new DashboardBasePage(page);

            //await expect(page).toHaveURL("https://pw-practice-dev.playwrightvn.com/wp-admin/");
            //await expect(page).toHaveURL(/wp-admin/);
            await expect(page).toHaveURL(/\/wp-admin\/$/);
            //await expect(page).toHaveURL(new RegExp("/wp-admin/$"));
            await expect(dashboardBasePage.dashboardHeadingLoc).toHaveText("Dashboard");
            await expect(dashboardBasePage.atAGlanceHeadingLoc).toHaveText("At a Glance");
            await expect(dashboardBasePage.activityHeadingLoc).toHaveText("Activity");

        })
    });
});