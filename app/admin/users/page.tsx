import { getAllUsers, deleteUser } from '@/lib/actions/user.actions';
import { requiredAdmin } from '@/lib/auth-guard';
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
import { formatId } from "@/lib/utils";
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import DeleteDialog from '@/components/shared/delete-dialog';
import { Badge } from '@/components/ui/badge';


export const metadata: Metadata = {
  title: 'Users List'
}

const AdminUserPage = async (props: {
  searchParams: Promise<{
    page: string
  }>
}) => {


  await requiredAdmin();

  const { page = '1' } = await props.searchParams;

  const users = await getAllUsers({ page: Number(page) });


  return (
    <div className="space-y-2 mt-6">
      <div className="mb-6 rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 shadow-md">
        <h1 className="h2-bold text-center tracking-tight">
          Users
        </h1>

      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {
                    user.role === 'user' ? (<Badge variant='secondary'>User</Badge>) : (<Badge variant='default'>Admin</Badge>)
                  }
                </TableCell>

                <TableCell>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/admin/users/${user.id}`}>
                      Edit
                    </Link>
                  </Button>

                  <DeleteDialog id={user.id} action={deleteUser} />

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-center mt-10">
          {users.totalPages >= 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={users.totalPages}
            />
          )}
        </div>
      </div>

    </div>
  )
}

export default AdminUserPage
