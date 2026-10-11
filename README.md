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
├── src/                       # Toàn bộ code hỗ trợ test (không chứa test)
│   ├── pages/                 # Page Object Model — base.page.ts + login/ + dashboard/ + storefront/
│   ├── fixtures/              # Custom fixture (VD: đăng nhập sẵn trước khi test)
│   └── utils/                 # Hàm thuần: sinh dữ liệu test ngẫu nhiên...
├── tests/                     # Kịch bản test — mirror 1-1 theo cấu trúc src/pages/
├── project-documentations/    # Tài liệu thiết kế (6 file .md ở trên)
├── .env.example               # Mẫu biến môi trường (không chứa giá trị thật)
├── playwright.config.ts       # Cấu hình chạy test
└── tsconfig.json              # Cấu hình TypeScript + path alias
```

Code trong `src/` được import qua **path alias** khai trong `tsconfig.json`, không dùng đường dẫn tương đối `../../../`:

| Alias | Trỏ tới |
|---|---|
| `@pages/*` | `src/pages/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@utils/*` | `src/utils/*` |
| `@data/*` | `src/data/*` (dành sẵn cho dữ liệu test, chưa sử dụng) |

```ts
import { UserPage } from '@pages/dashboard/users/add-user.page';
import { test } from '@fixtures/dashboard-fixture';
import { randomUserName } from '@utils/random-data.util';
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
BASE_URL=<URL trang admin, VD: https://pw-practice-dev.playwrightvn.com/wp-admin>
ADMIN_USERNAME=<tài khoản admin>
ADMIN_PASSWORD=<mật khẩu admin>
```

## Chạy test

```bash
npx playwright test                 # chạy toàn bộ test (chromium, firefox, webkit)
npx playwright test tests/dashboard/users/add-user.spec.ts   # chạy 1 file cụ thể
npx playwright show-report          # xem report HTML sau khi chạy xong
npm run typecheck                   # kiểm tra lỗi TypeScript toàn project (tsc --noEmit)
```

## CI

Project có sẵn workflow GitHub Actions tại [.github/workflows/playwright.yml](.github/workflows/playwright.yml), tự động chạy khi push/tạo Pull Request vào nhánh `main`/`master`, gồm các bước:

1. Cài dependencies (`npm ci`).
2. Kiểm tra type (`npm run typecheck`) — Playwright khi chạy test **không** kiểm tra type, nên bước này chặn lỗi type/import sai đường dẫn. Đặt trước bước cài browser để nếu lỗi thì job dừng ngay, không mất thời gian tải browser.
3. Cài browser — mặc định chỉ cài chromium (`npx playwright install --with-deps chromium`).
4. Chạy test — mặc định chỉ chạy chromium (`npx playwright test --project=chromium`).
5. Upload report HTML thành artifact `playwright-report` (giữ 30 ngày) để tải về xem trong tab **Actions** — bước này vẫn chạy kể cả khi test fail.

### Chọn browser chạy trên CI

| Cách kích hoạt | Browser |
|---|---|
| Push / Pull Request vào `main`/`master` | Chỉ **chromium** (nhanh, ~26 test) |
| Chạy tay từ tab **Actions** → chọn `chromium` | Chỉ **chromium** |
| Chạy tay từ tab **Actions** → chọn `all` | Cả **chromium, firefox, webkit** (~78 test, lâu hơn khoảng 3 lần) |

**Cách chạy tay** (không cần commit): repo trên GitHub → tab **Actions** → chọn workflow **Playwright Tests** ở cột trái → nút **Run workflow** → chọn branch, ở ô **Browser cần chạy** chọn `chromium` hoặc `all` → **Run workflow**.

**Lưu ý:**
- Nút **Run workflow** chỉ xuất hiện khi file workflow có `workflow_dispatch` đã nằm trên nhánh mặc định (`main`).
- **Re-run jobs** ở một lần chạy cũ chỉ chạy lại đúng cấu hình cũ, không chọn lại được browser — muốn đổi browser phải dùng **Run workflow**.
- Push/PR chỉ chạy chromium nên **không phát hiện được lỗi riêng của firefox/webkit** (VD: lỗi WordPress giành focus khi đang `fill` chỉ lộ ra trên firefox). Trước khi merge thay đổi lớn, nên chạy tay với `all` hoặc chạy đủ 3 browser ở local (`npx playwright test`).

### Biến môi trường trên CI

Vì `.env` không được commit, CI lấy biến môi trường từ **GitHub Actions Secrets**. Workflow đã truyền sẵn 3 secrets vào bước "Run Playwright tests":

```yaml
- name: Run Playwright tests
  run: |
    ...   # chạy chromium hoặc cả 3 browser tùy lựa chọn (xem mục trên)
  env:
    BASE_URL: ${{ secrets.BASE_URL }}
    ADMIN_USERNAME: ${{ secrets.ADMIN_USERNAME }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
```

Chỉ cần khai báo 3 secrets cùng tên tại **Repository Settings → Secrets and variables → Actions → New repository secret**, giá trị giống trong `.env` local. Code không cần sửa gì: trên CI không có file `.env` nên `dotenv` không ghi đè, `process.env.*` lấy đúng giá trị do workflow truyền vào.

**Lưu ý:**
- Tên secret phải trùng khớp chính xác (`BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`); thiếu secret nào thì biến đó rỗng và các test cần login sẽ fail.
- Khi dán giá trị secret, không để thừa dấu cách/dòng trống ở đầu hoặc cuối.
- Pull Request tạo từ **fork** không nhận được secrets → các test cần login sẽ fail trên PR đó.
