# 03 — Thiết kế Page Object Model (POM)

## 1. Sơ đồ kế thừa (inheritance)

```
BasePage                              src/pages/base.page.ts
   │  (giữ page, đọc BASE_URL, goto(path), waitForPageLoad(), getTitle())
   │
   ├── LoginPage                      src/pages/login/login.page.ts
   │      (form login, login(), getErrorMessage(userName))
   │
   ├── DashboardBasePage              src/pages/dashboard/dashboard.base.page.ts
   │      │  (toàn bộ tab menu điều hướng dùng chung: Users, Posts, Media, Pages,
   │      │   Comments, Tools, Appearance, Plugins, hoverProfile/clickLogout...
   │      │   + các heading Dashboard / At a Glance / Activity để verify login thành công)
   │      ├── HomePage                src/pages/dashboard/dashboard/home.page.ts
   │      ├── UpdatesPage             src/pages/dashboard/dashboard/updates.page.ts
   │      ├── UserPage                src/pages/dashboard/users/add-user.page.ts   (gộp Add User + All Users)
   │      └── ProfilePage             src/pages/dashboard/users/profile.page.ts
   │
   └── StoreFrontHomePage             src/pages/storefront/home.page.ts
          (trang chủ công khai, link ra từ admin bar)
```

**Lý do dùng kế thừa thay vì lặp lại code:**
- `BasePage` chứa phần **mọi trang đều cần** (`page`, `baseUrl`, điều hướng) — định nghĩa đúng 1 lần.
- `DashboardBasePage` chứa menu điều hướng (`clickUserTab`, `clickDashboardTab`...) và logout — xuất hiện ở mọi trang admin. Mọi Page Object trong `dashboard/` kế thừa nó là tự động có sẵn, không copy-paste locator menu sang từng file.

**Vì sao `DashboardBasePage` không kế thừa `LoginPage` nữa** (thiết kế cũ là `LoginPage → DashboardBasePage → ...`): trang admin **không phải** là một trang login — để nó kế thừa `LoginPage` khiến mọi page admin mang theo locator form login vô nghĩa. Sau refactor, login là 1 trang riêng ngang hàng; khi cần login (trong fixture hoặc khi login lại giữa test) thì tạo `new LoginPage(page)` để dùng (xem [05-fixture-design.md](05-fixture-design.md)). Tương tự, `StoreFrontHomePage` chỉ cần `BasePage`, không cần gì từ `LoginPage`.

**Quy tắc khi tạo Page Object mới kế thừa:** chỉ cần gọi `super(page)` đầu constructor — **không** tự khai lại `page: Page` và **không** gán `this.page = page`, vì `BasePage` đã khai `readonly page` và gán sẵn:
```ts
export class UpdatesPage extends DashboardBasePage {
    readonly wordPressUpdatesHeadingLoc: Locator;

    constructor(page: Page) {
        super(page);   // bắt buộc — BasePage gán this.page, DashboardBasePage khởi tạo locator menu
        this.wordPressUpdatesHeadingLoc = this.page.getByRole('heading', { name: 'WordPress Updates', exact: true });
    }
}
```

## 2. Locator: kiểu dữ liệu và thời điểm khởi tạo

Mọi locator trong project đều khai kiểu `Locator` (từ `@playwright/test`) và **gán trong thân constructor**, sau khi `this.page` đã có giá trị. `this.page` được gán trong constructor của `BasePage`, nên ở class con, mọi dòng **sau** `super(page)` đều dùng được `this.page` — ví dụ [src/pages/login/login.page.ts](../src/pages/login/login.page.ts):

```ts
export class LoginPage extends BasePage {
    readonly userNameLogin: Locator;
    readonly passwordLogin: Locator;

    constructor(page: Page) {
        super(page);                                                          // (1) BasePage gán this.page TRƯỚC
        this.userNameLogin = this.page.getByRole('textbox', { name: 'Username or Email Address' });  // (2)
        this.passwordLogin = this.page.getByRole('textbox', { name: 'Password' });
    }
}
```

`BasePage` ([src/pages/base.page.ts](../src/pages/base.page.ts)) là nơi duy nhất gán `page` và đọc `BASE_URL`:
```ts
export class BasePage {
    readonly page: Page;
    readonly baseUrl: string;

    constructor(page: Page) {
        this.page = page;
        this.baseUrl = process.env.BASE_URL!;
    }

    async goto(path: string = "") {
        await this.page.goto(this.baseUrl + path);
    }
}
```

**Vì sao không được khai giá trị `Locator` ngay tại dòng khai báo property** (kiểu `readonly userNameLogin: Locator = this.page.getByRole(...)`)? Vì property initializer chạy **trước** phần còn lại của thân constructor — với class không kế thừa, tại thời điểm đó `this.page` chưa được gán, gọi `this.page.getByRole(...)` sẽ lỗi. Gán trong constructor (sau `super(page)`) là cách an toàn và thống nhất cho mọi class.

## 3. Không cần getter — vì `Locator` vốn đã lazy

