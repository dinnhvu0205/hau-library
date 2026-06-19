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

// ========================================================
// 1. API ĐĂNG NHẬP (Chỉ cho đăng nhập nếu trạng thái là active hoặc tài khoản là admin)
// ========================================================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // RẤT QUAN TRỌNG: Câu SQL này bắt buộc tài khoản sinh viên phải có status = 'active' mới được đăng nhập
  const sql = 'SELECT username, role, avatar, status FROM users WHERE username = ? AND password = ?';
  
  db.query(sql, [username, password], (err, results: any) => { 
    if (err) return res.status(500).json(err);
    
    if (results && results.length > 0) {
      const userObj = results[0];
      
      // Nếu là sinh viên nhưng trạng thái chưa được Admin duyệt (vẫn là pending) -> Chặn đứng đăng nhập
      if (userObj.role === 'student' && userObj.status !== 'active') {
        return res.status(403).json({ 
          message: 'Tài khoản Sinh viên của bạn đang ở trạng thái chờ duyệt. Vui lòng đợi Quản trị viên kích hoạt!' 
        });
      }
      
      // Nếu thỏa mãn điều kiện, trả về thông tin đăng nhập thành công
      res.json({ user: userObj, token: 'access_token_' + Date.now() });
    } else {
      res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }
  });
});

// ========================================================
// 2. API ĐĂNG KÝ TÀI KHOẢN MỚI CHO SINH VIÊN
// ========================================================
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu' });
  }

  const checkSql = 'SELECT username FROM users WHERE username = ?';
  db.query(checkSql, [username], (err, results: any) => {
    if (err) return res.status(500).json(err);
    if (results && results.length > 0) {
      return res.status(400).json({ message: 'Tài khoản này đã tồn tại trên hệ thống!' });
    }

    // Ghi trực tiếp trạng thái "pending" vào cột status lúc sinh viên đăng ký
    const insertSql = 'INSERT INTO users (username, password, role, status, avatar) VALUES (?, ?, "student", "pending", "")';
    db.query(insertSql, [username, password], (insertErr) => {
      if (insertErr) return res.status(500).json(insertErr);
      return res.json({ message: 'Đăng ký thành công! Vui lòng chờ Quản trị viên phê duyệt kích hoạt.' });
    });
  });
});

// ========================================================
// 3. API LẤY DANH SÁCH SINH VIÊN ĐANG CHỜ DUYỆT (Hiện trên giao diện Admin)
// ========================================================
app.get('/api/auth/pending', (req, res) => {
  // Lấy chính xác những user có role là student và status là pending
  const sql = 'SELECT username, role, status FROM users WHERE status = "pending" AND role = "student"';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results); // Trả về danh sách mảng JSON cho Frontend map ra giao diện duyệt
  });
});

// ========================================================
// 4. API PHÊ DUYỆT HOẠT ĐỘNG CHO SINH VIÊN (Khi Admin bấm nút duyệt)
// ========================================================
app.put('/api/auth/approve/:username', (req, res) => {
  const { username } = req.params;
  // Cập nhật trạng thái từ pending thành active
  const sql = 'UPDATE users SET status = "active" WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Phê duyệt tài khoản sinh viên thành công!' });
  });
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Auth Service đã sẵn sàng nhận kết nối tại Port 3001');
});