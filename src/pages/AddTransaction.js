import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import api from '../api';

function AddTransaction() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = {
    expense: ['Food', 'Travel', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Other'],
    income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { category: categories[value][0] } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await api.post('/transactions', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add transaction");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight text-center">New Transaction</h2>
      
      <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/90">
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-6 font-semibold text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 \${formData.type === 'expense' ? 'bg-orange-200 text-orange-800 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95'}`}
              onClick={() => handleChange({ target: { name: 'type', value: 'expense' }})}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 \${formData.type === 'income' ? 'bg-green-200 text-green-800 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95'}`}
              onClick={() => handleChange({ target: { name: 'type', value: 'income' }})}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-blue-50 border-none rounded-2xl px-5 py-4 text-slate-800 font-extrabold text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-shadow"
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-blue-50 border-none rounded-2xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-blue-200 transition-shadow"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-blue-50 border-none rounded-2xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-blue-200 transition-shadow appearance-none"
              >
                {categories[formData.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Notes (Optional)</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="What was this for?"
                className="w-full bg-blue-50 border-none rounded-2xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-blue-200 transition-shadow"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-lg shadow-purple-200 disabled:opacity-50 mt-6 active:scale-[0.98]"
          >
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default AddTransaction;
