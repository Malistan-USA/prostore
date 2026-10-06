'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Product } from '@/types';
import AutoPlay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';

const ProductCarousel = ({ data }: { data: Product[] }) => {
  return (
    <Carousel
      className="w-full mb-12"
      opts={{ loop: true }}
      plugins={[
        AutoPlay({
          delay: 10000,
          stopOnInteraction: false,
          stopOnMouseEnter: false,
        }),
      ]}
    >
      <CarouselContent>
        {data.map((product) => (
          <CarouselItem key={product.id}>
            <Link href={`/product/${product.slug}`}>
              <div className="relative mx-auto aspect-[16/6] w-full">
                {product.banner && (
                  <Image
                    src={product.banner}
                    alt={product.name}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                )}

                <div className="absolute inset-0 flex items-end justify-center">
                  <h2 className="bg-gray-900/50 px-2 text-2xl font-bold text-white">
                    {product.name}
                  </h2>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default ProductCarousel;