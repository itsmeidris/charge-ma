import BaseButton from './BaseButton.jsx';

export default function LabeledSelectField({
  label,
  value,
  options,
  showCustomOption = false,
  customValue = '',
  onChange,
  actionActive = false,
  actionText = '📍',
  actionLabel = '',
  actionTitle = '',
  onActionClick,
}) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-with-pin">
        <select value={value} onChange={onChange} aria-label={label}>
          {showCustomOption && <option value={customValue}>{customValue}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <BaseButton
          className={`pin-btn${actionActive ? ' pin-btn--active' : ''}`}
          onClick={onActionClick}
          title={actionTitle || actionLabel}
          aria-label={actionLabel || actionTitle}
        >
          {actionText}
        </BaseButton>
      </div>
    </div>
  );
}
