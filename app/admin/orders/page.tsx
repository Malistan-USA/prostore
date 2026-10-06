import { auth } from '@/auth';
import { requiredAdmin } from '@/lib/auth-guard';
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions';
import { Metadata } from 'next';
import {
  TableHeader,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell
}
  from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import DeleteDialog from '@/components/shared/delete-dialog';


export const metadata: Metadata = {
  title: 'Admin Orders'
}



async function AdminOrdersPage(props: {
  searchParams: Promise<{ page: string; query: string }>
}) {

  await requiredAdmin();

  const { page = '1', query: searchText } = await props.searchParams;

  console.log('searchText:', searchText);

  const session = await auth();

  if (session?.user?.role !== 'admin') {
    throw new Error('User is not authorized')
  };

  const orders = await getAllOrders({ page: Number(page), query: searchText });



  return (
    <div className="space-y-2 mt-6">
      <div className="mb-6 rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 shadow-md">
        <div className="relative flex items-center justify-between">
          {/* Center title */}
          <h1 className="h2-bold absolute left-1/2 -translate-x-1/2 tracking-tight">
            Orders
          </h1>

          {/* Right filter */}
          {searchText && (
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtered by:</span>

              <span className="font-medium text-foreground">
                {searchText}
              </span>

              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>BUYER</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {
                    order.isPaid && order.paidAt ? formatDateTime(order.paidAt).dateTime : 'Not Paid'
                  }
                </TableCell>
                <TableCell>
                  {
                    order.isDelivered && order.deliveredAt ? formatDateTime(order.deliveredAt).dateTime : 'Not Delivered'
                  }
                </TableCell>
                <TableCell>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/order/${order.id}`}>
                      Details
                    </Link>
                  </Button>

                  <DeleteDialog id={order.id} action={deleteOrder} />

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-center mt-8">
          {orders.totalPages >= 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={orders.totalPages}
            />
          )}
        </div>
      </div>

    </div>
  )
}

export default AdminOrdersPage
