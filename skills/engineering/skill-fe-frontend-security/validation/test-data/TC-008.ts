// TC-008: FSEC08 - Dynamic Script Injection & Third-Party Integrity

export function loadThirdPartyWidget(widgetUrl: string) {
  // VIOLATION (FSEC08): Dynamically loading script from arbitrary external URL without SRI hash
  const script = document.createElement('script');
  script.src = widgetUrl;
  script.async = true;
  document.head.appendChild(script);
}

