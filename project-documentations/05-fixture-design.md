# 05 — Thiết kế Fixture

## 1. Vấn đề fixture giải quyết

Gần như mọi file test trong `tests/dashboard/` đều cần login bằng tài khoản admin trước khi test. Nếu viết lặp lại 4 dòng login trong `beforeEach` của từng file, khi cách login thay đổi (ví dụ WordPress bật thêm xác thực 2 lớp) sẽ phải sửa ở rất nhiều nơi. Playwright hỗ trợ giải quyết đúng vấn đề này bằng **custom fixture**.

## 2. Fixture hiện có — [fixtures/dashboard-fixture.ts](../fixtures/dashboard-fixture.ts)

```ts
import { test as base, expect } from '@playwright/test';
import { DashboardBasePage } from '../pom/dashboard/dashboard.base.page';

const test = base.extend<{ dashboardBasePage: DashboardBasePage }>({
    dashboardBasePage: async ({ page }, use) => {
        const userAdmin = process.env.ADMIN_USERNAME!;
        const pswAdmin = process.env.ADMIN_PASSWORD!;

        const dashboardBasePage = new DashboardBasePage(page);
        await dashboardBasePage.openPlaywrightPage();
        await dashboardBasePage.login(userAdmin, pswAdmin);

        await expect(page).toHaveURL("https://pw-practice-dev.playwrightvn.com/wp-admin/");
        await expect(dashboardBasePage.dashboardHeadingLoc).toHaveText("Dashboard");
        await expect(dashboardBasePage.atAGlanceHeadingLoc).toHaveText("At a Glance");
        await expect(dashboardBasePage.activityHeadingLoc).toHaveText("Activity");

        await use(dashboardBasePage);   // trả fixture ra cho test dùng
        // Không có code sau use() -> fixture này KHÔNG có teardown
    }
});

export { test };
```

`base.extend<{...}>({...})` tạo ra một bản `test` **mới** (không thay thế `test` gốc của Playwright), có thêm 1 "nguyên liệu" tên `dashboardBasePage` mà mọi hook/test có thể xin dùng qua tham số. Cấu trúc luôn là: code **trước** `use(...)` là **setup**, giá trị truyền vào `use(...)` là **thứ fixture trả về**, code **sau** `use(...)` (nếu có) là **teardown**.

## 3. Vì sao fixture chỉ bọc phần login, không bọc luôn từng Page Object

`dashboardBasePage` chỉ trả về một `DashboardBasePage` đã login sẵn — **không** phải `UserPage`/`HomePage`/`ProfilePage` cụ thể. Vì fixture là hạ tầng dùng chung cho **mọi** file test trong `dashboard/`, nó chỉ nên đảm nhận đúng phần chung nhất (login). Từng file test tự khởi tạo Page Object cụ thể mình cần, dùng lại `page` đã đăng nhập:
```ts
userPage = new UserPage(dashboardBasePage.page);
```
Nếu để fixture trả thẳng `UserPage`, những file test không liên quan tới Users (VD: `home.spec.ts`, `updates.spec.ts`) sẽ phải phụ thuộc vào một fixture "thừa" không liên quan tới chúng.

## 4. Cách dùng trong file test

Import `test` từ file fixture, **không phải** từ `@playwright/test` — ví dụ [tests/dashboard/users/all-users.spec.ts](../tests/dashboard/users/all-users.spec.ts):
```ts
import { expect } from '@playwright/test';
import { UserPage } from '../../../pom/dashboard/users/add-user.page';
import { test } from '../../../fixtures/dashboard-fixture';   // lấy test từ fixture

test.describe("Users - all users", () => {
    let userPage: UserPage;

    test("Click Users tab", async ({ dashboardBasePage }) => {   // xin fixture qua tham số
        userPage = new UserPage(dashboardBasePage.page);
        await userPage.clickUserTab();
        await expect(userPage.usersHeadingLoc).toBeVisible();
    });
});
```

## 5. Cơ chế cốt lõi cần hiểu: fixture chỉ resolve **một lần cho mỗi test**

Fixture được tạo ra (chạy phần setup) đúng **một lần** khi có nơi đầu tiên (hook hoặc test body) yêu cầu nó, rồi **dùng chung** xuyên suốt `beforeEach` → test body → `afterEach` của cùng 1 test — bất kể ai là nơi request đầu tiên. Áp dụng thực tế trong [tests/dashboard/users/add-user.spec.ts](../tests/dashboard/users/add-user.spec.ts):

```ts
test.beforeEach("Đã login trang with admin user", async ({ dashboardBasePage }) => {   // request fixture ở đây
    userName = randomUserName();
    email = randomEmail();
    psw = defaultTestPassword;
    createdUserName = undefined;

    userPage = new UserPage(dashboardBasePage.page);   // login đã chạy xong TRƯỚC dòng này
});
```
Các `test(...)` và `test.afterEach(...)` phía dưới chỉ cần xin `page` (fixture có sẵn của Playwright) — **không cần** xin lại `dashboardBasePage` — vì `page` lúc đó đã ở trạng thái "đã login" do cùng 1 fixture xử lý trước đó trong chính test này.

## 6. Khi nào vẫn phải login thủ công dù đã có fixture

Fixture chỉ chạy setup **một lần lúc đầu test**. Nếu giữa chừng test có bước **logout** (để dọn dẹp dữ liệu, hoặc để verify quyền hạn của 1 role khác), muốn login lại phải gọi thủ công — fixture không tự chạy lại:

```ts
// tests/dashboard/users/add-user.spec.ts — afterEach
test.afterEach("Login by admin & delete normal user", async ({ page }) => {
    if (!createdUserName) return;

    await userPage.hoverProfile();
    await userPage.clickLogout();          // đã logout

    await userPage.openPlaywrightPage();
    await userPage.login(userAdmin, pswAdmin);   // phải tự login lại, fixture không tự làm
    // ... tiếp tục xóa user
});
```
Tương tự, [tests/dashboard/users/account-permissions.spec.ts](../tests/dashboard/users/account-permissions.spec.ts) cũng phải tự login lại admin trong `afterEach` sau khi test đã logout để verify quyền hạn user vừa tạo bằng tài khoản đó.

## 7. Khi nào nên thêm fixture mới thay vì mở rộng fixture hiện có

Nếu về sau có nhu cầu (ví dụ) "test luôn cần sẵn 1 user với role Editor đã tồn tại" cho nhiều file test khác nhau, đó là lúc nên cân nhắc thêm 1 fixture mới (ví dụ `editorUser`) thay vì nhồi thêm logic vào `dashboardBasePage` — giữ đúng nguyên tắc mỗi fixture chỉ chuẩn bị **một loại trạng thái** cụ thể, tránh một fixture ôm đồm quá nhiều trách nhiệm không liên quan tới nhau.
