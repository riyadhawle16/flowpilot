import React, { useState, useEffect, useRef } from 'react';
import { COLUMNS, PRIORITIES } from '../../context/KanbanContext';
import { validateTaskForm } from '../../utils/kanbanValidators';
import LabelManager from '../LabelManager';
import AttachmentUI from '../AttachmentUI';
import './TaskForm.css';

/**
 * TaskForm — Phase 4 enhanced modal.
 * Adds Labels and Attachments sections on top of Phase 3 fields.
 *
 * Props:
 *   mode          {'create'|'edit'}
 *   task          {object|null}
 *   defaultColumn {string}
 *   onClose       {() => void}
 *   onSubmit      {async (formData) => void}
 *   isSubmitting  {boolean}
 */
function TaskForm({ mode, task, defaultColumn, onClose, onSubmit, isSubmitting }) {
  const isEdit = mode === 'edit';
  const firstInputRef = useRef(null);

  const [values, setValues] = useState({
    title:       isEdit ? task?.title       || '' : '',
    description: isEdit ? task?.description || '' : '',
    priority:    isEdit ? task?.priority    || 'Medium' : 'Medium',
    dueDate:     isEdit ? task?.dueDate     || '' : '',
    assignee:    isEdit ? task?.assignee    || '' : '',
    column:      isEdit ? task?.column      || defaultColumn : defaultColumn || 'Todo',
    labels:      isEdit ? task?.labels      || [] : [],
    attachments: isEdit ? task?.attachments || [] : [],
  });

  const [errors, setErrors]         = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => { firstInputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleLabelsChange = (labels) => {
    setValues((prev) => ({ ...prev, labels }));
  };

  const handleAttachmentsChange = (attachments) => {
    setValues((prev) => ({ ...prev, attachments }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const validationErrors = validateTaskForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const formTitle = isEdit ? 'Edit Task' : 'New Task';

  return (
    <div
      className="task-form-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={formTitle}
    >
      <div className="task-form">
        {/* Header */}
        <div className="task-form__header">
          <h2 className="task-form__title">{formTitle}</h2>
          <button
            className="task-form__close"
            onClick={onClose}
            aria-label="Close form"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* API error */}
        {submitError && (
          <div className="task-form__error-banner" role="alert">
            {submitError}
          </div>
        )}

        <form className="task-form__body" onSubmit={handleSubmit} noValidate>

          {/* ── Title ─────────────────────────────────────────────── */}
          <div className="task-form__field">
            <label htmlFor="tf-title" className="task-form__label">
              Title <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="tf-title"
              name="title"
              type="text"
              className={`task-form__input ${errors.title ? 'task-form__input--error' : ''}`}
              value={values.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              maxLength={100}
              aria-required="true"
              aria-describedby={errors.title ? 'tf-title-err' : undefined}
            />
            {errors.title && (
              <span id="tf-title-err" className="task-form__field-error" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          {/* ── Description ───────────────────────────────────────── */}
          <div className="task-form__field">
            <label htmlFor="tf-desc" className="task-form__label">Description</label>
            <textarea
              id="tf-desc"
              name="description"
              className={`task-form__textarea ${errors.description ? 'task-form__input--error' : ''}`}
              value={values.description}
              onChange={handleChange}
              placeholder="Add more details (optional)"
              maxLength={500}
              rows={3}
              aria-describedby={errors.description ? 'tf-desc-err' : undefined}
            />
            {errors.description && (
              <span id="tf-desc-err" className="task-form__field-error" role="alert">
                {errors.description}
              </span>
            )}
          </div>

          {/* ── Priority + Column ──────────────────────────────────── */}
          <div className="task-form__row">
            <div className="task-form__field">
              <label htmlFor="tf-priority" className="task-form__label">Priority</label>
              <select
                id="tf-priority"
                name="priority"
                className="task-form__select"
                value={values.priority}
                onChange={handleChange}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="task-form__field">
              <label htmlFor="tf-column" className="task-form__label">Column</label>
              <select
                id="tf-column"
                name="column"
                className="task-form__select"
                value={values.column}
                onChange={handleChange}
              >
                {COLUMNS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Due Date + Assignee ────────────────────────────────── */}
          <div className="task-form__row">
            <div className="task-form__field">
              <label htmlFor="tf-due" className="task-form__label">Due Date</label>
              <input
                id="tf-due"
                name="dueDate"
                type="date"
                className={`task-form__input ${errors.dueDate ? 'task-form__input--error' : ''}`}
                value={values.dueDate}
                onChange={handleChange}
                aria-describedby={errors.dueDate ? 'tf-due-err' : undefined}
              />
              {errors.dueDate && (
                <span id="tf-due-err" className="task-form__field-error" role="alert">
                  {errors.dueDate}
                </span>
              )}
            </div>
            <div className="task-form__field">
              <label htmlFor="tf-assignee" className="task-form__label">Assignee</label>
              <input
                id="tf-assignee"
                name="assignee"
                type="text"
                className={`task-form__input ${errors.assignee ? 'task-form__input--error' : ''}`}
                value={values.assignee}
                onChange={handleChange}
                placeholder="Name or @username"
                maxLength={50}
                aria-describedby={errors.assignee ? 'tf-assignee-err' : undefined}
              />
              {errors.assignee && (
                <span id="tf-assignee-err" className="task-form__field-error" role="alert">
                  {errors.assignee}
                </span>
              )}
            </div>
          </div>

          {/* ── Labels ────────────────────────────────────────────── */}
          <div className="task-form__field">
            <span className="task-form__label" id="tf-labels-label">Labels</span>
            <LabelManager
              labels={values.labels}
              onChange={handleLabelsChange}
              aria-labelledby="tf-labels-label"
            />
          </div>

          {/* ── Attachments ───────────────────────────────────────── */}
          <div className="task-form__field">
            <span className="task-form__label" id="tf-att-label">Attachments</span>
            <AttachmentUI
              attachments={values.attachments}
              onChange={handleAttachmentsChange}
              aria-labelledby="tf-att-label"
            />
          </div>

          {/* ── Actions ───────────────────────────────────────────── */}
          <div className="task-form__actions">
            <button
              type="button"
              className="task-form__btn task-form__btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="task-form__btn task-form__btn--submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="task-form__spinner" aria-hidden="true" />
              ) : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
