function LocaleFlag({ locale }) {
  const commonProps = {
    'aria-hidden': true,
    className: 'settings-language-flag',
    focusable: 'false',
    viewBox: '0 0 24 16',
  };

  switch (locale) {
    case 'fr':
      return (
        <svg {...commonProps}>
          <rect width="8" height="16" fill="#0055a4" />
          <rect x="8" width="8" height="16" fill="#ffffff" />
          <rect x="16" width="8" height="16" fill="#ef4135" />
        </svg>
      );
    case 'de':
      return (
        <svg {...commonProps}>
          <rect width="24" height="5.33" fill="#000000" />
          <rect y="5.33" width="24" height="5.34" fill="#dd0000" />
          <rect y="10.67" width="24" height="5.33" fill="#ffcc00" />
        </svg>
      );
    case 'it':
      return (
        <svg {...commonProps}>
          <rect width="8" height="16" fill="#009246" />
          <rect x="8" width="8" height="16" fill="#ffffff" />
          <rect x="16" width="8" height="16" fill="#ce2b37" />
        </svg>
      );
    case 'tr':
      return (
        <svg {...commonProps}>
          <rect width="24" height="16" fill="#e30a17" />
          <circle cx="9" cy="8" r="4.25" fill="#ffffff" />
          <circle cx="10.25" cy="8" r="3.4" fill="#e30a17" />
          <path
            d="m14 5.7.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"
            fill="#ffffff"
          />
        </svg>
      );
    case 'es':
      return (
        <svg {...commonProps}>
          <rect width="24" height="16" fill="#aa151b" />
          <rect y="4" width="24" height="8" fill="#f1bf00" />
        </svg>
      );
    case 'pt':
      return (
        <svg {...commonProps}>
          <rect width="9.5" height="16" fill="#046a38" />
          <rect x="9.5" width="14.5" height="16" fill="#da291c" />
          <circle cx="9.5" cy="8" r="2.75" fill="#ffcc00" />
          <circle cx="9.5" cy="8" r="1.75" fill="#ffffff" />
          <path d="M8.25 7.2h2.5v1.8h-2.5z" fill="#046a38" />
        </svg>
      );
    case 'ru':
      return (
        <svg {...commonProps}>
          <rect width="24" height="16" fill="#ffffff" />
          <rect y="5.33" width="24" height="5.34" fill="#0039a6" />
          <rect y="10.67" width="24" height="5.33" fill="#d52b1e" />
        </svg>
      );
    case 'ar':
      return (
        <svg {...commonProps}>
          <rect width="24" height="5.33" fill="#00732f" />
          <rect y="5.33" width="24" height="5.34" fill="#ffffff" />
          <rect y="10.67" width="24" height="5.33" fill="#000000" />
          <rect width="6" height="16" fill="#ef3340" />
        </svg>
      );
    case 'hi':
      return (
        <svg {...commonProps}>
          <rect width="24" height="5.33" fill="#ff9933" />
          <rect y="5.33" width="24" height="5.34" fill="#ffffff" />
          <rect y="10.67" width="24" height="5.33" fill="#138808" />
          <circle cx="12" cy="8" r="1.7" fill="none" stroke="#000080" strokeWidth="0.7" />
          <circle cx="12" cy="8" r="0.35" fill="#000080" />
        </svg>
      );
    case 'bn':
      return (
        <svg {...commonProps}>
          <rect width="24" height="16" fill="#006a4e" />
          <circle cx="10.5" cy="8" r="4" fill="#f42a41" />
        </svg>
      );
    case 'zh':
      return (
        <svg {...commonProps}>
          <rect width="24" height="16" fill="#de2910" />
          <path
            d="m4.2 2 .7 1.5 1.7.2-1.3 1.1.4 1.7-1.5-.9-1.5.9.4-1.7-1.3-1.1 1.7-.2z"
            fill="#ffde00"
          />
        </svg>
      );
    case 'ja':
      return (
        <svg {...commonProps}>
          <rect width="24" height="16" fill="#ffffff" />
          <circle cx="12" cy="8" r="4" fill="#bc002d" />
        </svg>
      );
    case 'en':
    default:
      return (
        <svg {...commonProps}>
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0 24 16M24 0 0 16" stroke="#ffffff" strokeWidth="3.2" />
          <path d="M0 0 24 16M24 0 0 16" stroke="#c8102e" strokeWidth="1.25" />
          <path d="M12 0v16M0 8h24" stroke="#ffffff" strokeWidth="5" />
          <path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="2.6" />
        </svg>
      );
  }
}

export default LocaleFlag;
