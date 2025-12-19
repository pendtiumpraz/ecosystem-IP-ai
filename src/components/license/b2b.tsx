import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function LicenseB2B() {
  const [licenseType, setLicenseType] = useState("merchandise");
  const [territory, setTerritory] = useState("indonesia");
  const [duration, setDuration] = useState("1");
  const [usage, setUsage] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>B2B Licensing Application</CardTitle>
          <CardDescription>
            Apply for commercial licensing of IP content for your business needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseType">License Type</Label>
              <Select value={licenseType} onValueChange={setLicenseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merchandise">Merchandise</SelectItem>
                  <SelectItem value="media">Media & Broadcasting</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="themepark">Theme Park</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="territory">Territory</Label>
              <Select value={territory} onValueChange={setTerritory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indonesia">Indonesia</SelectItem>
                  <SelectItem value="asean">ASEAN</SelectItem>
                  <SelectItem value="asia">Asia Pacific</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="custom">Custom Territory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Years)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Year</SelectItem>
                <SelectItem value="2">2 Years</SelectItem>
                <SelectItem value="3">3 Years</SelectItem>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="custom">Custom Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage">Usage Description</Label>
            <Textarea 
              id="usage" 
              placeholder="Describe how you plan to use the licensed content..."
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Requirements</Label>
            <Textarea 
              id="description" 
              placeholder="Any specific requirements or questions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" placeholder="Your Company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input id="contact" placeholder="Name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="contact@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+62 812 3456 7890" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Submit Application</Button>
        </CardFooter>
      </Card>

      {/* License Information */}
      <Card>
        <CardHeader>
          <CardTitle>Licensing Information</CardTitle>
          <CardDescription>
            Understand our licensing terms and conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">License Types</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Merchandise: Products, apparel, accessories</li>
              <li>• Media: TV, film, streaming, broadcast</li>
              <li>• Gaming: Video games, mobile apps, VR</li>
              <li>• Theme Park: Rides, attractions, experiences</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Territory Options</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Indonesia: National rights</li>
              <li>• ASEAN: Regional rights</li>
              <li>• Asia Pacific: Regional rights</li>
              <li>• Global: Worldwide rights</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Duration</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Standard: 1-3 years with renewal options</li>
              <li>• Long-term: 5+ years for major projects</li>
              <li>• Perpetual: Lifetime rights available</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}