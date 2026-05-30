import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import { Circle, ArrowRightCircle, CheckCircle2, Pencil, Trash2, Flag, CalendarDays, Sparkles } from 'lucide-react';

const statusStyles = {
  todo: { label: 'To Do', color: '#f59e0b', bg: '#fde68a33' },
  in_progress: { label: 'In Progress', color: '#38bdf8', bg: '#bae6fd33' },
  completed: { label: 'Completed', color: '#22c55e', bg: '#bbf7d033' },
};

const priorityStyles = {
  high: { label: 'High', color: '#f97316' },
  medium: { label: 'Medium', color: '#8b5cf6' },
  low: { label: 'Low', color: '#22c55e' },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const status = statusStyles[task.status] ?? statusStyles.todo;
  const priority = priorityStyles[task.priority] ?? priorityStyles.medium;
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate ? isPast(dueDate) && task.status !== 'completed' : false;
  const isTodayDue = dueDate ? isToday(dueDate) && task.status !== 'completed' : false;
  const nextStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'todo';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glow-card task-card"
    >
      <div className="task-card-top">
        <div>
          <h3>{task.title}</h3>
          <p>{task.description || 'No description provided.'}</p>
        </div>
        <button className="soft-button" onClick={() => onStatusChange(task, nextStatus)}>
          <ArrowRightCircle size={18} />
          {nextStatus.replace('_', ' ').toUpperCase()}
        </button>
      </div>
      <div className="task-card-meta">
        <span className="status-pill" style={{ color: status.color, background: status.bg }}>
          <Circle size={10} /> {status.label}
        </span>
        <span className="badge" style={{ border: `1px solid ${priority.color}`, color: priority.color }}>
          <Flag size={14} /> {priority.label}
        </span>
        {dueDate && (
          <span className="badge" style={{ border: `1px solid ${isOverdue ? '#ef4444' : '#38bdf8'}`, color: isOverdue ? '#ef4444' : '#38bdf8' }}>
            <CalendarDays size={14} /> {format(dueDate, 'MMM d, yyyy')}
            {isOverdue ? ' • Overdue' : isTodayDue ? ' • Today' : ''}
          </span>
        )}
      </div>
      <div className="task-card-actions">
        <button className="icon-button" onClick={() => onEdit(task)}>
          <Pencil size={16} /> Edit
        </button>
        <button className="icon-button danger" onClick={() => onDelete(task)}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
      <div className="task-card-footer">
        <span>{task.created_at ? `Created ${format(new Date(task.created_at), 'MMM d, yyyy')}` : ''}</span>
        <span>
          <Sparkles size={14} /> Smooth task tracking
        </span>
      </div>
    </motion.div>
  );
}
