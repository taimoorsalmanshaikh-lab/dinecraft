import { Restaurant } from '../../types';

export const getStorefrontThemeStyle = (restaurant: Restaurant): React.CSSProperties => {
  const theme = restaurant.theme;

  const primary = restaurant.themeColor || theme?.primary || '#FF6900';
  const background = theme?.background || '#FFFFFF';
  const textColor = theme?.textColor || '#111827';
  const textMuted = '#64748B';

  const buttonStyle = theme?.buttonStyle || 'pill';

  let cardRadius = '28px';
  let tileRadius = '20px';
  let buttonRadius = '9999px';

  if (buttonStyle === 'square') {
    cardRadius = '8px';
    tileRadius = '6px';
    buttonRadius = '8px';
  } else if (buttonStyle === 'rounded') {
    cardRadius = '20px';
    tileRadius = '14px';
    buttonRadius = '14px';
  } else {
    // default: pill
    cardRadius = '28px';
    tileRadius = '20px';
    buttonRadius = '9999px';
  }

  // Soft surface page background (tint of background, like dashboard canvas #F3F4F6)
  const isDefaultWhiteBg = !theme?.background || theme.background.toLowerCase() === '#ffffff' || theme.background.toLowerCase() === '#fff';
  const surfaceBg = isDefaultWhiteBg ? '#F3F4F6' : background;

  return {
    '--brand': primary,
    '--brand-subtle': `${primary}18`,
    '--brand-soft': `${primary}12`,
    '--brand-contrast': '#FFFFFF',
    '--bg': background,
    '--text': textColor,
    '--text-muted': textMuted,
    '--radius': buttonRadius,
    '--font-heading': theme?.headingFont ? `'${theme.headingFont}', sans-serif` : "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
    '--font-body': theme?.bodyFont ? `'${theme.bodyFont}', sans-serif` : "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",

    // Storefront Bento tokens
    '--sf-card': '#FFFFFF',
    '--sf-surface': surfaceBg,
    '--sf-radius-card': cardRadius,
    '--sf-radius-tile': tileRadius,
    '--sf-shadow': '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.04)',
    '--sf-shadow-hover': '0 4px 6px rgba(16, 24, 40, 0.04), 0 12px 32px rgba(16, 24, 40, 0.08)',
  } as React.CSSProperties;
};
