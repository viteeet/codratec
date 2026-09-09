type LogoVariant = 'mark' | 'wordmark';

type Props = {
  variant?: LogoVariant;
  className?: string;
  title?: string;
};

export function CodratecLogo({
  variant = 'wordmark',
  className = '',
  title = 'CODRATEC',
}: Props) {
  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 80 80"
        className={className}
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <ApertureC />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 428 80"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <ApertureC />
      <g transform="translate(86 16)" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8 0H28L36 8V40L28 48H8L0 40V8L8 0ZM12 10H24L28 14V34L24 38H12L8 34V14L12 10Z"
        />
        <path
          fillRule="evenodd"
          d="M42 0H68L78 10V38L68 48H42V0ZM54 10H66L70 14V34L66 38H54V10Z"
        />
        <path
          fillRule="evenodd"
          d="M86 0H112L122 10V22L114 30H98L122 48H108L90 32H86V0ZM98 10H110L114 14V22L110 26H98V10Z"
        />
        <path
          fillRule="evenodd"
          d="M146 0H162L182 48H168L164 36H144L140 48H126L146 0ZM147 26H161L154 10L147 26Z"
        />
        <path d="M188 0H224V10H212V48H200V10H188V0Z" />
        <path d="M232 0H266V10H244V19H262V29H244V38H266V48H232V0Z" />
        <path d="M308 10L298 0H280L270 10V38L280 48H298L308 38V30H296V38H284V10H296V18H308V10Z" />
      </g>
    </svg>
  );
}

function ApertureC() {
  return (
    <g fill="currentColor">
      <path d="M70.53 59.08 L59.17 70.47 L50.92 57.35 L57.38 50.86 Z" />
      <path d="M56.89 71.79 L41.36 75.97 L40.77 60.49 L49.62 58.10 Z" />
      <path d="M38.72 75.98 L23.18 71.83 L30.42 58.12 L39.27 60.49 Z" />
      <path d="M20.89 70.51 L9.51 59.14 L22.64 50.90 L29.12 57.37 Z" />
      <path d="M8.19 56.86 L4.02 41.32 L19.51 40.75 L21.89 49.60 Z" />
      <path d="M4.02 38.68 L8.19 23.14 L21.89 30.40 L19.51 39.25 Z" />
      <path d="M9.51 20.86 L20.89 9.49 L29.12 22.63 L22.64 29.10 Z" />
      <path d="M23.18 8.17 L38.72 4.02 L39.27 19.51 L30.42 21.88 Z" />
      <path d="M41.36 4.03 L56.89 8.21 L49.62 21.90 L40.77 19.51 Z" />
      <path d="M59.17 9.53 L70.53 20.92 L57.38 29.14 L50.92 22.65 Z" />
    </g>
  );
}
