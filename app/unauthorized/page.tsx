
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized Access",
};

const UnauthorizedPage = () => {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-gradient-to-br from-background to-muted/50 p-8 text-center shadow-lg">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>

        {/* Heading */}
        <h1 className="h1-bold text-3xl tracking-tight">
          Unauthorized Access
        </h1>

        {/* Message */}
        <p className="mt-3 text-muted-foreground">
          You do not have permission to access this page.
          Please return to the home page.
        </p>

        {/* Button */}
        <div className="mt-6">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

