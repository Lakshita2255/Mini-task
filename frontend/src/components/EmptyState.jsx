import { motion } from 'framer-motion';
import { ClipboardList, Plus } from 'lucide-react';

export default function EmptyState({ hasFilters, onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glow-card empty-state"
    >
      <div className="empty-icon">
        <ClipboardList size={40} />
      </div>
      <h3>{hasFilters ? 'No tasks match your filters' : 'No tasks created yet'}</h3>
      <p>{hasFilters ? 'Try a different search or reset the filters to see your tasks.' : 'Get started by adding your first task to make your dashboard come alive.'}</p>
      {!hasFilters && (
        <button className="primary-button" onClick={onCreate}>
          <Plus size={16} /> Create first task
        </button>
      )}
    </motion.div>
  );
}
