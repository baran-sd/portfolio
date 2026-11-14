(function () {
  const body = document.body;
  const params = new URLSearchParams(window.location.search);
  const company = params.get('company');

  const themes = {
    surfshark: {
      dark: { bg: '#09090b', fg: '#fafafa', muted: '#a1a1b5', accent: '#8b9aff', accentRgb: '139,154,255', border: '#2c2d3b', cardBg: 'rgba(139,154,255,.05)', cardBorder: '#2c2d3b', btnText: '#09090b' },
      light: { bg: '#ffffff', fg: '#09090b', muted: '#55556b', accent: '#1b2ff5', accentRgb: '27,47,245', border: '#dcdde8', cardBg: 'rgba(27,47,245,.03)', cardBorder: '#dcdde8', btnText: '#ffffff' }
    },
    vinted: {
      dark: { bg: '#0a1614', fg: '#e8f5f0', muted: '#5a8a80', accent: '#007782', accentRgb: '0,119,130', border: '#1a3a35', cardBg: 'rgba(0,119,130,.06)', cardBorder: '#1a3a35', btnText: '#e8f5f0' },
      light: { bg: '#f0f7f5', fg: '#1a2a28', muted: '#526e67', accent: '#007782', accentRgb: '0,119,130', border: '#c0d8d0', cardBg: 'rgba(0,119,130,.04)', cardBorder: '#c0d8d0', btnText: '#ffffff' }
    },
    hostinger: {
      dark: { bg: '#0a0a18', fg: '#e8e5f5', muted: '#8a7ab0', accent: '#673DE6', accentRgb: '103,61,230', border: '#1a1a3a', cardBg: 'rgba(103,61,230,.06)', cardBorder: '#1a1a3a', btnText: '#e8e5f5' },
      light: { bg: '#f5f0ff', fg: '#1a1a2a', muted: '#705f91', accent: '#673DE6', accentRgb: '103,61,230', border: '#d0c0e8', cardBg: 'rgba(103,61,230,.04)', cardBorder: '#d0c0e8', btnText: '#ffffff' }
    },
    soro: {
      dark: { bg: '#0d0d12', fg: '#f0f0f5', muted: '#7a7a99', accent: '#5855FF', accentRgb: '88,85,255', border: '#1a1a2e', cardBg: 'rgba(88,85,255,.06)', cardBorder: '#1a1a2e', btnText: '#ffffff' },
      light: { bg: '#ffffff', fg: '#000000', muted: '#666666', accent: '#5855FF', accentRgb: '88,85,255', border: '#e0e0e5', cardBg: 'rgba(88,85,255,.04)', cardBorder: '#e0e0e5', btnText: '#ffffff' }
    }
  };

  const tokenMap = {
    bg: '--bg', fg: '--fg', muted: '--muted', accent: '--accent', accentRgb: '--accent-rgb',
    border: '--border', cardBg: '--card-bg', cardBorder: '--card-border', btnText: '--btn-text'
  };

  function applyTheme(mode) {
    body.classList.toggle('light', mode === 'light');

    Object.values(tokenMap).forEach(function (property) { body.style.removeProperty(property); });
    const palette = company && themes[company] ? themes[company][mode] : null;
    if (palette) {
      Object.entries(palette).forEach(function ([name, value]) {
        body.style.setProperty(tokenMap[name], value);
      });
    }

    const background = getComputedStyle(body).getPropertyValue('--bg').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
  }

  applyTheme(localStorage.getItem('theme') || 'dark');

  document.querySelectorAll('[data-preserve-query]').forEach(function (link) {
    const target = new URL(link.getAttribute('href'), window.location.href);
    target.search = params.toString();
    link.href = target.href;
  });
})();
