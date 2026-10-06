import { Metadata } from 'next';
import { requiredAdmin } from '@/lib/auth-guard';
import ProductForm from '@/components/admin/product-form';


export const metadata: Metadata = {
  title: 'Create Product'
}

const CreateProductPage = async () => {

  await requiredAdmin();

  return (
    <>
      <div className="space-y-2 mt-6">
        <div className="mb-6 rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 shadow-md">
          <h1 className="h2-bold text-center tracking-tight">
            Create Product
          </h1>

        </div>
      </div>
      <div className='my-8'>
        <ProductForm type='Create' />
      </div>
    </>
  )
}

export default CreateProductPage
