'use server';

import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import z from "zod";
import { insertProductSchema, updateProductSchema } from "../validators";
import { Prisma } from "@prisma/client";


export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: 'desc' }
  });

  return convertToPlainObject(data)
}

//Get single product by it's slug
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug }
  })
}

//Get single product by ID
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId }
  });

  return convertToPlainObject(data)
}



// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // -----------------------------
  // Search filter
  // -----------------------------
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== 'all'
      ? {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      }
      : {};

  // -----------------------------
  // Category filter
  // -----------------------------
  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== 'all'
      ? {
        category,
      }
      : {};

  // -----------------------------
  // Price filter
  // -----------------------------
  let priceFilter: Prisma.ProductWhereInput = {};

  if (price && price !== 'all') {
    const [minPrice, maxPrice] = price.split('-').map(Number);

    if (!Number.isNaN(minPrice) && !Number.isNaN(maxPrice)) {
      priceFilter = {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      };
    }
  }

  // -----------------------------
  // Rating filter
  // -----------------------------
  const ratingFilter: Prisma.ProductWhereInput =
    rating && rating !== 'all'
      ? {
        rating: {
          gte: Number(rating),
        },
      }
      : {};

  // -----------------------------
  // Combine all filters
  // -----------------------------
  const where: Prisma.ProductWhereInput = {
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  };

  // -----------------------------
  // Sorting
  // -----------------------------
  let orderBy: Prisma.ProductOrderByWithRelationInput = {
    createdAt: 'desc',
  };

  switch (sort) {
    case 'lowest':
      orderBy = { price: 'asc' };
      break;

    case 'highest':
      orderBy = { price: 'desc' };
      break;

    case 'rating':
      orderBy = { rating: 'desc' };
      break;

    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // -----------------------------
  // Get products
  // -----------------------------
  const data = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  // -----------------------------
  // Get total count
  // -----------------------------
  const dataCount = await prisma.product.count({
    where,
  });

  return {
    data: convertToPlainObject(data),
    totalPage: Math.ceil(dataCount / limit),
  };
}


// Delete a Product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}


//Create a Product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {

    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data: product });

    revalidatePath('/admin/products')

    return {
      success: true,
      message: "Product Created Successfully",
    };

  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}


//Update a Product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {

    const product = updateProductSchema.parse(data);

    const productExists = await prisma.product.findFirst({ where: { id: product.id } });
    if (!productExists) throw new Error('Product Not Found');

    await prisma.product.update({
      where: { id: product.id },
      data: product
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product Updated Successfully'
    }

  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Get all categories
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ['category'],
    _count: true
  });

  return data;
}

// Get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return convertToPlainObject(data)
}