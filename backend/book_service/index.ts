import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CẤU HÌNH LƯU TRỮ FILE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

// ===== MYSQL =====
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'library_management'
});

// Hàm bổ trợ để lấy Base URL động (localhost hoặc 10.0.2.2 tùy thiết bị gọi)
const getBaseUrl = (req: any) => {
  // req.get('host') sẽ tự lấy localhost:3002 hoặc 10.0.2.2:3002 tương ứng
  return `${req.protocol}://${req.get('host')}`;
};

// LẤY DANH SÁCH SÁCH
app.get('/api/books', (req, res) => {
  const sql = `
    SELECT books.*, categories.name AS categoryName
    FROM books
    LEFT JOIN categories ON books.categoryId = categories.id
  `;
  db.query(sql, (err, results: any) => {
    if (err) return res.status(500).json(err);

    // SỬA TẠI ĐÂY: Duyệt qua từng cuốn sách để sửa link ảnh trước khi gửi về App
    const fixedResults = results.map((book: any) => {
      if (book.imageUrl && book.imageUrl.includes('localhost')) {
        // Nếu App gọi (host là 10.0.2.2) thì đổi localhost thành 10.0.2.2
        const currentHost = req.get('host'); // Lấy host của thiết bị đang gọi
        if (currentHost?.includes('10.0.2.2')) {
          book.imageUrl = book.imageUrl.replace('localhost', '10.0.2.2');
        }
      }
      return book;
    });

    res.json(fixedResults);
  });
});

// THÊM SÁCH MỚI (POST)
app.post('/api/books', upload.single('image'), (req: any, res: any) => {
  const { title, categoryId, quantity } = req.body;
  const id = 'B' + Date.now();
  const entryDate = new Date().toISOString().split('T')[0];
  
  // SỬA TẠI ĐÂY: Dùng getBaseUrl để tự động thích ứng
  const imageUrl = req.file 
    ? `${getBaseUrl(req)}/uploads/${req.file.filename}` 
    : null;
    
  const sql = `INSERT INTO books (id, title, categoryId, quantity, entryDate, imageUrl) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [id, title, categoryId, quantity, entryDate, imageUrl], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ id, imageUrl });
  });
});

// CẬP NHẬT THÔNG TIN SÁCH (PUT)
app.put(
  '/api/books/:id',
  (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      upload.single('image')(req, res, next);
    } else {
      next();
    }
  },
  (req, res) => {
    const { title, categoryId, quantity, imageUrl: bodyImageUrl } = req.body;

    // SỬA TẠI ĐÂY: Không viết cứng localhost hay 10.0.2.2 nữa
    const finalImageUrl = req.file
      ? `${getBaseUrl(req)}/uploads/${req.file.filename}`
      : bodyImageUrl || null;

    const sql = `
      UPDATE books
      SET title=?, categoryId=?, quantity=?, imageUrl=?
      WHERE id=?
    `;

    db.query(
      sql,
      [title, categoryId, quantity, finalImageUrl, req.params.id],
      (err) => {
        if (err) {
          console.error('Lỗi SQL PUT:', err);
          return res.status(500).json(err);
        }
        res.json({ message: 'Success', imageUrl: finalImageUrl });
      }
    );
  }
);

// XÓA SÁCH (DELETE)
app.delete('/api/books/:id', (req, res) => {
  db.query('DELETE FROM books WHERE id = ?', [req.params.id], () =>
    res.sendStatus(200)
  );
});

app.listen(3002, '0.0.0.0', () => {
  console.log('Book Service đã sẵn sàng nhận kết nối tại Port 3002');
});