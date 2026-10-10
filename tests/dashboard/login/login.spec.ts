import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../../pom/dashboard/login/login.page';

test.describe("AUTH-Authentication", () => { 
    let loginPage: LoginPage;

    test.beforeEach("Go to practice page", async ({ page }) => { 
        loginPage = new LoginPage(page); 
        await loginPage.openPlaywrightPage();
    });

    test("@AUTH_001:Login fail", async ({ page }) => { 
        const userName = "betterbytes.academy.admin123";
        const psw = "StrongPass@BetterBytesAcademy";

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
        const userName = "betterbytes.academy.admin";
        const psw = "StrongPass@BetterBytesAcademy";

        await test.step("Input correct user name - password", async () => { 
            await loginPage.fillUserNameLogin(userName);
            await expect(loginPage.userNameLogin).toHaveValue(userName);

            await loginPage.fillPasswordLogin(psw);
            await expect(loginPage.passwordLogin).toHaveValue(psw);
        });

        await test.step("Click login button", async () => {  
            await loginPage.clickLoginButton()

            await expect(page).toHaveURL("https://pw-practice-dev.playwrightvn.com/wp-admin/");
            await expect(loginPage.dashboardHeadingLoc).toHaveText("Dashboard");
            await expect(loginPage.atAGlanceHeadingLoc).toHaveText("At a Glance");
            await expect(loginPage.activityHeadingLoc).toHaveText("Activity");

        })
    });
});