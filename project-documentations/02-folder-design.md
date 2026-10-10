# 02 — Thiết kế folder

## 1. Cấu trúc tổng thể

```
playwright-automation-framework/
├── src/                          # Toàn bộ code hỗ trợ test — KHÔNG chứa file .spec.ts
│   ├── pages/                    # Page Object Model — mô tả trang web
│   │   ├── base.page.ts          # BasePage — lớp gốc của mọi Page Object
│   │   ├── login/                # Trang login (đứng trước khu vực admin)
│   │   ├── dashboard/            # Khu vực Admin (sau khi login vào wp-admin)
│   │   │   └── dashboard.base.page.ts
│   │   └── storefront/           # Khu vực trang công khai (không cần login)
│   ├── fixtures/                 # Custom fixture (mở rộng test của Playwright)
│   └── utils/                    # Hàm thuần, không phụ thuộc page/browser
├── tests/                        # Kịch bản test — MIRROR 1-1 với cấu trúc src/pages/
│   ├── login/
│   ├── dashboard/
│   └── storefront/
├── project-documentations/       # Tài liệu thiết kế (các file .md này)
├── .github/workflows/            # CI GitHub Actions
├── .env / .env.example           # Biến môi trường (thật / mẫu)
├── .gitignore
├── playwright.config.ts
├── tsconfig.json                 # Cấu hình TypeScript + path alias
└── package.json
```

## 2. Vì sao gom code hỗ trợ vào `src/`, tách khỏi `tests/`

Trước đây `pom/`, `fixtures/`, `utils/` nằm rải ở gốc project, ngang hàng với `tests/`. Sau refactor, toàn bộ được gom vào `src/`:
- **Ranh giới rõ ràng:** `src/` là "thư viện" (page object, fixture, hàm tiện ích), `tests/` là "nơi dùng thư viện" (kịch bản test). Nhìn vào gốc project là thấy ngay 2 vai trò này.
- **Gốc project gọn hơn:** chỉ còn `src/`, `tests/`, tài liệu và các file cấu hình.
- **Dễ khai báo path alias:** mọi alias (`@pages/*`, `@fixtures/*`, `@utils/*`, `@data/*`) đều trỏ vào cùng 1 gốc `src/` (xem mục 7).

## 3. Vì sao tách `login/`, `dashboard/` và `storefront/` ở cấp cao nhất

Đây là ranh giới lớn nhất của bản thân website — **các vùng có ngữ cảnh xác thực và cấu trúc trang khác hẳn nhau**:
- `login/` — trang đăng nhập, là "cửa vào" khu vực admin nhưng **chưa** thuộc admin (chưa có sidebar, admin bar). Vì vậy `LoginPage` không nằm trong `dashboard/` và không kế thừa `DashboardBasePage`.
- `dashboard/` — mọi trang đều nằm sau đăng nhập (`/wp-admin/...`), dùng chung 1 khung sườn (admin bar, sidebar menu) — đây là lý do `DashboardBasePage` (xem [03-pom-design.md](03-pom-design.md)) chỉ cần tồn tại trong nhánh này.
- `storefront/` — trang công khai (`/`, `/category/...`, `/single-post/...`), không có sidebar admin, không bắt buộc phải login để xem.

Phần dùng chung cho **cả 3 vùng** (giữ `page`, đọc `BASE_URL`, điều hướng) nằm ở `src/pages/base.page.ts`, đặt ngay gốc `pages/` chứ không nằm trong vùng nào.

Tách ở cấp cao nhất giúp không bao giờ nhầm lẫn khi mở rộng: thêm 1 trang admin mới luôn đi vào `dashboard/`, thêm 1 trang công khai mới luôn đi vào `storefront/`.

## 4. Vì sao `src/pages/` và `tests/` mirror 1-1 theo module

Cả `src/pages/` lẫn `tests/` đều chia theo cùng một cây thư mục. Bên trong `dashboard/`, module được chia theo đúng **menu thật của WordPress Admin sidebar**: `dashboard/`, `users/`, `posts/`, `media/`, `page/`, `comments/`, `appearance/`, `plugins/`, `setttings/`, `tools/`, `mini-orange-api/`.

```
src/pages/login/login.page.ts                <-->   tests/login/login.spec.ts
src/pages/dashboard/users/add-user.page.ts   <-->   tests/dashboard/users/add-user.spec.ts
src/pages/dashboard/users/profile.page.ts    <-->   tests/dashboard/users/profile.spec.ts
src/pages/storefront/home.page.ts            <-->   tests/storefront/home.spec.ts
```

