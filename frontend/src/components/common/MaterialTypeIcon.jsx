import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

const TYPE_CONFIG = {
  diary: { label: '일기', Icon: CalendarMonthOutlinedIcon },
  memo: { label: '메모', Icon: DescriptionOutlinedIcon },
  image: { label: '이미지', Icon: ImageOutlinedIcon },
  file: { label: '파일', Icon: InsertDriveFileOutlinedIcon },
};

export default function MaterialTypeIcon({ type, size = 'medium', showLabel = false }) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.file;
  const Icon = config.Icon;

  return (
    <span className={`material-type material-type--${type} material-type--${size}`}>
      <span className="material-type__icon"><Icon /></span>
      {showLabel && <span className="material-type__label">{config.label}</span>}
    </span>
  );
}
