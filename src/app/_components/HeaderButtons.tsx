import Link from "next/link";

import { Button } from "~/components/ui/button";

export const HeaderButtons = () => {
  return (
    <div className="flex flex-row items-center gap-4">
      <Link href="/">
        <Button variant="outline">Home</Button>
      </Link>
      <Link href="/history">
        <Button variant="outline">History</Button>
      </Link>
      <Link href="/chart">
        <Button variant="outline">Chart</Button>
      </Link>
      <Link href="/assets">
        <Button variant="outline">Assets</Button>
      </Link>
      <Link href="/addRecord">
        <Button variant="outline">Add Record</Button>
      </Link>
    </div>
  );
};
