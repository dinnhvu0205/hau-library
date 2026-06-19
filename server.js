import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

// 1. Cấu hình kết nối MySQL (XAMPP mặc định)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'library_management'
});

db.connect(err => {
  if (err) console.error('❌ Lỗi kết nối MySQL:', err);
  else console.log('✅ Đã kết nối Database library_management thành công!');
});

const createService = (port, serviceName, setupRoutes) => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  setupRoutes(app);
  app.listen(port, () => {
    console.log(`🚀 ${serviceName} đang chạy tại http://localhost:${port}`);
  });
};

// --- Các Endpoint đồng bộ với Frontend của bạn ---

createService(3001, 'Auth Service', (app) => {
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
      if (results && results.length > 0) {
        res.json({ user: results[0], token: 'fake-jwt-token' });
      } else {
        res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
      }
    });
  });
});

createService(3002, 'Book Service', (app) => {
  app.get('/api/books', (req, res) => {
    const sql = `SELECT books.*, categories.name as categoryName 
                 FROM books LEFT JOIN categories ON books.categoryId = categories.id`;
    db.query(sql, (err, results) => res.json(results));
  });
});

createService(3003, 'Category Service', (app) => {
  app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => res.json(results));
  });
});

createService(3004, 'Borrow Service', (app) => {
  app.get('/api/borrow', (req, res) => {
    db.query('SELECT * FROM borrow_records', (err, results) => res.json(results));
  });
});

createService(3005, 'Reporting Service', (app) => {
  app.get('/api/reports/stats', (req, res) => {
    db.query('SELECT COUNT(*) as totalBooks FROM books', (err, b) => {
      db.query('SELECT COUNT(*) as activeLoans FROM borrow_records WHERE status="borrowing"', (err, br) => {
        res.json({
          totalBooks: b?.[0]?.totalBooks || 0,
          totalBorrowers: 0,
          activeLoans: br?.[0]?.activeLoans || 0,
          lateReturns: 0
        });
      });
    });
  });
});