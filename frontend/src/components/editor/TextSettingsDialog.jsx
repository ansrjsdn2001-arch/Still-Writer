import CloseIcon from '@mui/icons-material/Close';

const choices = {
  fontSize: [['small', '작게'], ['medium', '보통'], ['large', '크게']],
  lineHeight: [['tight', '좁게'], ['normal', '보통'], ['wide', '넓게']],
  paragraphGap: [['tight', '좁게'], ['normal', '보통'], ['wide', '넓게']],
};

export default function TextSettingsDialog({ settings, onChange, onReset, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="text-settings-title">
        <header><h2 id="text-settings-title">본문 설정</h2><button className="icon-button" type="button" onClick={onClose} aria-label="닫기"><CloseIcon /></button></header>
        {Object.entries(choices).map(([key, values]) => (
          <div className="setting-row" key={key}>
            <span>{key === 'fontSize' ? '글자 크기' : key === 'lineHeight' ? '줄 간격' : '문단 간격'}</span>
            <div className="segmented-control">
              {values.map(([value, label]) => <button key={value} type="button" className={settings[key] === value ? 'is-active' : ''} onClick={() => onChange(key, value)}>{label}</button>)}
            </div>
          </div>
        ))}
        <footer><button className="secondary-button" type="button" onClick={onReset}>기본값으로</button><button className="primary-button" type="button" onClick={onClose}>적용</button></footer>
      </section>
    </div>
  );
}
