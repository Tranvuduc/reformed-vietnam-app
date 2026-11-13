# Reformed Vietnam — Ứng dụng di động (Mobile App)

> **Tiếng Việt trước, English below.**

Ứng dụng iOS + Android cho thư viện Cải Chánh tiếng Việt — **reformedvietnam.com**.

## Ứng dụng này là gì?

Đây là một **Capacitor wrapper** (vỏ bọc): ứng dụng mở trang web đang chạy tại
`https://reformedvietnam.com` trong một WebView toàn màn hình. Nội dung thư viện
(3.000+ sách, Kinh Thánh 1934, giáo lý, học viện, sách nói) **không** đóng gói
trong app — nó quá lớn và thay đổi mỗi ngày. Trong app chỉ có một trang dự phòng
(`www/index.html`): khi không có mạng, app hiện thông báo tiếng Việt
"Cần mạng để mở thư viện" kèm nút thử lại.

- **Tên app:** Reformed Vietnam
- **App ID:** `com.reformedvietnam.app` (tên miền đảo ngược của reformedvietnam.com;
  tìm trên mạng không thấy app nào đang dùng ID này — xác nhận cuối cùng khi tạo
  app trong Google Play Console / App Store Connect)
- **Phiên bản:** 1.0 (versionCode 1)
- **Android:** minSdk 24 (Android 7.0+), targetSdk 36, compileSdk 36
- **iOS:** deployment target 15.0
- **Capacitor:** 8.6.2 · **Node:** 24 · **JDK:** 21 · **Gradle:** 8.14.3
- **Icon/splash:** tạo từ `icon-512.png` của website (`@capacitor/assets`),
  icon nền cam `#9a3412` (giống favicon của web), splash nền ngà `#f7f2e9`.
- **Push notifications:** thư viện `@capacitor/push-notifications` đã được cài
  (giai đoạn 2) nhưng **chưa nối dây** — cần một nhà cung cấp push (ví dụ
  Firebase) và dự án Firebase của Duc thì mới đăng ký nhận thông báo được.

## ⚠️ Trạng thái build trên máy này (thành thật)

**File APK debug CHƯA build được trên máy ảo này.** Mọi thứ khác đã xong
(scaffold, 2 native project, icon, splash, cấu hình), nhưng lệnh build Android
dừng ở bước bắt tay với Gradle daemon:

- Gradle client (Java) kết nối tới daemon qua loopback TCP (127.0.0.1) thì nhận
  được thông báo của sandbox: *"Other TCP connections is turned off for this
  assistant"* — byte đầu tiên là `m` (type tag 109) nên Gradle báo
  `Could not receive a message from the daemon` / `Unexpected type tag 109 found`.
- Bằng chứng: daemon vẫn chạy tốt và lắng nghe trên cổng của nó (log
  `~/.gradle/daemon/8.14.3/daemon-*.out.log` ghi "Daemon server started");
  một chương trình Java test nối tới đúng cổng đó cũng nhận được đúng thông báo
  chặn; trong khi một socket Python nối tới cùng cổng thì tới được daemon.
  Tức là sandbox chặn TCP loopback **đối với tiến trình Java** — không phải lỗi
  của project, và không thể (cũng không nên) vòng qua kiểm soát mạng này.
- `sdkmanager` gặp cùng một lỗi mạng Java nên SDK được cài bằng `curl`
  (platform-tools 37.0.3, platform android-36 r02, build-tools 36.0.0).

**Nghĩa là:** project này build được bình thường trên một máy thật (máy Mac/PC
của Duc, máy CI, hoặc Ionic Appflow). Chỉ riêng máy ảo này là không build được
APK. Đừng mất thời gian build lại ở đây — hãy build ở máy khác theo hướng
dẫn dưới đây.

Môi trường đã cài sẵn trên máy này (để tham khảo, không cần cài lại ở máy build
nếu máy đó đã có): JDK 21 (`/usr/lib/jvm/java-21-openjdk-amd64`), Android SDK
36 (`~/Android/sdk`), Gradle 8.14.3 (`~/gradle/gradle-8.14.3`).

## Build Android (trên máy thật)

