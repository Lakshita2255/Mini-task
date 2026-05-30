import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import StatsBar from './components/StatsBar.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskCard from './components/TaskCard.jsx';
import TaskFormModal from './components/TaskFormModal.jsx';
import DeleteConfirmDialog from './components/DeleteConfirmDialog.jsx';
import EmptyState from './components/EmptyState.jsx';
import AuthPage from './components/AuthPage.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/tasks';
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE || 'http://localhost:5000/api/auth';
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
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_BASE, { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
      if (!response.ok) {
        console.error('Failed to load tasks', response.statusText);
        setTasks([]);
        return;
      }
      const data = await response.text();
      const parsed = data ? JSON.parse(data) : [];
      const normalized = Array.isArray(parsed)
        ? parsed.map((t) => ({ ...t, id: t.id || t._id }))
        : [];
      setTasks(normalized);
    } catch (error) {
      console.error('Failed to load tasks', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      setLoading(true);
      fetchTasks();
    } else {
      setLoading(false);
      setTasks([]);
    }
  }, [authToken]);

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
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
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
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
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
      await fetch(`${API_BASE}/${deletingTask.id}`, { method: 'DELETE', headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
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

  const handleRegister = async (email, password) => {
    setIsAuthLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Register failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setIsAuthLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken('');
    setUser(null);
    setTasks([]);
  };

  const hasFilters = search.trim() || statusFilter !== 'all' || priorityFilter !== 'all';

  if (!authToken) {
    return (
      <div className="auth-fullpage">
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} loading={isAuthLoading} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Mini Task Dashboard</p>
          <h1>Modern task tracking in one place.</h1>
          <p className="hero-copy">Create, manage, and organize tasks with status, due dates, priority, and filtering.</p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <p className="eyebrow">Signed in as</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{user?.name || user?.email || 'Task User'}</p>
          </div>
          <button className="secondary-button" onClick={handleLogout}>Logout</button>
          <button className="primary-button header-button" onClick={handleCreate}>
            <Plus size={18} /> New Task
          </button>
        </div>
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
