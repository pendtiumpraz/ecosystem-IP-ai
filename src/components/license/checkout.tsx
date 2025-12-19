import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function LicenseCheckout() {
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  return (
    <div className="space-y-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
          <CardDescription>Where should we send your order?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+62 812 3456 7890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" placeholder="123 Main Street" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Jakarta" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal">Postal Code</Label>
              <Input id="postal" placeholder="12345" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Indonesia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Indonesia</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="sg">Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>How would you like to pay?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "credit_card" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input id="cardName" placeholder="John Doe" />
              </div>
            </div>
          )}

          {paymentMethod === "bank_transfer" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Banks Available</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bca">BCA</SelectItem>
                    <SelectItem value="mandiri">Mandiri</SelectItem>
                    <SelectItem value="bni">BNI</SelectItem>
                    <SelectItem value="bri">BRI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input placeholder="1234567890" />
              </div>
            </div>
          )}

          {paymentMethod === "ewallet" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>E-Wallet</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select E-Wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gopay">GoPay</SelectItem>
                    <SelectItem value="ovo">OVO</SelectItem>
                    <SelectItem value="dana">DANA</SelectItem>
                    <SelectItem value="shopeepay">ShopeePay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+62 812 3456 7890" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp 1,000,000</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Rp 25,000</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (11%)</span>
            <span>Rp 112,750</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>Rp 1,137,750</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Place Order</Button>
        </CardFooter>
      </Card>
    </div>
  );
}