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
  database: 'library_management' 
});

// 1. LẤY LỊCH SỬ MƯỢN TRẢ SÁCH (Giữ nguyên)
app.get('/api/borrow', (req, res) => {
  const sql = `SELECT br.*, b.title as bookTitle FROM borrow_records br JOIN books b ON br.bookId = b.id`;
  db.query(sql, (err, results: any) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 2. TẠO PHIẾU MƯỢN SÁCH MỚI (KIỂM TRA CHẶN KHI SÁCH BẰNG 0)
app.post('/api/borrow', (req, res) => {
  const { borrowerName, idCard, bookId, dueDate } = req.body;

  // Bước kiểm tra số lượng sách tồn kho thực tế
  const sqlCheckQuantity = 'SELECT quantity, title FROM books WHERE id = ?';
  db.query(sqlCheckQuantity, [bookId], (checkErr, bookRows: any) => {
    if (checkErr) return res.status(500).json(checkErr);
    
    if (!bookRows || bookRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuốn sách này!' });
    }

    const currentQuantity = bookRows[0].quantity;
    const bookTitle = bookRows[0].title;

    // CHẶN NGAY TẠI ĐÂY: Nếu số lượng nhỏ hơn hoặc bằng 0 thì dừng lại, trả về lỗi 400
    if (currentQuantity <= 0) {
      return res.status(400).json({ message: `Sách "${bookTitle}" trong thư viện đã hết, không thể đặt mượn thêm!` });
    }

    // NẾU CÒN SÁCH -> Tiến hành tạo phiếu mượn ở trạng thái "requested"
    const id = 'BR' + Date.now();
    const borrowDate = new Date().toISOString().split('T')[0];
    const sqlInsert = 'INSERT INTO borrow_records (id, borrowerName, idCard, bookId, borrowDate, dueDate, status) VALUES (?,?,?,?,?,?, "requested")';
    
    db.query(sqlInsert, [id, borrowerName, idCard, bookId, borrowDate, dueDate], (insertErr) => {
      if (insertErr) return res.status(500).json(insertErr);

      // TỰ ĐỘNG CẬP NHẬT: Trừ số lượng sách trong bảng books đi 1 đơn vị để giữ chỗ
      const sqlMinus = 'UPDATE books SET quantity = quantity - 1 WHERE id = ?';
      db.query(sqlMinus, [bookId], (updateErr) => {
        if (updateErr) {
          console.error("Lỗi khi cập nhật trừ số lượng kho sách:", updateErr);
          return res.status(500).json(updateErr);
        }
        
        res.json({ id, borrowerName, idCard, bookId, borrowDate, dueDate, status: 'requested' });
      });
    });
  });
});

// 3. XÁC NHẬN TRẢ SÁCH (Giữ nguyên)
app.put('/api/borrow/:id/return', (req, res) => {
  const recordId = req.params.id;
  const returnDate = new Date().toISOString().split('T')[0];

  const sqlGetBookId = 'SELECT bookId, status FROM borrow_records WHERE id = ?';
  db.query(sqlGetBookId, [recordId], (getErr, recordRows: any) => {
    if (getErr) return res.status(500).json(getErr);

    if (!recordRows || recordRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy mã phiếu mượn này!' });
    }

    const { bookId, status } = recordRows[0];
    
    if (status === 'returned') {
      return res.status(400).json({ message: 'Phiếu mượn này đã được hoàn trả từ trước!' });
    }

    const sqlUpdateRecord = 'UPDATE borrow_records SET status = "returned", returnDate = ? WHERE id = ?';
    db.query(sqlUpdateRecord, [returnDate, recordId], (updateRecordErr) => {
      if (updateRecordErr) return res.status(500).json(updateRecordErr);

      const sqlPlus = 'UPDATE books SET quantity = quantity + 1 WHERE id = ?';
      db.query(sqlPlus, [bookId], (plusErr) => {
        if (plusErr) {
          console.error("Lỗi khi cộng trả lại số lượng kho sách:", plusErr);
          return res.status(500).json(plusErr);
        }

        res.sendStatus(200);
      });
    });
  });
});

// ========================================================
// 4. API BỔ SUNG: XÁC NHẬN ĐÃ GOM SÁCH XONG (Chuyển sang "borrowing")
// ========================================================
app.put('/api/borrow/confirm-packaged/:id', (req, res) => {
  const { id } = req.params;
  
  // Chuyển trạng thái phiếu từ chờ gom 'requested' thành đang mượn 'borrowing'
  const sql = 'UPDATE borrow_records SET status = "borrowing" WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Đã xác nhận gom sách thành công! Sách sẵn sàng bàn giao cho sinh viên.' });
  });
});

// Lưu ý: Đổi từ app.listen(3004) thành app.listen(3004, '0.0.0.0') để kết nối qua IP mạng nội bộ từ điện thoại di động
app.listen(3004, '0.0.0.0', () => {
  console.log('Borrow Service đã sẵn sàng nhận kết nối tại Port 3004');
});