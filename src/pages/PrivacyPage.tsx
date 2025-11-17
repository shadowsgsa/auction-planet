import { Shield, Eye, Lock, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: January 1, 2024
          </p>
        </div>

        {/* Privacy Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We're clear about what data we collect and how we use it.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is protected with industry-leading security measures.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <UserCheck className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Control</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                You have control over your personal information and privacy settings.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Policy Content */}
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
          <p className="mb-4">
            When you create an account, we collect:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Name and contact information (email, phone, address)</li>
            <li>Payment information (processed securely by our payment partners)</li>
            <li>Identity verification documents (for seller accounts)</li>
            <li>Profile information and preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Usage Information</h3>
          <p className="mb-4">
            We automatically collect information about how you use our service:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Pages visited and features used</li>
            <li>Search queries and browsing behavior</li>
            <li>Device information and IP address</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use your information to:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Provide and improve our auction services</li>
            <li>Process transactions and prevent fraud</li>
            <li>Communicate with you about your account and transactions</li>
            <li>Personalize your experience and show relevant listings</li>
            <li>Comply with legal obligations and resolve disputes</li>
            <li>Send marketing communications (with your consent)</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
          <p className="mb-4">
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Other users:</strong> Public profile information and transaction history</li>
            <li><strong>Service providers:</strong> Payment processors, shipping companies, and security services</li>
            <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
            <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
          </ul>
          <p className="mb-6">
            We never sell your personal information to third parties for marketing purposes.
          </p>

          <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
          <p className="mb-4">
            We protect your information using:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>SSL encryption for all data transmission</li>
            <li>Secure data centers with 24/7 monitoring</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and employee background checks</li>
            <li>Two-factor authentication options</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">5. Your Privacy Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Access and download your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing communications</li>
            <li>Control cookie preferences</li>
            <li>Port your data to another service</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar technologies for:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Essential site functionality</li>
            <li>Performance and analytics</li>
            <li>Personalization and recommendations</li>
            <li>Advertising and marketing</li>
          </ul>
          <p className="mb-6">
            You can control cookie preferences through your browser settings or our cookie preference center.
          </p>

          <h2 className="text-2xl font-bold mb-4">7. International Data Transfers</h2>
          <p className="mb-6">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
          </p>

          <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
          <p className="mb-6">
            Our service is not intended for children under 13. We do not knowingly collect personal information from children. 
            If you believe we have collected information from a child, please contact us immediately.
          </p>

          <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
          <p className="mb-6">
            We may update this privacy policy from time to time. We will notify you of significant changes by email 
            or through our platform. Your continued use constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
          <p className="mb-6">
            If you have questions about this privacy policy or want to exercise your rights, contact us at:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Email:</strong> privacy@auctionplanet.com</p>
            <p><strong>Phone:</strong> 1-800-AUCTION</p>
            <p><strong>Data Protection Officer:</strong> dpo@auctionplanet.com</p>
            <p><strong>Address:</strong> 123 Auction Street, Commerce City, CC 12345</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;