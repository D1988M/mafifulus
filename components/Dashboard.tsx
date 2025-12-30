
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Transaction, LifeObjective } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Sankey, TooltipProps } from 'recharts';
import { Plus, Target, LayoutDashboard, FileBarChart, Lightbulb, Wallet, ArrowLeft, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, RotateCcw, Repeat, ExternalLink, RefreshCw, Layers, LineChart, PhoneOff, Mic, Sparkles, ChevronRight, MoreHorizontal, Banknote } from 'lucide-react';
import { startLiveSession } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  onBack: () => void;
  userName: string;
}

// --- Constants & Helpers ---

// Vibrant Palette for Charts
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#6366F1', '#0EA5E9', '#F97316'];

// Dedicated Palette for Sankey to make it "pop" - ALL VIBRANT COLORS
const SANKEY_PALETTE = {
  income: '#8B5CF6', // Vibrant Violet (Source)
  savingsInput: '#F59E0B', // Amber 500
  hub: '#06B6D4', // Vibrant Cyan (Hub - NO GREY!)
  savingsOutput: '#10B981', // Emerald 500 (Goal)
  expenses: [
    '#EC4899', // Pink 500
    '#3B82F6', // Blue 500
    '#8B5CF6', // Violet 500
    '#F97316', // Orange 500
    '#14B8A6', // Teal 500
    '#EF4444', // Red 500
    '#EAB308', // Yellow 500
    '#06B6D4', // Cyan 500
  ]
};

const SUBSCRIPTION_KEYWORDS = ['netflix', 'spotify', 'apple', 'hulu', 'disney', 'prime', 'hbo', 'gym', 'fitness', 'adobe', 'slack', 'zoom', 'openai', 'claude', 'github', 'linkedin', 'dropbox', 'icloud', 'youtube', 'microsoft', 'google storage'];

type Tab = 'dashboard' | 'reports' | 'goals' | 'investments' | 'advice';

