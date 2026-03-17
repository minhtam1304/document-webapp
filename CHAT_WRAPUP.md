# Tóm tắt hội thoại triển khai Document Web App

## 1) Mục tiêu ban đầu

 Yêu cầu xây dựng web app phục vụ giáo viên dạy Vật Lý và các bạn học sinh , có các chức năng chính:
- Upload và download tài liệu theo danh mục có sẵn.
- Danh mục chính: `Cơ`, `Điện`, `Nhiệt`, `Quang`.
- Riêng `Cơ` có các phần: `Động học`, `Động lực học`, `Năng lượng`, `Bầu trời`, `Cơ học chất lưu`.
- Mỗi phần có 2 nhóm con: `Cơ sở lý thuyết`, `Bài tập`.
- Có thể thêm tài liệu bằng upload file hoặc đường dẫn, và download bằng click.
- Public web app, giao diện thân thiện.
- Chốt MVP dùng `SQLite` và lưu file trên local server.
- Hỗ trợ học tập và ôn thi cho học sinh.
- Có thêm xem bài của nhau và đánh giá để chỉnh sửa tài liệu tỉ lệ đúng cao nhất có thể.


## 2) Kế hoạch đã thống nhất

Thiết kế MVP theo kiến trúc 2 tầng:
- Frontend: React + Vite + TypeScript.
- Backend: Node.js + Express.
- Database: SQLite.
- File upload: lưu local tại `backend/uploads`.

## 3) Các hạng mục đã triển khai

### Backend
- Tạo backend Express với các file:
  - `backend/src/server.js`
  - `backend/src/db.js`
  - `backend/src/taxonomy.js`
- Tạo schema SQLite bảng `documents`.
- Tạo API:
  - `GET /api/health`
  - `GET /api/taxonomy`
  - `GET /api/documents`
  - `POST /api/documents/upload`
  - `GET /api/documents/:id/download`
- Phục vụ static file upload qua route `/uploads`.

### Frontend
- Thay UI mặc định Vite bằng giao diện quản lý tài liệu:
  - Sidebar danh mục môn/phần.
  - Tab loại tài liệu.
  - Tìm kiếm theo tên.
  - Form upload (tên, môn, phần, loại, file/link).
  - Danh sách tài liệu và nút download.
- Cập nhật các file:
  - `frontend/src/App.tsx`
  - `frontend/src/App.css`
  - `frontend/src/index.css`
  - `frontend/vite.config.ts`

### Root scripts và tài liệu
- Tạo script chạy đồng thời frontend/backend từ root bằng `concurrently`.
- Cập nhật `README.md` nhiều lần theo yêu cầu:
  - Bổ sung mô tả bài toán, thiết kế high-level, công nghệ sử dụng.
  - Bổ sung kế hoạch checklist task đã/chưa thực hiện.
  - Chuẩn hóa nội dung có đầy đủ dấu tiếng Việt.
  - Bổ sung hướng dẫn chạy Docker Compose chi tiết.

## 4) Docker hóa dự án

Đã tạo đầy đủ cấu hình Docker:
- `backend/Dockerfile`
- `backend/.dockerignore`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `frontend/nginx.conf`
- `docker-compose.yml`

Cơ chế chạy:
- `frontend` chạy trên Nginx, proxy `/api` và `/uploads` sang `backend`.
- `backend` chạy Express + SQLite.
- Dữ liệu được giữ bằng volume:
  - `backend_data`
  - `backend_uploads`

## 5) Lỗi đã gặp và cách xử lý

### Lỗi container restart liên tục
- Backend lỗi `sqlite3` native binary với `GLIBC_2.38 not found`.
- Frontend lỗi theo do không resolve được upstream `backend`.

### Cách fix
- Cập nhật `backend/Dockerfile`:
  - Cài toolchain build (`python3`, `make`, `g++`).
  - Build `sqlite3` from source bằng `npm_config_build_from_source=true npm ci --omit=dev`.
- Rebuild stack:
  - `docker compose down`
  - `docker compose up --build -d`

Kết quả: containers lên ổn định, frontend và backend đều truy cập được.

## 6) Trạng thái chạy hiện tại

URL truy cập khi chạy bằng Docker Compose:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`

## 7) Câu lệnh sử dụng chính

Chạy local (không Docker):
```bash
npm install
npm run dev
```

Chạy Docker Compose:
```bash
docker compose up --build -d
```

Kiểm tra trạng thái:
```bash
docker compose ps
```

Xem logs:
```bash
docker compose logs -f
```

Dừng:
```bash
docker compose down
```

Dừng và xóa dữ liệu volume:
```bash
docker compose down -v
```

## 8) Kết luận

MVP đã hoàn thành theo đúng yêu cầu đã chốt:
- Dùng SQLite cho metadata.
- Lưu file trên local server.
- Có upload/download theo taxonomy.
- Chạy được cả local dev và Docker Compose (phù hợp môi trường Windows/Linux/macOS).
