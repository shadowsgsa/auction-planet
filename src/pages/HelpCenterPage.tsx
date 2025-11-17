import { Search, MessageCircle, Book, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HelpCenterPage = () => {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: Book,
      questions: [
        "How do I create an account?",
        "How do I verify my identity?",
        "What payment methods do you accept?",
        "How does bidding work?"
      ]
    },
    {
      title: "Buying",
      icon: MessageCircle,
      questions: [
        "How do I place a bid?",
        "What happens if I win an auction?",
        "Can I cancel my bid?",
        "How is shipping calculated?"
      ]
    },
    {
      title: "Selling",
      icon: Phone,
      questions: [
        "How do I list an item?",
        "What are the selling fees?",
        "How do I ship my item?",
        "When do I get paid?"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Find answers to your questions and get the support you need.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search for help articles..."
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Quick Help Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>
                Get instant help from our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Chat</Button>
              <p className="text-sm text-muted-foreground mt-2">
                Available 24/7
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Email Support</CardTitle>
              <CardDescription>
                Send us a detailed message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Send Email</Button>
              <p className="text-sm text-muted-foreground mt-2">
                Response within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Phone Support</CardTitle>
              <CardDescription>
                Call us for urgent issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">1-800-AUCTION</Button>
              <p className="text-sm text-muted-foreground mt-2">
                Mon-Fri 9AM-6PM EST
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {faqCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <category.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.questions.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        className="text-left text-sm text-muted-foreground hover:text-primary transition-colors block w-full"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Help Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "How to place your first bid",
              "Understanding our buyer protection",
              "Setting up your seller account",
              "Payment and shipping options",
              "Resolving disputes with sellers",
              "Account security best practices"
            ].map((article, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{article}</h3>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Step-by-step guide to help you get started
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Contact Support</Button>
            <Button variant="outline" size="lg">Browse All Articles</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;