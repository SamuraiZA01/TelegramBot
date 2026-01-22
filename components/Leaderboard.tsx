import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../lib/supabase.ts';

interface RawLeaderboardEntry {
  user_id: string;
  username: string;
  total_earned: number;
}

interface ChefEntry extends RawLeaderboardEntry {
  rank: number;
  title: string;
  icon: string;
}

interface LeaderboardProps {
  userEarnings: number;
  userId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userEarnings, userId }) => {
  const [leaders, setLeaders] = useState<ChefEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch real top 20 from Supabase
        const { data, error } = await supabase
          .from('leaderboard')
          .select('user_id, username, total_earned')
          .order('total_earned', { ascending: false })
          .limit(20);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          setLeaders([]);
          setIsLoading(false);
          return;
        }

        // 2. Use Gemini to "Garnish" the real data with fun titles/emojis
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `I have a list of top players for a chef game: ${JSON.stringify(data)}.
        Assign each of these real players a funny culinary "Master Chef" title (e.g. "Sultan of Sizzle", "The Risotto Rebel") 
        and a single emoji icon based on their success. Return as a JSON array keeping the original user_id and total_earned.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  user_id: { type: Type.STRING },
                  username: { type: Type.STRING },
                  total_earned: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  icon: { type: Type.STRING }
                },
                required: ["user_id", "username", "total_earned", "title", "icon"]
              }
            }
          }
        });

        const garnishedLeaders = JSON.parse(response.text || '[]').map((item: any, index: number) => ({
          ...item,
          rank: index + 1
        }));
        
        setLeaders(garnishedLeaders);

        // Find user rank
        const myIdx = garnishedLeaders.findIndex((l: any) => l.user_id === userId);
        if (myIdx !== -1) {
          setUserRank(myIdx + 1);
        } else {
          setUserRank(null); 
        }

      } catch (err) {
        console.error("Leaderboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalData();
  }, [userId, userEarnings]);

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black italic uppercase text-amber-500 drop-shadow-md">Global Rankings</h2>
        <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">Real-Time Kitchen Supremacy</p>
      </div>

      <div className="bg-slate-800/40 rounded-3xl p-4 border border-slate-700/50 backdrop-blur-md shadow-2xl">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Rank/Chef</span>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Sales</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-bold uppercase animate-pulse">Syncing with Cloud Kitchens...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <span className="text-5xl mb-4">🏆</span>
            <p className="text-sm font-bold uppercase tracking-widest">No chefs on the board yet!</p>
            <p className="text-[10px] uppercase mt-1">Start cooking to claim the top spot.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((chef) => (
              <div 
                key={chef.user_id}
                className={`flex justify-between items-center p-3 rounded-2xl transition-all border ${
                  chef.user_id === userId ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                  chef.rank <= 3 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 text-xl relative shadow-inner">
                    {chef.icon}
                    {chef.rank === 1 && <span className="absolute -top-2 -left-2">🥇</span>}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm leading-none ${chef.user_id === userId ? 'text-emerald-400' : 'text-white'}`}>
                      #{chef.rank} {chef.username} {chef.user_id === userId && "(You)"}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{chef.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-500">${chef.total_earned.toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            {userRank === null && (
              <div className="mt-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase">You are currently unranked</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase">Earn more to enter the Top 20!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-center">
        <p className="text-slate-500 text-[10px] italic">Competitive cooking is 10% talent, 90% clicking faster than your rivals.</p>
      </div>
    </div>
  );
};

export default Leaderboard;