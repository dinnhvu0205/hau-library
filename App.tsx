import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ViewType, Book, Category, BorrowRecord } from './types';
import { authService, User } from './services/AuthService';
import { bookService } from './services/BookService';
import { categoryService } from './services/CategoryService';
import { borrowingService } from './services/BorrowingService';
import { 
  Book as BookIcon, 
  Users, 
  Menu, 
  ChevronDown, 
  ChevronLeft,
  Circle,
  LayoutDashboard,
  Search,
  Calendar,
  Trash2,
  Edit,
  Plus,
  UserCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoginView, setIsLoginView] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['books', 'borrow']);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States cho dữ liệu
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  // States cho việc chỉnh sửa
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  const refreshData = async () => {
    try {
      const [b, c, br] = await Promise.all([
        bookService.getBooks(),
        categoryService.getCategories(),
        borrowingService.getBorrowHistory()
      ]);
      setBooks(b);
      setCategories(c);
      setBorrows(br);

      // Nếu tài khoản đăng nhập là Admin, tiến hành nạp danh sách sinh viên trực tuyến chờ duyệt tài khoản
            if (user?.role === 'admin' || user?.role === 'librarian') {
        const res = await fetch('http://172.20.10.2:3001/api/auth/pending');
        if (res.ok) {
          const data = await res.json();
          setPendingUsers(data);
        }
      }
    } catch (e) {
      console.error("Lỗi đồng bộ dữ liệu:", e);
    }
  };

  // --- LOGIC XỬ LÝ SỰ KIỆN ---

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsLoginView(false);
    setCurrentView(ViewType.DASHBOARD);
  };

  // Hàm xử lý kích hoạt duyệt tài khoản sinh viên (Chỉ Admin có quyền gọi)
  const handleApproveUser = async (username: string) => {
    try {
      const res = await fetch(`http://172.20.10.2:3001/api/auth/approve/${username}`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert(`Đã phê duyệt hoạt động trực tuyến cho tài khoản: ${username}`);
        refreshData();
      } else {
        alert('Phê duyệt tài khoản thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối đến máy chủ dịch vụ');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này?')) {
      await bookService.deleteBook(id);
      refreshData();
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setCurrentView(ViewType.BOOK_ADD);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Xóa thể loại này?')) {
      await categoryService.deleteCategory(id);
      refreshData();
    }
  };

  const handleAddCategory = async () => {
    const name = window.prompt('Nhập tên thể loại mới:');
    if (name) {
      await categoryService.addCategory(name);
      refreshData();
    }
  };

  const handleUpdateCategory = async (id: string, currentName: string) => {
    const name = window.prompt('Chỉnh sửa tên thể loại:', currentName);
    if (name && name !== currentName) {
      await categoryService.updateCategory(id, name);
      refreshData();
    }
  };

  // --- FILTER LOGIC (TÌM KIẾM) ---
  const filteredBooks = useMemo(() => 
    books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())),
    [books, searchTerm]
  );

  const filteredBorrows = useMemo(() => 
    borrows.filter(r => r.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) || r.idCard.includes(searchTerm)),
    [borrows, searchTerm]
  );

  // --- PHÂN QUYỀN TRÊN SIDEBAR ĐIỀU HƯỚNG ---
  const Sidebar = () => {
    const isStudent = user?.role === 'student';

    return (
      <aside className={`bg-[#0056b3] w-64 flex-shrink-0 flex flex-col border-r border-[#004085] transition-all duration-300 ${sidebarOpen ? 'ml-0' : '-ml-64'}`}>
        <div className="p-4 flex items-center space-x-3 h-14 border-b border-[#004085] bg-[#004085]">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white flex-shrink-0">
            <img
              src="/img/nen.png"
              alt="nen"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <span className="text-white font-medium text-sm">Quản lý thư viện Trường Đại Học Kiến Trúc Hà Nội</span>
        </div>

        <div className="px-4 py-4 border-b border-[#004085] bg-[#004b9b]">
          {!user ? (
            <button onClick={() => setIsLoginView(true)} className="w-full py-2 bg-white text-[#0056b3] rounded font-bold text-sm text-center shadow hover:bg-gray-100 transition">Đăng nhập / Đăng ký</button>
          ) : (
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar || "/img/avatar1.png"}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                alt="avatar"
              />
              <div className="flex flex-col">
                <span className="text-white font-bold text-[13px]">{user.username}</span>
                <span className="text-blue-200 text-[10px] uppercase font-bold tracking-wider">Quyền: {user.role}</span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-grow overflow-y-auto mt-2 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label={user?.role === 'admin' ? "Thống kê số liệu" : user?.role === 'librarian' ? "Thống kê số liệu" : "Chào mừng"} 
            active={currentView === ViewType.DASHBOARD && !isLoginView}
            onClick={() => { setCurrentView(ViewType.DASHBOARD); setIsLoginView(false); setSearchTerm(''); }} 
          />
          
          {/* MENU 1: QUẢN LÝ SÁCH / TRA CỨU SÁCH */}
          <SidebarItem 
            icon={<BookIcon size={18} />} 
            label={isStudent ? "Tra cứu sách" : "Quản lý sách"} 
            expandable 
            expanded={expandedMenus.includes('books')}
            onClick={() => setExpandedMenus(p => p.includes('books') ? p.filter(m => m !== 'books') : [...p, 'books'])}
            active={!isLoginView && [ViewType.BOOK_LIST, ViewType.BOOK_ADD, ViewType.CATEGORY_LIST].includes(currentView)}
          />
          {expandedMenus.includes('books') && (
            <div className="bg-[#004b9b]">
              <SubSidebarItem label="Danh sách sách" active={currentView === ViewType.BOOK_LIST} onClick={() => { setCurrentView(ViewType.BOOK_LIST); setSearchTerm(''); }} />
              
              {/* Nếu KHÔNG PHẢI sinh viên mới hiện các chức năng này */}
              {!isStudent && (
                <>
                  <SubSidebarItem label="Thêm sách" active={currentView === ViewType.BOOK_ADD && !editingBook} onClick={() => { setEditingBook(null); setCurrentView(ViewType.BOOK_ADD); }} />
                  <SubSidebarItem label="Thể loại" active={currentView === ViewType.CATEGORY_LIST} onClick={() => setCurrentView(ViewType.CATEGORY_LIST)} />
                </>
              )}
            </div>
          )}

          {/* MENU 2: QUẢN LÝ MƯỢN SÁCH / DỊCH VỤ MƯỢN SÁCH */}
          <SidebarItem 
            icon={<Users size={18} />} 
            label={isStudent ? "Dịch vụ mượn sách" : "Quản lý mượn sách"} 
            expandable 
            expanded={expandedMenus.includes('borrow')}
            onClick={() => setExpandedMenus(p => p.includes('borrow') ? p.filter(m => m !== 'borrow') : [...p, 'borrow'])}
            active={!isLoginView && [ViewType.BORROW_ADD, ViewType.BORROW_LIST, ViewType.BORROW_HISTORY].includes(currentView)}
          />
          {expandedMenus.includes('borrow') && (
            <div className="bg-[#004b9b]">
              <SubSidebarItem label="Đăng ký mượn sách" active={currentView === ViewType.BORROW_ADD} onClick={() => setCurrentView(ViewType.BORROW_ADD)} />
              
              {/* Nếu KHÔNG PHẢI sinh viên mới hiện mục Đang mượn và Lịch sử */}
              {!isStudent && (
                <>
                  <SubSidebarItem label="Đang mượn" active={currentView === ViewType.BORROW_LIST} onClick={() => { setCurrentView(ViewType.BORROW_LIST); setSearchTerm(''); }} />
                  <SubSidebarItem label="Lịch sử" active={currentView === ViewType.BORROW_HISTORY} onClick={() => { setCurrentView(ViewType.BORROW_HISTORY); setSearchTerm(''); }} />
                </>
              )}
            </div>
          )}

          {user && <SidebarItem icon={<Circle size={8} fill="currentColor" className="text-red-200" />} label="Đăng xuất" onClick={handleLogout} />}
        </nav>
      </aside>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden text-gray-800">
      {Sidebar()}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 space-x-6 shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-[#0056b3] transition"><Menu size={18} /></button>
          <span className="text-[13px] font-medium text-gray-500">Chào mừng bạn đến với hệ thống quản lý thư viện Trường Đại Học Kiến Trúc Hà Nội</span>
        </header>

        <main className="flex-grow overflow-y-auto p-4 md:p-8 flex flex-col relative bg-[#f1f3f5]">
          {/* Màn hình Chào mừng (Phân chia nội dung sinh viên / thủ thư độc lập) */}
          {currentView === ViewType.DASHBOARD && <WelcomeView user={user} onLoginClick={() => setIsLoginView(true)} />}
          
          {/* LUỒNG HIỂN THỊ TRANG CHỦ HOÀN CHỈNH CHO ADMIN VÀ THỦ THƯ */}
          {currentView === ViewType.DASHBOARD && (user?.role === 'admin' || user?.role === 'librarian') && (
            <div className="mt-6">
              <AdminDashboardView 
                userRole={user.role} // Truyền quyền để ẩn/hiện nút tương ứng
                pendingUsers={pendingUsers} 
                onApprove={handleApproveUser} 
                books={books}
                borrows={borrows}
                onRefresh={refreshData}
              />
            </div>
          )}

          {currentView === ViewType.BOOK_LIST && user && (
            <BookListView 
              books={filteredBooks} 
              onDelete={handleDeleteBook} 
              onEdit={handleEditBook} 
              onAdd={() => { setEditingBook(null); setCurrentView(ViewType.BOOK_ADD); }}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
            />
          )}

          {currentView === ViewType.BOOK_ADD && user && (
            <BookAddEditView 
              categories={categories} 
              editingBook={editingBook} 
              onBack={() => { setEditingBook(null); setCurrentView(ViewType.BOOK_LIST); }} 
              onRefresh={refreshData} 
            />
          )}

          {currentView === ViewType.CATEGORY_LIST && user && (
            <CategoryListView 
              categories={categories} 
              onAdd={handleAddCategory} 
              onDelete={handleDeleteCategory} 
              onEdit={handleUpdateCategory} 
            />
          )}

          {currentView === ViewType.BORROW_ADD && user && (
            <BorrowAddView books={books} onRefresh={refreshData} />
          )}

          {currentView === ViewType.BORROW_LIST && user && (
            <BorrowListView 
              records={filteredBorrows.filter(r => r.status === 'borrowing')} 
              onRefresh={refreshData}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
            />
          )}

          {currentView === ViewType.BORROW_HISTORY && user && (
            <BorrowHistoryView 
              records={filteredBorrows}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
            />
          )}
          
          {isLoginView && !user && (
             <div className="absolute inset-0 bg-[#f8f9fa] flex items-center justify-center z-50">
                <LoginView 
                  onLogin={(u: any) => { setUser(u); setIsLoginView(false); }} 
                  onCancel={() => setIsLoginView(false)}
                />
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- View Components ---

const BookListView = ({ books, onDelete, onEdit, onAdd, searchTerm, onSearch }: any) => {
  const currentUser = authService.getCurrentUser();
  const isStudent = currentUser?.role === 'student';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-700 font-bold text-base border-l-4 border-[#0056b3] pl-2">Danh sách sách trong thư viện</h2>
        <div className="relative flex shadow-sm">
          <input 
            type="text" value={searchTerm} onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên" 
            className="bg-white border border-gray-300 rounded-l px-3 py-1.5 text-xs text-gray-800 focus:outline-none w-64 focus:border-[#0056b3]"
          />
          <button className="bg-[#0056b3] text-white px-3 rounded-r hover:bg-[#004085] transition"><Search size={14} /></button>
        </div>
      </div>

      {!isStudent && (
        <div className="pb-2">
          <button onClick={onAdd} className="bg-[#28a745] hover:bg-green-600 text-white px-4 py-2 rounded text-xs font-bold transition flex items-center space-x-2 shadow">
            <Plus size={14} /> <span>Thêm sách</span>
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead className="bg-[#f1f3f5] text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="p-4">STT</th>
              <th className="p-4">Tên</th>
              <th className="p-4">Thể loại</th>
              <th className="p-4 text-center">Số lượng</th>
              <th className="p-4">Ngày nhập</th>
              <th className="p-4">Hình ảnh</th>
              {!isStudent && (
                <>
                  <th className="p-4 text-center">Chỉnh sửa</th>
                  <th className="p-4 text-center">Xóa</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600">
            {books.map((b: any, i: number) => (
              <tr key={b.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{i + 1}</td>
                <td className="p-4 text-gray-900 font-bold">{b.title}</td>
                <td className="p-4"><span className="bg-blue-50 text-[#0056b3] px-2 py-0.5 rounded text-xs font-medium border border-blue-100">{b.categoryName || '---'}</span></td>
                <td className="p-4 text-center font-bold text-gray-800">{b.quantity}</td>
                <td className="p-4 text-gray-500">{new Date(b.entryDate).toLocaleDateString('vi-VN')}</td>
                <td className="p-4">
                  <img 
                    src={b.imageUrl ? b.imageUrl : 'https://picsum.photos/200/300'} 
                    className="w-14 h-20 object-cover rounded shadow-sm border border-gray-200" 
                    alt="cover" 
                    onError={(e: any) => {
                      e.target.src = 'https://via.placeholder.com/50x70?text=No+Image';
                    }}
                  />
                </td>
                {!isStudent && (
                  <>
                    <td className="p-4 text-center">
                      <button onClick={() => onEdit(b)} className="bg-[#17a2b8] hover:bg-cyan-600 text-white px-3 py-1.5 rounded text-xs font-medium transition shadow-sm">Chỉnh sửa</button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => onDelete(b.id)} className="bg-[#dc3545] hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs transition shadow-sm">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {books.length === 0 && (
              <tr><td colSpan={isStudent ? 6 : 8} className="p-10 text-center italic text-gray-400 bg-white">Không tìm thấy kết quả nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BookAddEditView = ({ categories, editingBook, onBack, onRefresh }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(editingBook?.imageUrl || '');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const imageFile = fileInputRef.current?.files?.[0];
    if (imageFile) {
      fd.append('image', imageFile);
    }

    try {
      if (editingBook) {
        await bookService.updateBook(editingBook.id, fd);
        alert('Cập nhật thành công!');
      } else {
        await bookService.addBook(fd);
        alert('Thêm mới thành công!');
      }
      await onRefresh();
      onBack();
    } catch (err: any) {
      console.error(err);
      alert('Lỗi khi lưu dữ liệu');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-[#0056b3] p-4 text-white font-bold text-base shadow-sm">
          {editingBook ? 'Chỉnh sửa thông tin sách' : 'Thêm sách mới vào thư viện'}
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-5">
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">Tên sách</label>
                <input name="title" defaultValue={editingBook?.title} required placeholder="Nhập tên sách" className="w-full bg-white border border-gray-300 rounded p-2.5 text-sm text-gray-800 focus:border-[#0056b3] outline-none transition" />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">Thể loại</label>
                <select name="categoryId" defaultValue={editingBook?.categoryId} className="w-full bg-white border border-gray-300 rounded p-2.5 text-sm text-gray-800 focus:border-[#0056b3] outline-none transition">
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">Số lượng</label>
                <input name="quantity" type="number" defaultValue={editingBook?.quantity || 1} min="1" className="w-full bg-white border border-gray-300 rounded p-2.5 text-sm text-gray-800 focus:border-[#0056b3] outline-none transition" />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">Ảnh bìa</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <div onClick={() => fileInputRef.current?.click()} className="flex border border-gray-300 rounded overflow-hidden bg-white cursor-pointer hover:border-gray-400 transition">
                   <div className="flex-grow p-2.5 text-sm text-gray-400 italic truncate">
                      {preview ? 'Đã chọn ảnh' : 'Nhấn đây để chọn file...'}
                   </div>
                   <button type="button" className="bg-gray-100 text-gray-700 px-4 border-l border-gray-300 text-xs font-bold uppercase hover:bg-gray-200">Browse</button>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wider">Xem trước bìa</span>
              <div className="w-full aspect-[3/4] bg-gray-50 border border-gray-200 rounded-md overflow-hidden shadow-sm">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 italic text-xs">Chưa có ảnh</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button type="submit" className="bg-[#0056b3] hover:bg-[#004085] text-white px-8 py-2 rounded text-sm font-bold shadow-md transition">Lưu</button>
            <button type="button" onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2 rounded text-sm font-bold shadow-md transition">Hủy bỏ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryListView = ({ categories, onAdd, onDelete, onEdit }: any) => (
  <div className="max-w-2xl mx-auto w-full">
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-800 font-bold text-lg border-l-4 border-[#0056b3] pl-2">Danh sách thể loại sách</h2>
        <button onClick={onAdd} className="bg-[#28a745] hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 shadow shadow-sm">
          <Plus size={14} /> <span>Thêm thể loại</span>
        </button>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead className="bg-[#f1f3f5] text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="p-4 w-20">STT</th>
              <th className="p-4">Tên thể loại</th>
              <th className="p-4 w-28 text-center">Chỉnh sửa</th>
              <th className="p-4 w-24 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600">
            {categories.map((c: any, i: number) => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{i + 1}</td>
                <td className="p-4 text-gray-900 font-bold">{c.name}</td>
                <td className="p-4 text-center">
                  <button onClick={() => onEdit(c.id, c.name)} className="bg-[#17a2b8] text-white px-3 py-1.5 rounded text-xs hover:bg-cyan-600 transition shadow-sm">
                    <Edit size={12} />
                  </button>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => onDelete(c.id)} className="bg-[#dc3545] text-white px-3 py-1.5 rounded text-xs hover:bg-red-600 transition shadow-sm">
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const BorrowListView = ({ records, onRefresh, searchTerm, onSearch }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-gray-800 font-bold text-lg border-l-4 border-[#0056b3] pl-2">Danh sách sách đang mượn</h2>
      <div className="relative flex shadow-sm">
        <input 
          type="text" value={searchTerm} onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc CMND" 
          className="bg-white border border-gray-300 rounded-l px-3 py-1.5 text-xs text-gray-800 focus:outline-none w-64 focus:border-[#0056b3]"
        />
        <button className="bg-[#0056b3] text-white px-3 rounded-r hover:bg-[#004085] transition"><Search size={14} /></button>
      </div>
    </div>
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      <table className="w-full text-left text-[13px] border-collapse">
        <thead className="bg-[#f1f3f5] text-gray-700 font-bold border-b border-gray-200">
          <tr>
            <th className="p-4">STT</th>
            <th className="p-4">Họ tên sinh viên</th>
            <th className="p-4">Mã sinh viên</th>
            <th className="p-4">Tên sách mượn</th>
            <th className="p-4">Ngày mượn</th>
            <th className="p-4">Ngày trả</th>
            <th className="p-4 text-center">Xác nhận</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-600">
          {records.map((r: any, i: number) => (
            <tr key={r.id} className="hover:bg-gray-50 transition">
              <td className="p-4 font-medium">{i + 1}</td>
              <td className="p-4 text-gray-900 font-bold">{r.borrowerName}</td>
              <td className="p-4 font-mono">{r.idCard}</td>
              <td className="p-4 text-[#0056b3] font-medium italic">{r.bookTitle}</td>
              <td className="p-4 text-gray-500">{new Date(r.borrowDate).toLocaleDateString('vi-VN')}</td>
              <td className="p-4 text-red-500 font-bold">{new Date(r.dueDate).toLocaleDateString('vi-VN')}</td>
              <td className="p-4 text-center">
                <button 
                  onClick={() => borrowingService.returnBook(r.id).then(onRefresh)}
                  className="bg-[#ffc107] hover:bg-yellow-500 text-black font-bold px-3 py-1.5 rounded text-[11px] transition shadow-sm border border-yellow-400"
                >
                  Đã trả sách
                </button>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr><td colSpan={7} className="p-10 text-center italic text-gray-400 bg-white">Không có dữ liệu mượn sách hiện tại</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const BorrowHistoryView = ({ records, searchTerm, onSearch }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-gray-800 font-bold text-lg border-l-4 border-[#0056b3] pl-2">Lịch sử mượn trả sách</h2>
      <div className="relative flex shadow-sm">
        <input 
          type="text" value={searchTerm} onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm tên người mượn..." 
          className="bg-white border border-gray-300 rounded-l px-3 py-1.5 text-xs text-gray-800 focus:outline-none w-64 focus:border-[#0056b3]"
        />
        <button className="bg-[#0056b3] text-white px-3 rounded-r hover:bg-[#004085] transition"><Search size={14}/></button>
      </div>
    </div>
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      <table className="w-full text-left text-[13px] border-collapse">
        <thead className="bg-[#f1f3f5] text-gray-700 font-bold border-b border-gray-200">
          <tr>
            <th className="p-4">STT</th>
            <th className="p-4">Họ tên sinh viên</th>
            <th className="p-4">Mã sinh viên</th>
            <th className="p-4">Tên sách mượn</th>
            <th className="p-4">Ngày mượn</th>
            <th className="p-4">Ngày trả</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-600">
          {records.map((r: any, i: number) => (
            <tr key={r.id} className="hover:bg-gray-50 transition">
              <td className="p-4 font-medium">{i + 1}</td>
              <td className="p-4 text-gray-900 font-bold">{r.borrowerName}</td>
              <td className="p-4 font-mono">{r.idCard}</td>
              <td className="p-4 text-gray-700 font-medium italic">{r.bookTitle}</td>
              <td className="p-4 text-gray-500">{new Date(r.borrowDate).toLocaleString('vi-VN')}</td>
              <td className="p-4">
                {/* LOGIC PHÂN CHIA TRẠNG THÁI CHUẨN NGHIỆP VỤ */}
                {r.returnDate ? (
                  // TRẠNG THÁI 1: Sinh viên đã hoàn trả sách thành công (Màu xanh lá)
                  <span className="bg-green-50 text-green-600 font-bold px-2 py-1 rounded text-xs border border-green-200">
                    {new Date(r.returnDate).toLocaleString('vi-VN')}
                  </span>
                ) : r.status === 'requested' ? (
                  // TRẠNG THÁI 2: Sinh viên mới đặt đơn trên app, chưa đến thư viện lấy sách (Màu cam hiển thị tĩnh)
                  <span className="bg-orange-50 text-orange-600 font-bold px-2 py-1 rounded text-xs border border-orange-200 italic">
                    Chưa lấy sách
                  </span>
                ) : (
                  // TRẠNG THÁI 3: Sinh viên đã lấy sách đi, đang cầm về nhà học chưa trả (Màu vàng)
                  <span className="bg-yellow-50 text-yellow-600 font-bold px-2 py-1 rounded text-xs border border-yellow-200">
                    Chưa trả
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BorrowAddView = ({ books, onRefresh }: any) => {
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const bookId = fd.get('bookId') as string;
    const book = books.find((b: any) => b.id === bookId);
    
    try {
      // Gọi đến API mượn sách của bạn (Port 3004)
      const response = await fetch('http://172.20.10.2:3004/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrowerName: fd.get('name') as string,
          idCard: fd.get('idCard') as string,
          bookId,
          dueDate: fd.get('dueDate') as string
        })
      });

      const data = await response.json();

      // KIỂM TRA PHẢN HỒI TỪ SERVER: Nếu có lỗi (như sách bằng 0), hiển thị dòng thông báo chặn
      if (!response.ok) {
        alert(data.message || 'Không thể tạo phiếu mượn sách!');
        return; // Dừng hàm lại, không chạy tiếp
      }
      
      await onRefresh(); // Khởi động lại luồng dữ liệu kho sách
      
      alert('Đã tạo phiếu mượn trực tuyến thành công! Vui lòng đến thư viện chờ lấy sách.');
      e.target.reset();
    } catch (err) { 
      alert('Lỗi kết nối máy chủ khi tạo phiếu mượn sách!'); 
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-[#0056b3] p-4 text-white font-bold text-base shadow-sm">Đăng ký mượn sách</div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 text-sm">Họ tên sinh viên</label>
              <input name="name" required placeholder="Nhập họ và tên" className="w-full bg-white border border-gray-300 rounded p-2.5 text-sm text-gray-800 focus:border-[#0056b3] outline-none transition" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 text-sm">Mã sinh viên</label>
              <input name="idCard" required placeholder="Nhập mã sinh viên" className="w-full bg-white border border-gray-300 rounded p-2.5 text-sm text-gray-800 focus:border-[#0056b3] outline-none transition" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 text-sm">Tên sách mượn</label>
              <select name="bookId" className="w-full bg-white border border-gray-300 rounded p-2.5 text-sm text-gray-800 focus:border-[#0056b3] outline-none transition font-medium">
                {books.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.quantity <= 0 ? 'HẾT SÁCH' : `${b.quantity} còn lại`})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 text-sm">Hạn trả sách</label>
              <div className="relative">
                <input name="dueDate" type="date" required className="w-full bg-white border border-gray-300 rounded p-2.5 text-sm text-gray-800 focus:border-[#0056b3] outline-none transition" />
                <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button type="submit" className="bg-[#0056b3] hover:bg-[#004085] text-white px-10 py-2 rounded text-sm font-bold shadow-md transition">Lưu phiếu</button>
            <button type="reset" className="bg-gray-400 hover:bg-gray-500 text-white px-10 py-2 rounded text-sm font-bold shadow-md transition">Hủy bỏ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, expandable, expanded, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold transition-all duration-150 ${active ? 'bg-[#004085] text-white shadow-inner border-l-4 border-white' : 'text-blue-100 hover:bg-[#004b9b] hover:text-white'}`}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span>{label}</span>
    </div>
    {expandable && (expanded ? <ChevronDown size={14} /> : <ChevronLeft size={14} className="rotate-180" />)}
  </button>
);

const SubSidebarItem = ({ label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-8 py-2.5 text-[12px] border-b border-[#004085]/40 transition-all ${active ? 'bg-[#003366] text-white font-bold' : 'text-blue-200 hover:text-white'}`}
  >
    <Circle size={6} fill={active ? 'currentColor' : 'none'} className={active ? 'text-white' : 'text-blue-300'} />
    <span className="truncate">{label}</span>
  </button>
);

const LoginView = ({ onLogin, onCancel }: any) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (isRegister) {
      try {
        const data = await authService.register(username, password);
        alert(data.message || 'Đăng ký thành công! Vui lòng chờ Quản trị viên phê duyệt.');
        setIsRegister(false);
        setPassword('');
        setUsername('');
      } catch (err: any) {
        alert(err.message || 'Lỗi kết nối máy chủ khi đăng ký');
      }
    } else {
      try {
        const u = await authService.login(username, password);
        onLogin(u);
      } catch (err: any) {
        alert(err.message || 'Sai thông tin đăng nhập hoặc tài khoản chưa được phê duyệt!');
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative">
      <div className="bg-[#0056b3] p-5 text-white font-bold text-base text-center shadow-sm relative">
         {isRegister ? 'ĐĂNG KÝ TÀI KHOẢN SINH VIÊN' : 'ĐĂNG NHẬP HỆ THỐNG'}
         <button 
           type="button" 
           onClick={onCancel} 
           className="absolute right-4 top-4 text-blue-100 hover:text-white text-xs font-normal"
         >
           Đóng
         </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div>
          <label className="block text-gray-700 font-bold mb-1.5 text-sm">Tên đăng nhập / Mã SV</label>
          <input 
            type="text"
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={isRegister ? "Nhập Mã sinh viên mới..." : "Nhập tên đăng nhập..."} 
            className="w-full bg-white border border-gray-300 rounded p-3 text-gray-800 focus:border-[#0056b3] outline-none transition text-sm" 
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-1.5 text-sm">Mật khẩu</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..." 
            className="w-full bg-white border border-gray-300 rounded p-3 text-gray-800 focus:border-[#0056b3] outline-none transition text-sm" 
          />
        </div>

        <button type="submit" className="w-full bg-[#0056b3] hover:bg-[#004085] text-white font-bold py-3 rounded-lg shadow-md transition tracking-wider mt-2 text-sm">
          {isRegister ? 'Đăng Ký Ngay' : 'Đăng Nhập'}
        </button>

        <hr className="border-gray-200 my-4" />

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setUsername('');
              setPassword('');
            }}
            className="text-xs text-[#0056b3] hover:underline font-bold"
          >
            {isRegister ? 'Đã có tài khoản? Quay lại Đăng nhập' : 'Chưa có tài khoản? Đăng ký thành viên mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

const WelcomeView: React.FC<{ user: User | null; onLoginClick: () => void }> = ({ user, onLoginClick }) => {
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const isLibrarian = user?.role === 'librarian';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
      <div className="bg-[#0056b3] p-4 text-white font-bold text-base shadow-sm">
        {isAdmin 
          ? "Thống kê số liệu hệ thống - Trường Đại Học Kiến Trúc Hà Nội" 
          : isStudent 
            ? "Cổng Thông Tin Sinh Viên - HAU Library"
            : "Thư Viện Trường Đại Học Kiến Trúc Hà Nội"}
      </div>

      <div className="p-8 space-y-6 text-[14px] leading-relaxed text-gray-600">
        {user ? (
          <p className="font-bold text-[#0056b3] text-base">
            Xin chào {isAdmin ? 'Quản trị viên' : isStudent ? `Sinh viên ${user.username}` : 'Thủ thư'}!{' '}
            <span className="font-normal text-gray-600">
              {isStudent 
                ? 'Chào mừng bạn đến với ứng dụng thư viện di dộng HAU Library. Hệ thống đã sẵn sàng hỗ trợ bạn học tập và nghiên cứu.' 
                : 'Cảm ơn bạn đã đăng nhập. Hệ thống đã sẵn sàng để bạn thực hiện các tác vụ quầy vận hành thư viện.'}
            </span>
          </p>
        ) : (
          <p className="bg-blue-50 text-gray-700 p-4 rounded-md border border-blue-100">
            Chào mừng bạn! Để truy cập vào hệ thống quản lý thư viện Trường Đại Học Kiến Trúc Hà Nội, vui lòng{' '}
            <button onClick={onLoginClick} className="text-[#0056b3] font-bold mx-1 hover:underline">đăng nhập hoặc đăng ký</button> vào hệ thống. 
          </p>
        )}

        {isStudent ? (
          <>
            <p>Chào mừng bạn đã tham gia mạng lưới tra cứu tài liệu trực tuyến của HAU. Ứng dụng di động này được thiết kế nhằm giúp sinh viên tiết kiệm thời gian, chủ động tìm kiếm tri thức phục vụ cho đồ án và các học phần tại trường.</p>
          </>
        ) : isLibrarian ? (
          <>
            <p>Chào mừng bạn trở lại với nhiệm vụ vận hành quầy HAU Library. Dưới đây là các đầu mục quy trình nghiệp vụ lưu động trong phiên làm việc của bạn ngày hôm nay:</p>
          </>
        ) : (
          <>
            <p>Chào mừng bạn trở lại với Hệ thống quản lý thư viện HAU. Mọi công cụ quản lý danh mục sách, thống kê mượn trả và kiểm soát dữ liệu đều đã sẵn sàng để hỗ trợ công việc của bạn hôm nay. Chúc bạn một ngày làm việc hiệu quả!</p>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== THÀNH PHẦN GIAO DIỆN DÀNH RIÊNG CHO QUẢN TRỊ VIÊN & THỦ THƯ ====================
interface AdminDashboardViewProps {
  userRole: string; // Thêm prop check role
  pendingUsers: any[];
  onApprove: (username: string) => void;
  books: any[];
  borrows: any[];
  onRefresh?: () => void;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ 
  userRole,
  pendingUsers, 
  onApprove, 
  books, 
  borrows,
  onRefresh
}) => {
  const totalBooksCount = useMemo(() => books.length, [books]);
  const totalQuantityCount = useMemo(() => books.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0), [books]);
  
  // Trích lọc các trạng thái mượn trả
  const activeLoansCount = useMemo(() => borrows.filter(r => r.status === 'borrowing').length, [borrows]);
  const pendingRequestsList = useMemo(() => borrows.filter(r => r.status === 'requested'), [borrows]);
  const studentPendingList = useMemo(() => pendingUsers.filter(u => u.role === 'student'), [pendingUsers]);

  const isLibrarian = userRole === 'librarian';
  const isAdmin = userRole === 'admin';

  // Hàm xử lý kích hoạt đổi trạng thái (Gửi tín hiệu đến Borrow Service Port 3004)
  const handleConfirmPackaged = async (id: string, bookTitle: string) => {
    if (window.confirm(`Xác nhận bạn đã nhặt đầu sách "${bookTitle}" ra khỏi kho và đóng gói xong?`)) {
      try {
        const res = await fetch(`http://172.20.10.2:3004/api/borrow/confirm-packaged/${id}`, {
          method: 'PUT'
        });
        if (res.ok) {
          alert('Xác nhận lấy sách thành công! Phiếu đã chuyển sang trạng thái Đang mượn.');
          if (onRefresh) onRefresh();
        } else {
          alert('Xử lý phiếu thất bại');
        }
      } catch (err) {
        alert('Lỗi kết nối máy chủ dịch vụ quầy');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* KHỐI TỔNG QUAN THỐNG KÊ (Cả Admin và Thủ thư đều quan sát được) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng sách trong kho" value={totalBooksCount} subText={`${totalQuantityCount} cuốn thực tế`} color="border-[#0056b3] text-[#0056b3] bg-blue-50/50" />
        <StatCard title="Sinh viên chờ duyệt" value={studentPendingList.length} subText="Tài khoản đăng ký mới" color="border-orange-500 text-orange-600 bg-orange-50/30" />
        <StatCard title="Yêu cầu chờ lấy sách" value={pendingRequestsList.length} subText="Đơn sinh viên đặt trực tuyến" color="border-cyan-500 text-cyan-600 bg-cyan-50/30" />
        <StatCard title="Sách đang lưu thông" value={activeLoansCount} subText="Sinh viên đang giữ sách" color="border-[#28a745] text-[#28a745] bg-green-50/30" />
      </div>

      {/* PHÂN QUYỀN CHÍ CHÚC: KHỐI DANH SÁCH GOM SÁCH CHỈ HIỂN THỊ CHI TIẾT CHO THỦ THƯ (LIBRARIAN) */}
      {isLibrarian && (
        <div className="bg-white rounded-lg border border-cyan-200 shadow-md overflow-hidden">
          <div className="bg-cyan-600 p-4 text-white font-bold text-sm flex items-center space-x-2">
            <BookIcon size={16} />
            <span>Danh sách yêu cầu chờ lấy sách sách</span>
          </div>
          <div className="p-4">
            {pendingRequestsList.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic text-xs bg-gray-50 rounded border border-dashed">
                Tuyệt vời! Hiện tại không có yêu cầu đặt mượn nào cần đi lấy sách.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-cyan-50 text-cyan-800 font-bold border-b border-cyan-100">
                    <tr>
                      <th className="p-3">Họ tên sinh viên</th>
                      <th className="p-3">Mã sinh viên</th>
                      <th className="p-3">Tên sách mượn</th>
                      <th className="p-3">Ngày trả</th>
                      <th className="p-3 text-center">Tác vụ quầy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {pendingRequestsList.map((r: any) => (
                      <tr key={r.id} className="hover:bg-cyan-50/20 transition">
                        <td className="p-3 font-bold text-gray-900">{r.borrowerName}</td>
                        <td className="p-3 font-mono text-xs">{r.idCard}</td>
                        <td className="p-3 text-[#0056b3] italic font-medium">{r.bookTitle}</td>
                        <td className="p-3 text-red-500 font-medium">{new Date(r.dueDate).toLocaleDateString('vi-VN')}</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => handleConfirmPackaged(r.id, r.bookTitle)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-1.5 rounded text-xs transition shadow-sm"
                          >
                            Xác nhận đã lấy sách
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KHỐI DUYỆT TÀI KHOẢN: CHỈ HIỂN THỊ CHO ADMIN CHỨ THỦ THƯ KHÔNG ĐƯỢC XEM */}
      {isAdmin && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#0056b3] p-4 text-white font-bold text-sm flex items-center space-x-2">
              <UserCheck size={16} />
              <span>Phê duyệt tài khoản Sinh viên</span>
            </div>
            <div className="p-4">
              {studentPendingList.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic text-xs bg-gray-50 rounded border border-dashed">
                  Hiện tại không có tài khoản sinh viên nào đang chờ phê duyệt.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#f1f3f5] text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Mã sinh viên</th>
                        <th className="p-3">Quyền hạn hệ thống</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3 text-center">Xác nhận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      {studentPendingList.map((u: any) => (
                        <tr key={u.username} className="hover:bg-gray-50/80 transition">
                          <td className="p-3 font-bold text-gray-900">{u.username}</td>
                          <td className="p-3">
                            <span className="bg-blue-50 text-[#0056b3] border border-blue-100 px-2 py-0.5 rounded text-xs font-semibold uppercase">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-orange-500 font-medium italic flex items-center space-x-1">
                              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse inline-block"></span>
                              <span>Chờ kích hoạt</span>
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => onApprove(u.username)} 
                              className="bg-[#28a745] hover:bg-green-600 text-white font-bold px-4 py-1.5 rounded text-xs transition shadow-sm"
                            >
                              Kích hoạt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, subText, color }: any) => (
  <div className={`p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between transition hover:shadow-md ${color}`}>
    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">{title}</span>
    <span className="text-3xl font-extrabold my-2 tracking-tight">{value}</span>
    <span className="text-gray-400 text-[11px] font-medium">{subText}</span>
  </div>
);

export default App;