// 📁 frontend/src/components/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: 'PENDING' | 'COMPLETED' | 'PREPARING' | 'READY';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'PENDING') {
    return (
      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-sm animate-pulse">
        Active (Pending)
      </span>
    );
  }

  return (
    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
      Completed (Done)
    </span>
  );
};