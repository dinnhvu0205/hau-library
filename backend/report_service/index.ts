import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({ 
  host: 'localhost', 
  user: 'root', 
  password: '', 
  database: 'library_management',
  multipleStatements: true // Giữ nguyên tính năng gộp nhiều câu lệnh SQL cùng lúc
});

app.get('/api/reports/stats', (req, res) => {
  const sql = `
    SELECT COUNT(*) as totalBooks FROM books; -- Sửa thành COUNT để đếm tổng số đầu sách độc lập
    SELECT COUNT(DISTINCT idCard) as totalBorrowers FROM borrow_records;
    SELECT COUNT(*) as activeLoans FROM borrow_records WHERE status="borrowing";
    SELECT COUNT(*) as lateReturns FROM borrow_records WHERE status="borrowing" AND dueDate < CURDATE();
  `;
  
  db.query(sql, (err, results: any) => {
    if (err) {
      console.error("Lỗi truy vấn thống kê:", err);
      return res.status(500).json(err);
    }
    
    // Bọc thêm điều kiện kiểm tra kết quả an toàn bằng dấu ? để tránh lỗi undefined khi DB trống
    res.json({
      totalBooks: results?.[0]?.[0]?.totalBooks || 0,
      totalBorrowers: results?.[1]?.[0]?.totalBorrowers || 0,
      activeLoans: results?.[2]?.[0]?.activeLoans || 0,
      lateReturns: results?.[3]?.[0]?.lateReturns || 0
    });
  });
});

app.listen(3005, '0.0.0.0', () => {
  console.log('Report Service đã sẵn sàng nhận kết nối tại Port 3005');
});