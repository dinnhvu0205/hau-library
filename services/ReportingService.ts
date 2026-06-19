
// Tự nhận diện: Web dùng localhost, Mobile dùng 10.0.2.2
const API_URL = 'http://172.20.10.2:3005/api/reports/stats';
//const API_URL = 'http://localhost:3005/api/reports/stats';
class ReportingService {
  async getStats() {
    const res = await fetch(API_URL);
    if (!res.ok) {
      return {
        totalBooks: 0,
        totalBorrowers: 0,
        activeLoans: 0,
        lateReturns: 0
      };
    }
    return res.json();
  }
}

export const reportingService = new ReportingService();
