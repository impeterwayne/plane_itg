# Plane ITG (`plane_itg`)

> **Giao diện TUI tương tác và công cụ CLI cho Plane ITG: đồng bộ công việc ngoại tuyến, thu thập bằng chứng hình ảnh/video, trích xuất khung hình và liên kết git worktree.**

[![Self-Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Tính Năng Nổi Bật

- **Giao diện TUI tương tác trên Terminal**:
  - Điều hướng trực quan bằng bàn phím và chuột ngay trên terminal.
  - Bộ lọc tìm kiếm trực tiếp (`/`) cho công việc và dự án.
  - Chuyển đổi dự án (`p`) và chọn phạm vi đồng bộ (`s`) nhanh chóng.
  - Nhập API Key trực tiếp (`k`) qua terminal hoặc hộp thoại GUI.
- **Các lệnh CLI trực tiếp**:
  - Hỗ trợ đầy đủ các lệnh con (`sync`, `issues`, `projects`, `project`, `auth`, `open`, `config`) với đầu ra `--json` và mô phỏng `--dry-run`.
- **Thu thập dữ liệu bằng chứng ngoại tuyến (Evidence Crawler)**:
  - Tự động tải hình ảnh đính kèm nội dung phong phú `<image-component>` của Plane.
  - Cào và lưu trữ ảnh chụp màn hình từ `prnt.sc` (Lightshot).
  - Tải toàn bộ video bản ghi MP4 và ảnh bìa từ `streamable.com`.
  - Tải toàn bộ tệp đính kèm nhiệm vụ qua Plane REST API.
- **Trích xuất khung hình video (Keyframes) & Storyboard**:
  - Sử dụng `ffmpeg` để phát hiện chuyển cảnh và trích xuất khung hình với chu kỳ 1 giây.
  - Tự động tạo ảnh ghép storyboard tổng quan (`<mediaId>_storyboard.jpg`).
  - Xuất từng khung hình ảnh riêng biệt (`frame_01_00.0s.jpg`, v.v.).
- **Tài liệu Markdown ngoại tuyến**:
  - Tạo `plane/TASK_LIST.md` tổng hợp danh sách công việc theo trạng thái (Backlog, Todo, In Progress, Done, Cancelled).
  - Tạo từng tệp chi tiết công việc `plane/evidence/<taskID>/<taskID>.md` kèm mô tả, bình luận, liên kết bằng chứng và thẻ xem video HTML5 `<video>`.
- **Đồng bộ đa Git Worktree**:
  - Tự động nhận diện kho mã nguồn gốc và tất cả các git worktree liên quan.
  - Tự động tạo symlink/junction thư mục `plane/` xuyên suốt các worktree.
- **Không phụ thuộc thư viện ngoài (Zero Dependencies)**:
  - Xây dựng hoàn toàn bằng các module tích hợp sẵn trong Node.js (`node:fs`, `node:path`, `node:child_process`, `fetch`).

---

## Hướng Dẫn Sử Dụng Nhanh

### 1. Cài đặt & Khởi chạy TUI

```bash
# Liên kết toàn cục
npm link

# Khởi chạy giao diện TUI tương tác
plane
```

### 2. Các Lệnh CLI

```bash
# Khởi chạy giao diện TUI
plane tui

# Xem cấu hình hiện tại và dự án đã ánh xạ
plane config

# Lưu Plane API Key
plane auth plane_api_your_key_here

# Xem hoặc tìm kiếm danh sách dự án
plane projects
plane projects "android"

# Gán ID hoặc mã dự án cho workspace hiện tại
plane project COD

# Đồng bộ tác vụ và tải dữ liệu bằng chứng
plane sync

# Chỉ đồng bộ các mục Backlog và Todo
plane sync --categories backlog,todo

# Liệt kê các issue trực tiếp trên terminal
plane issues
plane issues "login"

# Mở issue trên trình duyệt web
plane open COD-101
```

Tất cả các lệnh đều hỗ trợ cờ `--dry-run` và `--json`:
```bash
plane sync --categories backlog,todo --dry-run
plane issues "login" --json
```

---

## Cấu Hình

Plane ITG ưu tiên đọc cấu hình theo thứ tự sau:

1. **Cấu hình cục bộ dự án**:
   - `.plane.json` trong thư mục dự án
   - `plane.json`
2. **Biến môi trường**:
   - `PLANE_API_KEY`
   - `PLANE_PROJECT_ID`
3. **Cài đặt CodingSpace**:
   - Tự động đọc ánh xạ dự án từ `CodingSpace/workspaces.json`.
4. **Cấu hình người dùng hệ thống**:
   - `~/.config/plane_itg/plane.json`

### Ví dụ `plane.json`

```json
{
  "baseUrl": "https://plane.itgproduct.com",
  "workspaceSlug": "product",
  "apiKey": "plane_api_...",
  "projectPlaneIds": {
    "/duong/dan/du/an": "uuid-cua-du-an"
  }
}
```

---

## Kiểm Thử Tự Động

Chạy bộ kiểm thử self-test:

```bash
npm test
# hoặc
node test/self-test.js
```

---

## Giấy Phép

MIT © Nguyen Khac Cuong
