export default function BigButton({ variant = 'primary', tall = false, className = '', children, ...rest }) {
  const classes = ['btn', `btn--${variant}`, tall ? 'btn--tall' : '', className].filter(Boolean).join(' ');
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
