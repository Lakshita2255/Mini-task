import { useEffect, useState } from 'react';
import { X, Save, PlusCircle } from 'lucide-react';

const defaultTask = { title: '', description: '', status: 'todo', priority: 'medium', due_date: '' };

export default function TaskFormModal({ open, onClose, task, onSubmit, isSubmitting, error }) {
  const [form, setForm] = useState(defaultTask);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      });
    } else {
      setForm(defaultTask);
    }
    setErrors({});
  }, [task, open]);

  if (!open) {
    return null;
  }

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Task title is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      due_date: form.due_date || null,
    });
  };

  return (
    <div className="dialog">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="dialog-panel scrollbar-glow">
        <div className="dialog-header">
          <div>
            <p className="eyebrow">Task Builder</p>
            <h2>{task ? 'Edit task details' : 'Create a new task'}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="dialog-form">
          <label>
            <span>Title</span>
            <input
              className="input-field"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Enter task title"
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </label>
          <label>
            <span>Description</span>
            <textarea
              className="input-field"
              rows="4"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Describe what needs to be done"
            />
          </label>
          <div className="grid-2">
            <label>
              <span>Status</span>
              <select className="input-field" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label>
              <span>Priority</span>
              <select className="input-field" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label>
            <span>Due Date</span>
            <input
              className="input-field"
              type="date"
              value={form.due_date}
              onChange={(event) => setForm({ ...form, due_date: event.target.value })}
            />
          </label>

          <div className="dialog-actions">
            {error && <span className="form-error">{error}</span>}
            <button type="button" className="soft-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              {task ? <Save size={16} /> : <PlusCircle size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