// Custom Link Component for Sankey
const CustomSankeyLink = (props: any) => {
  const { sourceX, targetX, sourceY, targetY, linkWidth, source, target, payload } = props;

  // Robustly generate a cubic bezier path for the Sankey link
  const curvature = 0.5;
  const deltaX = targetX - sourceX;
  const x1 = sourceX + deltaX * curvature;
  const x2 = targetX - deltaX * curvature;
  const y1 = sourceY + linkWidth / 2;
  const y2 = targetY + linkWidth / 2;
  const path = `M${sourceX},${y1} C${x1},${y1} ${x2},${y2} ${targetX},${y2}`;

  // Unique Gradient ID
  const gradientId = `linkGradient-${source.index}-${target.index}`;
  const sourceColor = payload?.source?.color || '#8884d8';
  const targetColor = payload?.target?.color || '#82ca9d';

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={sourceColor} />
          <stop offset="100%" stopColor={targetColor} />
        </linearGradient>
      </defs>
      <path
        d={path}
        stroke={`url(#${gradientId})`}
        strokeWidth={Math.max(1, linkWidth)}
        fill="none"
        strokeOpacity={0.6}
        onMouseEnter={(e) => { e.currentTarget.style.strokeOpacity = '0.9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.strokeOpacity = '0.6'; }}
        style={{ transition: 'stroke-opacity 0.3s' }}
      />
    </g>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onBack, userName }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [objectives, setObjectives] = useState<LifeObjective[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [newCost, setNewCost] = useState('');

  // Live Audio State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const disconnectRef = useRef<(() => void) | null>(null);

  // Scroll Tracking for AI Context
  const [activeSection, setActiveSection] = useState<string>('');
  const reportsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection('reports');
            // Trigger Merrit Context Update (Conceptual - in real app, send to AI)
            if (isLiveConnected && !isSpeaking) {
              // This would ideally trigger an AI event, but we can't force AI speech easily without a specific trigger function
              // We will update the systemInstruction to include current context
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (reportsRef.current) observer.observe(reportsRef.current);

    return () => observer.disconnect();
  }, [isLiveConnected, isSpeaking]);

  // --- Financial Calculations ---

  const cleanTransactions = useMemo(() => transactions.filter(t => t.category.toLowerCase() !== 'transfer'), [transactions]);

  const totalIncome = useMemo(() => cleanTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0), [cleanTransactions]);
  const totalExpenses = useMemo(() => Math.abs(cleanTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0)), [cleanTransactions]);
  const monthlySurplus = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((monthlySurplus / totalIncome) * 100).toFixed(1) : '0';

  const expenseCategories = useMemo(() => {
    const allCats = cleanTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) {
          existing.value += Math.abs(t.amount);
        } else {
          acc.push({ name: t.category, value: Math.abs(t.amount) });
        }
        return acc;
      }, [] as { name: string; value: number }[])
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);

    if (allCats.length <= 8) return allCats;

    const top8 = allCats.slice(0, 8);
    const otherVal = allCats.slice(8).reduce((sum, c) => sum + c.value, 0);

    if (otherVal > 0) {
      return [...top8, { name: 'Other', value: otherVal }];
    }
    return top8;
  }, [cleanTransactions]);

  const recurringExpenses = useMemo(() => {
    return cleanTransactions.filter(t => {
      if (t.amount >= 0) return false;
      const lowerDesc = t.description.toLowerCase();
      const lowerCat = t.category.toLowerCase();
      return SUBSCRIPTION_KEYWORDS.some(kw => lowerDesc.includes(kw)) || lowerCat.includes('subscription');
    }).map(t => ({
      ...t,
      amount: Math.abs(t.amount)
    })).sort((a, b) => b.amount - a.amount);
  }, [cleanTransactions]);

  const totalMonthlyRecurring = recurringExpenses.reduce((sum, t) => sum + t.amount, 0);

  // --- Vendor Summary by Category ---
  const vendorsByCategory = useMemo(() => {
    const categoryMap = new Map<string, Map<string, number>>();

    // Group by category, then by vendor (description)
    cleanTransactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        if (!categoryMap.has(t.category)) {
          categoryMap.set(t.category, new Map());
        }
        const vendorMap = categoryMap.get(t.category)!;
        const currentAmount = vendorMap.get(t.description) || 0;
        vendorMap.set(t.description, currentAmount + Math.abs(t.amount));
      });

    // Convert to array format with top 3 vendors per category
    return Array.from(categoryMap.entries())
      .map(([category, vendorMap]) => {
        const vendors = Array.from(vendorMap.entries())
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3); // Top 3 vendors per category

        const totalCategorySpend = vendors.reduce((sum, v) => sum + v.amount, 0);

        return {
          category,
          vendors,
          total: totalCategorySpend
        };
      })
      .filter(c => c.vendors.length > 0)
      .sort((a, b) => b.total - a.total); // Sort categories by total spend
  }, [cleanTransactions]);

  // --- Sankey Data Preparation ---
  const sankeyData = useMemo(() => {
    const refinedNodes: { name: string; color?: string }[] = [];
    const links: { source: number; target: number; value: number }[] = [];

    // Sources
    let incomeIdx = -1;
    if (totalIncome > 0) {
      refinedNodes.push({ name: 'Income', color: SANKEY_PALETTE.income });
      incomeIdx = refinedNodes.length - 1;
    }

    let reservesIdx = -1;
    if (monthlySurplus < -1) {
      refinedNodes.push({ name: 'From Savings', color: SANKEY_PALETTE.savingsInput });
      reservesIdx = refinedNodes.length - 1;
    }

    // Hub
    refinedNodes.push({ name: 'Cash Flow', color: SANKEY_PALETTE.hub });
    const hubIdx = refinedNodes.length - 1;

    // Destinations
    const expenseStartIdx = refinedNodes.length;
    expenseCategories.forEach((cat, i) => {
      refinedNodes.push({ name: cat.name, color: SANKEY_PALETTE.expenses[i % SANKEY_PALETTE.expenses.length] });
    });

    let savingsIdx = -1;
    if (monthlySurplus > 1) {
      refinedNodes.push({ name: 'To Savings', color: SANKEY_PALETTE.savingsOutput });
      savingsIdx = refinedNodes.length - 1;
    }

    // Links
    if (incomeIdx !== -1) links.push({ source: incomeIdx, target: hubIdx, value: totalIncome });
    if (reservesIdx !== -1) links.push({ source: reservesIdx, target: hubIdx, value: Math.abs(monthlySurplus) });

    expenseCategories.forEach((cat, i) => {
      if (cat.value > 0) links.push({ source: hubIdx, target: expenseStartIdx + i, value: cat.value });
    });

    if (savingsIdx !== -1) links.push({ source: hubIdx, target: savingsIdx, value: monthlySurplus });

    return { nodes: refinedNodes, links };

  }, [totalIncome, monthlySurplus, expenseCategories]);

  // --- AI Context ---
  const systemInstruction = useMemo(() => {
    // Category-wise expense breakdown
    const categoryBreakdown = expenseCategories.map(cat => {
      const percentage = totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(1) : '0';
      return `${cat.name}: AED ${cat.value.toFixed(0)} (${percentage}% of expenses)`;
    }).join(', ');

    // Calculate key ratios
    const housingExpense = Math.abs(transactions
      .filter(t => t.category.toLowerCase().includes('housing') || t.category.toLowerCase().includes('rent') || t.category.toLowerCase().includes('mortgage'))
      .reduce((sum, t) => sum + t.amount, 0));
    const housingRatio = totalIncome > 0 ? ((housingExpense / totalIncome) * 100).toFixed(1) : '0';

    const groceriesExpense = Math.abs(transactions
      .filter(t => t.category.toLowerCase().includes('groceries') || t.category.toLowerCase().includes('food'))
      .reduce((sum, t) => sum + t.amount, 0));
    const groceriesRatio = totalIncome > 0 ? ((groceriesExpense / totalIncome) * 100).toFixed(1) : '0';

    const savingsRateNum = totalIncome > 0 ? ((monthlySurplus / totalIncome) * 100).toFixed(1) : '0';
    const objectivesList = objectives.map(o => `${o.title} (AED ${o.estimatedCost})`).join(", ");

    // Build assertive opening script with context awareness
    let introScript = `Hello ${userName}. I'm Merrit. `;

    if (activeSection === 'reports') {
      introScript += `I see you're looking at your Reports. Let's analyze your top vendors. I noticed significant spending on TABBY - would you like me to break that down?`;
    } else {
      introScript += `Are you ready for my full review of your actual expenses category-wise versus best practices?`;
    }

    // Add specific insights
    const insights: string[] = [];
    if (parseFloat(housingRatio) > 30) {
      insights.push(`Your housing costs are ${housingRatio}% of income - that's above the recommended 30% benchmark.`);
    }
    if (parseFloat(groceriesRatio) > 15) {
      insights.push(`Groceries are ${groceriesRatio}% of income. Consider cutting spending on groceries to reach the 10-15% target.`);
    }
    if (parseFloat(savingsRateNum) < 20) {
      insights.push(`You're saving ${savingsRateNum}% of income. Aim for at least 20% to build wealth faster.`);
    } else {
      insights.push(`Great job saving ${savingsRateNum}% of your income!`);
    }
    if (objectives.length === 0) {
      insights.push(`Add your financial objectives to the Goals section so I can help you plan better.`);
    }
    if (monthlySurplus > totalIncome * 0.3) {
      insights.push(`You have significant room to spend on leisure or invest more aggressively.`);
    }

    return `
      You are 'Merrit', an assertive, expert AI Financial Advisor who drives the conversation with actionable insights.
      
      USER DATA:
      - Name: ${userName}
      - Income: AED ${totalIncome}
      - Expenses: AED ${totalExpenses}
      - Net Savings: AED ${monthlySurplus}
      - Savings Rate: ${savingsRateNum}%
      - Housing Ratio: ${housingRatio}% (benchmark: 30%)
      - Groceries Ratio: ${groceriesRatio}% (benchmark: 10-15%)
      - ACTIVE SECTION: ${activeSection || 'Dashboard Overview'}
      
      CATEGORY BREAKDOWN: ${categoryBreakdown}
      
      GOALS: ${objectivesList || 'None set'}
      
      KEY INSIGHTS: ${insights.join(' ')}
      
      INSTRUCTIONS:
      1. ALWAYS use "AED" (UAE Dirhams) when mentioning any currency amounts - NEVER use dollars ($)
      2. Start with: "${introScript}"
      3. If ACTIVE SECTION is 'reports', focus immediately on Top Vendors and Subscriptions. Ask specifically about "TABBY" if mentioned.
      4. Otherwise, provide category-wise analysis comparing actual vs benchmarks
      5. Give specific, actionable recommendations like:
         - "Cut spending on [category]"
         - "You have room to spend on [category]"
         - "Add your objectives to the Goals section"
         - "Increase savings by reducing [specific category]"
      6. Be direct, assertive, and drive the conversation
      7. Focus on concrete numbers and percentages
      8. Always end with a specific action the user should take
    `;
  }, [transactions, objectives, monthlySurplus, totalIncome, totalExpenses, userName, expenseCategories, activeSection]);

  // --- Handlers ---

  useEffect(() => {
    return () => { if (disconnectRef.current) disconnectRef.current(); };
  }, []);

  const handleAddObjective = () => {
    if (!newObjective || !newCost) return;
    setObjectives([...objectives, { id: Date.now().toString(), title: newObjective, estimatedCost: parseFloat(newCost) }]);
    setNewObjective(''); setNewCost('');
  };

  const disconnectSession = () => {
    if (disconnectRef.current) { disconnectRef.current(); disconnectRef.current = null; }
    setIsLiveConnected(false); setIsSpeaking(false);
  };

  const connectSession = async () => {
    setIsConnecting(true);
    try {
      const disconnect = await startLiveSession(
        systemInstruction,
        (speaking) => setIsSpeaking(speaking),
        (err) => { console.error(err); setIsLiveConnected(false); setIsConnecting(false); },
        () => { setIsLiveConnected(false); setIsSpeaking(false); }
      );
      disconnectRef.current = disconnect;
      setIsLiveConnected(true);
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes("API Key")) {
        alert("Voice features require an API Key. Please configure the 'API_KEY' environment variable in your deployment settings.");
      } else {
        alert("Connection failed. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleLiveSession = () => isLiveConnected ? disconnectSession() : connectSession();

  // Custom Sankey Node Renderer
  const renderSankeyNode = ({ x, y, width, height, index, payload }: any) => {
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) return null;
    const isSmall = height < 20;

    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={payload.color} rx={4} fillOpacity={1} />
        {!isSmall && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={10}
            fontWeight="600"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)', pointerEvents: 'none' }}
          >
            {payload.name}
          </text>
        )}
      </g>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-gray-800 mb-1">{label}</p>
          <p className="text-emerald-600 font-semibold">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get Initials Helper
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in pb-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Income</p>
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">AED {totalIncome.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Expenses</p>
                  <div className="p-1.5 bg-gray-50 rounded-lg text-gray-600">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">AED {totalExpenses.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Net Cash Flow</p>
                  <div className={`p-1.5 rounded-lg ${monthlySurplus >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <p className={`text-3xl font-bold tracking-tight ${monthlySurplus >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {monthlySurplus >= 0 ? '+' : ''}AED {monthlySurplus.toLocaleString()}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Savings Rate</p>
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-indigo-600 tracking-tight">{savingsRate}%</p>
              </div>
            </div>

            {/* Sankey Diagram (Cash Flow) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl shadow-md animate-pulse">
                    <Banknote className="w-5 h-5 text-white" style={{ transform: 'rotate(-15deg)' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Money Flow</h3>
                    <p className="text-gray-500 text-sm mt-1">Visualize how your income translates into expenses and savings.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <RefreshCw className="w-3.5 h-3.5" /> Dec 2024
                </div>
              </div>
              {/* Summary Header */}
              <div className="flex items-center justify-center gap-8 mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Income</p>
                  <p className="text-xl font-bold text-emerald-600">AED {totalIncome.toLocaleString()}</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expenses</p>
                  <p className="text-xl font-bold text-red-500">AED {totalExpenses.toLocaleString()}</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Savings</p>
                  <p className={`text-xl font-bold ${monthlySurplus >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>
                    {monthlySurplus >= 0 ? '+' : ''}AED {monthlySurplus.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="h-[550px] w-full">
                {sankeyData.links.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                      data={sankeyData}
                      node={({ x, y, width, height, index, payload }) => {
                        if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) return null;
                        const isHub = payload.name === 'Cash Flow';
                        // Calculate percentage relative to total flow
                        const totalFlow = totalIncome + (monthlySurplus < 0 ? Math.abs(monthlySurplus) : 0);
                        const value = payload.value;
                        const percent = totalFlow > 0 ? ((value / totalFlow) * 100).toFixed(0) : '0';

                        return (
                          <g>
                            <rect x={x} y={y} width={width} height={height} fill={payload.color} rx={4} fillOpacity={1} />
                            <text
                              x={isHub ? x + width / 2 : (x - 6)}
                              y={y + height / 2}
                              textAnchor={isHub ? "middle" : "end"}
                              dominantBaseline="middle"
                              fill="#1f2937"
                              fontSize={11}
                              fontWeight="600"
                              style={{ pointerEvents: 'none' }}
                            >
                              {!isHub && index < sankeyData.nodes.length / 2 && `${payload.name} AED ${value.toLocaleString()}`}
                            </text>
                            <text
                              x={isHub ? x + width / 2 : (x + width + 6)}
                              y={y + height / 2}
                              textAnchor={isHub ? "middle" : "start"}
                              dominantBaseline="middle"
                              fill="#1f2937"
                              fontSize={11}
                              fontWeight="600"
                              style={{ pointerEvents: 'none' }}
                            >
                              {!isHub && index >= sankeyData.nodes.length / 2 && `${payload.name} (${percent}%)`}
                              {isHub && 'Cash Flow'}
                            </text>
                          </g>
                        );
                      }}
                      link={<CustomSankeyLink />}
                      nodePadding={30}
                      margin={{ top: 20, right: 180, bottom: 20, left: 180 }}
                    >
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </Sankey>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                    <Layers className="w-10 h-10 opacity-30" />
                    <p className="font-medium">Insufficient data for visualization.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div ref={reportsRef} className="space-y-6 animate-fade-in pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Highest Expenditure Categories</h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseCategories} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} interval={0} height={60} angle={-30} textAnchor="end" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} label={{ value: 'AED', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: '10px' } }} />
                      <RechartsTooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                                <p className="font-bold text-gray-900">{payload[0].payload.name}</p>
                                <p className="text-sm text-indigo-600 font-medium">
                                  AED {Number(payload[0].value).toLocaleString()}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Spending Distribution</h3>
                <div className="h-[320px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        cornerRadius={6}
                        stroke="none"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                                <p className="font-bold text-gray-900">{payload[0].name}</p>
                                <p className="text-sm text-indigo-600 font-medium">
                                  AED {Number(payload[0].value).toLocaleString()}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Subscriptions */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recurring & Subscriptions</h3>
                  <p className="text-sm text-gray-500">Detected monthly payments based on your history.</p>
                </div>
                <span className="text-sm font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  AED {totalMonthlyRecurring.toFixed(2)} / month
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recurringExpenses.map(t => (
                  <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-indigo-600 text-sm shadow-sm">
                      {t.description[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{t.description}</p>
                      <p className="text-xs text-gray-500">Approx. AED {(t.amount * 12).toFixed(0)}/yr</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">AED {t.amount.toFixed(0)}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Monthly</div>
                    </div>
                  </div>
                ))}
                {recurringExpenses.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-8">No recurring items found.</p>}
              </div>
            </div>

            {/* Top Vendors by Category */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Top Vendors by Category</h3>
                <p className="text-sm text-gray-500">Your highest spending vendors in each expense category.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendorsByCategory.map((categoryData, catIndex) => (
                  <div key={categoryData.category} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-sm">{categoryData.category}</h4>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                        backgroundColor: `${COLORS[catIndex % COLORS.length]}15`,
                        color: COLORS[catIndex % COLORS.length]
                      }}>
                        AED {categoryData.total.toFixed(0)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {categoryData.vendors.map((vendor, vIndex) => {
                        const percentage = categoryData.total > 0 ? ((vendor.amount / categoryData.total) * 100).toFixed(0) : '0';
                        return (
                          <div key={vendor.name} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: COLORS[catIndex % COLORS.length] }}>
                              {vIndex + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{vendor.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-semibold text-gray-700">AED {vendor.amount.toFixed(0)}</span>
                                <span className="text-xs text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6 animate-fade-in max-w-4xl pb-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Life Objectives</h3>
                  <p className="text-gray-500 text-sm mt-1">Set targets for major life events and track your readiness.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
                  <Target className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Add New Goal</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Goal Name (e.g. Wedding, House Downpayment)"
                    className={`flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow ${isLiveConnected && objectives.length === 0 ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : ''}`}
                    value={newObjective}
                    onChange={e => setNewObjective(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Target Amount (AED)"
                    className="w-full sm:w-40 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                    value={newCost}
                    onChange={e => setNewCost(e.target.value)}
                  />
                  <button
                    onClick={handleAddObjective}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 font-semibold shadow-sm hover:shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {objectives.map((obj) => (
                  <div key={obj.id} className="p-5 bg-white border border-gray-100 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="font-bold text-lg text-gray-900 block">{obj.title}</span>
                        <span className="text-sm font-medium text-gray-500">Target: AED {obj.estimatedCost.toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <Target className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>

                    <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(5, (monthlySurplus / obj.estimatedCost) * 100 * 12))}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">Projected Progress (12 mo)</span>
                      <span className={monthlySurplus > 0 ? 'text-emerald-600' : 'text-red-400'}>
                        {monthlySurplus > 0 ? `${Math.ceil(obj.estimatedCost / monthlySurplus)} Months to Goal` : 'Increase Savings to Start'}
                      </span>
                    </div>
                  </div>
                ))}
                {objectives.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No goals set yet.</p>
                    <p className="text-gray-300 text-sm">Add a goal above to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'advice':
        return (
          <div className="space-y-6 animate-fade-in max-w-4xl pb-10">
            {/* Merrit Avatar Card */}
            <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              {/* Ambient Background Effects */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none group-hover:bg-indigo-500/25 transition-all duration-1000"></div>

              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="relative shrink-0">
                  <div className={`w-36 h-36 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 p-1.5 shadow-2xl ring-1 ring-white/10 ${isSpeaking ? 'scale-105 shadow-[0_0_50px_rgba(16,185,129,0.4)]' : ''} transition-all duration-700 ease-out`}>
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 opacity-0 ${isSpeaking ? 'opacity-100 animate-pulse' : ''} transition-opacity duration-500`}></div>
                      <Zap className={`w-14 h-14 text-emerald-400 relative z-10 ${isSpeaking ? 'drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]' : ''}`} />
                    </div>
                  </div>
                  {isLiveConnected && (
                    <div className="absolute bottom-2 right-2 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-slate-900"></span>
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left flex-1">
                  <h2 className="text-4xl font-bold mb-3 tracking-tight text-white">Meet Merrit</h2>
                  <p className="text-slate-300 mb-8 text-lg leading-relaxed max-w-lg">
                    Your AI financial strategist. I analyze your spending patterns, audit subscriptions, and help you reach your life goals faster.
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    {/* Voice Toggle Switch */}
                    <div className="flex items-center gap-4 bg-slate-800/50 p-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
                      <span className={`text-sm font-bold pl-4 ${isLiveConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isLiveConnected ? 'Voice Active' : 'Voice Mode'}
                      </span>
                      <button
                        onClick={toggleLiveSession}
                        disabled={isConnecting}
                        className={`
                                  relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none 
                                  ${isLiveConnected ? 'bg-emerald-500' : 'bg-slate-600'}
                                  ${isConnecting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                                `}
                      >
                        <span
                          className={`
                                    absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
                                    ${isLiveConnected ? 'translate-x-6' : 'translate-x-0'}
                                  `}
                        >
                          {isConnecting ? (
                            <RefreshCw className="w-3.5 h-3.5 text-slate-900 animate-spin" />
                          ) : isLiveConnected ? (
                            <Mic className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <PhoneOff className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </span>
                      </button>
                    </div>

                    {isLiveConnected && (
                      <button
                        onClick={() => { disconnectSession(); setTimeout(connectSession, 200); }}
                        className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white"
                        title="Restart Conversation"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center text-xs font-medium text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Gemini 2.5 Live API</span>
                <span className={`${isSpeaking ? 'text-emerald-400 animate-pulse' : ''}`}>{isSpeaking ? "Speaking..." : isLiveConnected ? "Listening..." : "Ready to connect"}</span>
              </div>
            </div>

            {/* Static Advice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Savings Insight</h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You're currently spending <strong className="text-gray-900">${(totalMonthlyRecurring * 12).toFixed(0)}/yr</strong> on subscriptions.
                  Reviewing your "Entertainment" category could unlock $50/mo in savings.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Goal Trajectory</h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {monthlySurplus > 0
                    ? `Great pace! With a surplus of $${monthlySurplus.toFixed(0)}/mo, you are well-positioned to fund new goals.`
                    : "Your expenses currently exceed your income. Prioritize reducing high-spend categories like Dining Out."}
                </p>
              </div>
            </div>
          </div>
        );

      case 'investments':
        return (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-gray-50/50">
              <LineChart className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Investments</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">Connect your brokerage accounts to track your net worth and portfolio performance.</p>
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-black transition-colors">
              Join Waitlist
            </button>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 hidden lg:flex flex-col pr-8 sticky top-24 h-[calc(100vh-8rem)]">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all font-medium text-sm shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Upload New File</span>
          </button>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm group ${activeTab === 'dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
              Dashboard
            </div>
            {activeTab === 'dashboard' && <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm group ${activeTab === 'reports' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-3">
              <FileBarChart className={`w-5 h-5 ${activeTab === 'reports' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
              Reports
            </div>
            {activeTab === 'reports' && <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm group ${activeTab === 'goals' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-3">
              <Target className={`w-5 h-5 ${activeTab === 'goals' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
              Goals
            </div>
            {activeTab === 'goals' && <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>

          <button
            onClick={() => setActiveTab('investments')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm group ${activeTab === 'investments' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-3">
              <LineChart className={`w-5 h-5 ${activeTab === 'investments' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
              Investments
            </div>
            {activeTab === 'investments' && <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('advice')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm group ${activeTab === 'advice' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className={`w-5 h-5 ${activeTab === 'advice' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                Merrit AI
              </div>
              {activeTab === 'advice' && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>}
            </button>
          </div>
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {getInitials(userName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">Pro Plan</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-400 ml-auto" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:max-w-5xl">
        {/* Mobile Nav Tabs */}
        <div className="lg:hidden flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar no-scrollbar">
          {['dashboard', 'reports', 'goals', 'investments', 'advice'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap capitalize transition-colors ${activeTab === tab ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize tracking-tight">{activeTab === 'advice' ? 'Financial Advice' : activeTab}</h1>
            <p className="text-gray-500 mt-1">
              {activeTab === 'dashboard' && 'Your financial health at a glance.'}
              {activeTab === 'reports' && 'Deep dive into your spending habits.'}
              {activeTab === 'goals' && 'Plan and track your life objectives.'}
              {activeTab === 'advice' && 'AI-powered insights from Merrit.'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button className="px-4 py-1.5 text-xs font-semibold bg-gray-100 text-gray-900 rounded-md shadow-sm">This Month</button>
            <button className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-md transition-colors">Last Month</button>
            <button className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-md transition-colors">YTD</button>
          </div>
        </header>

        {renderTabContent()}
      </main>
    </div>
  );
};
