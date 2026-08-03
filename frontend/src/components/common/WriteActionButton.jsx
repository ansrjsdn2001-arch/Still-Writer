import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useNavigate } from 'react-router-dom';

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
