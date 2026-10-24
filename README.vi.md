# Plane ITG (plane_itg)

> **Client REST API Plane, đồng bộ danh sách công việc ngoại tuyến, thu thập bằng chứng hình ảnh/video và quản lý worktree git cho Plane ITG.**

[![Self-Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Tính Năng Nổi Bật

- **Giao diện Terminal TUI tương tác**:
  - Giao diện dòng lệnh toàn màn hình, hỗ trợ đầy đủ phím tắt và chuột.
  - Tìm kiếm và lọc tác vụ / dự án tức thì (`/`).
  - Chuyển đổi dự án Plane nhanh chóng (`p`) và chọn phạm vi đồng bộ (`s`).
  - Nhập API key trực tiếp (`k`) qua terminal hoặc hộp thoại đồ họa hệ điều hành.
- **Thu thập dữ liệu bằng chứng ngoại tuyến (Evidence Crawler)**:
  - Tự động tải hình ảnh đính kèm nội dung phong phú `<image-component>` của Plane.
  - Tự động cào và lưu trữ ảnh chụp màn hình từ `prnt.sc` (Lightshot).
  - Tải toàn bộ video bản ghi MP4 và ảnh bìa từ `streamable.com`.
  - Tải toàn bộ tệp đính kèm nhiệm vụ qua Plane REST API.
- **Trích xuất khung hình video (Keyframes) & Storyboard**:
  - Sử dụng `ffmpeg` để phát hiện chuyển cảnh và trích xuất khung hình với chu kỳ 1 giây.
  - Tự động tạo ảnh ghép storyboard tổng quan (`<mediaId>_storyboard.jpg`).
  - Xuất từng khung hình ảnh riêng biệt (`frame_01_00.0s.jpg`, v.v.) để xem chi tiết.
- **Tài liệu Markdown ngoại tuyến**:
  - Tạo `plane/TASK_LIST.md` tổng hợp danh sách công việc theo trạng thái (Backlog, Todo, In Progress, Done, Cancelled).
  - Tạo từng tệp chi tiết công việc `plane/evidence/<taskID>/<taskID>.md` kèm mô tả, bình luận, liên kết bằng chứng và thẻ xem video HTML5 `<video>`.
- **Đồng bộ đa Git Worktree**:
  - Tự động nhận diện kho mã nguồn gốc và tất cả các git worktree liên quan.
  - Tự động tạo symlink/junction thư mục `plane/` xuyên suốt các worktree, giúp dữ liệu luôn đồng bộ.
- **Tích hợp Herdr Plugin & Workspace**:
  - Sẵn sàng chạy trong [Herdr](https://herdr.dev) dưới dạng cửa sổ popup tiện ích (`plane-popup`) hoặc dòng lệnh độc lập.
  - Không có bất kỳ thư viện npm bên ngoài nào (zero-dependency) — chỉ dùng Node.js tiêu chuẩn.

---

## 🚀 Hướng Dẫn Sử Dụng Nhanh

### 1. Sử dụng CLI Độc Lập

```bash
# Mở giao diện TUI tương tác
node bin/cli.js

# Hoặc cài đặt liên kết toàn cục
npm link
plane-itg
```

### 2. Các Lệnh Thường Dùng

```bash
# Kiểm tra cấu hình và dự án đang hoạt động
plane-itg config

# Lưu Plane API Key
plane-itg auth plane_api_your_key_here

# Xem hoặc tìm kiếm danh sách dự án
plane-itg projects
plane-itg projects "android"

# Gán ID hoặc mã dự án cho workspace hiện tại
plane-itg project COD

# Đồng bộ tác vụ và tải dữ liệu bằng chứng
plane-itg sync

# Chỉ đồng bộ các mục Backlog và Todo
plane-itg sync --categories backlog,todo

# Liệt kê các issue trực tiếp trên terminal
plane-itg issues
plane-itg issues "login"

# Mở issue trên trình duyệt web
plane-itg open COD-101
```

Tất cả các lệnh đều hỗ trợ cờ `--dry-run` và `--json`:
```bash
plane-itg sync --dry-run --json
```

---

## ⚙️ Cấu Hình

Plane ITG ưu tiên đọc cấu hình theo thứ tự sau:

1. **Cấu hình cục bộ dự án**:
   - `.plane.json` (trong thư mục gốc workspace hoặc `.herdr/`)
   - `plane.json`
2. **Biến môi trường**:
   - `PLANE_API_KEY` / `HERDR_PLANE_API_KEY`
   - `PLANE_PROJECT_ID` / `HERDR_PLANE_PROJECT_ID`
3. **Cài đặt CodingSpace**:
   - Tự động đọc ánh xạ dự án từ `CodingSpace/workspaces.json`.
4. **Cấu hình người dùng hệ thống**:
   - `~/.config/plane_itg/plane.json`
   - `~/.config/herdr/plugin-config/herdr-launcher/plane.json`

---

## 🖥️ Cài Đặt Plugin Cho Herdr

Liên kết plugin vào phiên làm việc Herdr:

```bash
herdr plugin link /home/peter/Quest/plane_itg
```

Thêm phím tắt vào `~/.config/herdr/config.toml`:

```toml
[[keys.command]]
key = "prefix+alt+p"
type = "plugin_action"
command = "plane-itg.tool-plane"
description = "Plane tasks popup"
```

---

## 🧪 Kiểm Thử Tự Động

Chạy bộ kiểm thử self-test:

```bash
node test/self-test.js
# hoặc
npm test
```

---

## 📄 Giấy Phép

MIT © Peter Wayne
