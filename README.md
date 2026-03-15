# Document Web App (MVP)

## Đầu bài mô tả bài toán

Xây dựng web app phục vụ giáo viên dạy Vật Lý, cho phép upload/download tài liệu theo danh mục có sẵn.

Yêu cầu nghiệp vụ:
- Danh mục chính: `Cơ`, `Điện`, `Nhiệt`, `Quang`
- Riêng `Cơ` chia thành: `Động học`, `Động lực học`, `Năng lượng`, `Bầu trời`, `Cơ học chất lưu`
- Mỗi phần có 2 loại tài liệu: `Cơ sở lý thuyết`, `Bài tập`
- Upload tài liệu (tên + file hoặc link), download bằng 1 click
- Public web app, giao diện thân thiện
- Ưu tiên đơn giản, dễ bảo trì: dùng SQLite và local file storage

## Thiết kế high level

- Kiến trúc 2 tầng:
  - Frontend: React UI để duyệt danh mục, upload, tìm kiếm, download
  - Backend: Express API xử lý taxonomy, upload file, metadata, download
- Lưu trữ:
  - Metadata tài liệu trong SQLite (`backend/data.sqlite`)
  - File upload lưu trên local server (`backend/uploads`)
- Luồng nghiệp vụ:
  - User chọn môn -> phần -> loại tài liệu
  - User upload file hoặc nhập external URL
  - Backend validate taxonomy, lưu metadata vào SQLite
  - Frontend load danh sách theo filter và cho download

## Công nghệ sử dụng

- Frontend:
  - React + Vite + TypeScript
  - CSS custom responsive
- Backend:
  - Node.js + Express
  - Multer (xử lý upload file)
  - CORS + static serving
- Database:
  - SQLite3
- Dev tooling:
  - Nodemon
  - Concurrently (chạy frontend/backend cùng lúc)

## Kế hoạch thực hiện

### 1. Phần khởi tạo và kiến trúc

- [x] Tạo workspace gồm `frontend/` và `backend/`
- [x] Cấu hình script chạy cùng lúc FE/BE (`npm run dev`)
- [x] Tạo README hướng dẫn run local

### 2. Phần backend API + data

- [x] Tạo taxonomy cố định theo yêu cầu
- [x] Khởi tạo SQLite schema `documents`
- [x] API lấy taxonomy: `GET /api/taxonomy`
- [x] API list tài liệu có filter: `GET /api/documents`
- [x] API upload tài liệu (file/link): `POST /api/documents/upload`
- [x] API download tài liệu: `GET /api/documents/:id/download`
- [x] Static route để phục vụ file upload

### 3. Phần frontend UI

- [x] Giao diện danh mục môn học + phần + loại tài liệu
- [x] Form upload tài liệu (tên, môn, phần, loại, file/link)
- [x] Danh sách tài liệu theo filter
- [x] Tìm kiếm tài liệu theo tên
- [x] Nút download 1 click
- [x] Responsive cho desktop/mobile

### 4. Kiểm thử và vận hành

- [x] Build frontend thành công
- [x] Kiểm tra backend health endpoint thành công
- [ ] Bổ sung unit/integration test cho API
- [ ] Bổ sung validate URL/file type chi tiết hơn
- [ ] Bổ sung logging + error tracking

### 5. Mở rộng sau MVP (chưa thực hiện)

- [ ] Xác thực admin cho upload/xóa/sửa
- [ ] Trang quản trị xóa/sửa tài liệu
- [ ] Phân trang danh sách tài liệu
- [ ] Gắn tag/lớp học/khối học cho tài liệu
- [ ] Deploy public với persistent storage
- [ ] Backup/restore SQLite + uploads định kỳ

## Hướng dẫn chạy local

### Cách nhanh (1 lệnh)

```bash
npm install
npm run dev
```

Địa chỉ local:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

### Cách tách riêng

```bash
npm run dev:backend
npm run dev:frontend
```

## API chính

- `GET /api/taxonomy`
- `GET /api/documents?subject=&topic=&contentType=&q=`
- `POST /api/documents/upload` (multipart form)
- `GET /api/documents/:id/download`

## Chạy bằng Docker Compose (Windows/Linux/macOS)

### Điều kiện cần

- Đã cài Docker Desktop
- Docker Engine đang chạy

### Các bước chạy

1. Mở terminal tại thư mục gốc project (nơi có file `docker-compose.yml`).
2. Build và chạy toàn bộ service:

```bash
docker compose up --build -d
```

3. Kiểm tra trạng thái container:

```bash
docker compose ps
```

4. Truy cập ứng dụng:
- Frontend (Nginx): `http://localhost:8080`
- Backend API: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

Lưu ý:
- Lần build đầu tiên có thể mất vài phút do cần build dependency native (`sqlite3`).

### Quản lý vòng đời container

- Xem log realtime:

```bash
docker compose logs -f
```

- Dừng và gỡ container/network:

```bash
docker compose down
```

- Dừng và xóa luôn volume dữ liệu:

```bash
docker compose down -v
```

### Dữ liệu khi chạy Docker

Dữ liệu được lưu qua Docker volume để không mất sau khi restart container:
- `backend_data`: chứa SQLite DB
- `backend_uploads`: chứa file upload

Lưu ý quan trọng:
- `docker compose down -v` sẽ xóa toàn bộ dữ liệu DB và file upload.

### Xử lý nhanh lỗi thường gặp

- Lỗi cổng `8080` hoặc `4000` đã được dùng:
  - Đổi port trong `docker-compose.yml`, sau đó chạy lại `docker compose up --build -d`.
- Container đang `Restarting`:

```bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

## Lưu ý deploy

MVP hiện tại lưu file trên local disk của backend. Khi deploy public, cần hosting có persistent storage để tránh mất file upload sau khi restart/redeploy.
