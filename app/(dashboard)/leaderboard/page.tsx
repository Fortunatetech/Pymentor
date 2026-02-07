"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    id: string;
    name: string;
    total_xp: number;
    streak_days: number;
    total_lessons_completed: number;
}

export default function LeaderboardPage() {
    const { profile } = useUser();
    const [users, setUsers] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await fetch("/api/leaderboard");
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (err) {
                console.error("Failed to load leaderboard", err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-dark-500">Loading leaderboard...</div>
            </div>
        );
    }

    // Find user's rank
    const userRank = users.findIndex((u) => u.id === profile?.id) + 1;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark-900 mb-2">Leaderboard</h1>
                    <p className="text-dark-500">Top learners this week. Keep learning to climb the ranks!</p>
                </div>
                {userRank > 0 && (
                    <div className="bg-primary-50 px-4 py-2 rounded-xl border border-primary-200">
                        <span className="text-sm text-dark-500 block">Your Rank</span>
                        <span className="text-xl font-bold text-primary-700">#{userRank}</span>
                    </div>
                )}
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-dark-200 text-sm text-dark-500">
                                <th className="p-4 w-16 text-center">Rank</th>
                                <th className="p-4">Learner</th>
                                <th className="p-4 text-center">Streak</th>
                                <th className="p-4 text-right">XP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => {
                                const rank = index + 1;
                                const isMe = user.id === profile?.id;

                                // Rank styling
                                let rankIcon = <span className="text-dark-500 font-mono">#{rank}</span>;
                                let rowBg = isMe ? "bg-primary-50/50" : "hover:bg-dark-50";

                                if (rank === 1) rankIcon = <span className="text-2xl">🥇</span>;
                                if (rank === 2) rankIcon = <span className="text-2xl">🥈</span>;
                                if (rank === 3) rankIcon = <span className="text-2xl">🥉</span>;

                                if (rank === 1) rowBg = "bg-yellow-50/50 hover:bg-yellow-100/50";
                                if (rank === 2) rowBg = "bg-slate-50/50 hover:bg-slate-100/50";
                                if (rank === 3) rowBg = "bg-orange-50/50 hover:bg-orange-100/50";
                                if (isMe) rowBg = "bg-primary-100 border-l-4 border-primary-500";

                                return (
                                    <tr key={user.id} className={cn("border-b border-dark-100 last:border-0 transition-colors", rowBg)}>
                                        <td className="p-4 text-center font-medium">{rankIcon}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                                    rank <= 3 ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-primary-400"
                                                )}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className={cn("font-medium", isMe ? "text-primary-900" : "text-dark-900")}>
                                                        {user.name} {isMe && "(You)"}
                                                    </div>
                                                    <div className="text-xs text-dark-500">
                                                        {user.total_lessons_completed} lessons
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1 bg-white border border-dark-200 px-2 py-1 rounded-full text-xs shadow-sm">
                                                <span>🔥</span>
                                                <span>{user.streak_days}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-bold text-dark-900">{user.total_xp}</span>
                                            <span className="text-xs text-dark-500 ml-1">XP</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {users.length === 0 && (
                <div className="text-center py-12 text-dark-500">
                    No learners found yet. Be the first!
                </div>
            )}
        </div>
    );
}
