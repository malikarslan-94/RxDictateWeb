import { ICON_PATHS } from './iconPaths';
import type { IconName } from './iconPaths';

export type { IconName };

export type IconProps = {
  name: IconName;
  /** Size and colour as classes, e.g. "size-4 text-primary". */
  className?: string;
  /** Read out when the icon is the only thing saying what something is. */
  label?: string;
};

/** Outline icons on a 24×24 grid, the same set the mobile app draws. */
export function Icon({ name, className = 'size-5', label }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
