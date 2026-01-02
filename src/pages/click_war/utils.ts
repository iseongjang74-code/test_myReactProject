
export const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const getCountryCode = (countryName: string): string => {
  const countryMap: Record<string, string> = {
    'USA': 'US', 'China': 'CN', 'India': 'IN', 'Brazil': 'BR',
    'Russia': 'RU', 'Japan': 'JP', 'Germany': 'DE', 'United Kingdom': 'GB',
    'France': 'FR', 'South Korea': 'KR', 'Canada': 'CA', 'Australia': 'AU'
  };
  return countryMap[countryName] || 'AQ';
};
