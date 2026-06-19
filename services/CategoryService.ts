
import { Category } from '../types';

// Tự động chọn localhost nếu chạy trên Web, 10.0.2.2 nếu chạy trên máy ảo
const API_URL = 'http://172.20.10.2:3003/api/categories';
//const API_URL = 'http://localhost:3003/api/categories';
class CategoryService {
  async getCategories(): Promise<Category[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  }

  async addCategory(name: string): Promise<Category> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return res.json();
  }

  async updateCategory(id: string, name: string): Promise<Category> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return res.json();
  }

  async deleteCategory(id: string): Promise<void> {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  }
}

export const categoryService = new CategoryService();