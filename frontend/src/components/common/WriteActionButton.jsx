import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useNavigate } from 'react-router-dom';

/**
 * 글 작성 진입점을 여러 화면에서 같은 디자인으로 보여주는 공용 버튼입니다.
 * 글 작성 페이지가 다시 구현되면 onClick에 라우팅 함수를 전달합니다.
 */
export default function WriteActionButton({ onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate('/write');
  };

  return (
    <button className="write-action-button" type="button" onClick={handleClick}>
      <EditOutlinedIcon aria-hidden="true" />
      <span>글 작성</span>
    </button>
  );
}