`Locator` trong Playwright **không** query DOM ngay khi tạo ra — nó chỉ là một "chiến lược tìm phần tử". DOM chỉ thực sự được truy vấn khi gọi action (`.fill()`, `.click()`, `.hover()`) hoặc `expect(...)`, và mỗi lần gọi tự động **auto-retry** theo DOM hiện tại. Vì vậy gán `Locator` một lần trong constructor là đủ — không lo bị "cũ" (stale) dù trang có điều hướng/reload, khác hẳn với `ElementHandle` kiểu cũ.

## 4. Khi nào cần method thay vì property cố định

Khi locator phụ thuộc **tham số chỉ biết lúc runtime** (ví dụ tên user cụ thể), không thể khai là property cố định — phải là method nhận tham số, ví dụ [src/pages/dashboard/users/add-user.page.ts:101-103](../src/pages/dashboard/users/add-user.page.ts#L101-L103):

```ts
async hoverUserName(userName: string) {
    await this.page.getByRole('link', { name: userName, exact: true }).hover();
}
```

Và message lỗi login (chứa chính username người dùng nhập) trong [src/pages/login/login.page.ts:39-42](../src/pages/login/login.page.ts#L39-L42):
```ts
async getErrorMessage(userName: string) {
    const errorMsg = this.page.getByText(`Error: The username ${userName} is not registered on this site. If you are unsure of your username, try your email address instead.`);
    return errorMsg;
}
```

## 5. Ưu tiên locator ngữ nghĩa (semantic) hơn XPath/CSS thô

Thứ tự ưu tiên áp dụng xuyên suốt project: `getByRole` > `getByLabel` > `getByText` > CSS/id (chỉ khi không còn cách nào khác), ví dụ [src/pages/dashboard/users/add-user.page.ts:39-46](../src/pages/dashboard/users/add-user.page.ts#L39-L46):
```ts
this.userNameTextboxLoc = this.page.getByLabel('Username (required)');
this.roleComboboxLoc = this.page.getByLabel('Role');
this.msgCreateUserLoc = this.page.getByText('New user created. ');
```

**Hai bẫy cần kiểm tra trước khi tin vào locator lấy từ DevTools:**
1. **Role bị ghi đè bởi thuộc tính `role` tường minh trên DOM** — một thẻ `<a href>` có role mặc định `link`, nhưng nếu DOM khai `role="menuitem"` tường minh, accessible role thật là `menuitem`. `getByRole('link', ...)` sẽ không khớp trong trường hợp này.
2. **Text hiển thị bị cắt bởi CSS (`text-overflow: ellipsis`)** không phải nội dung DOM thật — phải kiểm tra `textContent` thật trong tab Elements/Accessibility trước khi dùng làm điều kiện `name` với `exact: true`.

## 6. Naming convention cho locator

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Locator cố định (property) | hậu tố `Loc` | `usersTabLoc`, `msgCreateUserLoc`, `duplicateUserNameMsgLoc` |
| Locator động (method, có tham số) | không có hậu tố `Loc` — tên mô tả hành động/mục đích | `hoverUserName(userName)`, `getErrorMessage(userName)` |
| Action method | động từ + đối tượng | `fillUserName`, `clickLoginButton`, `submitAddUser`, `selectRole` |

Tên khác nhau giữa 2 nhóm đầu giúp người đọc phân biệt ngay "cái này dùng trực tiếp" hay "cái này cần truyền tham số trước khi dùng".

## 7. `readonly` cho locator không đổi sau khi gán

```ts
readonly userNameLogin: Locator;
readonly passwordLogin: Locator;
```
`readonly` chỉ cho phép gán một lần (tại constructor). Nếu sau này một method khác lỡ viết nhầm `this.userNameLogin = ...` thay vì `this.passwordLogin = ...` (lỗi copy-paste rất dễ xảy ra khi có nhiều field/method tên gần giống nhau), TypeScript sẽ báo lỗi compile ngay lập tức thay vì để lỗi trôi tới lúc chạy test mới phát hiện.

Hiện trạng: **mọi Page Object trong project đều đã áp dụng `readonly`** cho toàn bộ locator, kể cả `page`/`baseUrl` trong `BasePage` và chuỗi selector `storeFrontPageLoc` trong `StoreFrontHomePage`. Page Object mới tạo phải giữ đúng quy ước này.

## 8. POM cung cấp locator cho cả action lẫn assertion

Nguyên tắc: **test không bao giờ tự viết `page.getByRole(...)`/`page.getByText(...)` trực tiếp** để assertion — phải lấy đúng locator đã khai trong POM, dù locator đó "chỉ để nhìn" chứ không thao tác. Ví dụ đúng trong [tests/login/login.spec.ts](../tests/login/login.spec.ts):
```ts
await loginPage.fillUserNameLogin(userName);
await expect(loginPage.userNameLogin).toHaveValue(userName);   // dùng lại chính locator đã khai trong POM

// Verify login thành công: heading nằm ở DashboardBasePage, không nằm ở LoginPage
const dashboardBasePage = new DashboardBasePage(page);
await expect(dashboardBasePage.dashboardHeadingLoc).toHaveText("Dashboard");
```
Nếu selector thay đổi, chỉ cần sửa đúng 1 chỗ trong POM — không phải rà từng file test xem có chỗ nào tự viết lại locator y hệt.
