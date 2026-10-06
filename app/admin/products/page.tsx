

import { requiredAdmin } from '@/lib/auth-guard';
import Link from 'next/link';
import { getAllProducts, deleteProduct } from '@/lib/actions/product.actions';
import { formatCurrency, formatId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string
  }>
}) => {

  await requiredAdmin();

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || '';
  const category = searchParams.category || '';


  const products = await getAllProducts({
    query: searchText,
    page,
    category
  })


  return (
    <div className="mt-6 space-y-4 ">
      <div className="mt-6 rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 shadow-md">
        <div className="relative flex items-center justify-between">
          {/* Left - Create Product */}
          <Button asChild>
            <Link href="/admin/products/create">
              Create Product
            </Link>
          </Button>

          {/* Center - Title */}
          <h1 className="h2-bold absolute left-1/2 -translate-x-1/2 tracking-tight">
            Products
          </h1>

          {/* Right - Filter */}
          {searchText && (
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtered by:</span>

              <span className="font-medium text-foreground">
                {searchText}
              </span>

              <Link href="/admin/products">
                <Button variant="outline" size="sm">
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead className='text-right'>PRICE</TableHead>
            <TableHead>CATEGORY</TableHead>
            <TableHead>STOCK</TableHead>
            <TableHead>RATING</TableHead>
            <TableHead className='w-[100px]'>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{formatId(product.id)}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell className='text-right'>{formatCurrency(product.price)}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.rating}</TableCell>
              <TableCell className='flex gap-1'>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>

                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>

      {products.totalPage > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            page={page}
            totalPages={products.totalPage}
          />
        </div>
      )}

    </div>
  )
}

export default AdminProductsPage
