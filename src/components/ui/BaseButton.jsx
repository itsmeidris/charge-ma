export default function BaseButton({
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  return (
    <button type={type} className={className} {...rest}>
      {children}
    </button>
  );
}
