
import { BorrowRecord } from '../types';

const API_URL = 'http://172.20.10.2:3004/api/borrow';
//const API_URL = 'http://localhost:3004/api/borrow';

class BorrowingService {
  async getBorrowHistory(): Promise<BorrowRecord[]> {
    const res = await fetch(API_URL);
    return res.json();
  }

  async createBorrow(record: Omit<BorrowRecord, 'id' | 'borrowDate' | 'status'>): Promise<BorrowRecord> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return res.json();
  }

  async returnBook(id: string): Promise<void> {
    await fetch(`${API_URL}/${id}/return`, { method: 'PUT' });
  }
}

export const borrowingService = new BorrowingService();
