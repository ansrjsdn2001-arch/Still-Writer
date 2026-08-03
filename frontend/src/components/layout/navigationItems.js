import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';

// 데스크탑 사이드바와 모바일 슬라이드 메뉴가 같은 정보 구조를 공유합니다.
export const primaryNavigationItems = [
  { id: 'home', label: '홈', Icon: HomeOutlinedIcon },
  { id: 'all', label: '모든 글', Icon: ViewListOutlinedIcon },
  { id: 'search', label: '검색', Icon: SearchRoundedIcon },
  { id: 'folders', label: '내 폴더', Icon: FolderOutlinedIcon },
  { id: 'materials', label: '소재 보관함', Icon: CollectionsBookmarkOutlinedIcon },
  { id: 'favorites', label: '즐겨찾기', Icon: StarBorderOutlinedIcon },
  { id: 'trash', label: '휴지통', Icon: DeleteOutlineOutlinedIcon },
];

export const settingsNavigationItem = {
  id: 'settings',
  label: '설정',
  Icon: SettingsOutlinedIcon,
};