```bash
# Cần: Node 18+, JDK 21, Android SDK (API 36 + build-tools 36.0.0)
# Đặt biến môi trường:
export JAVA_HOME=/path/to/jdk-21
export ANDROID_HOME=/path/to/android-sdk

cd reformed-vietnam-app
npm install
npx cap sync

# Debug APK (cài trực tiếp lên điện thoại để thử):
cd android && ./gradlew assembleDebug
# -> android/app/build/outputs/apk/debug/app-debug.apk

# Release App Bundle (để đăng Play Store):
cd android && ./gradlew bundleRelease
# -> android/app/build/outputs/bundle/release/app-release.aab
```

**Ký release (bước của Duc, chưa làm):** chưa tạo keystore nào ở đây.
Tạo keystore riêng và giữ file + mật khẩu cẩn thận — mất keystore là không
cập nhật được app nữa:

```bash
keytool -genkeypair -v -keystore reformed-vietnam-release.keystore \
  -alias reformedvietnam -keyalg RSA -keysize 2048 -validity 10000
```

rồi khai báo trong `android/app/build.gradle` (mục `signingConfigs`) hoặc dùng
Play App Signing của Google (khuyên dùng: Google giữ khóa, Duc chỉ cần upload
key lần đầu).

## Build iOS (cần máy Mac + Xcode)

```bash
cd reformed-vietnam-app
npm install
npx cap sync
npx cap open ios        # mở App.xcworkspace trong Xcode
```

Trong Xcode: chọn team (Apple ID của Duc đã đăng ký Apple Developer Program),
chọn target `App`, bấm Run để chạy trên máy thật hoặc Archive để đăng App Store.
**Không build được iOS trên Linux/Windows** — bắt buộc máy Mac (hoặc dịch vụ
build đám mây như Ionic Appflow, Codemagic, GitHub Actions với macOS runner).

## Checklist đăng store — những gì Duc cần chuẩn bị

### Cả hai store
- [ ] **Trang Chính sách bảo mật (Privacy Policy) — CHƯA CÓ.** Website hiện
      không có trang này (đã kiểm tra: không có file nào, các URL
      `/chinh-sach-bao-mat.html` và `/privacy-policy.html` đều 404).
      Cần viết một trang chính sách bảo mật trên website trước khi nộp store
      (cả Apple và Google đều bắt buộc có URL này). Nội dung: app không thu
      thập tài khoản, không theo dõi người dùng; chỉ tải nội dung từ
      reformedvietnam.com.
- [ ] Ảnh chụp màn hình store (điện thoại + máy tính bảng, cả iOS lẫn Android)
- [ ] Mô tả app tiếng Việt + tiếng Anh, từ khóa, danh mục (Books / Education)
- [ ] Đánh giá độ tuổi / nội dung (app không có nội dung người lớn, không có mua
      trong app)

### Google Play ($25 một lần)
- [ ] Tài khoản Google Play Developer (trả $25 một lần bằng tài khoản Google của Duc)
- [ ] Tạo app với package `com.reformedvietnam.app`, upload file `.aab` đã ký
- [ ] Điền Data Safety (khai báo dữ liệu app thu thập — app này: không thu thập)

### App Store ($99/năm)
- [ ] Apple Developer Program ($99/năm, đăng ký bằng Apple ID của Duc, cần xác
      minh danh tính — có thể mất vài ngày)
- [ ] App Store Connect: tạo app với bundle ID `com.reformedvietnam.app`,
      upload bản archive từ Xcode
- [ ] ⚠️ **Rủi ro bị Apple từ chối (Guideline 4.2 — Minimum Functionality):**
      Apple đôi khi từ chối app chỉ là "website bỏ trong vỏ bọc". Để tăng khả
      năng duyệt, cần thêm tính năng native thật sự, ví dụ: push notification
      khi có sách mới (thư viện push đã cài sẵn), đọc offline / tải sách về máy,
      hoặc lưu vị trí đang đọc. **Phương án dự phòng:** nếu App Store từ chối,
      vẫn có thể phát hành dưới dạng PWA (người dùng mở web bằng Chrome/Safari
      rồi chọn "Add to Home Screen") — không cần qua store.

