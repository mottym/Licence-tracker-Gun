"use client";

import { Button } from "@/components/ui/button";

interface RenewActionProps {
  isExternal: boolean;
  externalUrl: string | null;
}

export function RenewAction({ isExternal, externalUrl }: RenewActionProps) {
  if (isExternal && externalUrl) {
    return (
      <Button asChild variant="secondary">
        <a href={externalUrl} target="_blank" rel="noreferrer">
          Renew
        </a>
      </Button>
    );
  }

  return (
    <Button type="submit" variant="secondary">
      Renew
    </Button>
  );
}
