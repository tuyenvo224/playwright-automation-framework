import { expect } from '@playwright/test';
import { UserPage } from '@pages/dashboard/users/add-user.page';
import { test } from '@fixtures/dashboard-fixture';
import { defaultTestPassword, randomAlphaString, randomEmail, randomNumericString, randomUserName } from '@utils/random-data.util';
import { LoginPage } from '@pages/login/login.page';

test.describe("Users - add user", () => {
    let userPage: UserPage;
    let userName: string;
    let psw: string;
    let email: string;
    let createdUserName: string | undefined;
    // userName là tên sẽ dùng thử để tạo user (được sinh ra ở mọi test, kể cả test không tạo thành công). createdUserName khác về ý nghĩa: nó chỉ có giá trị khi user thực sự đã được tạo trong hệ thống. Tách riêng 2 biến giúp afterEach biết chính xác có cần dọn dẹp hay không, thay vì đoán qua userName.

    const userAdmin = process.env.ADMIN_USERNAME!;
    const pswAdmin = process.env.ADMIN_PASSWORD!;

    test.beforeEach("Đã login trang with admin user", async ({ dashboardBasePage }) => {

        userName = randomUserName();
        email = randomEmail();
        psw = defaultTestPassword;
        createdUserName = undefined;
        // Bắt buộc phải reset về undefined mỗi test. Vì createdUserName khai ở scope describe (dùng chung cho mọi test), nếu không reset, giá trị từ test trước có thể "rớt lại" sang test sau và khiến afterEach chạy nhầm cleanup cho user không hề được tạo ở test hiện tại.

        userPage = new UserPage(dashboardBasePage.page);
    });

    test.afterEach("Login by admin & delete normal user", async ({ page }) => {
        if (!createdUserName) {
            return;   // Test này không tạo ra user nào -> không cần dọn dẹp
        }
        //Dòng if (!createdUserName) { return; } ở đầu — đây là "cổng gác" duy nhất bạn cần. return sớm trong hook của Playwright là hợp lệ, các bước phía dưới sẽ không chạy.
        // Toàn bộ chỗ dùng userName bên trong phần cleanup được đổi thành createdUserName — về mặt logic hai biến đang giữ cùng giá trị ở test tạo-thành-công, nhưng dùng đúng createdUserName giúp code tự nói lên ý nghĩa: "đây là thao tác xóa cái đã xác nhận được tạo", tránh nhầm lẫn nếu sau này có test tạo user theo cách khác (không nhất thiết bằng biến userName gốc).

        //await userPage.hoverProfile(); // 
        //await userPage.clickLogout(); // Click Log Out
        await userPage.logout();

        const loginPage = new LoginPage (page);
        await loginPage.openPlaywrightPage();
        await loginPage.login(userAdmin,pswAdmin);

        await userPage.clickUserTab();
        await userPage.fillSearchUser(createdUserName);
        await userPage.clickSearchUser();

        await userPage.hoverUserName(createdUserName);
        await userPage.clickDeleteUser();

        await page.waitForLoadState('domcontentloaded'); // Sau khi click submitdelete, WordPress điều hướng sang trang confirm deletion -> chờ trang load xong

        if (await userPage.submitDeleteUserLoc.isEnabled()) {
            await userPage.submitDeleteUser();
        } else {
            await userPage.checkOptionDeleteUser();
            await userPage.submitDeleteUser();
        }

        await userPage.fillSearchUser(createdUserName);
        await userPage.clickSearchUser();
        await expect(userPage.msgDeleteUserLoc).toBeVisible();
    });


    test("Click Add User button from Users tab", async ({ page }) => {
        await test.step("Click Add User button from Users tab", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();
            await expect(userPage.addUserHeadingLoc).toBeVisible();
        });
    });

    test("Click Add User button from All Users tab", async ({ page }) => {
        await test.step("Click Add User button from All Users tab", async () => {
            await userPage.clickUserTab();
            await userPage.clickAllUsersTab();
            await userPage.clickAddUserButton();
            await expect(userPage.addUserHeadingLoc).toBeVisible();
        });
    });

    test("Click Add User tab", async ({ page }) => {
        await test.step("Click Add User tab", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserTab();
            await expect(userPage.addUserHeadingLoc).toBeVisible();
        });
    });

    test("Add new user without userName & email", async ({ page }) => {
        await test.step("Add new user without userName & email", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.submitAddUser();
            await expect(page).toHaveURL(/user-new\.php$/);
            //await expect(page).toHaveURL('https://pw-practice-dev.playwrightvn.com/wp-admin/user-new.php') // Không chuyển trang
        });
    });

    test("Add new user with userName only", async ({ page }) => {
        await test.step("Add new user with userName only", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(userName);

            await userPage.submitAddUser();
            await expect(page).toHaveURL(/user-new\.php$/);
            //await expect(page).toHaveURL('https://pw-practice-dev.playwrightvn.com/wp-admin/user-new.php') // Không chuyển trang
        });
    });

    test("Add new user with email only", async ({ page }) => {
        await test.step("Add new user with email only", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(page).toHaveURL(/user-new\.php$/);
            //await expect(page).toHaveURL('https://pw-practice-dev.playwrightvn.com/wp-admin/user-new.php') // Không chuyển trang
        });
    });

    test("Add new user with invalid username", async ({ page }) => {
        await test.step("Add new user with invalid username", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName('!@#$');
            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(userPage.errorUserNameMsgLoc).toBeVisible();
            await expect(page).toHaveURL(/user-new\.php$/);
            //await expect(page).toHaveURL('https://pw-practice-dev.playwrightvn.com/wp-admin/user-new.php') // Không chuyển trang
        });
    });

    test("Add new user with invalid email", async ({ page }) => {
        await test.step("Add new user with invalid email", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(userName);
            await userPage.fillEmail('tuyen@@gmail.com');

            await userPage.submitAddUser();
            await expect(userPage.errorEmailMsgLoc).toBeVisible();
            await expect(page).toHaveURL(/user-new\.php$/);
            //await expect(page).toHaveURL('https://pw-practice-dev.playwrightvn.com/wp-admin/user-new.php') // Không chuyển trang
        });
    });

    test("Add new user with username & email only", async ({ page }) => {
        await test.step("Add new user with username & email only", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(userName);
            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(userPage.msgCreateUserLoc).toBeVisible();
            createdUserName = userName;
            // Chỉ gán sau khi expect(...).toBeVisible() đã pass — tức là thời điểm bạn có bằng chứng chắc chắn user đã tồn tại trên hệ thống. Nếu expect này fail (test thất bại), dòng gán cờ sẽ không chạy tới, và afterEach sẽ tự động biết là không cần dọn dẹp gì — đúng ý đồ. Về sau, mỗi khi bạn thêm test mới thực sự tạo ra user, chỉ cần thêm đúng 1 dòng createdUserName = userName; ở vị trí tương tự.
        });
    });

    test("Add new user with all info", async ({ page }) => {
        await test.step("Add new user with all info", async () => {
            await userPage.clickUserTab();
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
            createdUserName = userName;
        });
    });

    test("Add new user with username is number", async ({ page }) => {
        await test.step("Add new user with username is number", async () => {
            // const testUserName = '1234567890';
            const testUserName = randomNumericString(10);

            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(testUserName);
            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(userPage.msgCreateUserLoc).toBeVisible();
            createdUserName = testUserName;
        });
    });

    test("Add new user with username is char", async ({ page }) => {
        await test.step("Add new user with username is char", async () => {
            //const testUserName = 'tuyentuyen';
            const testUserName = randomAlphaString(10);

            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(testUserName);
            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(userPage.msgCreateUserLoc).toBeVisible();
            createdUserName = testUserName;
        });
    });

    test("Add new user with duplicate username", async ({ page }) => {
        const testUserName = `dup-${Date.now()}`;

        await test.step("Tạo user gốc thành công", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(testUserName);
            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(userPage.msgCreateUserLoc).toBeVisible();
            createdUserName = testUserName; // chỉ user này thực sự tồn tại -> cần dọn dẹp
        });

        await test.step("Thử tạo user thứ 2 với username trùng -> mong đợi lỗi", async () => {
            const anotherEmail = `dup2-${Date.now()}@gmail.com`;

            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(testUserName);
            await userPage.fillEmail(anotherEmail);       // dùng email khác để lỗi chắc chắn là do username, không lẫn với lỗi email trùng

            await userPage.submitAddUser();
            await expect(userPage.duplicateUserNameMsgLoc).toBeVisible();
            await expect(page).toHaveURL(/user-new\.php$/);
            //await expect(page).toHaveURL('https://pw-practice-dev.playwrightvn.com/wp-admin/user-new.php'); // Không tạo thêm được
        });
    });

    test("Add new user with duplicate username - không phân biệt hoa thường", async ({ page }) => {
        const testUserName = `dup-${Date.now()}`;

        await test.step("Tạo user gốc thành công", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(testUserName);
            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(userPage.msgCreateUserLoc).toBeVisible();
            createdUserName = testUserName; // chỉ user này thực sự tồn tại -> cần dọn dẹp
        });

        await test.step("Thử tạo user thứ 2 với username trùng -> mong đợi lỗi", async () => {
            const anotherEmail = `dup2-${Date.now()}@gmail.com`;

            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(testUserName.toUpperCase());
            await userPage.fillEmail(anotherEmail); // dùng email khác để lỗi chắc chắn là do username, không lẫn với lỗi email trùng

            await userPage.submitAddUser();
            await expect(userPage.duplicateUserNameMsgLoc).toBeVisible();
            await expect(page).toHaveURL(/user-new\.php$/);
            //await expect(page).toHaveURL('https://pw-practice-dev.playwrightvn.com/wp-admin/user-new.php'); // Không tạo thêm được
        });
    });

    test("Add new user with duplicate email", async ({ page }) => {
        await test.step("Tạo user gốc thành công", async () => {
            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(userName);
            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(userPage.msgCreateUserLoc).toBeVisible();
            createdUserName = userName; // chỉ user này thực sự tồn tại -> cần dọn dẹp
        });

        await test.step("Thử tạo user thứ 2 với username trùng -> mong đợi lỗi", async () => {
            const anotherUserName = `dup2-${Date.now()}`;

            await userPage.clickUserTab();
            await userPage.clickAddUserButton();

            await userPage.fillUserName(anotherUserName); // dùng username khác để lỗi chắc chắn là do email, không lẫn với lỗi username trùng
            await userPage.fillEmail(email);

            await userPage.submitAddUser();
            await expect(userPage.duplicatedEmailMsgLoc).toBeVisible();
            await expect(page).toHaveURL(/user-new\.php$/);
            //await expect(page).toHaveURL('https://pw-practice-dev.playwrightvn.com/wp-admin/user-new.php'); // Không tạo thêm được
        });
    });

    // Triển khai thêm các tests khác cho tab Add  User
});