## Cấu trúc project

```
reformed-vietnam-app/
├── capacitor.config.ts   # appId, tên app, server.url = https://reformedvietnam.com
├── www/index.html        # trang dự phòng khi mất mạng (tiếng Việt)
├── assets/               # icon.png / splash.png nguồn (1024 / 2732)
├── android/              # native project Android (Capacitor)
├── ios/                  # native project iOS (Capacitor)
├── package.json
└── README.md
```

Đổi icon/splash: thay file trong `assets/` rồi chạy `npm run assets`.
Sau mỗi lần đổi `www/` hay `capacitor.config.ts`: chạy `npx cap sync`.

## Lệnh npm

| Lệnh | Làm gì |
|---|---|
| `npm run sync` | Đồng bộ `www` + config vào 2 native project |
| `npm run assets` | Tạo lại toàn bộ icon/splash từ `assets/` |
| `npm run android:debug` | Sync + build APK debug |
| `npm run android:release` | Sync + build App Bundle release |
| `npm run ios:open` | Mở project iOS trong Xcode (chỉ trên Mac) |

---

# Reformed Vietnam — Mobile App (English)

A Capacitor wrapper app for the Vietnamese Reformed library at
**reformedvietnam.com**. The app loads the live website in a full-screen
WebView; only a small offline fallback page (`www/index.html`, Vietnamese
"Cần mạng để mở thư viện" + retry button) is bundled — the library content
(3,000+ books, 1934 Bible, catechism, academy, audiobooks) is far too large
and changes daily to bundle.

- **App name:** Reformed Vietnam · **App ID:** `com.reformedvietnam.app`
  (reverse domain of reformedvietnam.com; web search found no existing app
  using this ID — final confirmation happens in Play Console / App Store Connect)
- **Version:** 1.0 (versionCode 1) · **Android:** minSdk 24, targetSdk 36 ·
  **iOS:** 15.0+ · **Capacitor:** 8.6.2 · **Node:** 24 · **JDK:** 21 ·
  **Gradle:** 8.14.3
- **Icons/splash:** generated from the website's `icon-512.png`
  (`@capacitor/assets`); burnt-orange `#9a3412` icon (matches the site
  favicon), ivory `#f7f2e9` splash.
- **Push notifications:** `@capacitor/push-notifications` is installed
  (phase 2) but **not wired up** — it needs a push provider (e.g. Firebase)
  and Duc's Firebase project before notifications can be registered.

## ⚠️ Build status on this machine (honest)

**The debug APK could NOT be built on this VM.** Everything else is done
(scaffold, both native projects, icons, splash, configuration), but the
Android build stops at the Gradle daemon handshake:

- The Gradle client (Java) connects to its daemon over loopback TCP
  (127.0.0.1) and receives the sandbox's message: *"Other TCP connections is
  turned off for this assistant"* — its first byte is `m` (type tag 109), so
  Gradle reports `Could not receive a message from the daemon` /
  `Unexpected type tag 109 found`.
- Evidence: the daemon itself starts fine and listens on its port (see
  `~/.gradle/daemon/8.14.3/daemon-*.out.log`, "Daemon server started"); a
  small Java test program connecting to that same port receives the same
  blocking message, while a Python socket connecting to the same port reaches
  the daemon. So the sandbox blocks loopback TCP **for Java processes** —
  not a project bug, and not something to work around.
- `sdkmanager` hit the same Java networking issue, so the SDK was installed
  with `curl` instead (platform-tools 37.0.3, platform android-36 r02,
  build-tools 36.0.0).

**Meaning:** this project builds normally on a real machine (Duc's Mac/PC, a
CI runner, or Ionic Appflow). Only this VM cannot build the APK — do not
retry the build here; build on another machine using the instructions above.

Already installed on this machine for reference: JDK 21
(`/usr/lib/jvm/java-21-openjdk-amd64`), Android SDK 36 (`~/Android/sdk`),
Gradle 8.14.3 (`~/gradle/gradle-8.14.3`).

## Build Android (on a real machine)

