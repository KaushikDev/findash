"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <ConfirmActionButton
      onConfirm={handleSignOut}
      variant="outline-button"
      label="Signout"
      title="Confirm Signout?"
      description="Are you sure you want to end your session? You will need to log back in to access your budgets."
    />
  );
}
