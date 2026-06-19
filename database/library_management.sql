-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 05, 2026 lúc 04:06 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `library_management`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `entryDate` date DEFAULT NULL,
  `imageUrl` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `books`
--

INSERT INTO `books` (`id`, `title`, `categoryId`, `quantity`, `entryDate`, `imageUrl`) VALUES
(11, 'Đắc Nhân Tâm', 6, 2, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824116473.jpg'),
(12, 'Khi Người Ta Tư Duy', 6, 5, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824316799.jpg'),
(13, 'Mặt Trời Và Con Người', 6, 1, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824335106.jpg'),
(14, 'Hạnh Phúc Thật Giản Đơn', 6, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824356564.jpg'),
(15, 'Dám Ước Mơ', 6, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824380795.jpg'),
(16, 'Nghĩ Lớn Để Thành Công', 7, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824406205.jpg'),
(17, 'Chiêu Bài Quản Lý Vàng Của Bill Gates', 7, 4, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824432801.jpg'),
(18, 'Từ Tốt Đến Vĩ Đại', 7, 2, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824463267.jpg'),
(19, '360 Động Từ Bất Quy Tắc Đầy Đủ', 8, 7, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824491287.jpg'),
(20, 'Tự Học Tiếng Anh Hiệu Quả', 8, 5, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824516374.jpg'),
(21, 'Tiếng Hàn Ứng Dụng Học Nhanh', 8, 1, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824564194.png'),
(22, 'Hands-On Machine Learning', 9, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766825442162.jpg'),
(23, 'ASP.NET Core in Action', 9, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766825454866.png'),
(24, 'Head First Java A Brain-Friendly Guide 3rd Edition', 9, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824652004.png'),
(25, 'Michael J Pont - Embedded C', 9, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766825498725.png'),
(26, 'Mật thư', 10, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824765181.jpg'),
(27, 'Tại Sao Các Đế Quốc Sụp Đổ', 11, 4, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824797221.png'),
(28, 'Toàn Cảnh Phật Giáo Đức Phật Và Phật Pháp', 11, 2, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824817936.png'),
(29, 'BƯỚC ĐI NGẪU NHIÊN TRÊN PHỐ WALL', 12, 4, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824847044.png'),
(30, 'Cổ Phiếu Không Khó', 12, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824874052.png'),
(31, 'PHÙ THỦY SÀN CHỨNG KHOÁN', 12, 3, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824903235.png'),
(32, 'Đọc Hiểu Tác Phẩm Hội Họa', 13, 1, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824935470.png'),
(33, 'Đọc Hiểu Công Trình Kiến Trúc', 6, 2, '2025-12-27', 'http://10.0.2.2:3002/uploads/1766824954932.png'),
(35, 'tái tạo mô hình kinh doanh hiệu quả', 7, 1, '2026-01-13', 'http://10.0.2.2:3002/uploads/1768265233733.png'),
(36, 'Toàn Cảnh Phật Giáo Đức Phật Và Phật Pháp', 11, 1, '2026-01-13', 'http://10.0.2.2:3002/uploads/1768268633245.png'),
(38, 'Ngay yeu em', 6, 3, '2026-06-01', NULL),
(39, ' la la ', 6, 0, '2026-06-01', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `borrow_records`
--

CREATE TABLE `borrow_records` (
  `id` int(11) NOT NULL,
  `borrowerName` varchar(100) NOT NULL,
  `idCard` varchar(20) NOT NULL,
  `studentId` varchar(50) DEFAULT NULL,
  `bookId` int(11) DEFAULT NULL,
  `borrowDate` date NOT NULL,
  `dueDate` date NOT NULL,
  `returnDate` date DEFAULT NULL,
  `status` enum('requested','prepared','borrowing','returned') DEFAULT 'requested'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `borrow_records`
--

INSERT INTO `borrow_records` (`id`, `borrowerName`, `idCard`, `studentId`, `bookId`, `borrowDate`, `dueDate`, `returnDate`, `status`) VALUES
(9, 'Trần Đình Vũ', '042223313131', NULL, 19, '2026-01-13', '2026-01-14', '2026-01-13', 'returned'),
(10, 'Hải Nam', '23423423', NULL, 26, '2026-01-13', '2026-01-14', '2026-01-13', 'returned'),
(11, 'Quang Minh', '3245023', NULL, 23, '2026-01-13', '2026-01-15', '2026-01-13', 'returned'),
(12, 'Ngọc Lan', '567465', NULL, 27, '2026-01-13', '2026-01-17', '2026-04-07', 'returned'),
(13, 'Nguyễn Mia Huyền', '324325', NULL, 33, '2026-01-13', '2026-01-14', '2026-04-07', 'returned'),
(14, 'Đoàn Thị Lệ Thu', '4444', NULL, 30, '2026-04-07', '2026-04-08', NULL, 'borrowing'),
(15, 'Random', '222222', NULL, 29, '2026-04-07', '2026-04-09', NULL, 'borrowing'),
(16, 'Đoàn Thị Lệ Thu', '222222', NULL, 11, '2026-04-15', '2026-04-16', '2026-06-01', 'returned'),
(17, 'ph', '73737338', NULL, 11, '2026-06-01', '2026-06-21', '2026-06-01', 'returned'),
(18, 'rrrr', '24244', NULL, 11, '2026-06-01', '2026-06-02', '2026-06-01', 'returned'),
(19, 'duc minh phe', '8328', NULL, 38, '2026-06-01', '2026-06-09', '2026-06-01', 'returned'),
(20, 'Quangminh', '3243', NULL, 11, '2026-06-01', '2026-06-10', NULL, 'borrowing'),
(21, 'vuvuvu ', '43424', NULL, 13, '2026-06-01', '2026-06-02', '2026-06-01', 'returned'),
(22, 'ferg', '4334', NULL, 11, '2026-06-04', '2026-06-15', '2026-06-04', 'returned'),
(23, 'hihsdsa', '133322', NULL, 11, '2026-06-04', '2026-06-06', NULL, 'borrowing'),
(24, 'thuuadhkj', '675876', NULL, 11, '2026-06-04', '2026-06-17', NULL, 'borrowing'),
(25, 'hbkjnfdlakns', '126583791', NULL, 11, '2026-06-05', '2026-06-23', '2026-06-05', 'returned'),
(26, 'hjagdihab', '798986', NULL, 39, '2026-06-05', '2026-06-25', NULL, 'requested'),
(27, 'Dinnh', '111', NULL, 11, '2026-06-05', '2026-06-11', NULL, 'requested'),
(28, 'Tran Dinh Vu', '2255010258', NULL, 11, '2026-06-05', '2026-06-06', NULL, 'borrowing');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(6, 'Tâm Lý - Kỹ Năng Sống'),
(7, 'Kinh Tế Quản Lý'),
(8, 'Ngoại Ngữ'),
(9, 'Công Nghệ Thông Tin'),
(10, 'Khoa học kỹ thuật'),
(11, 'Lịch Sử Và Chính Trị'),
(12, 'Tài Chính Và Đầu Tư'),
(13, 'Kiến Trúc Hội Họa');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','librarian','student') DEFAULT 'student',
  `avatar` text DEFAULT NULL,
  `status` enum('pending','active') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`username`, `password`, `role`, `avatar`, `status`) VALUES
('123', '1', 'student', '', 'pending'),
('123456', '1', 'student', '', 'pending'),
('2', '2', 'student', '', 'active'),
('2255010258', '1', 'student', '', 'active'),
('admin', 'admin', 'admin', '', 'active'),
('dinnhvu', '1', 'librarian', '', 'active'),
('sinhvien1', '1', 'student', '', 'active'),
('Sinhvien2', '1', 'student', '', 'active'),
('sinhvien3', '1', 'student', '', 'pending'),
('sinhvien4', '1', 'student', '', 'active');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Chỉ mục cho bảng `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookId` (`bookId`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`username`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT cho bảng `borrow_records`
--
ALTER TABLE `borrow_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD CONSTRAINT `borrow_records_ibfk_1` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
