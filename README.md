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

## Giải thích Thuật toán (Cách hệ thống hoạt động)
1. **Minimality Check:** Nhận vào một tập hợp vị từ (VD: `GPA > 3.5`, `GPA <= 3.5`). Thuật toán tự động đánh giá xem một vị từ có thực sự tham gia vào việc phân tách dữ liệu hay không. Nếu phát hiện dư thừa (như ví dụ trên), nó sẽ loại bỏ vị từ dư thừa ra khỏi tập hợp.
2. **Minterm Generation:** Lấy các vị từ đã "làm sạch" để sinh ra tất cả các tổ hợp Minterm có thể có ($2^n$).
3. **Fragmentation (Completeness):** Loại bỏ các minterm rỗng hoặc mâu thuẫn. Nhóm các dữ liệu (tuples) vào các Minterms hợp lệ. Mọi bản ghi sẽ rơi vào đúng 1 phân mảnh duy nhất, đáp ứng tính Completeness.
