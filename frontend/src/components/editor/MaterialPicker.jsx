import CloseIcon from '@mui/icons-material/Close';
import MaterialTypeIcon from '../common/MaterialTypeIcon';

const materialTypes = [
  { type: 'diary', title: '일기', description: '작성한 일기를 소재로 가져옵니다.' },
  { type: 'memo', title: '메모', description: '짧은 메모와 아이디어를 가져옵니다.' },
  { type: 'image', title: '이미지', description: '보관한 참고 이미지를 선택합니다.' },
  { type: 'file', title: '파일', description: '문서와 외부 파일을 선택합니다.' },
];

export default function MaterialPicker({ onSelect, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="material-picker" role="dialog" aria-modal="true" aria-labelledby="material-picker-title">
        <header><div><h2 id="material-picker-title">소재에서 가져오기</h2><p>글에 활용할 소재 유형을 선택하세요.</p></div><button className="icon-button" type="button" onClick={onClose} aria-label="닫기"><CloseIcon /></button></header>
        <div className="material-picker__grid">
          {materialTypes.map((item) => (
            <button key={item.type} type="button" onClick={() => onSelect(item)}>
              <MaterialTypeIcon type={item.type} size="large" /><span><strong>{item.title}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
