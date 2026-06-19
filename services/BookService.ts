// Tự nhận diện: Web dùng localhost, Mobile dùng 10.0.2.2
const API_URL = 'http://172.20.10.2:3002/api/books';
//const API_URL = 'http://localhost:3002/api/books';
export const bookService = {
  getBooks: () => fetch(API_URL).then(res => res.json()),
  addBook: (formData: FormData) => 
    fetch(API_URL, {
      method: 'POST',
      body: formData,
    }).then(res => res.json()),

  updateBook: (id: string, formData: FormData) => 
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: formData,
    }).then(res => res.json()),

  deleteBook: (id: string) => 
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
};