import type { ServiceCategory } from '@/src/lib/types';

export const SERVICE_CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Painting',
  'Masonry',
  'Interior Design',
  'Landscaping',
  'Cleaning',
  'Security',
  'HVAC',
  'Roofing',
  'Tiling',
] as const satisfies readonly ServiceCategory[];

export const PRICE_TYPES = [
  { value: 'FIXED', label: 'Fixed price' },
  { value: 'HOURLY', label: 'Hourly rate' },
] as const;

export type MultiSelectOption = {
  value: string;
  label: string;
};

export type ProviderDetailsOptions = {
  servicesOffered: MultiSelectOption[];
  serviceTitles: MultiSelectOption[];
  serviceTags: MultiSelectOption[];
};

export type ProviderDetailsDefaults = {
  bio: string;
  yearsOfExperience: string;
  hourlyRate: string;
  skills: string[];
  location: string;
  serviceTitles: string[];
  serviceDescription: string;
  category: ServiceCategory | '';
  price: string;
  priceType: 'FIXED' | 'HOURLY';
  deliveryTime: string;
  tags: string[];
};

export function splitProviderList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function joinProviderList(value?: string[] | null): string {
  return value?.join(', ') ?? '';
}

export function uniqueProviderOptions(values: Iterable<string>): MultiSelectOption[] {
  const seen = new Set<string>();
  const options: MultiSelectOption[] = [];

  for (const raw of values) {
    const value = raw.trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    options.push({ value, label: value });
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export function mergeSelectedOptions(
  options: MultiSelectOption[],
  selected: string[]
): MultiSelectOption[] {
  const existing = new Set(options.map((option) => option.value.toLowerCase()));
  const missing = selected
    .filter((value) => value.trim() && !existing.has(value.toLowerCase()))
    .map((value) => ({ value, label: value }));

  return [...missing, ...options];
}
