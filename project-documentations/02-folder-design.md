# 02 — Thiết kế folder

## 1. Cấu trúc tổng thể

```
playwright-automation-framework/
├── pom/                        # Page Object Model — mô tả trang web
│   ├── dashboard/               # Khu vực Admin (sau khi login vào wp-admin)
│   └── storefront/               # Khu vực trang công khai (không cần login)
├── tests/                       # Kịch bản test — MIRROR 1-1 với cấu trúc pom/
│   ├── dashboard/
│   └── storefront/
├── fixtures/                    # Custom fixture (mở rộng test của Playwright)
├── utils/                       # Hàm thuần, không phụ thuộc page/browser
├── project-documentations/       # Tài liệu thiết kế (các file .md này)
├── .env / .env.example          # Biến môi trường (thật / mẫu)
├── .gitignore
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## 2. Vì sao tách `dashboard/` và `storefront/` ở cấp cao nhất

Đây là ranh giới lớn nhất của bản thân website: **2 vùng có ngữ cảnh xác thực và cấu trúc trang khác hẳn nhau**:
- `dashboard/` — mọi trang đều nằm sau đăng nhập (`/wp-admin/...`), dùng chung 1 khung sườn (admin bar, sidebar menu) — đây là lý do `DashboardBasePage` (xem [03-pom-design.md](03-pom-design.md)) chỉ cần tồn tại trong nhánh này.
- `storefront/` — trang công khai (`/`, `/category/...`, `/single-post/...`), không có sidebar admin, không bắt buộc phải login để xem.

Tách ở cấp cao nhất giúp không bao giờ nhầm lẫn khi mở rộng: thêm 1 trang admin mới luôn đi vào `dashboard/`, thêm 1 trang công khai mới luôn đi vào `storefront/`.

## 3. Vì sao `pom/` và `tests/` mirror 1-1 theo module

Bên trong `dashboard/`, cả `pom/` lẫn `tests/` đều được chia theo đúng **menu thật của WordPress Admin sidebar**: `login/`, `dashboard/`, `users/`, `posts/`, `media/`, `page/`, `comments/`, `appearance/`, `plugins/`, `setttings/`, `tools/`, `mini-orange-api/`.

```
pom/dashboard/users/add-user.page.ts   <-->   tests/dashboard/users/add-user.spec.ts
pom/dashboard/users/profile.page.ts    <-->   tests/dashboard/users/profile.spec.ts
```

Lợi ích: **muốn sửa test nào, biết ngay page object tương ứng nằm ở đâu** — không cần tìm kiếm toàn project. Khi thêm 1 module mới (VD: `Widgets`), quy trình luôn là tạo cùng lúc `pom/dashboard/appearance/widgets.page.ts` và `tests/dashboard/appearance/widgets.spec.ts`, giữ 2 cây thư mục luôn khớp nhau.

## 4. Trường hợp đặc biệt: gộp "All Users" và "Add User" vào chung 1 file POM

Ban đầu dự định mỗi tab một file POM riêng (`all-users.page.ts`, `add-user.page.ts`), nhưng 2 tab này **thao tác trên cùng một entity (User)** và có sự phụ thuộc chặt: muốn test "All Users" (search, xóa) luôn cần có sẵn 1 user do "Add User" tạo ra. Quyết định: gộp toàn bộ locator/action của cả 2 tab vào **một class `UserPage`** trong `pom/dashboard/users/add-user.page.ts`.

File `pom/dashboard/users/all-users.page.ts` vẫn được **giữ lại** (không xóa) nhưng chỉ còn 1 dòng comment trỏ sang nơi thực sự chứa code:
```ts
// Kết hợp POM của tab All Users & Add User vào cùng 1 file POM -> pom/dashboard/users/add-user.page.ts
```
Giữ lại file này (thay vì xóa hẳn) để bất kỳ ai tìm theo đúng cấu trúc mirror (`tests/.../all-users.spec.ts` → mong đợi có `pom/.../all-users.page.ts`) đều thấy ngay ghi chú dẫn đường, không bị "mất dấu".

## 5. Vì sao `fixtures/` và `utils/` nằm ở gốc, không nằm trong `dashboard/`/`storefront/`

Cả 2 lớp này đều là **hạ tầng dùng chung**, không thuộc riêng khu vực nào:
- `fixtures/dashboard-fixture.ts` tuy tên có "dashboard" (vì hiện tại chỉ phục vụ login khu vực admin), nhưng về vị trí đặt ở gốc `fixtures/` để nếu sau này có thêm fixture cho `storefront` (ví dụ fixture giỏ hàng), cả hai cùng nằm cạnh nhau, dễ so sánh/tái sử dụng.
- `utils/random-data.util.ts` (sinh dữ liệu ngẫu nhiên) không hề biết gì về `page`/`browser`, dùng được cho **cả 2 khu vực** — không có lý do để nằm bên trong `dashboard/` hay `storefront/`.

## 6. `project-documentations/` — tài liệu song song với code, không lẫn vào code

Tài liệu thiết kế được tách hẳn khỏi `pom/`/`tests/` để không bị công cụ build/test quét nhầm, và để người mới vào dự án đọc đúng 1 nơi duy nhất hiểu toàn bộ quyết định kiến trúc trước khi đọc code chi tiết. Thứ tự đánh số (`01` → `06`) phản ánh đúng trình tự nên đọc: từ hiểu **website** → hiểu **cấu trúc folder** → hiểu **POM** → hiểu **utils** → hiểu **fixture** → hiểu **coding convention** áp dụng xuyên suốt tất cả.
