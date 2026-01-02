import { Country, AutoClickTierInfo, CountryTheme } from '../../../types';

export const COUNTRIES: Country[] = [
  { name: 'USA', code: 'US' },
  { name: 'China', code: 'CN' },
  { name: 'India', code: 'IN' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Russia', code: 'RU' },
  { name: 'Japan', code: 'JP' },
  { name: 'Germany', code: 'DE' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'France', code: 'FR' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
];

// Event duration: 24 hours
export const EVENT_DURATION_MS = 24 * 60 * 60 * 1000;

export const AUTO_CLICK_TIERS: AutoClickTierInfo[] = [
  {
    id: 'slow',
    name: 'Standard',
    clicksPerSecond: 5,
    price: '$0.99',
    intervalMs: 200,
  },
  {
    id: 'fast',
    name: 'Supercharged',
    clicksPerSecond: 10,
    price: '$1.99',
    intervalMs: 100,
  },
  {
    id: 'ludicrous',
    name: 'Ludicrous Speed',
    clicksPerSecond: 20,
    price: '$4.99',
    intervalMs: 50,
  },
];

export const GOD_MODE_INTERVAL_MS = 10; // 100 clicks per second
export const MAX_LEVEL = 523;

export const COUNTRY_THEMES: Record<string, CountryTheme> = {
  'USA': { button: 'bg-blue-600 hover:bg-blue-500', text: 'text-white' },
  'China': { button: 'bg-red-600 hover:bg-red-500', text: 'text-yellow-300' },
  'India': { button: 'bg-orange-500 hover:bg-orange-400', text: 'text-white' },
  'Brazil': { button: 'bg-green-600 hover:bg-green-500', text: 'text-yellow-300' },
  'Russia': { button: 'bg-red-600 hover:bg-red-500', text: 'text-white' },
  'Japan': { button: 'bg-red-600 hover:bg-red-500', text: 'text-white' },
  'Germany': { button: 'bg-yellow-500 hover:bg-yellow-400', text: 'text-black' },
  'United Kingdom': { button: 'bg-blue-700 hover:bg-blue-600', text: 'text-white' },
  'France': { button: 'bg-blue-700 hover:bg-blue-600', text: 'text-white' },
  'South Korea': { button: 'bg-blue-500 hover:bg-blue-400', text: 'text-red-500' },
  'Canada': { button: 'bg-red-600 hover:bg-red-500', text: 'text-white' },
  'Australia': { button: 'bg-blue-800 hover:bg-blue-700', text: 'text-white' },
  'default': { button: 'bg-yellow-500 hover:bg-yellow-400', text: 'text-gray-900' }
};
