import React, { useRef, useCallback } from 'react';
import { generateId } from '../../context/KanbanContext';
import './AttachmentUI.css';

const MAX_FILES = 10;
const MAX_NAME_LENGTH = 80;

/**
 * AttachmentUI — file attachment list UI (no real upload; stores name + size).
 *
 * Props:
 *   attachments {Array<{id, name, size, addedAt}>}
 *   onChange    {(attachments) => void}
 */
function AttachmentUI({ attachments = [], onChange }) {
  const inputRef = useRef(null);

  const handleFileInput = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const canAdd = MAX_FILES - attachments.length;
      const toAdd = files.slice(0, canAdd).map((f) => ({
        id:      generateId('att'),
        name:    f.name.slice(0, MAX_NAME_LENGTH),
        size:    f.size,
        addedAt: new Date().toISOString(),
      }));

      onChange([...attachments, ...toAdd]);
      // Reset input so same file can be re-added after removal
      e.target.value = '';
    },
    [attachments, onChange]
  );

  const handleRemove = useCallback(
    (id) => {
      onChange(attachments.filter((a) => a.id !== id));
    },
    [attachments, onChange]
  );

  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄', doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊', csv: '📊',
      png: '🖼', jpg: '🖼', jpeg: '🖼', gif: '🖼', svg: '🖼', webp: '🖼',
      zip: '📦', rar: '📦', '7z': '📦',
      mp4: '🎬', mov: '🎬', avi: '🎬',
      mp3: '🎵', wav: '🎵',
      js: '💻', ts: '💻', jsx: '💻', tsx: '💻',
      html: '🌐', css: '🎨',
    };
    return icons[ext] || '📎';
  }

  return (
    <div className="attachment-ui">
      {/* Existing attachments */}
      {attachments.length > 0 && (
        <ul className="attachment-ui__list" aria-label="Attachments">
          {attachments.map((a) => (
            <li key={a.id} className="attachment-item">
              <span className="attachment-item__icon" aria-hidden="true">
                {fileIcon(a.name)}
              </span>
              <div className="attachment-item__info">
                <span className="attachment-item__name" title={a.name}>
                  {a.name}
                </span>
                {a.size > 0 && (
                  <span className="attachment-item__size">{formatSize(a.size)}</span>
                )}
              </div>
              <button
                type="button"
                className="attachment-item__remove"
                onClick={() => handleRemove(a.id)}
                aria-label={`Remove attachment ${a.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add button */}
      {attachments.length < MAX_FILES && (
        <div className="attachment-ui__add">
          <button
            type="button"
            className="attachment-ui__add-btn"
            onClick={() => inputRef.current?.click()}
            aria-label="Attach files"
          >
            <span aria-hidden="true">📎</span>
            Attach file{attachments.length > 0 ? ' another' : ''}
          </button>
          <input
            ref={inputRef}
            type="file"
            className="attachment-ui__file-input"
            multiple
            onChange={handleFileInput}
            aria-hidden="true"
            tabIndex={-1}
          />
          <span className="attachment-ui__hint">
            {attachments.length}/{MAX_FILES} files attached
          </span>
        </div>
      )}
    </div>
  );
}

export default AttachmentUI;
