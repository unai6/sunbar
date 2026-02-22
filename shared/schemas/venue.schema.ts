import { z } from 'zod'

/**
 * Venue creation schema with Zod validation
 */
export const createVenueSchema = z.object({
  name: z
    .string()
    .min(2, 'Venue name must be at least 2 characters')
    .max(100, 'Venue name must be less than 100 characters'),

  venueType: z.enum(['bar', 'cafe', 'restaurant', 'pub', 'nightclub'], {
    message: 'Please select a valid venue type'
  }),

  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),

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
      /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
      'Invalid phone number format'
    )
    .optional()
    .or(z.literal('')),

  website: z.string().url('Invalid website URL').optional().or(z.literal('')),

  openingHours: z
    .string()
    .max(200, 'Opening hours must be less than 200 characters')
    .optional()
})

export type CreateVenueInput = z.infer<typeof createVenueSchema>;

/**
 * Initial form values
 */
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
