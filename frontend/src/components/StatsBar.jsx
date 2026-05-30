import { motion } from 'framer-motion';
import { ListChecks, Clock3, Loader2, CheckCircle2 } from 'lucide-react';

const stats = [
  { key: 'total', label: 'Total Tasks', icon: ListChecks, accent: '#8b5cf6' },
  { key: 'todo', label: 'To Do', icon: Clock3, accent: '#f97316' },
  { key: 'in_progress', label: 'In Progress', icon: Loader2, accent: '#38bdf8' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, accent: '#22c55e' },
];

export default function StatsBar({ tasks }) {
  const counts = {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === 'todo').length,
    in_progress: tasks.filter((task) => task.status === 'in_progress').length,
    completed: tasks.filter((task) => task.status === 'completed').length,
  };

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glow-card"
            style={{ borderColor: `${stat.accent}33` }}
          >
            <div className="stat-card-header">
              <span className="badge" style={{ background: `${stat.accent}1a`, color: stat.accent }}>
                <Icon size={18} />
                {stat.label}
              </span>
              <div className="stat-value" style={{ color: stat.accent }}>
                {counts[stat.key]}
              </div>
            </div>
            <p className="stat-text">A clean view of your task progress.</p>
          </motion.div>
        );
      })}
    </div>
  );
}
