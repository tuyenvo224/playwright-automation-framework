# 06 — Coding Convention

Tài liệu này tổng hợp toàn bộ quy ước áp dụng xuyên suốt project — phần lớn được rút ra trực tiếp từ các quyết định thiết kế ở [03-pom-design.md](03-pom-design.md), [04-utils-design.md](04-utils-design.md), [05-fixture-design.md](05-fixture-design.md), cộng thêm các quy ước riêng cho phần viết test (`tests/`) và cấu hình project chưa nằm ở đâu khác.

## 1. Naming

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| File Page Object | `<ten-trang>.page.ts` | `add-user.page.ts`, `login.page.ts` |
| File test | `<ten-trang>.spec.ts` | `add-user.spec.ts`, `login.spec.ts` |
| File base page (lớp cha dùng chung) | `<pham-vi>.base.page.ts` hoặc `base.page.ts` | `base.page.ts`, `dashboard.base.page.ts` |
| Class Page Object | PascalCase, hậu tố `Page` | `BasePage`, `LoginPage`, `UserPage`, `DashboardBasePage` |
| Locator cố định (property) | camelCase, hậu tố `Loc` | `usersTabLoc`, `msgCreateUserLoc` |
| Locator động (method có tham số) | camelCase, **không** hậu tố `Loc` | `hoverUserName(userName)`, `getErrorMessage(userName)` |
| Action method | động từ + đối tượng | `fillUserName`, `clickLoginButton`, `submitAddUser`, `selectRole` |
| Hàm sinh dữ liệu trong `src/utils/` | `random<Loai>` | `randomUserName`, `randomEmail`, `randomNumericString` |
| Biến theo dõi trạng thái đã tạo (để cleanup) | `created<TenEntity>` | `createdUserName` |

## 2. Quy ước cho `src/pages/`

