# 01 — Tính năng website & lưu ý khi test

Website test: **[pw-practice-dev.playwrightvn.com/wp-admin](https://pw-practice-dev.playwrightvn.com/wp-admin)** — một trang quản trị **WordPress Admin Dashboard** tiêu chuẩn, có cài thêm plugin **miniOrange API** (bảo vệ/định danh REST API).

Tài liệu này chỉ ghi lại các tính năng và lưu ý **dựa trên phần đã thực sự khảo sát và implement test** trong project. Các mục còn lại (đã tạo sẵn folder/file rỗng để chờ triển khai) được liệt kê riêng ở mục 3. Mục 4 tổng hợp các lưu ý chung về timing (race condition) rút ra từ các lỗi flaky đã gặp.

## 1. Khu vực Dashboard (Admin — sau khi login)

### 1.1 Login / Authentication
> Trang login nằm **trước** khu vực admin nên trong code được tách thành module riêng ở cấp cao nhất: [src/pages/login/](../src/pages/login/) ↔ [tests/login/](../tests/login/) (không nằm trong `dashboard/`).

- Trang login WordPress chuẩn: 2 textbox (`Username or Email Address`, `Password`) + nút `Log In`.
- Login thất bại hiển thị message dạng: `Error: The username {userName} is not registered on this site. If you are unsure of your username, try your email address instead.`
- Login thành công điều hướng về `/wp-admin/`, hiển thị heading `Dashboard`, `At a Glance`, `Activity`.
- **Lưu ý khi test:** message lỗi login chứa chính username người dùng nhập vào (interpolate động) — không thể hardcode toàn bộ chuỗi cố định trong assertion, phải dựng lại locator theo tham số (`getErrorMessage(userName)`).
- **Lưu ý khi test — trang login tự giành focus:** sau khi trang tải khoảng 200ms, WordPress tự **focus và bôi đen ô Username** (hàm `wp_attempt_focus`). `fill()` của Playwright gồm 2 bước (focus vào ô → chèn chữ vào ô **đang được focus**); nếu WordPress kéo focus về Username đúng lúc đang điền Password thì **mật khẩu bị đè vào ô Username** → login sai tài khoản. Lỗi này là race condition, hay lộ ra trên Firefox/WebKit chạy trên CI (chậm hơn Chromium).
  - Cách xử lý trong [src/pages/login/login.page.ts](../src/pages/login/login.page.ts): `login()` **điền hết các ô rồi mới kiểm tra cả 2 ô**, sai thì điền lại toàn bộ (bọc trong `expect(...).toPass()`):
    ```ts
    await expect(async () => {
        await this.userNameLogin.fill(userName);
        await this.passwordLogin.fill(password);
        await expect(this.userNameLogin).toHaveValue(userName, { timeout: 1000 });
        await expect(this.passwordLogin).toHaveValue(password, { timeout: 1000 });
    }).toPass({ timeout: 10000 });
    ```
  - **Không** dùng kiểm tra từng ô (`fillAndVerify()` lần lượt cho Username rồi Password) cho `login()`: ô bị hỏng là Username — ô **đã điền và kiểm tra xong trước đó** — nên kiểm tra từng ô sẽ không phát hiện ra. Phải đảm bảo **trạng thái cuối cùng của cả form** đúng ngay trước khi submit.
  - `fillUserNameLogin()` / `fillPasswordLogin()` (dùng khi test cố ý điền từng ô riêng) dùng `fillAndVerify()` — giảm phần lớn rủi ro nhưng không chặn được trường hợp ô sau đè sang ô trước như trên.

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
  - **Lưu ý khi test — form chỉ sẵn sàng khi `zxcvbn` tải xong (quan trọng nhất):**
    - Trang `user-new.php` tải hơn 60 file JS. Riêng thư viện đo độ mạnh mật khẩu **`zxcvbn.min.js` (~400KB)** được WordPress tải theo kiểu `zxcvbn-async`: chỉ **bắt đầu** tải **sau** sự kiện `load`. Trên máy CI của GitHub, file này mất 200–870ms để tải.
    - Form chỉ được khởi tạo xong khi zxcvbn tải xong. Mã nguồn `wp-admin/js/user-profile.js` (WordPress 7.0.7):
      ```js
      function generatePassword() {
          if ( typeof zxcvbn !== 'function' ) {
              setTimeout( generatePassword, 50 );   // zxcvbn chưa tải -> chờ 50ms thử lại, form CHƯA khởi tạo
              return;
          }
          $pass1.val( $pass1.data( 'pw' ) );        // zxcvbn tải xong -> điền mật khẩu tự sinh vào ô Password
          ...
          $( $pass1 ).trigger( 'focus' );           // ... rồi FOCUS vào ô Password
      }
      ```
    - Thao tác **trước** thời điểm này gây ra 2 loại lỗi (đều đã gặp thực tế trên CI firefox/webkit, local hầu như không gặp vì máy local tải nhanh hơn):
      | Thao tác rơi vào lúc | Hậu quả |
      |---|---|
      | Đang `fill` một ô **đúng lúc** `generatePassword()` chạy | Focus bị kéo sang ô Password → chữ bị **nối vào cuối mật khẩu tự sinh**, ô đang điền bị **trống** (`textbox "Username (required)"` trống, `textbox "Password": ...E101-tuyen-1791699032022`) |
      | Bấm "Add User" **trước khi** `generatePassword()` chạy | **Form không được gửi đi**: trace không có request POST nào, không có message nào hiện ra — dù các ô đã điền đúng. Đo trên 14/14 lần fail: đều bấm submit sớm hơn lúc zxcvbn tải xong 80–760ms |
    - **Chờ `load` (`waitForPageLoad()`) là KHÔNG đủ:** trace cho thấy `waitForPageLoad()` trả về đúng thời điểm zxcvbn **bắt đầu** tải.
    - **Cách xử lý:** `waitForAddUserFormReady()` trong [add-user.page.ts](../src/pages/dashboard/users/add-user.page.ts) chờ **dấu hiệu nhìn thấy được** của việc khởi tạo xong — ô Password đã có mật khẩu tự sinh:
      ```ts
      async waitForAddUserFormReady() {
          await this.waitForPageLoad();
          await expect(this.passwordTextBoxLoc).not.toHaveValue('');
      }
      ```
      Vì điền mật khẩu và focus nằm liền nhau trong cùng một lần chạy của `generatePassword()`, khi thấy ô Password có giá trị thì focus cũng đã chuyển xong → **một điều kiện chờ chặn được cả 2 lỗi**. Method này được gọi ở cả 2 đường vào form: `clickAddUserButton()` và `clickAddUserTab()` (bản override trong `UserPage`, gọi `super.clickAddUserTab()` rồi chờ form).
    - **Lớp bảo vệ thêm:** các hàm `fillUserName/fillEmail/fillFirstName/fillLastName/fillPassword` dùng `fillAndVerify()` ([base.page.ts](../src/pages/base.page.ts)) — điền xong kiểm tra ô **đó** có đúng giá trị không, sai thì điền lại. Ở trang này kiểm tra từng ô là đủ (khác trang login): ô đang điền bị trống nên chính `fillAndVerify()` của ô đó phát hiện ra; ô Password bị nối thêm chữ thì vô hại vì `fillPassword()` (nếu test có gọi) dùng `fill()` **ghi đè** toàn bộ ô.
    - ✅ Bản sửa `waitForAddUserFormReady()` (commit `e86bb67`) **đã được xác nhận trên CI**: chạy tay workflow với lựa chọn `all` — cả chromium, firefox, webkit đều pass (trước đó: 8 test fail trên firefox, 6 trên webkit).
- **All Users** — có ô tìm kiếm (`Search Users`), sau khi search ra kết quả có thể hover vào tên user để hiện link `Delete`. Xóa user cần 2 bước: bấm `Delete` → điều hướng sang trang **Confirm Deletion** (có nút `Confirm Deletion`, và nếu user có nội dung liên quan — bài viết, comment — sẽ hiện thêm radio option `Delete all content.` cần chọn trước khi xác nhận được).
  - **Lưu ý khi test:** sau khi bấm `Delete`, trang điều hướng sang confirm-deletion cần chờ `page.waitForLoadState('domcontentloaded')` trước khi thao tác tiếp — nếu không chờ, nút `Confirm Deletion` có thể chưa sẵn sàng.
  - Nút `Confirm Deletion` có 2 trạng thái: **enabled ngay** (user không có content liên quan) hoặc **disabled cho tới khi chọn radio `Delete all content.`** — test cleanup phải kiểm tra `isEnabled()` trước, xử lý rẽ nhánh.
  - Sau khi xóa xong, search lại đúng username đó sẽ thấy message `No users found.`
- **Profile** — trang cá nhân, chỉ mới xác nhận có heading `Profile` hiển thị khi bấm vào tab.
- **Phân quyền theo Role (Account Permissions):** đã kiểm chứng 2 role:
  - **Editor**: thấy các tab `Dashboard, Posts, Media, Pages, Comments, Profile, Tools`; **không thấy** `Appearance, Plugins, Users`.
  - **Subscriber**: chỉ thấy `Dashboard, Profile`; **không thấy** `Posts, Media, Pages, Comments, Tools, Appearance, Plugins, Users`.
  - **Lưu ý khi test:** muốn verify quyền theo role, bắt buộc phải **logout tài khoản admin rồi login lại bằng chính user vừa tạo** — không thể test quyền chỉ bằng cách nhìn UI của admin. Đây là luồng tốn thời gian nhất trong bộ test hiện tại (tạo user → logout → login user mới → verify tab → logout → phải login lại admin ở bước sau để dọn dẹp).
  - Vì luồng dài (trên CI đã đo tới ~22s, sát mức timeout mặc định 30s), file [account-permissions.spec.ts](../tests/dashboard/users/account-permissions.spec.ts) đặt `test.describe.configure({ timeout: 60000 })`. Lưu ý timeout của Playwright tính **chung cho test + `beforeEach` + `afterEach`** — nếu test tiêu gần hết thời gian, `afterEach` (dọn user) bị cắt giữa chừng và **để sót user** trên site.

### 1.4 Admin bar — menu Howdy / Log Out
- Logout bằng cách hover vào `Howdy, <tên user>` trên admin bar → menu con hiện ra → click `Log Out`.
- Menu con được mở/đóng bằng JS (`hoverIntent` trong `admin-bar.js`): có **độ trễ + hiệu ứng** khi mở, và chỉ mở khi chuột **đi vào** phần tử (sự kiện `mouseover`/`mouseenter`).
- **Lưu ý khi test:** tách rời `hover()` rồi `click()` dễ bị flaky — click lúc menu đang mở dở (*"element is not stable"*) hoặc menu đã đóng lại (*"element is not visible"*) thì click sẽ chờ mãi tới hết timeout. Thử lại bằng cách `hover()` lần nữa cũng **không có tác dụng**: chuột vẫn ở đúng vị trí cũ nên trình duyệt không phát sinh sự kiện "đi vào" mới, JS không mở menu.
  - Cách xử lý: `logout()` trong [dashboard.base.page.ts](../src/pages/dashboard/dashboard.base.page.ts) gộp cả cụm và thử lại cả cụm, mỗi lần thử **đưa chuột ra ngoài trước**:
    ```ts
    await expect(async () => {
        await this.page.mouse.move(0, 0);           // tạo lại sự kiện "đi vào" cho lần hover sau
        await this.hoverProfileLoc.hover();
        await this.logoutLoc.click({ timeout: 2000 });  // click hụt thì báo lỗi sau 2s, không treo tới 30s
    }).toPass({ timeout: 15000 });
    ```
  - Test cần logout luôn gọi `logout()`, không gọi rời `hoverProfile()` + `clickLogout()`.

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

## 4. Lưu ý chung về timing (race condition)

Các lỗi ở mục 1.1, 1.3 (Add User) và 1.4 có chung một bản chất: **test thao tác đúng lúc JavaScript của WordPress đang thay đổi trang**.

- Nhiều đoạn JS của WordPress chạy **sau** sự kiện `load` — qua `setTimeout` (tự focus ô Username), tải thêm script rồi mới khởi tạo (`zxcvbn` → `generatePassword()` ở trang Add User), hoặc có độ trễ theo thao tác chuột (`hoverIntent`). Vì vậy chỉ chờ `load` (`waitForPageLoad()`) là **chưa đủ** để chắc chắn trang đã sẵn sàng.
- Các lỗi này là **flaky**: lúc pass lúc fail tùy tốc độ máy và mạng. Chromium thường nhanh nên ít gặp; Firefox/WebKit trên máy CI chậm hơn nên hay lộ ra — đã gặp thực tế: chromium pass hết, 7–8 test Add User fail trên firefox.
- **Vì sao local pass mà CI fail?** Máy CI của GitHub đặt ở nước ngoài, cấu hình yếu hơn → tải script chậm hơn hẳn (zxcvbn ~400KB mất 200–870ms). Ở local, lúc test kịp thao tác thì script thường đã tải xong → lỗi **vẫn tồn tại** nhưng gần như không bao giờ rơi trúng. "Chạy local pass" **không** chứng minh được lỗi timing đã hết.

**Nguyên tắc áp dụng:**
1. Trước khi thao tác, chờ **dấu hiệu nhìn thấy được** cho biết JS của trang đã khởi tạo xong (VD: ô Password đã có mật khẩu tự sinh ở trang Add User) — không chỉ chờ `load`. Tìm dấu hiệu này bằng cách đọc mã nguồn JS của trang hoặc quan sát trace.
2. Thao tác xong phải **kiểm tra kết quả thật** (giá trị ô, phần tử hiện ra...), sai thì **thử lại** bằng `expect(async () => {...}).toPass()` — không giả định thao tác luôn thành công.
3. Khi thử lại, thử lại **từ bước tạo ra trạng thái cần thiết** (VD: đưa chuột ra rồi hover lại, chứ không chỉ click lại), và đặt timeout ngắn cho từng thao tác bên trong (`{ timeout: 1000–2000 }`) để vòng thử lại kịp chạy nhiều lần.
4. Form nhiều ô rồi submit: kiểm tra **trạng thái cuối cùng của cả form** trước khi submit nếu các ô có thể làm hỏng nhau (như trang login).
5. **Không** dùng `page.waitForTimeout(...)` (chờ cố định vài giây): máy nhanh thì phí thời gian, máy chậm thì vẫn có thể chưa đủ.
6. Bọc cách xử lý trong **POM** (`login()`, `logout()`, `fillAndVerify()`...) để mọi test tự động được bảo vệ, không phải sửa từng file test.

**Về CI:** push/PR mặc định chỉ chạy chromium (xem phần CI trong [README.md](../README.md#ci)), nên các lỗi kiểu này có thể **không bị phát hiện** trên CI. Khi sửa code liên quan tới các trang trên, hoặc trước khi merge thay đổi lớn, nên chạy đủ 3 browser — chạy tay workflow với lựa chọn `all`, hoặc `npx playwright test` ở local.
