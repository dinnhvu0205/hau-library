// Client-side Authentication Service
// Kết nối đến backend API

export interface User {
  username: string;
  role: 'admin' | 'student' | 'librarian';
  avatar?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

const API_BASE_URL = 'http://172.20.10.2:3001/api';

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Load user từ localStorage đồng bộ với App.tsx (Dùng lib_user)
    const saved = localStorage.getItem('lib_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  async login(username: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Đăng nhập thất bại');
      }

      const data: LoginResponse = await response.json();
      this.currentUser = data.user;
      
      // Đồng bộ Key lưu trữ với App.tsx
      localStorage.setItem('lib_user', JSON.stringify(data.user));
      localStorage.setItem('lib_token', data.token);

      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối đến máy chủ');
    }
  }

  async register(username: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Đăng ký thất bại');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối đến máy chủ');
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('lib_user');
    localStorage.removeItem('lib_token');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}

// Export singleton instance
export const authService = new AuthService();