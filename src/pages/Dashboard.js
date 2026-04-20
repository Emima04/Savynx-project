import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Bell, Activity } from 'lucide-react';
import Card from '../components/Card';
import api from '../api';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, alertsRes, txRes] = await Promise.all([
          api.get('/summary'),
          api.get('/alerts'),
          api.get('/transactions')
        ]);
        setSummary(sumRes.data);
        setAlerts(alertsRes.data);
        setTransactions(txRes.data.slice(0, 5)); // top 5 recent
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading your finances...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pastel Lavender / Mix Card for Balance */}
        <Card className="bg-gradient-to-br from-purple-200 to-indigo-200 border-none shadow-sm text-indigo-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-indigo-700/80 font-bold uppercase tracking-wide">Total Balance</p>
              <h2 className="text-3xl font-extrabold mt-1 text-indigo-900 flex items-center">
                <IndianRupee size={24} className="mr-1"/>
                {summary?.total_balance.toLocaleString()}
              </h2>
            </div>
          </div>
        </Card>
        
        {/* Pastel Green Card for Income */}
        <Card className="bg-green-100 border-none shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-green-700/80 font-bold uppercase tracking-wide">Total Income</p>
              <h2 className="text-2xl font-bold mt-1 text-green-800 flex items-center">
                <IndianRupee size={20} className="mr-1 text-green-700"/>
                {summary?.total_income.toLocaleString()}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 shadow-sm">
              <ArrowUpRight size={20} />
            </div>
          </div>
        </Card>

        {/* Pastel Orange/Pink Card for Expenses */}
        <Card className="bg-orange-100 border-none shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-orange-700/80 font-bold uppercase tracking-wide">Total Expenses</p>
              <h2 className="text-2xl font-bold mt-1 text-orange-800 flex items-center">
                <IndianRupee size={20} className="mr-1 text-orange-700"/>
                {summary?.total_expense.toLocaleString()}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 shadow-sm">
              <ArrowDownRight size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Smart Alerts */}
          {alerts.length > 0 && (
            <Card title="Smart Insights" className="bg-pink-50 border-pink-100">
              <div className="space-y-4">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-pink-100 shadow-sm transition-colors">
                    <div className={`mt-1 \${alert.title === 'On Track!' ? 'text-green-500' : 'text-pink-500'}`}>
                      {alert.title === 'On Track!' ? <Activity size={20}/> : <Bell size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{alert.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                      <p className="text-sm text-pink-600 mt-2 font-semibold">{alert.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card title="Recent Transactions" className="bg-blue-50 border-blue-100">
            {transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-700">{tx.category}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold \${tx.type === 'income' ? 'text-green-600' : 'text-orange-500'}`}>
                        {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]">{tx.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <p className="text-slate-500 text-sm bg-white p-4 rounded-xl">No transactions yet. Add your first!</p>
            )}
          </Card>
        </div>

        {/* Sidebar Space (Today's Summary) */}
        <div className="space-y-6">
          <Card className="bg-green-50 border-green-100" style={{ backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }}>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
              Today's Summary
              <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-md shadow-sm">Live</span>
            </h3>
            
            <div className="space-y-6 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-green-200"></div>
              
              <div className="relative pl-8">
                <div className="absolute left-[9px] top-2 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-[#f0fdf4]"></div>
                <p className="text-sm font-semibold text-slate-500">Earned Today</p>
                <p className="text-xl font-bold text-slate-800 tracking-tight">₹{summary?.today_earned.toLocaleString()}</p>
              </div>
              
              <div className="relative pl-8">
                <div className="absolute left-[9px] top-2 w-2 h-2 rounded-full bg-orange-400 ring-4 ring-[#f0fdf4]"></div>
                <p className="text-sm font-semibold text-slate-500">Spent Today</p>
                <p className="text-xl font-bold text-slate-800 tracking-tight">₹{summary?.today_spent.toLocaleString()}</p>
              </div>
              
              <div className="relative pl-8 pt-4">
                <div className="absolute left-[9px] top-6 w-2 h-2 rounded-full bg-purple-400 ring-4 ring-[#f0fdf4]"></div>
                <p className="text-sm font-bold text-purple-600 mb-0.5">Net Saved</p>
                <p className="text-2xl font-black text-purple-600 tracking-tight">₹{summary?.today_saved.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
