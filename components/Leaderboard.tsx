
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.ts';

interface RawLeaderboardEntry {
  user_id: string;
  username: string;
  total_earned: any;
}

interface ChefEntry {
  user_id: string;
  username: string;
  total_earned: number;
  rank: number;
}

interface LeaderboardProps {
  userEarnings: number;
  userId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userEarnings, userId }) => {
  const [leaders, setLeaders] = useState<ChefEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchGlobalData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('user_id, username, total_earned')
        .order('total_earned', { ascending: false })
        .limit(25);

      if (error) throw error;
      
      if (data) {
        setLeaders(data.map((item: RawLeaderboardEntry, index: number) => ({
          user_id: item.user_id,
          username: item.username || 'Anonymous Chef',
          total_earned: Number(item.total_earned),
          rank: index + 1
        })));
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Leaderboard database error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  const myRank = leaders.find(l => l.user_id === userId)?.rank;

  return (
    <div className="p-4 space-y-6 pb-32">
      <div className="text-center">
        <h2 className="text-4xl font-black italic uppercase text-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
          Hall of Fame
        </h2>
        <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase mt-1">Global Restaurant Rankings</p>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={fetchGlobalData}
          disabled={isLoading}
          className="bg-slate-900/80 hover:bg-slate-800 text-slate-400 text-[9px] font-black uppercase px-6 py-2 rounded-2xl border border-slate-800 transition-all flex items-center gap-3"
        >
          {isLoading ? 'Syncing...' : '🔄 Refresh Rankings'}
        </button>
      </div>

      <div className="bg-slate-900/60 rounded-[2.5rem] p-5 border border-slate-800/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 px-4">
          <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Master Chefs</span>
          <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Total Sales</span>
        </div>

        {isLoading && leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Entering Kitchen...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((chef) => {
              const isMe = chef.user_id === userId;
              const isTop3 = chef.rank <= 3;

              return (
                <div 
                  key={chef.user_id}
                  className={`flex justify-between items-center p-4 rounded-[1.5rem] transition-all border ${
                    isMe ? 'bg-amber-500/10 border-amber-500/50' :
                    isTop3 ? 'bg-slate-800/40 border-slate-700/50' : 'bg-transparent border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                      isMe ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{chef.rank}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-black text-sm truncate ${isMe ? 'text-amber-400' : 'text-slate-100'}`}>
                        {chef.username}
                      </h3>
                      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Verified Chef</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-black ${isMe ? 'text-amber-400' : 'text-slate-300'}`}>
                      ${chef.total_earned.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-8 text-center opacity-40">
        {lastUpdated && (
          <p className="text-[8px] text-slate-500 uppercase font-black tracking-[0.3em]">
            Sync: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
