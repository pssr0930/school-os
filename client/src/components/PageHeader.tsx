import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#F3F4F6] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2.5">{action}</div>}
    </div>
  );
};

export default PageHeader;
