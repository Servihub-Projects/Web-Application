import type { ServiceWithProvider } from '@/src/lib/types';

export function rankServiceResults(services: ServiceWithProvider[]): ServiceWithProvider[] {
  return [...services].sort((a, b) => {
    const ratingDelta = (b.rating ?? 0) - (a.rating ?? 0);
    if (ratingDelta !== 0) return ratingDelta;

    const reviewDelta = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    if (reviewDelta !== 0) return reviewDelta;

    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function applyPlacementMetadata(services: ServiceWithProvider[]): ServiceWithProvider[] {
  return services.map((service, index) => ({
    ...service,
    placement: {
      kind: 'ORGANIC',
      source: 'organic',
      slot: index + 1,
    },
  }));
}
