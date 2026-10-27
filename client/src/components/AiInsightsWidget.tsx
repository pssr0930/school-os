import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight, 
  IndianRupee, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  CalendarCheck
} from 'lucide-react';

export interface AiInsightItem {
  observation: string;
  severity?: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface AiInsightsData {
  summary: string;
  attendanceInsights?: AiInsightItem[];
  feeInsights?: AiInsightItem[];
  actions?: string[];
}

interface AiInsightsWidgetProps {
  insights: AiInsightsData | null;
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
}

export const AiInsightsWidget: React.FC<AiInsightsWidgetProps> = ({
  insights,
  isLoading,
  onRefresh,
  className = ''
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!insights && !isLoading) {
    return (
      <div className={`p-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">AI Executive Insights Ready</h4>
            <p className="text-[11px] text-slate-400">Generate real-time executive observations on attendance and fees.</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Analyze Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/50 border border-purple-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl ${className}`}>
      {/* AMBIENT PURPLE GLOW ACCENT */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-sm shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xs sm:text-sm text-white tracking-tight">Gemini AI Executive Observations</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                Live Insights
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Synthesized from real-time attendance, enrollment & fee ledgers</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh AI Analysis"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/20 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all"
            title={isExpanded ? 'Collapse Insights' : 'Expand Insights'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
          <p className="text-xs text-purple-200 font-bold animate-pulse">Gemini AI is analyzing school health metrics...</p>
        </div>
      )}

      {/* CONTENT BODY */}
      {!isLoading && insights && (
        <div className="space-y-4 pt-3.5 relative z-10">
          {/* 1. EXECUTIVE SUMMARY */}
          <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-2xl flex items-start gap-2.5">
            <span className="text-purple-400 text-base leading-none mt-0.5">💡</span>
            <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-medium">
              {insights.summary}
            </p>
          </div>

          {/* EXPANDABLE INSIGHTS BREAKDOWN */}
          {isExpanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 2. ATTENDANCE INSIGHTS */}
                {insights.attendanceInsights && insights.attendanceInsights.length > 0 && (
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[11px] font-extrabold text-blue-300 uppercase tracking-wider">Attendance Health</span>
                      </div>
                      {insights.attendanceInsights[0].severity && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          insights.attendanceInsights[0].severity === 'high' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : insights.attendanceInsights[0].severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {insights.attendanceInsights[0].severity === 'high' ? <ShieldAlert className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                          {insights.attendanceInsights[0].severity} Alert
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white leading-snug">
                      {insights.attendanceInsights[0].observation}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <span className="text-blue-400 font-bold">Recommendation:</span> {insights.attendanceInsights[0].recommendation}
                    </p>
                  </div>
                )}

                {/* 3. FEE & FINANCIAL INSIGHTS */}
                {insights.feeInsights && insights.feeInsights.length > 0 && (
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">Fee Collections</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                        Financial Status
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-snug">
                      {insights.feeInsights[0].observation}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <span className="text-emerald-400 font-bold">Recommendation:</span> {insights.feeInsights[0].recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* 4. RECOMMENDED ACTION ITEMS */}
              {insights.actions && insights.actions.length > 0 && (
                <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
                        Suggested Administrative Next Steps
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {insights.actions.map((act, idx) => (
                      <div 
                        key={idx}
                        className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors flex items-start gap-2 text-xs"
                      >
                        <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] text-slate-300 font-medium leading-tight">
                          {act}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* QUICK SHORTCUT BUTTONS */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2 flex-wrap">
                    <button
                      onClick={() => navigate('/admin/attendance')}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-slate-800/90 rounded-lg border border-blue-500/20 transition-colors"
                    >
                      <span>Take Attendance</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => navigate('/admin/payments')}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2.5 py-1 bg-slate-800/90 rounded-lg border border-emerald-500/20 transition-colors"
                    >
                      <span>Record Payments</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => navigate('/admin/sms')}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-purple-400 hover:text-purple-300 px-2.5 py-1 bg-slate-800/90 rounded-lg border border-purple-500/20 transition-colors"
                    >
                      <span>Draft SMS with AI</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
