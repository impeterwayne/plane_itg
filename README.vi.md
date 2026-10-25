# Plane ITG (`plane_itg`)

> **Giao diện TUI tương tác, công cụ CLI và thư viện Node.js cho Plane ITG: đồng bộ công việc ngoại tuyến, thu thập bằng chứng hình ảnh/video, trích xuất khung hình và liên kết git worktree.**

[![npm version](https://img.shields.io/npm/v/plane_itg.svg)](https://www.npmjs.com/package/plane_itg)
[![npm downloads](https://img.shields.io/npm/dm/plane_itg.svg)](https://www.npmjs.com/package/plane_itg)
[![Self-Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](test/self-test.js)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](package.json)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md) | **Tiếng Việt**

---

## Tính Năng Nổi Bật

- **Giao diện TUI tương tác trên Terminal**:
  - Điều hướng trực quan bằng bàn phím và chuột ngay trên terminal.
  - Bộ lọc tìm kiếm trực tiếp (`/`) cho công việc và dự án.
  - Chuyển đổi dự án (`p`) và chọn phạm vi đồng bộ (`s`) nhanh chóng.
  - Nhập API Key trực tiếp (`k`) qua terminal hoặc hộp thoại GUI.
- **Các lệnh CLI trực tiếp**:
  - Hỗ trợ đầy đủ các lệnh con (`sync`, `issues`, `projects`, `project`, `auth`, `open`, `ffmpeg`, `config`) với đầu ra `--json` và mô phỏng `--dry-run`.
- **Thu thập dữ liệu bằng chứng ngoại tuyến (Evidence Crawler)**:
  - Tự động tải hình ảnh đính kèm nội dung phong phú `<image-component>` của Plane.
  - Cào và lưu trữ ảnh chụp màn hình từ `prnt.sc` (Lightshot).
  - Tải toàn bộ video bản ghi MP4 và ảnh bìa từ `streamable.com`.
  - Tải toàn bộ tệp đính kèm nhiệm vụ qua Plane REST API.
- **Trích xuất khung hình video (Keyframes) & Storyboard**:
  - Sử dụng `ffmpeg` để phát hiện chuyển cảnh và trích xuất khung hình với chu kỳ 1 giây.
  - Tự động kiểm tra và tải xuống bản `ffmpeg` di động (`~/.config/plane_itg/bin/`) nếu thiết bị người dùng chưa cài đặt `ffmpeg`.
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

## Cài Đặt & Khởi Chạy Nhanh

### Cách 1: Cài đặt toàn cục qua npm (Khuyên dùng)

```bash
npm install -g plane_itg

# Khởi chạy giao diện TUI tương tác
plane
```

### Cách 2: Chạy trực tiếp bằng `npx` (Không cần cài đặt)

```bash
# Mở giao diện TUI tương tác
npx plane_itg

# Hoặc chạy trực tiếp bất kỳ lệnh CLI nào
npx plane_itg sync --categories backlog,todo
```

### Cách 3: Tích hợp vào `package.json` của dự án

Cài đặt làm dependency trong dự án của bạn:

```bash
npm install -D plane_itg
```

Thêm các script tiện lợi vào `package.json`:

```json
{
  "scripts": {
    "plane": "plane",
    "plane:sync": "plane sync --categories backlog,todo,in_progress",
    "plane:issues": "plane issues"
  }
}
```

### Cách 4: Phát triển cục bộ từ mã nguồn

```bash
git clone https://github.com/impeterwayne/plane_itg.git
cd plane_itg
npm link
```

---

## Sử Dụng CLI

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

# Kiểm tra hoặc tự động cài đặt ffmpeg di động
plane ffmpeg
```

Tất cả các lệnh đều hỗ trợ cờ `--dry-run` và `--json`:

```bash
plane sync --categories backlog,todo --dry-run
plane issues "login" --json
```

---

## Tích Hợp Thư Viện Node.js (Programmatic API)

Bạn có thể `require('plane_itg')` trực tiếp trong mã nguồn Node.js hoặc các công cụ tự động hóa:

```js
const plane = require('plane_itg');

async function main() {
  const worktree = process.cwd();

  // 1. Lưu API key hoặc liên kết mã dự án
  plane.saveApiKey(process.env.PLANE_API_KEY);
  plane.saveWorkspaceProjectId(worktree, 'COD');

  // 2. Đọc cấu hình đã phân giải cho workspace
  const cfg = plane.config(worktree);

  // 3. Truy vấn danh sách dự án hoặc công việc
  const allProjects = await plane.projects(cfg);
  const openIssues = await plane.issues(cfg);

  // 4. Đồng bộ công việc, bình luận, bằng chứng đa phương tiện & liên kết worktree
  const result = await plane.sync(worktree, {
    categories: ['backlog', 'todo', 'in_progress'],
  }, (progressMsg) => {
    console.log(progressMsg);
  });

  console.log(`Đã đồng bộ ${result.taskCount} công việc vào ${result.path}`);
}

main();
```

### Các Hàm API Chính

| Hàm | Mô tả |
| :--- | :--- |
| `plane.config(worktreePath)` | Phân giải cấu hình hoạt động (`baseUrl`, `workspaceSlug`, `projectId`, `apiKey`, `parentRoot`). |
| `plane.sync(worktreePath, options, onProgress)` | Đồng bộ công việc, bình luận, bằng chứng và tạo `plane/TASK_LIST.md`. |
| `plane.syncProject(worktreePath, cfg, options, onProgress)` | Đồng bộ dự án với đối tượng cấu hình truyền vào trực tiếp. |
| `plane.issues(cfg)` | Lấy danh sách toàn bộ issue của dự án hiện tại. |
| `plane.projects(cfg)` | Lấy danh sách toàn bộ dự án trong workspace Plane. |
| `plane.saveApiKey(apiKey)` | Làm sạch và lưu Plane API Key vào tệp cấu hình người dùng. |
| `plane.saveWorkspaceProjectId(worktreePath, projectId)` | Ánh xạ đường dẫn thư mục dự án với ID hoặc mã dự án Plane. |
| `plane.ensureWorktreePlane(worktreePath, parentRoot)` | Tạo liên kết symlink/junction thư mục `plane/` giữa các git worktree. |
| `plane.ensureFfmpeg(options, onProgress)` | Kiểm tra hoặc tự động tải xuống bản thực thi `ffmpeg` di động. |

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

## Kiểm Thử & Phát Hành (npm Publish)

Chạy bộ kiểm thử tự động self-test:

```bash
npm test
# hoặc
node test/self-test.js
```

Kiểm tra danh sách tệp đóng gói trước khi phát hành:

```bash
npm pack --dry-run
```

Phát hành phiên bản mới lên npm:

```bash
# Phát hành thủ công (tự động chạy self-test qua prepublishOnly)
npm login
npm publish

# Hoặc tự động phát hành qua GitHub Actions khi đẩy tag phiên bản mới
npm version patch
git push origin main --follow-tags
```

---

## Giấy Phép

[MIT](LICENSE) © Peter Wayne (Nguyen Khac Cuong)
