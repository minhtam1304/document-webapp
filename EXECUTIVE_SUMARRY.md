# Executive Summary - Document Web App (MVP)

## Mục tiêu
Xây dựng web app public phục vụ giáo viên dạy Vật Lý để quản lý tài liệu theo danh mục chuẩn, hỗ trợ upload và download nhanh, dễ vận hành.

## Phạm vi MVP đã hoàn thành
- Upload tài liệu theo cấu trúc môn/phần/loại.
- Download tài liệu bằng 1 click.
- Hỗ trợ 2 hình thức lưu tài liệu:
  - Upload file local
  - Lưu liên kết tài liệu (URL)
- Tìm kiếm tài liệu theo tên.
- Giao diện responsive, thân thiện cho desktop/mobile.

## Cấu trúc danh mục
- Môn chính: `Cơ`, `Điện`, `Nhiệt`, `Quang`
- Riêng `Cơ`: `Động học`, `Động lực học`, `Năng lượng`, `Bầu trời`, `Cơ học chất lưu`
- Mỗi phần gồm: `Cơ sở lý thuyết`, `Bài tập`

## Thiết kế giải pháp
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- Database: SQLite (metadata tài liệu)
- File storage: local server (`backend/uploads`)
- Triển khai container: Docker + Docker Compose

## Kết quả kỹ thuật chính
- Backend API đã sẵn sàng:
  - `GET /api/taxonomy`
  - `GET /api/documents`
  - `POST /api/documents/upload`
  - `GET /api/documents/:id/download`
  - `GET /api/health`
- Frontend đã tích hợp đầy đủ luồng nghiệp vụ upload/list/download.
- Đã xử lý lỗi native `sqlite3` trong Docker bằng build from source để stack chạy ổn định.

## Cách truy cập hệ thống
Khi chạy bằng Docker Compose:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:4000`

## Lệnh vận hành chuẩn
```bash
docker compose up --build -d
docker compose ps
docker compose logs -f
docker compose down
```

## Giá trị mang lại
- Đáp ứng đúng nhu cầu lõi của giáo viên: quản lý tài liệu theo cấu trúc môn học rõ ràng.
- Dễ bảo trì: kiến trúc đơn giản, SQLite + local storage, ít phụ thuộc hạ tầng.
- Sẵn sàng demo nội bộ hoặc triển khai public trên môi trường có persistent storage.

## Đề xuất bước tiếp theo (sau MVP)
1. Bổ sung xác thực admin cho thao tác upload/sửa/xóa.
2. Bổ sung trang quản trị tài liệu và phân trang danh sách.
3. Bổ sung test tự động cho API và backup dữ liệu định kỳ.
