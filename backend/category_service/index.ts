import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'library_management' });

app.get('/api/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results: any) => res.json(results));
});

app.post('/api/categories', (req, res) => {
  const id = 'C' + Date.now();
  db.query('INSERT INTO categories (id, name) VALUES (?, ?)', [id, req.body.name], () => {
    res.json({ id, name: req.body.name });
  });
});

app.delete('/api/categories/:id', (req, res) => {
  db.query('DELETE FROM categories WHERE id = ?', [req.params.id], () => res.sendStatus(200));
});

app.listen(3003, '0.0.0.0', () => {
  console.log('Category Service đã sẵn sàng nhận kết nối tại Port 3003');
});