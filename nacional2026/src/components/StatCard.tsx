import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatMoney } from '../api';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  accent?: 'gold' | 'green' | 'blue' | 'forest';
}

const accents = {
  gold: 'from-nacional-gold/20 to-white border-nacional-gold/40',
  green: 'from-nacional-100 to-white border-nacional-200',
  blue: 'from-blue-50 to-white border-blue-100',
  forest: 'from-nacional-800/10 to-white border-nacional-300',
};

const dots = {
  gold: 'bg-nacional-gold',
  green: 'bg-nacional-600',
  blue: 'bg-blue-400',
  forest: 'bg-nacional-800',
};

export default function StatCard({ title, value, trend, trendLabel = 'vs. mês anterior', accent = 'gold' }: StatCardProps) {
  const displayValue = typeof value === 'number' ? formatMoney(value) : value;
  const positive = trend !== undefined && trend >= 0;

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 shadow-card ${accents[accent]}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-nacional-700">{title}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${dots[accent]}`} />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-nacional-900">{displayValue}</p>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5 text-nacional-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          )}
          <span className={positive ? 'font-medium text-nacional-600' : 'font-medium text-red-500'}>
            {positive ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="text-gray-400">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
