"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2 } from "lucide-react";

interface Transaction {
  _id: string;
  createdAt: number;
  description?: string;
  aiModel?: string;
  amount: number;
  type: "purchase" | "usage" | "refund";
}

interface CreditsHistoryProps {
  transactions: Transaction[] | undefined;
}

export function CreditsHistory({ transactions }: CreditsHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Recent activity including purchases and usage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>AI Model</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!transactions ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No transaction history found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(transaction.createdAt).toLocaleDateString()} <span className="text-muted-foreground text-xs ml-1">{new Date(transaction.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    {transaction.aiModel ? (
                      <Badge variant="secondary" className="text-xs">
                        {transaction.aiModel}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

