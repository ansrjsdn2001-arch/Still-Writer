import stillWriterLogo from '../../../logo/logo-transparent.png';

export default function BrandLogo({ compact = false }) {
  return (
    <div className={`brand-logo${compact ? ' brand-logo--compact' : ''}`} aria-label="Still Writer">
      <img
        className="brand-logo__image"
        src={stillWriterLogo}
        alt="Still Writer"
      />
    </div>
  );
}
