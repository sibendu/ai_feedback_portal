type IconProps = {
  className?: string;
};

export function MenuIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24">
      <path d="m4 11 8-7 8 7" />
      <path d="M6.5 10.5V20h11v-9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function FeedbackIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 5h14v10H8l-3 3V5Z" />
      <path d="M9 9h6M9 12h4" />
    </svg>
  );
}

export function ConfigureIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
      <path d="m19 12 2-1.2-2-3.5-2.3 1a7.7 7.7 0 0 0-1.7-1L14.7 5h-5.4L9 7.3a7.7 7.7 0 0 0-1.7 1L5 7.3l-2 3.5L5 12l-2 1.2 2 3.5 2.3-1a7.7 7.7 0 0 0 1.7 1l.3 2.3h5.4l.3-2.3a7.7 7.7 0 0 0 1.7-1l2.3 1 2-3.5L19 12Z" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
      <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 15.2A8 8 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M14 7V5H5v14h9v-2" />
      <path d="M10 12h10M16 8l4 4-4 4" />
    </svg>
  );
}
