import type { Category } from '../data/schema';

interface Props {
  category: Category;
  size?: number;
}

/** Small stroke-icons for the CATEGORY segmented control + row meta. */
export function CategoryIcon({ category, size = 14 }: Props) {
  const stroke = 'currentColor';
  const sw = 1.5;
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (category === 'laptops') {
    return (
      <svg {...props}>
        <rect x="3" y="4" width="14" height="9" rx="1" />
        <path d="M1.5 15.5h17" />
      </svg>
    );
  }
  if (category === 'tablets') {
    return (
      <svg {...props}>
        <rect x="4" y="2.5" width="12" height="15" rx="1.5" />
        <path d="M9 15h2" />
      </svg>
    );
  }
  // phones
  return (
    <svg {...props}>
      <rect x="5.5" y="2" width="9" height="16" rx="1.5" />
      <path d="M8.5 15.5h3" />
    </svg>
  );
}
