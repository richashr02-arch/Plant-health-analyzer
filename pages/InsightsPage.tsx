import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getReviews, getSentimentStats, getKeywordStats, getCriticalAlerts } from '../services/dataService';
import { ReviewData, KeywordStat } from '../types';
import { AlertTriangle, TrendingUp, MessageSquare, FileSpreadsheet, ExternalLink } from 'lucide-react';

const InsightsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getReviews();
      console.log("Total Fetched Reviews for Insights:", data.length);
      setReviews(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-20 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="text-stone-500 text-sm animate-pulse">Fetching data from Google Sheets...</p>
      </div>
    );
  }

  const sentimentData = getSentimentStats(reviews);
  const keywordData = getKeywordStats(reviews);
  const criticalAlerts = getCriticalAlerts(reviews);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-bold text-stone-800">Review Insights</h1>
           <div className="flex items-center gap-2 text-stone-500 mt-2">
             <FileSpreadsheet className="w-4 h-4 text-green-600" />
             <span className="text-sm">Live Connection:</span>
             <a 
                href="https://docs.google.com/spreadsheets/d/1zmXD0dlAEBpJYcwwXCm6DNwE-1M30h3Di5Y7dSlm8q0/edit" 
                target="_blank" 
                rel="noreferrer"
                className="text-sm text-green-700 hover:text-green-800 underline flex items-center gap-1"
             >
                Google Sheet 1zmXD...
                <ExternalLink className="w-3 h-3" />
             </a>
           </div>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-stone-700">{reviews.length} Total Reviews</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-stone-300">
            <AlertTriangle className="w-10 h-10 text-stone-300 mb-3" />
            <p className="text-stone-500 font-medium">No data found in the connected sheet.</p>
            <p className="text-stone-400 text-sm mt-1">Please ensure the sheet follows the expected template.</p>
        </div>
      ) : (
        <>
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            {/* Sentiment Analysis */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-stone-800">Sentiment Analysis</h2>
                </div>

                {/* Fixed height container for Recharts */}
                <div style={{ height: '300px', width: '100%' }}>
                    {sentimentData.reduce((acc, curr) => acc + curr.value, 0) > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={sentimentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                isAnimationActive={false}
                            >
                            {sentimentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400">
                            No sentiment data available
                        </div>
                    )}
                </div>
            </div>

            {/* Common Keywords */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-stone-800">Common Keywords</h2>
                </div>

                {/* Fixed height container for Recharts */}
                <div style={{ height: '300px', width: '100%' }}>
                    {keywordData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={keywordData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="keyword"
                                type="category"
                                width={90}
                                tick={{fill: '#57534e', fontSize: 12}}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{fill: '#f5f5f4'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#10b981"
                                radius={[0, 4, 4, 0]}
                                barSize={24}
                                isAnimationActive={false}
                            />
                        </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400">
                            No keyword data available
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Critical Alerts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-red-800">Latest Critical Alerts</h2>
            </div>
            <span className="text-xs font-semibold bg-red-200 text-red-800 px-2 py-1 rounded">Top 5 Negative</span>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Summary</th>
                    <th className="px-6 py-4">Keywords</th>
                    <th className="px-6 py-4">Date</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                {criticalAlerts.map((review) => (
                    <tr key={review.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-stone-800">{review.customerName}</td>
                    <td className="px-6 py-4 text-red-700">{review.summary}</td>
                    <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                        {review.keywords.map((k, i) => (
                            <span key={i} className="px-2 py-0.5 bg-stone-100 rounded text-xs text-stone-500 border border-stone-200">{k}</span>
                        ))}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-stone-400 font-mono text-xs">{review.date}</td>
                    </tr>
                ))}
                {criticalAlerts.length === 0 && (
                    <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-stone-400 italic">No critical alerts found.</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
        </>
      )}
    </div>
  );
};

export default InsightsPage;