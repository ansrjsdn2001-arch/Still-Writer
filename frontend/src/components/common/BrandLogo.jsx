export default function BrandLogo({ compact = false }) {
  return (
    <div className={`brand-logo${compact ? ' brand-logo--compact' : ''}`} aria-label="Still Writer">
      <img
        className="brand-logo__image"
        src="/images/still-writer-logo.png"
        alt="Still Writer"
      />
    </div>
  );
}
