import { useNavigate } from 'react-router-dom';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import ErrorState from '../components/common/ErrorState';
import '../styles/error.css';

export default function NotFoundPage({ currentUser }) {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <ErrorState
        eyebrow="404"
        title="요청하신 화면을 찾을 수 없습니다."
        description="주소가 잘못 입력되었거나, 아직 프론트엔드 라우트가 만들어지지 않은 화면입니다."
        primaryActionLabel={currentUser ? '홈으로 이동' : '로그인 화면으로 이동'}
        secondaryActionLabel="이전 화면으로 돌아가기"
        onPrimaryAction={() => navigate(currentUser ? '/' : '/login', { replace: true })}
        onSecondaryAction={() => navigate(-1)}
        icon={<TravelExploreRoundedIcon />}
      />
    </div>
  );
}
