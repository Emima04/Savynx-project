import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../components/Card';
import api from '../api';

const PASTEL_COLORS = ['#A78BFA', '#F472B6', '#FBBF24', '#34D399', '#60A5FA', '#C084FC', '#FB923C'];

function Analytics() {
  const [data, setData] = useState({ pie_data: [], bar_data: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading charts...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Financial Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Pie Chart */}
        <Card title="Spending by Category" className="h-[400px] flex flex-col bg-white">
          {data.pie_data.length > 0 ? (
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.pie_data}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.pie_data.map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹\${value}`}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f8eaf6', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#334155', fontWeight: '800' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-bold">
              No expense data to analyze yet.
            </div>
          )}
        </Card>

        {/* Monthly Trends Bar Chart */}
        <Card title="Monthly Trends" className="h-[400px] flex flex-col bg-white">
          {data.bar_data.length > 0 ? (
            <div className="flex-1 w-full h-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bar_data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={13} tickLine={false} axisLine={false} dy={10} fontWeight={600} />
                  <YAxis stroke="#cbd5e1" fontSize={13} tickLine={false} axisLine={false} tickFormatter={(value) => `₹\${value}`} fontWeight={600} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#334155', fontWeight: '800' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="income" name="Income" fill="#a7f3d0" radius={[10, 10, 0, 0]} barSize={24} />
                  <Bar dataKey="expense" name="Expense" fill="#fecaca" radius={[10, 10, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-bold">
              No trend data available yet.
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}

export default Analytics;
