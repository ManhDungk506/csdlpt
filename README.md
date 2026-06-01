# Predicate Tester: University Enrollment

Dự án này là một ứng dụng web (Spring Boot + ReactJS) nhằm mô phỏng và kiểm thử quá trình Phân mảnh ngang (Horizontal Fragmentation) trong Cơ sở dữ liệu Phân tán, đặc biệt tập trung vào việc áp dụng quy tắc "Minimality" và "Completeness" của Özsu.

## Yêu cầu Hệ thống
- **Java 17** trở lên.
- **Node.js** (phiên bản 18+).

## Cấu trúc Dự án
- `backend/`: Chứa mã nguồn REST API bằng Spring Boot (xử lý thuật toán phân mảnh).
- `frontend/`: Chứa mã nguồn giao diện người dùng bằng Vite + ReactJS.
- `students.csv`: Bộ dữ liệu sinh viên mẫu được hệ thống tự động nạp vào bộ nhớ.

## Hướng dẫn Cài đặt & Chạy Thuật toán

### 1. Khởi động Backend (Thuật toán lõi)
Backend được xây dựng bằng Spring Boot, xử lý việc phân tích vị từ và chạy thuật toán phân mảnh.
Mở terminal, di chuyển vào thư mục `backend` và chạy:
- Trên Windows:
  ```bash
  cd backend
  .\gradlew bootRun
  ```
- Trên macOS/Linux:
  ```bash
  cd backend
  ./gradlew bootRun
  ```
Server sẽ chạy trên cổng `http://localhost:8080`.

### 2. Khởi động Frontend (Giao diện người dùng)
Frontend sử dụng ReactJS và Vite để trực quan hoá kết quả.
Mở một terminal khác, di chuyển vào thư mục `frontend` và chạy:
```bash
cd frontend
npm install
npm run dev
```
Ứng dụng web sẽ chạy trên cổng `http://localhost:5173` (hoặc 5174 nếu cổng 5173 bị trùng). Truy cập đường link này trên trình duyệt.

## Giải thích Thuật toán (Đạt chuẩn 3 quy tắc của Özsu)
1. **Minimality Check:** Nhận vào một tập hợp vị từ (VD: `GPA > 3.5`, `GPA <= 3.5`). Thuật toán tự động đánh giá xem một vị từ có thực sự tham gia vào việc phân tách dữ liệu hay không. Nếu phát hiện dư thừa (như ví dụ trên), nó sẽ loại bỏ vị từ dư thừa ra khỏi tập hợp.
2. **Completeness (Tính Đầy đủ):** Lấy các vị từ đã "làm sạch" để sinh ra tất cả các tổ hợp Minterm có thể có. Hệ thống tự động loại bỏ các minterm rỗng (không chứa dữ liệu). Mọi sinh viên trong tập gốc sẽ rơi vào đúng 1 phân mảnh duy nhất, đáp ứng tính Completeness.
3. **Mô phỏng Phân tán (Distributed Aspect):** Các phân mảnh được tạo ra không chỉ hiển thị trên giao diện mà còn được Backend ghi trực tiếp xuống các file CSV riêng biệt (`backend/sites/Site_F*.csv`), mô phỏng việc dữ liệu được đẩy đi các Node khác nhau trên mạng.
4. **Reconstruction (Tính Tái tạo):** Giao diện cung cấp nút "Tái tạo Dữ liệu", gọi API đọc và gộp (UNION) toàn bộ các file từ các Node về lại thành một bảng 30 sinh viên gốc. Đặc biệt, người dùng có thể thử "Đánh sập Node" (Xoá file) để chứng minh rằng khi thiếu Node, hệ thống sẽ báo lỗi mất mát dữ liệu, qua đó làm nổi bật tầm quan trọng của cơ chế Nhân bản (Replication).