Lợi ích: **muốn sửa test nào, biết ngay page object tương ứng nằm ở đâu** — không cần tìm kiếm toàn project. Khi thêm 1 module mới (VD: `Widgets`), quy trình luôn là tạo cùng lúc `src/pages/dashboard/appearance/widgets.page.ts` và `tests/dashboard/appearance/widgets.spec.ts`, giữ 2 cây thư mục luôn khớp nhau.

Ngoại lệ: `tests/dashboard/users/account-permissions.spec.ts` không có page object riêng — test này dùng lại `UserPage` và `LoginPage` vì bản chất là kịch bản kết hợp nhiều trang (tạo user → logout → login bằng user mới → kiểm tra menu).

## 5. Trường hợp đặc biệt: gộp "All Users" và "Add User" vào chung 1 file POM

Ban đầu dự định mỗi tab một file POM riêng (`all-users.page.ts`, `add-user.page.ts`), nhưng 2 tab này **thao tác trên cùng một entity (User)** và có sự phụ thuộc chặt: muốn test "All Users" (search, xóa) luôn cần có sẵn 1 user do "Add User" tạo ra. Quyết định: gộp toàn bộ locator/action của cả 2 tab vào **một class `UserPage`** trong `src/pages/dashboard/users/add-user.page.ts`.

File `src/pages/dashboard/users/all-users.page.ts` vẫn được **giữ lại** (không xóa) nhưng chỉ còn 1 dòng comment trỏ sang nơi thực sự chứa code:
```ts
// Kết hợp POM của tab All Users & Add User vào cùng 1 file POM -> src/pages/dashboard/users/add-user.page.ts
```
Giữ lại file này (thay vì xóa hẳn) để bất kỳ ai tìm theo đúng cấu trúc mirror (`tests/.../all-users.spec.ts` → mong đợi có `src/pages/.../all-users.page.ts`) đều thấy ngay ghi chú dẫn đường, không bị "mất dấu".

## 6. Vì sao `fixtures/` và `utils/` nằm ở gốc `src/`, không nằm trong `pages/`

Cả 2 lớp này đều là **hạ tầng dùng chung**, không phải page object và không thuộc riêng khu vực nào:
- `src/fixtures/dashboard-fixture.ts` tuy tên có "dashboard" (vì hiện tại chỉ phục vụ login khu vực admin), nhưng đặt ở `src/fixtures/` để nếu sau này có thêm fixture cho `storefront` (ví dụ fixture giỏ hàng), cả hai cùng nằm cạnh nhau, dễ so sánh/tái sử dụng.
- `src/utils/random-data.util.ts` (sinh dữ liệu ngẫu nhiên) không hề biết gì về `page`/`browser`, dùng được cho **mọi khu vực** — không có lý do để nằm bên trong `pages/`.

## 7. Path alias — import theo tên, không theo số tầng thư mục

`tsconfig.json` khai báo các alias trỏ vào `src/`:

```jsonc
"paths": {
  "@data/*": ["./src/data/*"],
  "@pages/*": ["./src/pages/*"],
  "@fixtures/*": ["./src/fixtures/*"],
  "@utils/*": ["./src/utils/*"]
}
```

So sánh trước và sau refactor:
```ts
// Trước — phụ thuộc vào độ sâu thư mục của file test
import { UserPage } from '../../../pom/dashboard/users/add-user.page';

// Sau — giống nhau ở mọi file, dù file test nằm sâu bao nhiêu tầng
import { UserPage } from '@pages/dashboard/users/add-user.page';
```

Lợi ích: di chuyển 1 file test sang thư mục khác (hoặc đổi độ sâu) không làm gãy import; đọc import là biết ngay đang dùng page object, fixture hay util. Playwright tự đọc `paths` trong `tsconfig.json` khi chạy test nên không cần cấu hình thêm.

`@data/*` (trỏ tới `src/data/`) được khai sẵn cho dữ liệu test tĩnh (JSON...) — thư mục này **chưa tồn tại**, sẽ tạo khi có nhu cầu.

## 8. `project-documentations/` — tài liệu song song với code, không lẫn vào code

Tài liệu thiết kế được tách hẳn khỏi `src/`/`tests/` để không bị công cụ build/test quét nhầm, và để người mới vào dự án đọc đúng 1 nơi duy nhất hiểu toàn bộ quyết định kiến trúc trước khi đọc code chi tiết. Thứ tự đánh số (`01` → `06`) phản ánh đúng trình tự nên đọc: từ hiểu **website** → hiểu **cấu trúc folder** → hiểu **POM** → hiểu **utils** → hiểu **fixture** → hiểu **coding convention** áp dụng xuyên suốt tất cả.
