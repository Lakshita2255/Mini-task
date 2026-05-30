import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import StatsBar from './components/StatsBar.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskCard from './components/TaskCard.jsx';
import TaskFormModal from './components/TaskFormModal.jsx';
import DeleteConfirmDialog from './components/DeleteConfirmDialog.jsx';
import EmptyState from './components/EmptyState.jsx';

const API_BASE = '/api/tasks';
const priorityOrder = { high: 0, medium: 1, low: 2 };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        console.error('Failed to load tasks', response.statusText);
        setTasks([]);
        return;
      }
      const data = await response.text();
      const parsed = data ? JSON.parse(data) : [];
      setTasks(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error('Failed to load tasks', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleSubmit = async (taskData) => {
    setIsSubmitting(true);
    try {
      const url = editingTask ? `${API_BASE}/${editingTask.id}` : API_BASE;
      const method = editingTask ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      await fetchTasks();
      setFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await fetch(`${API_BASE}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus }),
      });
      await fetchTasks();
    } catch (error) {
      console.error('Status change failed', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_BASE}/${deletingTask.id}`, { method: 'DELETE' });
      await fetchTasks();
      setDeletingTask(null);
    } catch (error) {
      console.error('Delete failed', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = useMemo(() => {
    let filtered = [...safeTasks];
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter((task) =>
        (task.title || '').toLowerCase().includes(query) || (task.description || '').toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (sortBy === 'priority') return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      return 0;
    });
    return filtered;
  }, [safeTasks, search, statusFilter, priorityFilter, sortBy]);

  const hasFilters = search.trim() || statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Mini Task Dashboard</p>
          <h1>Modern task tracking in one place.</h1>
          <p className="hero-copy">Create, manage, and organize tasks with status, due dates, priority, and filtering.</p>
        </div>
        <button className="primary-button header-button" onClick={handleCreate}>
          <Plus size={18} /> New Task
        </button>
      </header>

      <main className="content-grid">
        <StatsBar tasks={safeTasks} />
        <TaskFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading tasks...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onCreate={handleCreate} />
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={setDeletingTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      <TaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editingTask}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <DeleteConfirmDialog
        open={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        taskTitle={deletingTask?.title}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
