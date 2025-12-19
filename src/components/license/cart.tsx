import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartItem } from "@/types/license";

interface LicenseCartProps {
  items?: CartItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  itemCount?: number;
}

export function LicenseCart({ items = [], subtotal = 0, tax = 0, total = 0, itemCount = 0 }: LicenseCartProps) {
  const [coupon, setCoupon] = useState("");

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="space-y-4">
        {items.map(item => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Coupon */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="flex-1"
        />
        <Button>Apply</Button>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (11%)</span>
            <span>Rp {tax.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>Rp {total.toLocaleString()}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Proceed to Checkout</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  return (
    <Card className="flex gap-4">
      <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
        <img 
          src={item.productImage || "/placeholder.png"} 
          alt={item.productName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg">{item.productName}</CardTitle>
          <CardDescription>{item.productDescription}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              {item.variantName && (
                <div className="text-sm text-gray-600">
                  {item.variantName} - Rp {item.variantPrice?.toLocaleString()}
                </div>
              )}
              <div className="text-sm text-gray-600">SKU: {item.variantSku || "N/A"}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">-</Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button variant="outline" size="sm">+</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-0">
          <Button variant="ghost" size="sm" className="text-red-600">
            Remove
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}