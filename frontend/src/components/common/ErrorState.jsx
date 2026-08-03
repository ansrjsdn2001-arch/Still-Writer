import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

/**
 * 여러 화면에서 재사용할 수 있는 공통 오류 안내 컴포넌트입니다.
 * 404, 네트워크 오류, 저장 실패처럼 사용자가 다음 행동을 선택해야 하는 상황에 사용합니다.
 */
export default function ErrorState({
  eyebrow = '오류',
  title,
  description,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  icon = <ErrorOutlineRoundedIcon />,
}) {
  return (
    <section className="error-state" aria-labelledby="error-state-title">
      <span className="error-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="error-state__eyebrow">{eyebrow}</p>
      <h1 id="error-state-title">{title}</h1>
      {description && <p className="error-state__description">{description}</p>}

      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="error-state__actions">
          {primaryActionLabel && (
            <button className="error-state__primary" type="button" onClick={onPrimaryAction}>
              <HomeRoundedIcon aria-hidden="true" />
              {primaryActionLabel}
            </button>
          )}
          {secondaryActionLabel && (
            <button className="error-state__secondary" type="button" onClick={onSecondaryAction}>
              <RefreshRoundedIcon aria-hidden="true" />
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
