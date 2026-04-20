import { useEffect, useState } from 'react';
import { Trash2, Search, Filter } from 'lucide-react';
import Card from '../components/Card';
import api from '../api';

function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Extract all unique categories for the filter dropdown
  const categories = [...new Set(transactions.map(t => t.category))];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/transactions/\${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      alert("Failed to delete transaction.");
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.notes.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="text-center py-20 text-slate-400">Loading history...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Transaction History</h2>

      <Card className="bg-white border-0 shadow-sm">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative border-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-purple-50 border border-purple-100 rounded-2xl pl-11 pr-4 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-purple-200 transition-colors"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full min-w-[200px] bg-purple-50 border border-purple-100 rounded-2xl pl-11 pr-4 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-purple-200 appearance-none transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="overflow-x-auto rounded-3xl border border-purple-100">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-purple-50/50">
              <tr className="border-b border-purple-100 text-purple-600/80 text-sm">
                <th className="py-5 font-black px-6 rounded-tl-3xl uppercase tracking-wider text-xs">Date</th>
                <th className="py-5 font-black px-6 uppercase tracking-wider text-xs">Category</th>
                <th className="py-5 font-black px-6 uppercase tracking-wider text-xs">Notes</th>
                <th className="py-5 font-black px-6 text-right uppercase tracking-wider text-xs">Amount</th>
                <th className="py-5 font-black px-6 text-right rounded-tr-3xl uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-purple-50 hover:bg-purple-50/30 transition-colors last:border-0">
                    <td className="py-4 px-6 text-slate-500 font-bold whitespace-nowrap">{tx.date}</td>
                    <td className="py-4 px-6">
                      <span className="bg-purple-100/50 text-purple-600 text-xs font-black px-4 py-2 rounded-xl">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium truncate max-w-[200px]">{tx.notes || '-'}</td>
                    <td className={`py-4 px-6 text-right font-black \${tx.type === 'income' ? 'text-green-500' : 'text-orange-500'}`}>
                      {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-300 hover:bg-pink-100 hover:text-pink-500 transition-colors p-2.5 rounded-xl"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-bold bg-white">
                    No transactions match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default History;
