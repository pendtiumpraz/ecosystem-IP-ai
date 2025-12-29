import { Suspense } from "react";
import { LicenseProducts } from "@/components/license/products";
import { LicenseCart } from "@/components/license/cart";
import { LicenseCheckout } from "@/components/license/checkout";
import { LicenseB2B } from "@/components/license/b2b";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { Product, CartItem } from "@/types/license"; 

export default function LicensePage() {
  // Mock data for demonstration
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "MODO Creator Verse T-Shirt",
      description: "Official merchandise featuring the MODO logo",
      price: 150000,
      category: "merchandise",
      imageUrl: "/placeholder.png",
      variantsCount: 3,
      salesCount: 45,
      isAvailable: true,
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Digital Art Collection",
      description: "High-resolution digital art assets",
      price: 50000,
      category: "digital",
      imageUrl: "/placeholder.png",
      variantsCount: 1,
      salesCount: 120,
      isAvailable: true,
      createdAt: new Date(),
    },
    {
      id: "3",
      name: "Limited Edition Poster",
      description: "Collectible poster with artist signature",
      price: 250000,
      category: "limited",
      imageUrl: "/placeholder.png",
      variantsCount: 2,
      salesCount: 30,
      isAvailable: true,
      createdAt: new Date(),
    },
  ];

  const mockCartItems: CartItem[] = [
    {
      id: "1",
      productId: "1",
      productName: "MODO Creator Verse T-Shirt",
      productDescription: "Official merchandise featuring the MODO logo",
      productImage: "/placeholder.png",
      variantId: "1",
      variantName: "Medium",
      variantPrice: 150000,
      variantSku: "MODO-TS-M",
      quantity: 2,
      createdAt: new Date(),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MODO Creator Verse License Marketplace</h1>
          <p className="text-xl text-gray-600 mb-6">Official merchandise, digital assets, and B2B licensing for your favorite IPs</p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary">Merchandise</Badge>
            <Badge variant="secondary">Digital Products</Badge>
            <Badge variant="secondary">Limited Edition</Badge>
            <Badge variant="secondary">B2B Licensing</Badge>
            <Badge variant="secondary">Royalty Management</Badge>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="products" className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="cart">Cart</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
            <TabsTrigger value="b2b">B2B Licensing</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Product Catalog</h2>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <LicenseProducts products={mockProducts} />
            </div>
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart" className="mt-6">
            <LicenseCart 
              items={mockCartItems}
              subtotal={300000}
              tax={33000}
              total={333000}
              itemCount={1}
            />
          </TabsContent>

          {/* Checkout Tab */}
          <TabsContent value="checkout" className="mt-6">
            <LicenseCheckout />
          </TabsContent>

          {/* B2B Licensing Tab */}
          <TabsContent value="b2b" className="mt-6">
            <LicenseB2B />
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MODO Creator Verse?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  Authentic Products
                </CardTitle>
                <CardDescription>
                  Official merchandise and digital assets directly from creators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Certified authentic merchandise</li>
                  <li>• Digital downloads with ownership proof</li>
                  <li>• Limited edition collectibles</li>
                  <li>• Quality assurance guarantee</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  B2B Licensing
                </CardTitle>
                <CardDescription>
                  Professional licensing for businesses and organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Territory-based licensing</li>
                  <li>• Revenue share models</li>
                  <li>• Digital contract generation</li>
                  <li>• Automated royalty tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  Secure Transactions
                </CardTitle>
                <CardDescription>
                  Safe and reliable payment processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Midtrans & Xendit integration</li>
                  <li>• Multiple payment methods</li>
                  <li>• Secure checkout process</li>
                  <li>• Order tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">Ready to License Your IP?</h3>
          <p className="text-gray-600 mb-6">Join thousands of creators and businesses using MODO Creator Verse</p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Browse Products</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
}