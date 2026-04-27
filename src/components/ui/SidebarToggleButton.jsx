import BaseButton from './BaseButton.jsx';

export default function SidebarToggleButton({
  collapsed,
  onClick,
  expandedLabel,
  collapsedLabel,
}) {
  const label = collapsed ? collapsedLabel : expandedLabel;

  return (
    <BaseButton
      className="card-sidebar-toggle"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={collapsed}
    >
      <span className="card-sidebar-toggle__chev" aria-hidden>
        {collapsed ? '›' : '‹'}
      </span>
    </BaseButton>
  );
}
