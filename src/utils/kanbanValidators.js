/**
 * Validate the task create/edit form.
 *
 * @param {object} values - { title, description, priority, dueDate, assignee, labels, attachments }
 * @returns {object} errors — empty object means all fields are valid
 */
export function validateTaskForm(values) {
  const errors = {};

  // Title
  const title = (values.title || '').trim();
  if (!title) {
    errors.title = 'Task title is required';
  } else if (title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (title.length > 100) {
    errors.title = 'Title must be 100 characters or fewer';
  }

  // Description
  const description = (values.description || '').trim();
  if (description.length > 500) {
    errors.description = 'Description must be 500 characters or fewer';
  }

  // Assignee
  const assignee = (values.assignee || '').trim();
  if (assignee.length > 50) {
    errors.assignee = 'Assignee name must be 50 characters or fewer';
  }

  // Due date
  if (values.dueDate) {
    const date = new Date(values.dueDate);
    if (isNaN(date.getTime())) {
      errors.dueDate = 'Enter a valid date';
    }
  }

  // Labels — max 10 per task
  if (Array.isArray(values.labels) && values.labels.length > 10) {
    errors.labels = 'You can add up to 10 labels per task';
  }

  return errors;
}

/**
 * Validate a workspace form (used in Phase 2).
 *
 * @param {object} values - { name, description }
 * @returns {object} errors
 */
export function validateWorkspaceForm(values) {
  const errors = {};

  const name = (values.name || '').trim();
  if (!name) {
    errors.name = 'Workspace name is required';
  } else if (name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  } else if (name.length > 50) {
    errors.name = 'Name must be 50 characters or fewer';
  }

  const description = (values.description || '').trim();
  if (description.length > 200) {
    errors.description = 'Description must be 200 characters or fewer';
  }

  return errors;
}

/**
 * Validate an invite code (Phase 2 join workspace).
 *
 * @param {string} code
 * @returns {object} errors
 */
export function validateInviteCode(code) {
  const errors = {};
  const INVITE_CODE_RE = /^[A-Z0-9]{8}$/i;

  if (!(code || '').trim()) {
    errors.inviteCode = 'Invite code is required';
  } else if (!INVITE_CODE_RE.test((code || '').trim())) {
    errors.inviteCode = 'Invite code must be 8 letters or numbers (e.g. AB12CD34)';
  }

  return errors;
}
