# playwright-automation-framework

Bộ test tự động (Playwright + TypeScript) cho trang quản trị WordPress **[pw-practice-dev.playwrightvn.com/wp-admin](https://pw-practice-dev.playwrightvn.com/wp-admin)**, sử dụng mô hình **Page Object Model (POM)**.

## Tài liệu thiết kế

Toàn bộ suy nghĩ, phân tích và quyết định thiết kế của project nằm trong [project-documentations/](project-documentations/), nên đọc theo đúng thứ tự sau:

1. [01-website-feature.md](project-documentations/01-website-feature.md) — Các tính năng của website và lưu ý gặp phải khi test (phần nào chậm, phần nào cần chú ý).
2. [02-folder-design.md](project-documentations/02-folder-design.md) — Thiết kế cấu trúc folder của project.
3. [03-pom-design.md](project-documentations/03-pom-design.md) — Thiết kế Page Object Model: locator, kế thừa, naming convention.
4. [04-utils-design.md](project-documentations/04-utils-design.md) — Thiết kế các hàm tiện ích (sinh dữ liệu test ngẫu nhiên...).
5. [05-fixture-design.md](project-documentations/05-fixture-design.md) — Thiết kế fixture dùng cho test (đăng nhập sẵn trước khi test).
6. [06-coding-convention-design.md](project-documentations/06-coding-convention-design.md) — Coding convention áp dụng xuyên suốt project.

## Cấu trúc project

```
playwright-automation-framework/
├── pom/                  # Page Object Model — mô tả trang web (dashboard/ + storefront/)
├── tests/                # Kịch bản test — mirror 1-1 theo cấu trúc pom/
├── fixtures/              # Custom fixture (VD: đăng nhập sẵn trước khi test)
├── utils/                 # Hàm thuần: sinh dữ liệu test ngẫu nhiên...
├── project-documentations/ # Tài liệu thiết kế (6 file .md ở trên)
├── .env.example           # Mẫu biến môi trường (không chứa giá trị thật)
├── playwright.config.ts   # Cấu hình chạy test
└── tsconfig.json          # Cấu hình TypeScript
```

Chi tiết đầy đủ về lý do thiết kế từng phần: xem [02-folder-design.md](project-documentations/02-folder-design.md) và [03-pom-design.md](project-documentations/03-pom-design.md).

## Cài đặt

```bash
npm install
npx playwright install
```

### Cấu hình biến môi trường

Project đọc URL và tài khoản đăng nhập từ file `.env` (không commit lên GitHub). Copy từ file mẫu rồi điền giá trị thật:

```bash
cp .env.example .env
```

Các biến cần khai báo trong `.env` (xem thêm [06-coding-convention-design.md §6](project-documentations/06-coding-convention-design.md#6-quản-lý-biến-môi-trường)):

```
BASE_URL=https://pw-practice-dev.playwrightvn.com/wp-admin
ADMIN_USERNAME=<tài khoản admin>
ADMIN_PASSWORD=<mật khẩu admin>
```

## Chạy test

```bash
npx playwright test                 # chạy toàn bộ test (chromium, firefox, webkit)
npx playwright test tests/dashboard/users/add-user.spec.ts   # chạy 1 file cụ thể
npx playwright show-report          # xem report HTML sau khi chạy xong
```

## CI

Project có sẵn workflow GitHub Actions tại [.github/workflows/playwright.yml](.github/workflows/playwright.yml), tự động cài dependencies, cài browser và chạy `npx playwright test` khi push/tạo Pull Request vào nhánh `main`/`master`. **Lưu ý:** vì `.env` không được commit, cần khai báo `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` dưới dạng GitHub Actions Secrets (Repository Settings → Secrets and variables → Actions) và truyền vào bước "Run Playwright tests" nếu muốn CI chạy được đầy đủ.
