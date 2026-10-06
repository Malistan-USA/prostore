import Link from "next/link";
import { UserIcon } from "lucide-react";

import { auth } from "@/auth";
import { signOutUser } from "@/lib/actions/user.actions";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserButton = async () => {
  const session = await auth();

  if (!session) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon className="mr-2 h-4 w-4" />
          Sign In
        </Link>
      </Button>
    );
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="ml-2 h-8 w-8 rounded-full bg-gray-200 p-0"
        >
          {firstInitial}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="text-sm font-medium leading-none">
              {session.user?.name}
            </div>
            <div className="text-sm text-muted-foreground leading-none">
              {session.user?.email}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem>
          <Link href='/user/profile' className="w-full">User Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href='/user/orders' className="w-full">Order History</Link>

        </DropdownMenuItem>
        {session?.user?.role === 'admin' && (
          <DropdownMenuItem>
            <Link href='/admin/overview' className="w-full">Admin</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="p-0 mb-1">
          <form action={signOutUser} className="w-full">
            <Button className="w-full py-4 px-2 h-4 justify-start" variant='ghost'>
              Sign Out
            </Button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;