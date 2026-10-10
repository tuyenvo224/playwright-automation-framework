# 04 — Thiết kế `src/utils/`

## 1. Vai trò của `src/utils/` — khác gì với `src/pages/` và `src/fixtures/`

`src/utils/` chỉ chứa **hàm thuần (pure function)**, không phụ thuộc `Page`/`Browser`/bất kỳ thứ gì của Playwright. Đây là điểm phân biệt rõ ràng với `src/pages/` (luôn cần `Page`) và `src/fixtures/` (luôn gắn với vòng đời của `test`). Hiện tại project có một file duy nhất: [src/utils/random-data.util.ts](../src/utils/random-data.util.ts), chuyên sinh dữ liệu test ngẫu nhiên. Nơi sử dụng import qua alias `@utils/...` (xem [02-folder-design.md §7](02-folder-design.md#7-path-alias--import-theo-tên-không-theo-số-tầng-thư-mục)).

## 2. Nội dung hiện có

```ts
import { faker } from '@faker-js/faker';

export function randomUserName(prefix: string = 'E101-tuyen'): string {
    return `${prefix}-${Date.now()}`;
}

export function randomEmail(prefix: string = 'tuyen'): string {
    return `${prefix}-${Date.now()}@gmail.com`;
}

export const defaultTestPassword = "Editor123456!@#!@";

export function randomNumericString(length: number): string {
    return faker.string.numeric(length);
}

export function randomAlphaString(length: number): string {
    return faker.string.alpha(length);
}

export function randomAlphanumericString(length: number): string {
    return faker.string.alphanumeric(length);
}
```

## 3. Nguyên tắc thiết kế tham số: chỉ thêm khi có bằng chứng cần dùng (YAGNI / "rule of three")

`randomUserName`/`randomEmail` dùng **default parameter** (`prefix: string = 'E101-tuyen'`), không phải vì "thêm cho chắc" mà vì đã có bằng chứng cụ thể: nếu dự án về sau cần prefix khác cho module khác, chỉ cần gọi `randomUserName('Khac')` mà không phá vỡ mọi chỗ đang gọi `randomUserName()` không tham số.

Nguyên tắc chung khi viết hàm mới trong `src/utils/`: **bắt đầu bằng hàm không tham số** nếu hiện tại chỉ có đúng 1 nhu cầu. Chỉ thêm tham số khi thấy **từ 2 chỗ gọi trở lên** cần giá trị khác nhau thật sự ("rule of three") — không đoán trước nhu cầu chưa xảy ra, vì thêm tham số sau này gần như không tốn chi phí (dùng dạng default/optional không phá vỡ chỗ gọi cũ).

### So sánh 3 cách viết tham số

| Cách viết | Ý nghĩa | Vấn đề |
|---|---|---|
| `function f(prefix): string` | Tham số **bắt buộc**, thiếu kiểu | TypeScript coi là `any` ngầm định; mọi chỗ gọi `f()` không tham số sẽ lỗi compile — phá vỡ tương thích ngược |
| `function f(prefix?: string): string` | Tham số **tùy chọn** | Hợp lệ, nhưng bên trong hàm phải tự xử lý `prefix` có thể là `undefined` |
| `function f(prefix: string = 'default'): string` | **Default parameter** (đang dùng trong project) | Tốt nhất: vừa tùy chọn, vừa có sẵn giá trị mặc định, không cần xử lý `undefined` thủ công |

## 4. `defaultTestPassword` — hằng số, không phải hàm generator

Khác với `randomUserName`/`randomEmail` (sinh giá trị mới mỗi lần gọi dựa vào `Date.now()`), mật khẩu test được giữ **cố định** — export dạng `const`, không phải `function`, vì bản chất khác nhau: một bên là "công thức sinh dữ liệu", một bên là "một giá trị có sẵn dùng chung". Không gộp chung logic của 2 loại vào cùng 1 kiểu khai báo dù nằm cùng 1 file.

## 5. Bọc thư viện ngoài (`faker`) thay vì để test file import trực tiếp

`randomNumericString`/`randomAlphaString`/`randomAlphanumericString` gọi `faker.string.*` bên trong, nhưng **test file không bao giờ `import { faker } from '@faker-js/faker'` trực tiếp** — luôn import qua các hàm wrapper trong `src/utils/`. Lý do: nếu sau này đổi từ `faker` sang thư viện khác (hoặc viết tay không dùng thư viện), chỉ cần sửa đúng 1 file `src/utils/random-data.util.ts`, không phải sửa lại từng file test đang gọi `faker` trực tiếp.

## 6. Bẫy quan trọng: bắt buộc phải có `export`

Nếu một file `.ts` **không có bất kỳ dòng `import`/`export`** nào, TypeScript coi nó là **global script** (không phải module) — mọi khai báo top-level tự động lọt vào **scope toàn cục của cả project**, file khác gọi được mà không cần `import`. Đây là hành vi ẩn và nguy hiểm: chỉ cần vô tình thêm 1 dòng `import` bất kỳ vào file đó, hành vi global biến mất ngay lập tức, mọi chỗ đang gọi ngầm sẽ vỡ lỗi khó hiểu.

**Quy tắc bắt buộc:** mọi hàm/hằng số dùng ở file khác đều phải có `export`, và nơi sử dụng phải `import` tường minh:
```ts
// src/utils/random-data.util.ts
export function randomUserName(...): string { ... }

// tests/dashboard/users/add-user.spec.ts
import { defaultTestPassword, randomAlphaString, randomEmail, randomNumericString, randomUserName } from '@utils/random-data.util';
```

## 7. Lợi ích so với việc hardcode chuỗi cố định trong test

So sánh trực tiếp trong [tests/dashboard/users/add-user.spec.ts](../tests/dashboard/users/add-user.spec.ts): trước đây có `const testUserName = '1234567890';`, nay là `const testUserName = randomNumericString(10);`. Lợi ích: mỗi lần chạy test sinh ra giá trị khác nhau, tránh lỗi "username đã tồn tại" nếu lần chạy trước cleanup thất bại giữa chừng và để sót dữ liệu — điều không thể tránh được nếu dùng chuỗi cố định.
