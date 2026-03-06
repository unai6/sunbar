import { z } from 'zod'

// Venue creation schema with Zod validation.
export const createVenueSchema = z.object({
  name: z
    .string()
    .min(2, 'venueForm.validation.nameMin')
    .max(100, 'venueForm.validation.nameMax'),

  venueType: z.enum(['bar', 'cafe', 'restaurant', 'pub', 'nightclub'], {
    message: 'venueForm.validation.venueTypeRequired'
  }),

  latitude: z
    .number()
    .min(-90, 'venueForm.validation.latitudeRange')
    .max(90, 'venueForm.validation.latitudeRange'),

  longitude: z
    .number()
    .min(-180, 'venueForm.validation.longitudeRange')
    .max(180, 'venueForm.validation.longitudeRange'),

  outdoorSeating: z.boolean().default(false),

  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional()
    })
    .optional(),

  phone: z
    .string()
    .regex(
      /^\+?\d{1,3}?[-.\s()]?\d{1,4}?[-.\s()]?\d{1,4}[-.\s()]?\d{1,9}$/,
      'venueForm.validation.phoneFormat'
    )
    .optional()
    .or(z.literal('')),

  website: z.string().regex(
    /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/,
    'venueForm.validation.websiteFormat'
  ).optional().or(z.literal('')),

  openingHours: z
    .string()
    .max(200, 'venueForm.validation.openingHoursMax')
    .optional()
})

export type CreateVenueInput = z.infer<typeof createVenueSchema>;

// Default initial values for the venue creation form.
export const createVenueDefaults: CreateVenueInput = {
  name: '',
  venueType: 'bar',
  latitude: 0,
  longitude: 0,
  outdoorSeating: false,
  phone: '',
  website: '',
  openingHours: ''
}
