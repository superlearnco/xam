"use client";

import { PurchaseCredits } from "~/components/credits/purchase-credits";

export default function CreditsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="container mx-auto py-8 px-4">
        <PurchaseCredits />
      </div>
    </div>
  );
}

