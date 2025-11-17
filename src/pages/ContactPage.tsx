import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have a question or need help? We're here to assist you. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-8">Get in Touch</h2>
            
            <div className="space-y-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Email Support</h3>
                      <p className="text-muted-foreground mb-2">
                        For general inquiries and support
                      </p>
                      <p className="text-primary">support@auctionplanet.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Phone Support</h3>
                      <p className="text-muted-foreground mb-2">
                        Speak directly with our team
                      </p>
                      <p className="text-primary">1-800-AUCTION (1-800-282-8466)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Office Address</h3>
                      <p className="text-muted-foreground mb-2">
                        Visit us at our headquarters
                      </p>
                      <p className="text-primary">
                        123 Auction Street<br />
                        Commerce City, CC 12345<br />
                        United States
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-muted-foreground mb-2">
                        When you can reach us
                      </p>
                      <div className="text-sm">
                        <p><strong>Phone Support:</strong></p>
                        <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                        <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                        <p>Sunday: Closed</p>
                        <p className="mt-2"><strong>Email Support:</strong> 24/7</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Contacts */}
            <h3 className="text-xl font-semibold mb-4">Department Contacts</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller Support:</span>
                <span>sellers@auctionplanet.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyer Protection:</span>
                <span>protection@auctionplanet.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technical Issues:</span>
                <span>tech@auctionplanet.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Legal/Privacy:</span>
                <span>legal@auctionplanet.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Press/Media:</span>
                <span>press@auctionplanet.com</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category" 
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select a category</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="seller">Seller Support</option>
                    <option value="buyer">Buyer Protection</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Please describe your question or concern in detail..."
                    rows={6}
                  />
                </div>
                
                <Button className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  We typically respond within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;