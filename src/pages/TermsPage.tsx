import { Scale, Shield, AlertCircle } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Scale className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: January 1, 2024
          </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-muted/50 border-l-4 border-primary p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Important Notice</h3>
                <p className="text-sm text-muted-foreground">
                  By using Auction Planet, you agree to these terms. Please read them carefully.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing and using Auction Planet, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily download one copy of the materials on Auction Planet's website for personal, 
            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
            <li>attempt to decompile or reverse engineer any software contained on Auction Planet's website</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
            You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-bold mb-4">4. Auction Rules</h2>
          <p className="mb-4">
            All auctions are governed by the following rules:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Bids are binding and cannot be retracted</li>
            <li>The highest bidder at auction close wins the item</li>
            <li>Payment must be completed within 48 hours of auction end</li>
            <li>Failure to pay may result in account suspension</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">5. Seller Responsibilities</h2>
          <p className="mb-4">
            Sellers must:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Provide accurate descriptions and photos</li>
            <li>Ship items within 3 business days of payment</li>
            <li>Package items securely to prevent damage</li>
            <li>Respond to buyer messages within 24 hours</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">6. Buyer Responsibilities</h2>
          <p className="mb-4">
            Buyers must:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Pay for won auctions within 48 hours</li>
            <li>Provide accurate shipping information</li>
            <li>Contact sellers before leaving negative feedback</li>
            <li>Report issues within 30 days of delivery</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">7. Prohibited Items</h2>
          <p className="mb-4">
            The following items are prohibited on our platform:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Illegal items or services</li>
            <li>Weapons and ammunition</li>
            <li>Stolen goods</li>
            <li>Counterfeit items</li>
            <li>Live animals</li>
            <li>Adult content</li>
            <li>Nudity</li>
            <li>No nudity or materials related to nudity</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">8. Fees and Payments</h2>
          <p className="mb-6">
            Auction Planet charges fees for listing and selling items. All fees are clearly disclosed before listing. 
            Payment processing is handled by secure third-party providers.
          </p>

          <h2 className="text-2xl font-bold mb-4">9. Dispute Resolution</h2>
          <p className="mb-6">
            In case of disputes between buyers and sellers, Auction Planet will mediate based on evidence provided. 
            Our buyer protection program covers eligible purchases as outlined in our buyer protection policy.
          </p>

          <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
          <p className="mb-6">
            Auction Planet shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
            including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>

          <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
          <p className="mb-6">
            We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. 
            Continued use of the service after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
          <p className="mb-6">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Email:</strong> legal@auctionplanet.com</p>
            <p><strong>Phone:</strong> 1-800-AUCTION</p>
            <p><strong>Address:</strong> 123 Auction Street, Commerce City, CC 12345</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;