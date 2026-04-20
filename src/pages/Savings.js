import { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api';
import { Target, Trophy } from 'lucide-react';

function Savings() {
  const [goal, setGoal] = useState({ target_amount: 0, name: 'Savings Goal' });
  const [summary, setSummary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', target_amount: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalRes, sumRes] = await Promise.all([
          api.get('/goals'),
          api.get('/summary')
        ]);
        setGoal(goalRes.data);
        setEditData({ name: goalRes.data.name, target_amount: goalRes.data.target_amount });
        setSummary(sumRes.data);
      } catch (err) {
        console.error("Failed to load savings data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveGoal = async () => {
    try {
      const res = await api.post('/goals', editData);
      setGoal(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update goal");
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading savings...</div>;

  const currentSaved = summary?.total_balance > 0 ? summary.total_balance : 0;
  const target = goal.target_amount;
  const completionPercentage = target > 0 ? Math.min((currentSaved / target) * 100, 100).toFixed(1) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Savings Goal</h2>

      <Card className="relative overflow-hidden border-0 shadow-sm bg-white">
        {/* Decorative pastel background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-70"></div>
        
        <div className="relative z-10 space-y-8">
          
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  className="bg-transparent border-b-4 border-pink-300 text-2xl font-black text-slate-800 focus:outline-none mb-2"
                />
              ) : (
                <h3 className="text-2xl font-black text-pink-500 flex items-center gap-2">
                  <Target size={26} strokeWidth={2.5}/>
                  {goal.name}
                </h3>
              )}
              <p className="text-slate-500 mt-1 font-bold">Track your progress automatically from your net balance.</p>
            </div>

            <button 
              onClick={() => isEditing ? handleSaveGoal() : setIsEditing(true)}
              className={`px-5 py-3 rounded-2xl text-sm font-black transition-all \${isEditing ? 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-200' : 'bg-pink-50 hover:bg-pink-100 text-pink-600'}`}
            >
              {isEditing ? 'Save Goal' : 'Edit Goal'}
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-pink-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-sm font-bold text-slate-400 mb-1 tracking-wider uppercase">Currently Saved</p>
                <p className="text-5xl font-black text-slate-800 tracking-tight">₹{currentSaved.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-400 mb-1 tracking-wider uppercase">Target Amount</p>
                {isEditing ? (
                  <div className="flex items-center justify-end">
                    <span className="text-2xl text-pink-400 mr-1 font-black">₹</span>
                    <input 
                      type="number"
                      value={editData.target_amount}
                      onChange={e => setEditData({...editData, target_amount: e.target.value})}
                      className="bg-transparent border-b-4 border-pink-300 text-3xl font-black text-slate-800 w-40 focus:outline-none text-right"
                      min="0"
                    />
                  </div>
                ) : (
                  <p className="text-3xl font-black text-pink-500">₹{target.toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-8 bg-pink-50 rounded-full overflow-hidden mt-8 shadow-inner relative border border-pink-100/50">
              <div 
                className="h-full bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `\${completionPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-5 text-sm font-black">
              <span className="text-purple-600 text-base">{completionPercentage}% Completed</span>
              <span className="text-slate-400">
                {target - currentSaved > 0 ? `₹\${(target - currentSaved).toLocaleString()} remaining` : "Goal Achieved!"}
              </span>
            </div>
          </div>

          {currentSaved >= target && target > 0 && (
            <div className="flex gap-5 p-6 rounded-3xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-700 items-center shadow-sm">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-green-500 animate-bounce">
                <Trophy size={32} className="flex-shrink-0" strokeWidth={2.5}/>
              </div>
              <div>
                <h4 className="font-black text-xl">Congratulations!</h4>
                <p className="text-base mt-1 font-bold text-green-600/80">You have successfully reached your pastel savings target!</p>
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}

export default Savings;
