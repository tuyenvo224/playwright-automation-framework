import { expect } from '@playwright/test';
import { UserPage } from '@pages/dashboard/users/add-user.page';
import { test } from '@fixtures/dashboard-fixture';
import { defaultTestPassword, randomEmail, randomUserName } from '@utils/random-data.util';
import { LoginPage } from '@pages/login/login.page';

test.describe("ACCOUNT-Account", () => {
    test.describe.configure({ timeout: 60000 }); // luồng phân quyền dài (tạo user → logout → login user mới → verify → logout → login admin → xóa user), cần nhiều thời gian hơn mặc định 30s
    
    let userPage: UserPage;
    let userName: string;
    let psw: string;
    let email: string;

    const userAdmin = process.env.ADMIN_USERNAME!;
    const pswAdmin = process.env.ADMIN_PASSWORD!;

    test.beforeEach("Đã login trang with admin user", async ({ dashboardBasePage }) => {

        userName = randomUserName();
        email = randomEmail();
        psw = defaultTestPassword;

        userPage = new UserPage(dashboardBasePage.page);

        await test.step("Click Users tab", async () => {
            await userPage.clickUserTab();
        });
    });

    test.afterEach("Login by admin & delete normal user", async ({ page }) => {
        const loginPage = new LoginPage (page);
        await loginPage.openPlaywrightPage();
        await loginPage.login(userAdmin,pswAdmin);

        await userPage.clickUserTab();
        await userPage.fillSearchUser(userName);
        await userPage.clickSearchUser();

        await userPage.hoverUserName(userName);
        await userPage.clickDeleteUser();

        await page.waitForLoadState('domcontentloaded'); // Sau khi click submitdelete, WordPress điều hướng sang trang confirm deletion -> chờ trang load xong

        if (await userPage.submitDeleteUserLoc.isEnabled()) {
            await userPage.submitDeleteUser();
        } else {
            await userPage.checkOptionDeleteUser();
            await userPage.submitDeleteUser();
        }

        await userPage.fillSearchUser(userName);
        await userPage.clickSearchUser();
        await expect(userPage.msgDeleteUserLoc).toBeVisible();
    });

    test("@ACC_001:Create account with editor permission", async ({ page }) => {
        await test.step("Add new user with editor permission", async () => {
            await userPage.clickAddUserButton();
            await userPage.fillUserName(userName);
            await userPage.fillEmail(email);
            await expect(userPage.emailTextboxLoc).toHaveValue(email);
            await userPage.fillFirstName("E101");
            await userPage.fillLastName("Tuyen");
            await userPage.selectRole('editor');
            await userPage.fillPassword(psw);

            await userPage.submitAddUser();
            await expect(userPage.msgCreateUserLoc).toBeVisible();

        });

        await test.step("Logout & Login with new account", async () => {
            //await userPage.hoverProfile();
            //await userPage.clickLogout();
            await userPage.logout();

            const loginPage = new LoginPage(page);
            await loginPage.login(userName, psw); // Đăng nhập bằng user mới được tạo với quyền editor

            await expect(userPage.dashboardTabLoc).toBeVisible(); // Verify user với quyền editor có quyền trên các tab
            await expect(userPage.postsTabLoc).toBeVisible();
            await expect(userPage.mediaTabLoc).toBeVisible();
            await expect(userPage.pagesTabLoc).toBeVisible();
            await expect(userPage.commentsTabLoc).toBeVisible();
            await expect(userPage.profileTabLoc).toBeVisible();
            await expect(userPage.toolsTabLoc).toBeVisible();

            await expect(userPage.appearanceTabLoc).toBeHidden(); // Verify user với quyền editor ko có quyền trên các tab
            await expect(userPage.pluginsTabLoc).toBeHidden();
            await expect(userPage.usersTabLoc).toBeHidden();

            //await userPage.hoverProfile(); // 
            //await userPage.clickLogout(); // Click Log Out 
            await userPage.logout();
        });
    });

    test("@ACC_002:Create account with subscriber permission", async ({ page }) => { // test case tạo user với quyền subscriber
        await test.step("Add new user with subscriber permission", async () => {
            await userPage.clickAddUserButton();
            await userPage.fillUserName(userName);
            await userPage.fillEmail(email);
            await expect(userPage.emailTextboxLoc).toHaveValue(email);
            await userPage.fillFirstName("E101");
            await userPage.fillLastName("Tuyen");
            await userPage.selectRole('Subscriber'); // chọn quyền Subscriber
            await userPage.fillPassword(psw);

            await userPage.submitAddUser();
            await expect(userPage.msgCreateUserLoc).toBeVisible(); // Verify User được tạo thành công
        });

        await test.step("Logout & Login with new account", async () => { // Thực hiện đăng xuất và đăng nhập lại với user name vừa tạo
            //await userPage.hoverProfile();
            //await userPage.clickLogout(); // Click Log Out
            await userPage.logout();

            const loginPage = new LoginPage(page);
            await loginPage.login(userName, psw); // Đăng nhập bằng user mới được tạo với quyền Subscriber

            await expect(userPage.dashboardTabLoc).toBeVisible(); // Verify user với quyền Subscriber có quyền trên các tab
            await expect(userPage.profileTabLoc).toBeVisible();

            await expect(userPage.postsTabLoc).toBeHidden(); // Verify user với quyền Subscriber ko có quyền trên các tab
            await expect(userPage.mediaTabLoc).toBeHidden();
            await expect(userPage.pagesTabLoc).toBeHidden();
            await expect(userPage.commentsTabLoc).toBeHidden();
            await expect(userPage.toolsTabLoc).toBeHidden();
            await expect(userPage.appearanceTabLoc).toBeHidden();
            await expect(userPage.pluginsTabLoc).toBeHidden();
            await expect(userPage.usersTabLoc).toBeHidden();

            //await userPage.hoverProfile();
            //await userPage.clickLogout(); // Click Log Out
            await userPage.logout();
        });
    });

    // Triển khai thêm các tests cho phần account permissions
});