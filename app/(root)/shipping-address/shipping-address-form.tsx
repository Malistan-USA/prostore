'use client';

import { ShippingAddress } from '@/types';
import { shippingAddressSchema } from '@/lib/validators';
import { shippingAddressDefaultValues } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateUserAddress } from '@/lib/actions/user.actions';

import { ArrowRight, Loader } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';



function ShippingAddressForm({
  address,
}: {
  address: ShippingAddress;
}) {


  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (values) => {

    startTransition(async () => {
      const res = await updateUserAddress(values);

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message
        });

        return;
      }

      router.push('/payment-method')

    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-2 mb-6">
        <h1 className="h2-bold">Shipping Address</h1>

        <p className="text-sm text-muted-foreground">
          Please enter an address to ship to
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter full name"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Street Address */}
          <FormField
            control={form.control}
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter street address"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* City + Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Enter city"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Enter postal code"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Country */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter country"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ShippingAddressForm;