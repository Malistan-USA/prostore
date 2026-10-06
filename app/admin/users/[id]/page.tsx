import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";
import UpdateUserForm from "./update-user-form";


export const metadata: Metadata = {
  title: 'User Update'
}

const AdminUserUpdatePage = async (props: {
  params: Promise<{
    id: string
  }>
}) => {


  const { id } = await props.params;
  const user = await getUserById(id);

  if (!user) notFound();

  console.log(user)

  return (
    <div className="space-y-2 mt-6">
      <div className="mb-6 rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 shadow-md">
        <h1 className="h2-bold text-center tracking-tight">
          Update Users
        </h1>

      </div>
      <UpdateUserForm user={user} />
    </div>
  )
}

export default AdminUserUpdatePage