```bash
# Requires: Node 18+, JDK 21, Android SDK (API 36 + build-tools 36.0.0)
export JAVA_HOME=/path/to/jdk-21
export ANDROID_HOME=/path/to/android-sdk

cd reformed-vietnam-app
npm install
npx cap sync

# Debug APK (install directly on a phone to test):
cd android && ./gradlew assembleDebug
# -> android/app/build/outputs/apk/debug/app-debug.apk

# Release App Bundle (for the Play Store):
cd android && ./gradlew bundleRelease
# -> android/app/build/outputs/bundle/release/app-release.aab
```

**Release signing (Duc's step — not done here):** no keystore was created.
Create one and guard the file + passwords — losing it means the app can never
be updated:

```bash
keytool -genkeypair -v -keystore reformed-vietnam-release.keystore \
  -alias reformedvietnam -keyalg RSA -keysize 2048 -validity 10000
```

Then declare it in `android/app/build.gradle` (`signingConfigs`), or use
Google Play App Signing (recommended: Google holds the key).

## Build iOS (Mac + Xcode required)

```bash
cd reformed-vietnam-app
npm install
npx cap sync
npx cap open ios        # opens App.xcworkspace in Xcode
```

In Xcode: pick the team (Duc's Apple ID enrolled in the Apple Developer
Program), select the `App` target, Run on a device or Archive for the App
Store. **iOS cannot be built on Linux/Windows** — a Mac is required (or a
cloud build service such as Ionic Appflow, Codemagic, or GitHub Actions with
a macOS runner).

## Store publishing checklist — what Duc must provide

### Both stores
- [ ] **Privacy Policy page — DOES NOT EXIST YET.** The website currently has
      no privacy page (checked: no such file; `/chinh-sach-bao-mat.html` and
      `/privacy-policy.html` both return 404). One must be published on the
      website before submitting to either store (both Apple and Google require
      the URL). Content: the app collects no accounts and tracks no users; it
      only loads content from reformedvietnam.com.
- [ ] Store screenshots (phone + tablet, iOS and Android)
- [ ] App descriptions in Vietnamese + English, keywords, category
      (Books / Education)
- [ ] Age/content rating (no adult content, no in-app purchases)

### Google Play ($25 one-time)
- [ ] Google Play Developer account ($25 one-time, Duc's Google account)
- [ ] Create the app with package `com.reformedvietnam.app`, upload the signed `.aab`
- [ ] Complete the Data Safety form (this app collects no data)

### App Store ($99/year)
- [ ] Apple Developer Program ($99/year, Duc's Apple ID, identity verification
      can take a few days)
- [ ] App Store Connect: create the app with bundle ID
      `com.reformedvietnam.app`, upload the archive from Xcode
- [ ] ⚠️ **Rejection risk (Guideline 4.2 — Minimum Functionality):** Apple
      sometimes rejects apps that are only a website in a wrapper. To improve
      the odds, add real native features — e.g. push notifications for new
      books (the push library is already installed), offline reading /
      downloads, or reading-position sync. **Fallback:** if the App Store
      refuses, the site can still be distributed as a PWA (users open the
      site in Chrome/Safari and choose "Add to Home Screen") — no store needed.

## Project layout

```
reformed-vietnam-app/
├── capacitor.config.ts   # appId, app name, server.url = https://reformedvietnam.com
├── www/index.html        # offline fallback page (Vietnamese)
├── assets/               # icon.png / splash.png sources (1024 / 2732)
├── android/              # native Android project (Capacitor)
├── ios/                  # native iOS project (Capacitor)
├── package.json
└── README.md
```

Change icons/splash: replace files in `assets/`, then run `npm run assets`.
After changing `www/` or `capacitor.config.ts`: run `npx cap sync`.

## npm scripts

| Command | Does |
|---|---|
| `npm run sync` | Sync `www` + config into both native projects |
| `npm run assets` | Regenerate all icons/splash from `assets/` |
| `npm run android:debug` | Sync + build debug APK |
| `npm run android:release` | Sync + build release App Bundle |
| `npm run ios:open` | Open the iOS project in Xcode (Mac only) |
