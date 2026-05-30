import { Search } from 'lucide-react';

export default function TaskFilters({ search, onSearchChange, statusFilter, onStatusFilterChange, priorityFilter, onPriorityFilterChange, sortBy, onSortChange }) {
  return (
    <div className="glow-card" style={{ padding: '22px' }}>
      <div className="filter-row">
        <label className="filter-input">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
          />
        </label>
        <select className="input-field" value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="input-field" value={priorityFilter} onChange={(event) => onPriorityFilterChange(event.target.value)}>
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="input-field" value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    </div>
  );
}
