import {
  MOCK_JOB_REQUESTS,
  MOCK_SERVICES,
  MOCK_USERS,
} from '@/src/lib/constants/mockData';
import {
  SERVICE_CATEGORIES,
  uniqueProviderOptions,
  type ProviderDetailsOptions,
  type ProviderDetailsDefaults,
} from '@/src/lib/provider-details';
import type { ServiceCategory, SessionUser } from '@/src/lib/types';

function blankDefaults(user: SessionUser): ProviderDetailsDefaults {
  return {
    bio: user.bio ?? '',
    yearsOfExperience: user.yearsOfExperience?.toString() ?? '',
    hourlyRate: user.hourlyRate?.toString() ?? '',
    skills: user.skills ?? [],
    location: user.location ?? '',
    serviceTitles: [],
    serviceDescription: '',
    category: '',
    price: '',
    priceType: 'FIXED',
    deliveryTime: '1',
    tags: [],
  };
}

export async function getProviderDetailsDefaults(
  user: SessionUser
): Promise<ProviderDetailsDefaults> {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('@/src/lib/prisma');
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          servicesProvided: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (dbUser) {
        const service = dbUser.servicesProvided[0];
        const tags = Array.from(
          new Set(
            dbUser.servicesProvided.flatMap((item) => item.tags).filter(Boolean)
          )
        );
        return {
          bio: dbUser.bio ?? '',
          yearsOfExperience: dbUser.yearsOfExperience?.toString() ?? '',
          hourlyRate: dbUser.hourlyRate?.toString() ?? '',
          skills: dbUser.skills,
          location: dbUser.location ?? '',
          serviceTitles: dbUser.servicesProvided
            .filter((item) => item.isActive)
            .map((item) => item.title),
          serviceDescription: service?.description ?? '',
          category: (service?.category as ServiceCategory | undefined) ?? '',
          price: service?.price?.toString() ?? '',
          priceType: service?.priceType ?? 'FIXED',
          deliveryTime: service?.deliveryTime?.toString() ?? '1',
          tags,
        };
      }
    } catch {
      // Local demo mode can run without a database.
    }
  }

  const mockUser = MOCK_USERS.find((item) => item.id === user.id);
  const service = MOCK_SERVICES.find((item) => item.providerId === user.id);
  const tags = Array.from(
    new Set(
      MOCK_SERVICES.filter((item) => item.providerId === user.id)
        .flatMap((item) => item.tags)
        .filter(Boolean)
    )
  );

  if (!mockUser) return blankDefaults(user);

  return {
    bio: mockUser.bio ?? '',
    yearsOfExperience: mockUser.yearsOfExperience?.toString() ?? '',
    hourlyRate: mockUser.hourlyRate?.toString() ?? '',
    skills: mockUser.skills ?? [],
    location: mockUser.location ?? '',
    serviceTitles: MOCK_SERVICES.filter((item) => item.providerId === user.id && item.isActive).map(
      (item) => item.title
    ),
    serviceDescription: service?.description ?? '',
    category: service?.category ?? '',
    price: service?.price?.toString() ?? '',
    priceType: service?.priceType ?? 'FIXED',
    deliveryTime: service?.deliveryTime?.toString() ?? '1',
    tags,
  };
}

export async function getProviderDetailsOptions(): Promise<ProviderDetailsOptions> {
  const serviceOfferValues: string[] = [...SERVICE_CATEGORIES];
  const serviceTitleValues: string[] = [];
  const tagValues: string[] = [];

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('@/src/lib/prisma');
      const [services, jobRequests, providers] = await Promise.all([
        prisma.service.findMany({
          select: { title: true, category: true, tags: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.jobRequest.findMany({
          select: { title: true, category: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.findMany({
          where: { role: 'PROVIDER' },
          select: { skills: true },
        }),
      ]);

      for (const service of services) {
        serviceOfferValues.push(service.category, ...service.tags);
        serviceTitleValues.push(service.title);
        tagValues.push(service.category, ...service.tags);
      }

      for (const request of jobRequests) {
        serviceOfferValues.push(request.category);
        serviceTitleValues.push(request.title);
        tagValues.push(request.category);
      }

      for (const provider of providers) {
        serviceOfferValues.push(...provider.skills);
        tagValues.push(...provider.skills);
      }
    } catch {
      // Fall back to bundled demo data below.
    }
  }

  for (const service of MOCK_SERVICES) {
    serviceOfferValues.push(service.category, ...service.tags);
    serviceTitleValues.push(service.title);
    tagValues.push(service.category, ...service.tags);
  }

  for (const request of MOCK_JOB_REQUESTS) {
    serviceOfferValues.push(request.category);
    serviceTitleValues.push(request.title);
    tagValues.push(request.category);
  }

  for (const provider of MOCK_USERS.filter((user) => user.role === 'PROVIDER')) {
    serviceOfferValues.push(...(provider.skills ?? []));
    tagValues.push(...(provider.skills ?? []));
  }

  return {
    servicesOffered: uniqueProviderOptions(serviceOfferValues),
    serviceTitles: uniqueProviderOptions(serviceTitleValues),
    serviceTags: uniqueProviderOptions(tagValues),
  };
}
