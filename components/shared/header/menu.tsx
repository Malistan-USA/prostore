import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { EllipsisVertical, ShoppingCart, User } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTrigger } from "@/components/ui/sheet";

function Menu() {
  return (
    <div className="flex justify-end gap-3">
      <nav className='hidden md:flex w-full max-w-xs gap-1'>
        <ModeToggle />
        <Button asChild variant="ghost">
          <Link href="/cart">
            <ShoppingCart /> Cart
          </Link>
        </Button>

        <Button asChild>
          <Link href="/sign-in">
            <User /> Sign In
          </Link>
        </Button>
      </nav>
      <nav className='flex md:hidden w-full max-w-xs gap-1'>
        <Sheet>
          <SheetTrigger className='align-middle'>
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className='flex flex-col items-start'>
            <ModeToggle />
            <Button asChild variant="ghost">
              <Link href="/cart">
                <ShoppingCart /> Cart
              </Link>
            </Button>
            <Button asChild>
              <Link href='/sign-in'>
                <User /> Sign In
              </Link>
            </Button>
            <SheetDescription>

            </SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>

    </div>
  )
}

export default Menu
