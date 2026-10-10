# 03 — Thiết kế Page Object Model (POM)

## 1. Sơ đồ kế thừa (inheritance)

```
LoginPage                       pom/dashboard/login/login.page.ts
   │  (login, đọc BASE_URL, các heading dashboard dùng để verify login thành công)
   └── DashboardBasePage        pom/dashboard/dashboard.base.page.ts
          │  (toàn bộ tab menu điều hướng dùng chung: Users, Posts, Media, Pages,
          │   Comments, Tools, Appearance, Plugins, hoverProfile/clickLogout...)
          ├── HomePage          pom/dashboard/dashboard/home.page.ts
          ├── UpdatesPage       pom/dashboard/dashboard/updates.page.ts
          ├── UserPage          pom/dashboard/users/add-user.page.ts   (gộp Add User + All Users)
          └── ProfilePage       pom/dashboard/users/profile.page.ts

LoginPage
   └── StroreFrontHomePage      pom/storefront/home.page.ts
          (trang storefront cần link ra từ admin bar, nên vẫn kế thừa LoginPage
           để tái dùng cơ chế login + baseUrl khi cần xuất phát từ trang admin)
```

**Lý do dùng kế thừa thay vì lặp lại code:** menu điều hướng (`clickUserTab`, `clickPostsTab`...) và cơ chế login xuất hiện ở hầu hết các trang admin. Định nghĩa một lần ở `DashboardBasePage`/`LoginPage`, mọi Page Object con tự động có sẵn — không copy-paste locator menu sang từng file.

**Quy tắc bắt buộc khi tạo Page Object mới kế thừa:** vẫn phải tự khai `page: Page` và gọi `super(page)` đầu constructor, để lớp cha khởi tạo đúng locator của nó:
```ts
export class HomePage extends DashboardBasePage {
    page: Page;

    constructor(page: Page) {
        super(page);      // bắt buộc — để DashboardBasePage + LoginPage khởi tạo locator của chúng
        this.page = page;
        // khai thêm locator riêng của HomePage tại đây (nếu có)
    }
}
```

## 2. Locator: kiểu dữ liệu và thời điểm khởi tạo

Mọi locator trong project đều khai kiểu `Locator` (từ `@playwright/test`) và **gán trong thân constructor**, sau khi `this.page` đã có giá trị — ví dụ [pom/dashboard/login/login.page.ts](../pom/dashboard/login/login.page.ts):

```ts
export class LoginPage {
    page: Page;
    readonly userNameLogin: Locator;
    readonly passwordLogin: Locator;

    constructor(page: Page) {
        this.page = page;                                                     // (1) gán page TRƯỚC
        this.userNameLogin = this.page.getByRole('textbox', { name: 'Username or Email Address' });  // (2)
        this.passwordLogin = this.page.getByRole('textbox', { name: 'Password' });
    }
}
```

**Vì sao không được khai giá trị `Locator` ngay tại dòng khai báo property** (kiểu `readonly userNameLogin: Locator = this.page.getByRole(...)`)? Vì property initializer chạy **trước** thân constructor — tại thời điểm đó `this.page` chưa được gán, gọi `this.page.getByRole(...)` sẽ lỗi. Đây là lý do bắt buộc phải gán trong constructor, không phải tại chỗ khai báo.

## 3. Không cần getter — vì `Locator` vốn đã lazy

`Locator` trong Playwright **không** query DOM ngay khi tạo ra — nó chỉ là một "chiến lược tìm phần tử". DOM chỉ thực sự được truy vấn khi gọi action (`.fill()`, `.click()`, `.hover()`) hoặc `expect(...)`, và mỗi lần gọi tự động **auto-retry** theo DOM hiện tại. Vì vậy gán `Locator` một lần trong constructor là đủ — không lo bị "cũ" (stale) dù trang có điều hướng/reload, khác hẳn với `ElementHandle` kiểu cũ.

## 4. Khi nào cần method thay vì property cố định

Khi locator phụ thuộc **tham số chỉ biết lúc runtime** (ví dụ tên user cụ thể), không thể khai là property cố định — phải là method nhận tham số, ví dụ [pom/dashboard/users/add-user.page.ts:111-113](../pom/dashboard/users/add-user.page.ts):

```ts
async hoverUserName(userName: string) {
    await this.page.getByRole('link', { name: userName, exact: true }).hover();
}
```

Và message lỗi login (chứa chính username người dùng nhập) trong [pom/dashboard/login/login.page.ts:50-53](../pom/dashboard/login/login.page.ts):
```ts
async getErrorMessage(userName: string) {
    const errorMsg = this.page.getByText(`Error: The username ${userName} is not registered on this site. If you are unsure of your username, try your email address instead.`);
    return errorMsg;
}
```

## 5. Ưu tiên locator ngữ nghĩa (semantic) hơn XPath/CSS thô

Thứ tự ưu tiên áp dụng xuyên suốt project: `getByRole` > `getByLabel` > `getByText` > CSS/id (chỉ khi không còn cách nào khác), ví dụ [pom/dashboard/users/add-user.page.ts:47-53](../pom/dashboard/users/add-user.page.ts):
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

## 8. POM cung cấp locator cho cả action lẫn assertion

Nguyên tắc: **test không bao giờ tự viết `page.getByRole(...)`/`page.getByText(...)` trực tiếp** để assertion — phải lấy đúng locator đã khai trong POM, dù locator đó "chỉ để nhìn" chứ không thao tác. Ví dụ đúng trong [tests/dashboard/login/login.spec.ts](../tests/dashboard/login/login.spec.ts):
```ts
await loginPage.fillUserNameLogin(userName);
await expect(loginPage.userNameLogin).toHaveValue(userName);   // dùng lại chính locator đã khai trong POM
```
Nếu selector thay đổi, chỉ cần sửa đúng 1 chỗ trong POM — không phải rà từng file test xem có chỗ nào tự viết lại locator y hệt.