- Mọi Page Object kế thừa (trực tiếp hoặc gián tiếp) từ `BasePage` — nơi duy nhất giữ `page`, đọc `BASE_URL` và cung cấp `goto(path)`.
- Locator khai kiểu `Locator` (import từ `@playwright/test`), **gán trong thân constructor**, sau `super(page)` — không khai giá trị ngay tại dòng property (xem lý do chi tiết ở [03-pom-design.md §2](03-pom-design.md#2-locator-kiểu-dữ-liệu-và-thời-điểm-khởi-tạo)).
- Ưu tiên locator ngữ nghĩa: `getByRole` > `getByLabel` > `getByText` > CSS/id (chỉ khi không còn lựa chọn nào khác).
- Trước khi dùng `exact: true` với `name`, luôn kiểm tra: (1) `role` tường minh trên DOM có ghi đè role mặc định của thẻ HTML không, (2) text hiển thị có bị CSS cắt (ellipsis) không — copy nhầm text bị cắt là lỗi hay gặp nhất.
- Thêm `readonly` cho mọi locator không cần gán lại sau constructor — giúp TypeScript tự bắt lỗi gán nhầm biến (copy-paste).
- Page Object kế thừa từ Page Object cha liên quan (VD: mọi trang trong `dashboard/` kế thừa `DashboardBasePage`; `LoginPage` và trang `storefront/` kế thừa thẳng `BasePage`) để dùng lại locator/action chung — không copy-paste.
- Class con gọi `super(page)` đầu constructor và **không** tự khai lại `page: Page` / gán lại `this.page = page` — `BasePage` đã làm việc này.- POM cung cấp locator cho **cả action lẫn assertion** — test không bao giờ tự viết `page.getByRole(...)`/`page.getByText(...)` để assertion, phải lấy từ property/method có sẵn trong POM.

## 3. Quy ước cho `src/utils/`

- Chỉ chứa hàm thuần, không phụ thuộc `Page`/`Browser`.
- **Luôn có `export`** cho mọi hàm/hằng số dùng ở file khác — thiếu `export` trong file không có `import`/`export` nào khác sẽ khiến TypeScript coi cả file là "global script", vô tình để lộ ra ngoài scope toàn cục (xem chi tiết [04-utils-design.md §6](04-utils-design.md#6-bẫy-quan-trọng-bắt-buộc-phải-có-export)).
- Chỉ thêm tham số cho hàm khi có **từ 2 nhu cầu giá trị khác nhau trở lên** ("rule of three") — không đoán trước. Khi cần thêm, dùng **default parameter** (`param: T = defaultValue`), không dùng tham số bắt buộc thiếu kiểu, và cân nhắc kỹ giữa `param?: T` (tùy chọn, phải tự xử lý `undefined`) với `param: T = default` (đã có sẵn giá trị mặc định).
- Bọc thư viện bên thứ 3 (VD: `faker`) bên trong hàm của `src/utils/`, không để test file import thư viện đó trực tiếp.

## 4. Quy ước cho `src/fixtures/`

- Đặt tên file `<pham-vi>-fixture.ts` (VD: `dashboard-fixture.ts`).
- Mỗi fixture chỉ chuẩn bị **một loại trạng thái** cụ thể (VD: "đã login") — không nhồi nhiều trách nhiệm không liên quan vào cùng 1 fixture.
- File test dùng fixture phải import `test` từ file fixture, không phải từ `@playwright/test`.
- Nếu trong test có bước logout rồi cần login lại (cleanup, hoặc verify quyền theo role khác), phải gọi lại các bước login **thủ công** bằng `new LoginPage(page)` — fixture chỉ chạy setup một lần lúc đầu test, không tự chạy lại giữa chừng.

## 5. Quy ước viết test (`tests/`)

### 5.0 Import

- Code trong `src/` luôn được import qua **path alias**, không dùng đường dẫn tương đối `../../../`:
  ```ts
  import { UserPage } from '@pages/dashboard/users/add-user.page';
  import { test } from '@fixtures/dashboard-fixture';
  import { randomUserName } from '@utils/random-data.util';
  ```
- Bên trong `src/` cũng dùng alias khi import chéo thư mục (VD: `import { BasePage } from "@pages/base.page";`).
- Vị trí file test mirror đúng vị trí page object trong `src/pages/` (VD: `src/pages/login/login.page.ts` ↔ `tests/login/login.spec.ts`).

### 5.1 Cấu trúc file
- Mỗi file test bắt đầu bằng `test.describe("<Tên module>", () => {...})`.
- Mỗi test case dùng `test.step(...)` bọc quanh các bước logic chính, đặt tên step trùng hoặc mô tả rõ hơn tên test — giúp đọc report dễ theo dõi bước nào đang chạy.
- `test.beforeEach` dùng để: xin fixture (kích hoạt login), sinh dữ liệu test mới (username/email random), reset biến theo dõi cleanup (`createdXxx = undefined`), khởi tạo Page Object.
- `test.afterEach` (nếu cần dọn dữ liệu) luôn bắt đầu bằng điều kiện gác cổng:
  ```ts
  test.afterEach(async ({ page }) => {
      if (!createdUserName) return;   // Không tạo gì -> không cần dọn
      // ... phần dọn dẹp
  });
  ```

### 5.2 Pattern dọn dẹp dữ liệu test — "cờ theo dõi" (tracking flag)

Không phải test nào cũng tạo ra dữ liệu cần xóa. Dùng 1 biến cờ theo dõi, chỉ gán **ngay sau** khi `expect(...)` xác nhận tạo thành công:
```ts
let createdUserName: string | undefined;

test.beforeEach(async ({ dashboardBasePage }) => {
    createdUserName = undefined;   // bắt buộc reset mỗi test
    // ...
});

test("Add new user with username & email only", async ({ page }) => {
    // ... tạo user
    await expect(userPage.msgCreateUserLoc).toBeVisible();
    createdUserName = userName;   // chỉ gán SAU KHI xác nhận thành công
});
```
Nếu `expect` phía trên fail, dòng gán không chạy tới → `afterEach` tự biết không cần dọn — không cần đoán qua việc search lại UI, không cần tách nhiều `describe`.

### 5.3 "Single source of truth" khi tạo dữ liệu test

Giá trị truyền vào action (`fillUserName(...)`) và giá trị gán cho biến theo dõi (`createdUserName`) phải luôn là **cùng một biến**, không phải 2 chuỗi viết tay ở 2 nơi khác nhau:
```ts
test("Add new user with username is number", async ({ page }) => {
    const testUserName = randomNumericString(10);   // 1 biến — dùng lại ở cả 2 chỗ dưới
    await userPage.fillUserName(testUserName);
    // ...
    createdUserName = testUserName;   // dùng lại đúng biến, không viết tay chuỗi mới
});
```

### 5.4 Test độc lập (test isolation)

Mọi bước cần thiết cho một kịch bản phải nằm **trong cùng một test**, không phụ thuộc dữ liệu do test khác để lại — vì (1) Playwright không đảm bảo thứ tự chạy test, và (2) `afterEach` đã tự dọn sạch dữ liệu ngay sau mỗi test. Ví dụ test "duplicate username" phải tự tạo user gốc rồi mới thử tạo trùng, tất cả trong cùng 1 test — xem ví dụ đầy đủ ở [tests/dashboard/users/add-user.spec.ts](../tests/dashboard/users/add-user.spec.ts) (test `"Add new user with duplicate username"`).

### 5.5 Cô lập nguyên nhân lỗi khi test trùng lặp dữ liệu

Khi test 1 field bị trùng (username hoặc email), field còn lại ở lần thử thứ 2 phải dùng giá trị **khác** với lần đầu — để chắc chắn lỗi trả về đúng là do field đang test, không lẫn với lỗi trùng ở field kia:
```ts
// Test trùng username -> email lần 2 phải khác lần 1
await userPage.fillUserName(testUserName);       // trùng — cố ý
await userPage.fillEmail(`dup2-${Date.now()}@gmail.com`);   // khác — để cô lập nguyên nhân
```

## 6. Quản lý biến môi trường

- Không hardcode tài khoản/mật khẩu/URL trong code — đọc từ `.env` qua `process.env.KEY!` (dấu `!` vì TypeScript luôn coi `process.env.KEY` có kiểu `string | undefined`).
- `.env` phải nằm trong `.gitignore`; `.env.example` (cùng tên biến, giá trị rỗng) được commit để người khác biết cần khai báo gì.
- Cú pháp `.env` là `KEY=value` thuần túy — **không** dùng cú pháp JavaScript (không `const`, không dấu nháy, không dấu `;`), vì `dotenv` sẽ đọc luôn cả ký tự thừa đó vào làm một phần giá trị.
- `playwright.config.ts` phải gọi `dotenv.config(...)` trước khi bất kỳ giá trị `process.env.*` nào được dùng ở nơi khác trong project — Playwright luôn load file config này trước khi chạy test, nên chỉ cần đặt đúng 1 lần ở đây.

## 7. Cấu hình TypeScript (`tsconfig.json`)

- Project phải luôn có `tsconfig.json` ở gốc — thiếu file này khiến editor không nhận diện đúng project là Node.js, dễ báo lỗi sai (VD: không nhận ra `process` dù `@types/node` đã cài đủ). `"types": ["node"]` khai tường minh để chắc chắn type của Node (`process`, `__dirname`...) luôn được nạp.
- Không dùng `"moduleResolution": "node"`/`"node10"` — bị đánh dấu deprecated ở các bản TypeScript mới. Vì code hiện tại import không ghi đuôi file (`from '@pages/login/login.page'`), **không đổi sang** `"node16"`/`"nodenext"` (yêu cầu ghi đuôi file, sẽ làm gãy toàn bộ import hiện có). Đơn giản nhất: không khai `moduleResolution`, để TypeScript tự suy luận từ `"module": "commonjs"`.
- Path alias khai trong `"paths"` với đường dẫn bắt đầu bằng `./` (tương đối so với vị trí `tsconfig.json`), **không** khai `"baseUrl"` — project dùng TypeScript 7, bản này đã bỏ `baseUrl`:
  ```jsonc
  "paths": {
    "@data/*": ["./src/data/*"],
    "@pages/*": ["./src/pages/*"],
    "@fixtures/*": ["./src/fixtures/*"],
    "@utils/*": ["./src/utils/*"]
  }
  ```
- Thêm alias mới khi có thư mục mới trong `src/` cần import từ nơi khác — luôn theo dạng `@<ten-thu-muc>/*` → `./src/<ten-thu-muc>/*`.
- Chạy `npm run typecheck` (`tsc --noEmit`) trước khi commit để bắt lỗi type/import sai đường dẫn — Playwright khi chạy test **không** kiểm tra type, nên lỗi type có thể lọt qua nếu chỉ chạy test.
