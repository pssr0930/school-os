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
      <div className={`p-4 bg-[#1F2937] border border-[#303B4D] rounded-lg flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#111827] border border-[#303B4D] flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F3F4F6]">Automated Insights</h4>
            <p className="text-[11px] text-[#9CA3AF]">Generate real-time executive observations on attendance and fees.</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Analyze Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-[#1F2937] border border-[#303B4D] rounded-lg p-5 ${className}`}>
      {/* HEADER BAR */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#303B4D]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#111827] border border-[#303B4D] flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#F3F4F6]">Executive Insights</h3>
            <p className="text-[11px] text-[#9CA3AF]">Synthesized from attendance, enrollment and fee ledgers</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Analysis"
            className="p-1.5 bg-[#111827] hover:bg-gray-700 text-[#9CA3AF] hover:text-[#F3F4F6] border border-[#303B4D] rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-[#111827] hover:bg-gray-700 text-[#9CA3AF] hover:text-[#F3F4F6] border border-[#303B4D] rounded-md transition-colors"
            title={isExpanded ? 'Collapse Insights' : 'Expand Insights'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
          <p className="text-xs text-[#9CA3AF]">Analyzing school metrics...</p>
        </div>
      )}

      {/* CONTENT BODY */}
      {!isLoading && insights && (
        <div className="space-y-4 pt-3.5">
          {/* 1. EXECUTIVE SUMMARY */}
          <div className="p-3 bg-[#111827] border border-[#303B4D] rounded-md flex items-start gap-2.5">
            <span className="text-blue-400 text-sm leading-none mt-0.5">ℹ️</span>
            <p className="text-xs text-[#F3F4F6] leading-relaxed">
              {insights.summary}
            </p>
          </div>

          {/* EXPANDABLE INSIGHTS BREAKDOWN */}
          {isExpanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 2. ATTENDANCE INSIGHTS */}
                {insights.attendanceInsights && insights.attendanceInsights.length > 0 && (
                  <div className="p-3.5 bg-[#111827] border border-[#303B4D] rounded-md space-y-2">
                    <div className="flex items-center justify-between border-b border-[#303B4D] pb-2">
                      <div className="flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-semibold text-[#F3F4F6]">Attendance Health</span>
                      </div>
                      {insights.attendanceInsights[0].severity && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize flex items-center gap-1 ${
                          insights.attendanceInsights[0].severity === 'high' 
                            ? 'bg-red-950/40 text-red-400 border border-red-800/50' 
                            : insights.attendanceInsights[0].severity === 'medium'
                            ? 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
                            : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50'
                        }`}>
                          {insights.attendanceInsights[0].severity === 'high' ? <ShieldAlert className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                          {insights.attendanceInsights[0].severity} alert
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[#F3F4F6] leading-snug">
                      {insights.attendanceInsights[0].observation}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                      <span className="text-[#F3F4F6] font-medium">Recommendation:</span> {insights.attendanceInsights[0].recommendation}
                    </p>
                  </div>
                )}

                {/* 3. FEE & FINANCIAL INSIGHTS */}
                {insights.feeInsights && insights.feeInsights.length > 0 && (
                  <div className="p-3.5 bg-[#111827] border border-[#303B4D] rounded-md space-y-2">
                    <div className="flex items-center justify-between border-b border-[#303B4D] pb-2">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-[#F3F4F6]">Fee Collections</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1F2937] text-[#9CA3AF] border border-[#303B4D]">
                        Status
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#F3F4F6] leading-snug">
                      {insights.feeInsights[0].observation}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                      <span className="text-[#F3F4F6] font-medium">Recommendation:</span> {insights.feeInsights[0].recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* 4. RECOMMENDED ACTION ITEMS */}
              {insights.actions && insights.actions.length > 0 && (
                <div className="p-3.5 bg-[#111827] border border-[#303B4D] rounded-md space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-[#F3F4F6]">
                      Suggested Actions
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {insights.actions.map((act, idx) => (
                      <div 
                        key={idx}
                        className="p-2.5 bg-[#1F2937] border border-[#303B4D] rounded-md text-left flex items-start gap-2 text-xs"
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF] leading-tight">
                          {act}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* QUICK SHORTCUT BUTTONS */}
                  <div className="pt-2 border-t border-[#303B4D] flex items-center justify-end gap-2 flex-wrap">
                    <button
                      onClick={() => navigate('/admin/attendance')}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#F3F4F6] hover:bg-gray-700 px-2.5 py-1 bg-[#1F2937] rounded-md border border-[#303B4D] transition-colors"
                    >
                      <span>Take Attendance</span>
                      <ArrowRight className="w-3 h-3 text-[#9CA3AF]" />
                    </button>
                    <button
                      onClick={() => navigate('/admin/payments')}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#F3F4F6] hover:bg-gray-700 px-2.5 py-1 bg-[#1F2937] rounded-md border border-[#303B4D] transition-colors"
                    >
                      <span>Record Payments</span>
                      <ArrowRight className="w-3 h-3 text-[#9CA3AF]" />
                    </button>
                    <button
                      onClick={() => navigate('/admin/sms')}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#F3F4F6] hover:bg-gray-700 px-2.5 py-1 bg-[#1F2937] rounded-md border border-[#303B4D] transition-colors"
                    >
                      <span>Send SMS</span>
                      <ArrowRight className="w-3 h-3 text-[#9CA3AF]" />
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
