import React, { useState, useRef, useCallback } from 'react';
import { LABEL_COLORS, generateId } from '../../context/KanbanContext';
import './LabelManager.css';

/**
 * LabelManager — inline label creator and picker used inside TaskForm.
 *
 * Props:
 *   labels   {Array<{id, text, colorId}>} — current labels on the task
 *   onChange {(labels) => void}            — called whenever labels change
 */
function LabelManager({ labels = [], onChange }) {
  const [inputText, setInputText] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[4].id); // blue default
  const inputRef = useRef(null);

  const addLabel = useCallback(
    (e) => {
      e.preventDefault();
      const text = inputText.trim();
      if (!text) return;
      // Don't allow duplicate label text (case-insensitive) on same task
      if (labels.some((l) => l.text.toLowerCase() === text.toLowerCase())) {
        setInputText('');
        return;
      }
      const newLabel = {
        id:      generateId('label'),
        text,
        colorId: selectedColor,
      };
      onChange([...labels, newLabel]);
      setInputText('');
    },
    [inputText, selectedColor, labels, onChange]
  );

  const removeLabel = useCallback(
    (labelId) => {
      onChange(labels.filter((l) => l.id !== labelId));
    },
    [labels, onChange]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addLabel(e);
    if (e.key === 'Backspace' && !inputText && labels.length > 0) {
      removeLabel(labels[labels.length - 1].id);
    }
  };

  const getColor = (colorId) =>
    LABEL_COLORS.find((c) => c.id === colorId) || LABEL_COLORS[4];

  return (
    <div className="label-manager">
      {/* Existing labels */}
      {labels.length > 0 && (
        <div className="label-manager__tags" aria-label="Labels">
          {labels.map((label) => {
            const col = getColor(label.colorId);
            return (
              <span
                key={label.id}
                className="label-tag"
                style={{ background: col.bg, color: col.hex, borderColor: col.hex }}
              >
                {label.text}
                <button
                  type="button"
                  className="label-tag__remove"
                  onClick={() => removeLabel(label.id)}
                  aria-label={`Remove label ${label.text}`}
                  style={{ color: col.hex }}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Add new label row */}
      <div className="label-manager__add-row">
        {/* Color picker swatches */}
        <div className="label-manager__swatches" role="group" aria-label="Label color">
          {LABEL_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`label-swatch ${selectedColor === c.id ? 'label-swatch--selected' : ''}`}
              style={{ background: c.hex }}
              onClick={() => setSelectedColor(c.id)}
              aria-label={`${c.name} color`}
              aria-pressed={selectedColor === c.id}
              title={c.name}
            />
          ))}
        </div>

        {/* Text input */}
        <div className="label-manager__input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="label-manager__input"
            placeholder="Add label…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={30}
            aria-label="New label text"
          />
          <button
            type="button"
            className="label-manager__add-btn"
            onClick={addLabel}
            disabled={!inputText.trim()}
            aria-label="Add label"
          >
            ＋
          </button>
        </div>
      </div>

      <p className="label-manager__hint">
        Press Enter or ＋ to add. Backspace to remove the last.
      </p>
    </div>
  );
}

export default LabelManager;
