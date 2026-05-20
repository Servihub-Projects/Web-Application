'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { setSession } from '@/src/lib/auth/session';
import { MOCK_SERVICES, MOCK_USERS } from '@/src/lib/constants/mockData';
import {
  PRICE_TYPES,
  SERVICE_CATEGORIES,
} from '@/src/lib/provider-details';
import type { ServiceCategory } from '@/src/lib/types';

export type ProviderDetailsActionResult = { error: string } | { success: true };

const numberFromForm = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  if (value === null) return undefined;
  return Number(value);
};

const providerDetailsSchema = z.object({
  bio: z.string().trim().min(30, 'Professional description must be at least 30 characters.').max(700),
  yearsOfExperience: z.preprocess(
    numberFromForm,
    z.number().int().min(0, 'Years of experience cannot be negative.').max(60)
  ),
  hourlyRate: z.preprocess(
    numberFromForm,
    z.number().min(1, 'Enter your usual hourly rate.').max(100_000_000)
  ),
  skills: z.array(z.string().trim().min(1)).min(1, 'Select at least one service offered.').max(12),
  location: z.string().trim().min(1, 'Select your work location.').max(80),
  serviceTitles: z.array(z.string().trim().min(5).max(100)).min(1, 'Select at least one service title.').max(8),
  serviceDescription: z.string().trim().min(20, 'Service description must be at least 20 characters.').max(1000),
  category: z.enum(SERVICE_CATEGORIES),
  price: z.preprocess(
    numberFromForm,
    z.number().min(1, 'Enter a starting price.').max(1_000_000_000)
  ),
  priceType: z.enum(PRICE_TYPES.map((item) => item.value) as ['FIXED', 'HOURLY']),
  deliveryTime: z.preprocess(
    numberFromForm,
    z.number().int().min(1, 'Delivery time must be at least 1 day.').max(365)
  ),
  tags: z.array(z.string().trim().min(1)).max(12),
});

type ProviderDetailsData = z.infer<typeof providerDetailsSchema>;

function getFormList(formData: FormData, name: string): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const item of formData.getAll(name)) {
    if (typeof item !== 'string') continue;
    const value = item.trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    values.push(value);
  }

  return values;
}

async function persistProviderDetailsToDatabase(
  providerId: string,
  data: ProviderDetailsData,
  tags: string[]
): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;

  const { prisma } = await import('@/src/lib/prisma');
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    select: { id: true },
  });

  if (!provider) return false;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: providerId },
      data: {
        bio: data.bio,
        yearsOfExperience: data.yearsOfExperience,
        hourlyRate: data.hourlyRate,
        skills: data.skills,
        location: data.location,
        providerDetailsCompleted: true,
      },
    });

    const existingServices = await tx.service.findMany({
      where: { providerId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true },
    });

    const serviceData = {
      description: data.serviceDescription,
      category: data.category,
      price: data.price,
      priceType: data.priceType,
      deliveryTime: data.deliveryTime,
      tags,
      isActive: true,
    };

    await tx.service.updateMany({
      where: {
        providerId,
        title: { notIn: data.serviceTitles },
      },
      data: { isActive: false },
    });

    for (const title of data.serviceTitles) {
      const existingService = existingServices.find(
        (service) => service.title.toLowerCase() === title.toLowerCase()
      );

      if (existingService) {
        await tx.service.update({
          where: { id: existingService.id },
          data: {
            ...serviceData,
            title,
          },
        });
      } else {
        await tx.service.create({
          data: {
            ...serviceData,
            providerId,
            title,
          },
        });
      }
    }
  });

  return true;
}

function persistProviderDetailsToMock(
  providerId: string,
  data: ProviderDetailsData,
  tags: string[]
) {
  const mockUser = MOCK_USERS.find((item) => item.id === providerId);
  if (mockUser) {
    mockUser.bio = data.bio;
    mockUser.yearsOfExperience = data.yearsOfExperience;
    mockUser.hourlyRate = data.hourlyRate;
    mockUser.skills = data.skills;
    mockUser.location = data.location;
    mockUser.providerDetailsCompleted = true;
  }

  for (const service of MOCK_SERVICES.filter((item) => item.providerId === providerId)) {
    service.isActive = data.serviceTitles.some(
      (title) => title.toLowerCase() === service.title.toLowerCase()
    );
  }

  data.serviceTitles.forEach((title, index) => {
    const existingService = MOCK_SERVICES.find(
      (item) => item.providerId === providerId && item.title.toLowerCase() === title.toLowerCase()
    );

    if (existingService) {
      existingService.description = data.serviceDescription;
      existingService.category = data.category as ServiceCategory;
      existingService.price = data.price;
      existingService.priceType = data.priceType;
      existingService.deliveryTime = data.deliveryTime;
      existingService.tags = tags;
      existingService.isActive = true;
      return;
    }

    MOCK_SERVICES.push({
      id: `svc_${Date.now()}_${index}`,
      providerId,
      title,
      description: data.serviceDescription,
      category: data.category as ServiceCategory,
      price: data.price,
      priceType: data.priceType,
      rating: 0,
      reviewCount: 0,
      deliveryTime: data.deliveryTime,
      tags,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function updateProviderDetailsAction(
  formData: FormData
): Promise<ProviderDetailsActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };
  if (user.role !== 'PROVIDER') return { error: 'Only providers can update professional details.' };

  const parsed = providerDetailsSchema.safeParse({
    bio: formData.get('bio'),
    yearsOfExperience: formData.get('yearsOfExperience'),
    hourlyRate: formData.get('hourlyRate'),
    skills: getFormList(formData, 'skills'),
    location: formData.get('location'),
    serviceTitles: getFormList(formData, 'serviceTitles'),
    serviceDescription: formData.get('serviceDescription'),
    category: formData.get('category'),
    price: formData.get('price'),
    priceType: formData.get('priceType'),
    deliveryTime: formData.get('deliveryTime'),
    tags: getFormList(formData, 'tags'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const data = parsed.data;
  const tags = data.tags.length > 0 ? data.tags : data.skills;

  if (tags.length === 0) return { error: 'Add at least one search tag.' };

  try {
    const savedToDatabase = await persistProviderDetailsToDatabase(user.id, data, tags);
    if (!savedToDatabase) {
      persistProviderDetailsToMock(user.id, data, tags);
    }
  } catch {
    return { error: 'We could not save your provider details. Please try again.' };
  }

  await setSession({
    ...user,
    bio: data.bio,
    yearsOfExperience: data.yearsOfExperience,
    hourlyRate: data.hourlyRate,
    skills: data.skills,
    location: data.location,
    providerDetailsCompleted: true,
  });

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/discover');
  revalidatePath('/add-details');
  return { success: true };
}
