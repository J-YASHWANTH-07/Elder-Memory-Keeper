export default function PageHeader({ title, subtitle }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      {subtitle && <p className="header__sub">{subtitle}</p>}
    </header>
  );
}
