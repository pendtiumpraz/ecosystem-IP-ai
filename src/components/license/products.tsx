import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/types/license";

interface LicenseProductsProps {
  products?: Product[];
}

export function LicenseProducts({ products = [] }: LicenseProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "merchandise", "digital", "limited"];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="aspect-video bg-gray-100 rounded-md mb-4 overflow-hidden">
          <img 
            src={product.imageUrl || "/placeholder.png"} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Price</span>
            <span className="font-semibold">Rp {product.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category</span>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Variants</span>
            <span>{product.variantsCount} available</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}