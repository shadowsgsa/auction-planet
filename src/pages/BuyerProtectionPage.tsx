import { Shield, CheckCircle, CreditCard, Clock, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BuyerProtectionPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Buyer Protection Program
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Shop with confidence knowing you're protected by our comprehensive buyer protection program.
          </p>
        </div>

        {/* Protection Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Purchase Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get your money back if items don't arrive, arrive damaged, or don't match the description.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All payments are processed securely with bank-level encryption and fraud protection.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Fast Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Most claims are resolved within 48 hours with our dedicated support team.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How Our Protection Works</h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Make Your Purchase</h3>
                <p className="text-muted-foreground">
                  Buy any item through our platform using our secure payment system.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Report Any Issues</h3>
                <p className="text-muted-foreground">
                  If something goes wrong, report it within 30 days of delivery (or expected delivery date).
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Protected</h3>
                <p className="text-muted-foreground">
                  We'll investigate and provide a full refund if the seller can't resolve the issue.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Covered */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What's Covered</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Covered Issues
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Item not received</li>
                <li>• Item significantly different from description</li>
                <li>• Item damaged during shipping</li>
                <li>• Seller communication issues</li>
                <li>• Unauthorized transactions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                What to Remember
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Claims must be filed within 30 days</li>
                <li>• Keep all communication on our platform</li>
                <li>• Provide clear evidence of the issue</li>
                <li>• Work with the seller first when possible</li>
                <li>• Follow our return policy guidelines</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help with a Purchase?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is ready to help resolve any issues.
          </p>
          <Button size="lg">Contact Support</Button>
        </div>
      </div>
    </div>
  );
};

export default BuyerProtectionPage;