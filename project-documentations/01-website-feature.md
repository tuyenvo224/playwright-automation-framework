# 01 — Tính năng website & lưu ý khi test

Website test: **[pw-practice-dev.playwrightvn.com/wp-admin](https://pw-practice-dev.playwrightvn.com/wp-admin)** — một trang quản trị **WordPress Admin Dashboard** tiêu chuẩn, có cài thêm plugin **miniOrange API** (bảo vệ/định danh REST API).

Tài liệu này chỉ ghi lại các tính năng và lưu ý **dựa trên phần đã thực sự khảo sát và implement test** trong project. Các mục còn lại (đã tạo sẵn folder/file rỗng để chờ triển khai) được liệt kê riêng ở cuối.

## 1. Khu vực Dashboard (Admin — sau khi login)

### 1.1 Login / Authentication
> Trang login nằm **trước** khu vực admin nên trong code được tách thành module riêng ở cấp cao nhất: [src/pages/login/](../src/pages/login/) ↔ [tests/login/](../tests/login/) (không nằm trong `dashboard/`).

- Trang login WordPress chuẩn: 2 textbox (`Username or Email Address`, `Password`) + nút `Log In`.
- Login thất bại hiển thị message dạng: `Error: The username {userName} is not registered on this site. If you are unsure of your username, try your email address instead.`
- Login thành công điều hướng về `/wp-admin/`, hiển thị heading `Dashboard`, `At a Glance`, `Activity`.
- **Lưu ý khi test:** message lỗi login chứa chính username người dùng nhập vào (interpolate động) — không thể hardcode toàn bộ chuỗi cố định trong assertion, phải dựng lại locator theo tham số (`getErrorMessage(userName)`).

### 1.2 Dashboard (Home / Updates)
- Tab **Home**: hiển thị 3 khối heading `Dashboard`, `At a Glance`, `Activity` — có thể vào qua tab `Dashboard` hoặc submenu `Home`, kết quả hiển thị giống nhau.
- Tab **Updates**: hiển thị heading `WordPress Updates`.
- **Lưu ý khi test:** menu `Dashboard` có 2 điểm vào cùng dẫn tới cùng 1 trang (`Dashboard` tab và `Home` submenu) — nên viết 2 test case riêng để xác nhận cả 2 đường dẫn đều đúng, thay vì giả định chúng tương đương.

### 1.3 Users (Users / Add User / Profile)
Đây là module được test kỹ nhất trong project hiện tại, gồm:

- **Add User** — form tạo user mới với các field: Username (bắt buộc), Email (bắt buộc), First Name, Last Name, Password, Role (combobox). Các validate đã ghi nhận:
  - Thiếu Username & Email → không tạo được, ở lại trang, không có message lỗi cụ thể.
  - Username chứa ký tự đặc biệt (`!@#$`) → message: `This username is invalid because it uses illegal characters. Please enter a valid username.`
  - Email sai định dạng → message: `The email address is not correct.`
  - Username đã tồn tại → message: `This username is already registered. Please choose another one.` — **kiểm tra trùng không phân biệt hoa/thường** (VD tạo `abc` trước, thử tạo `ABC` sau vẫn báo trùng).
  - Email đã tồn tại → message: ` This email is already registered. Please choose another one.`
  - Username hợp lệ có thể là chuỗi toàn số hoặc toàn chữ — cả hai đều tạo thành công (message: `New user created. `).
- **All Users** — có ô tìm kiếm (`Search Users`), sau khi search ra kết quả có thể hover vào tên user để hiện link `Delete`. Xóa user cần 2 bước: bấm `Delete` → điều hướng sang trang **Confirm Deletion** (có nút `Confirm Deletion`, và nếu user có nội dung liên quan — bài viết, comment — sẽ hiện thêm radio option `Delete all content.` cần chọn trước khi xác nhận được).
  - **Lưu ý khi test:** sau khi bấm `Delete`, trang điều hướng sang confirm-deletion cần chờ `page.waitForLoadState('domcontentloaded')` trước khi thao tác tiếp — nếu không chờ, nút `Confirm Deletion` có thể chưa sẵn sàng.
  - Nút `Confirm Deletion` có 2 trạng thái: **enabled ngay** (user không có content liên quan) hoặc **disabled cho tới khi chọn radio `Delete all content.`** — test cleanup phải kiểm tra `isEnabled()` trước, xử lý rẽ nhánh.
  - Sau khi xóa xong, search lại đúng username đó sẽ thấy message `No users found.`
- **Profile** — trang cá nhân, chỉ mới xác nhận có heading `Profile` hiển thị khi bấm vào tab.
- **Phân quyền theo Role (Account Permissions):** đã kiểm chứng 2 role:
  - **Editor**: thấy các tab `Dashboard, Posts, Media, Pages, Comments, Profile, Tools`; **không thấy** `Appearance, Plugins, Users`.
  - **Subscriber**: chỉ thấy `Dashboard, Profile`; **không thấy** `Posts, Media, Pages, Comments, Tools, Appearance, Plugins, Users`.
  - **Lưu ý khi test:** muốn verify quyền theo role, bắt buộc phải **logout tài khoản admin rồi login lại bằng chính user vừa tạo** — không thể test quyền chỉ bằng cách nhìn UI của admin. Đây là luồng tốn thời gian nhất trong bộ test hiện tại (tạo user → logout → login user mới → verify tab → logout → phải login lại admin ở bước sau để dọn dẹp).

## 2. Khu vực Storefront (trang công khai, không cần đăng nhập)

- Từ trang admin, có link ở admin bar (`#wp-admin-bar-site-name`, text: `Playwright practice site - Dev environment`) dẫn ra trang chủ storefront công khai (`https://pw-practice-dev.playwrightvn.com/`).
- Trang chủ storefront hiển thị heading tiêu đề site: `Playwright practice site - Dev environment`.
- **Lưu ý khi test:** phần chữ hiển thị trên admin bar bị **cắt bởi CSS (`text-overflow: ellipsis`)** khi độ rộng khung không đủ — text hiển thị trên UI có thể có dấu "…" nhưng đó **không phải nội dung DOM thật**. Phải kiểm tra `textContent` thật (qua DevTools) trước khi dùng làm điều kiện `name` cho `getByRole` với `exact: true`, nếu không locator sẽ không bao giờ khớp.
- **Lưu ý về `role` của phần tử:** link admin bar này có thuộc tính `role="menuitem"` tường minh trên thẻ `<a>` — ghi đè role mặc định (`link`) của thẻ `<a>`. Dùng `getByRole('link', ...)` sẽ **không** tìm thấy phần tử này, phải dùng đúng `getByRole('menuitem', ...)`.

## 3. Các module đã khảo sát cấu trúc nhưng CHƯA implement (folder/file đã tạo sẵn, đang rỗng)

Các khu vực này đã có sẵn khung folder trong `src/pages/dashboard/` và `tests/dashboard/` tương ứng theo đúng menu thật của WordPress Admin, chờ triển khai ở các giai đoạn sau:

- **Posts**: All Posts, Add Post, Categories, Tags
- **Media**: Library, Add Media File
- **Pages**: All Pages, Add Page
- **Comments**
- **Appearance**: Themes, Customize, Widgets, Menus, Theme File Editor, Patterns, Fonts
- **Plugins**: Installed Plugins, Add Plugin, Plugin File Editor
- **Settings**: General, Writing, Reading, Discussion, Media, Permalinks, Privacy, Connectors
- **Tools**: Available Tools, Import, Export, Export Personal Data, Erase Personal Data, Site Health, Network Setup
- **mini-orange-api** (plugin bảo vệ REST API — cài thêm ngoài WordPress lõi): Account Setup, Configure Methods, Advanced Settings, Protected REST APIs, Analytic, Popular Use Cases, Third Party Plugin Integrations, Full Feature Trial
- **Storefront**: trang Category, trang Single Post (đã có trang `Home` được test, `Category`/`Single Post` còn để trống)

**Lưu ý chung khi bắt đầu implement các module trên:** vì đây đều là các trang quản trị WordPress lõi (trừ mini-orange-api là plugin ngoài), phần lớn UI dùng chung 1 kiểu bảng danh sách + phân trang + search giống hệt màn `All Users`, và menu điều hướng chung đã có sẵn trong `DashboardBasePage` — nên tái sử dụng tối đa thay vì viết lại locator menu từ đầu (xem [03-pom-design.md](03-pom-design.md)).
