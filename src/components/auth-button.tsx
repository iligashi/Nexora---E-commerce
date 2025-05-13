"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button disabled variant="outline">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <Button
        variant="outline"
        onClick={() => signOut()}
      >
        Sign Out
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => signIn()}
      >
        Sign In
      </Button>
      <Button
        variant="default"
        asChild
      >
        <Link href="/auth/register">
          Sign Up
        </Link>
      </Button>
    </div>
  );
} 