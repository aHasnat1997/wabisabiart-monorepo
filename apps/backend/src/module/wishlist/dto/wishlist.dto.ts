import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// ─────────────────────────────────────────────────────────────────────────
// CREATE WISHLIST COLLECTION DTO
// ─────────────────────────────────────────────────────────────────────────

const CreateWishlistCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Collection name is required').max(255),
  description: z
    .string()
    .trim()
    .max(1000, 'Description max 1000 characters')
    .optional(),
  isPublic: z.boolean().default(false),
});

export class CreateWishlistCollectionDto extends createZodDto(
  CreateWishlistCollectionSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// UPDATE WISHLIST COLLECTION DTO
// ─────────────────────────────────────────────────────────────────────────

const UpdateWishlistCollectionSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(1000).optional(),
  isPublic: z.boolean().optional(),
});

export class UpdateWishlistCollectionDto extends createZodDto(
  UpdateWishlistCollectionSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// ADD TO WISHLIST DTO
// ─────────────────────────────────────────────────────────────────────────

const AddToWishlistSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  wishlistId: z.string().uuid('Invalid wishlist ID').optional(),
  note: z.string().trim().max(500, 'Note max 500 characters').optional(),
});

export class AddToWishlistDto extends createZodDto(AddToWishlistSchema) {}

// ─────────────────────────────────────────────────────────────────────────
// WISHLIST ITEM RESPONSE
// ─────────────────────────────────────────────────────────────────────────

const WishlistItemResponseSchema = z.object({
  id: z.string().uuid(),
  wishlistId: z.string().uuid(),
  productId: z.string().uuid(),
  note: z.string().optional(),
  addedAt: z.coerce.date(),
  product: z.object({
    id: z.string().uuid(),
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.string().optional(),
    currency: z.string().optional(),
    discountType: z.string().optional(),
    discountValue: z.string().optional(),
    badge: z.string().optional(),
    imageUrl: z.string().optional(),
    categoryId: z.string().optional(),
    category: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
      })
      .optional(),
    createdAt: z.coerce.date(),
  }),
});

export class WishlistItemResponse extends createZodDto(
  WishlistItemResponseSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// WISHLIST COLLECTION RESPONSE
// ─────────────────────────────────────────────────────────────────────────

const WishlistCollectionResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  itemCount: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export class WishlistCollectionResponse extends createZodDto(
  WishlistCollectionResponseSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// WISHLIST COLLECTION WITH ITEMS RESPONSE
// ─────────────────────────────────────────────────────────────────────────

const WishlistCollectionWithItemsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(WishlistItemResponseSchema),
});

export class WishlistCollectionWithItemsResponse extends createZodDto(
  WishlistCollectionWithItemsSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// GROUPED WISHLIST RESPONSE (grouped by category)
// ─────────────────────────────────────────────────────────────────────────

const CategoryGroupSchema = z.object({
  categoryId: z.string().uuid().optional(),
  categoryName: z.string(),
  itemCount: z.number().int().nonnegative(),
  items: z.array(WishlistItemResponseSchema),
});

const GroupedWishlistResponseSchema = z.object({
  type: z.enum(['Items', 'Collections']),
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  totalItems: z.number().int().nonnegative(),
  categories: z.array(CategoryGroupSchema).optional(),
  collections: z.array(WishlistCollectionResponseSchema).optional(),
});

export class GroupedWishlistResponse extends createZodDto(
  GroupedWishlistResponseSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// PAGINATED WISHLIST RESPONSE
// ─────────────────────────────────────────────────────────────────────────

const PaginatedWishlistSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.enum(['Items', 'Collections']),
      name: z.string().optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
      itemCount: z.number().int().nonnegative().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      product: z
        .object({
          id: z.string().uuid(),
          title: z.string().optional(),
          price: z.string().optional(),
          imageUrl: z.string().optional(),
          category: z
            .object({
              id: z.string().uuid(),
              name: z.string(),
            })
            .optional(),
        })
        .optional(),
      note: z.string().optional(),
      addedAt: z.coerce.date().optional(),
    }),
  ),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export class PaginatedWishlistResponse extends createZodDto(
  PaginatedWishlistSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// DELETE ITEM FROM WISHLIST DTO
// ─────────────────────────────────────────────────────────────────────────

const DeleteWishlistItemSchema = z.object({
  wishlistItemId: z.string().uuid('Invalid wishlist item ID'),
});

export class DeleteWishlistItemDto extends createZodDto(
  DeleteWishlistItemSchema,
) {}
