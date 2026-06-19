
export interface User {
  username: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

export interface Book {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  entryDate: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface BorrowRecord {
  id: string;
  borrowerName: string;
  idCard: string;
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowing' | 'returned';
}

export enum ViewType {
  DASHBOARD = 'dashboard',
  BOOK_LIST = 'book_list',
  BOOK_ADD = 'book_add',
  CATEGORY_LIST = 'category_list',
  BORROW_ADD = 'borrow_add',
  BORROW_LIST = 'borrow_list',
  BORROW_HISTORY = 'borrow_history'
}
