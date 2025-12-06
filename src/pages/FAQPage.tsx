
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Bot, Shield, FileText, Users, CreditCard, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQPage = () => {
  const faqCategories = [
    {
      title: "AI & Analysis Features",
      icon: Bot,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      questions: [
        {
          question: "Is the AI analysis legally binding?",
          answer: "No. All AI-generated analyses, summaries, and recommendations are for informational purposes only and do NOT constitute legal advice. You must consult with qualified legal professionals before making any decisions based on AI outputs. Our AI is a tool to assist, not replace, professional judgment."
        },
        {
          question: "How accurate is the AI contract analysis?",
          answer: "Our AI provides helpful insights but is not guaranteed to be 100% accurate. AI can miss nuances, misinterpret context, or produce errors. Always have a qualified professional review important documents. We recommend using AI analysis as a starting point for professional review, not as a final authority."
        },
        {
          question: "Can I trust the AI's risk assessments?",
          answer: "AI risk assessments are indicative only and should be verified by professionals. The AI cannot fully understand your specific business context, industry regulations, or strategic considerations. Use risk scores as conversation starters with your legal and business advisors, not as definitive assessments."
        },
        {
          question: "Does the AI have access to my confidential documents?",
          answer: "Your documents are processed securely to generate analyses. We do not use your specific documents to train our AI models. All data is encrypted and handled according to our Privacy Policy. We implement industry-standard security measures to protect your confidential information."
        },
        {
          question: "What happens if the AI makes a mistake?",
          answer: "You are responsible for verifying all AI-generated content. Trustroom.ai is not liable for errors in AI outputs or decisions made based on AI recommendations. This is why we strongly recommend professional review of all important analyses. Please report any errors to help us improve."
        },
        {
          question: "Can I use AI analysis in court or legal proceedings?",
          answer: "No. AI-generated content should not be used as evidence or submitted in legal proceedings. The analysis is for your internal reference only. Legal documents and arguments should be prepared by qualified legal professionals."
        }
      ]
    },
    {
      title: "Platform & Account",
      icon: Settings,
      iconColor: "text-info",
      iconBg: "bg-info/10",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' on the homepage and enter your email address and password. You can also sign up using Google or Apple for faster registration. After creating your account, you'll be guided through a brief onboarding process."
        },
        {
          question: "Is my data secure on Trustroom.ai?",
          answer: "Yes. We use industry-standard encryption, secure infrastructure, and access controls to protect your data. All document transfers are encrypted, and we maintain strict data handling policies. See our Privacy Policy and Security pages for detailed information."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes. You can request account deletion through Settings. This will permanently remove your account and associated data. Some data may be retained as required by law or for legitimate business purposes as outlined in our Privacy Policy."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link. If you don't receive the email, check your spam folder or contact support."
        }
      ]
    },
    {
      title: "Deals & Transactions",
      icon: FileText,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      questions: [
        {
          question: "What types of deals can I manage?",
          answer: "Trustroom.ai supports various deal types including business sales, IP transfers, real estate transactions, cross-border deals, and more. Each deal type has customized features and document templates relevant to that transaction type."
        },
        {
          question: "Is Trustroom.ai involved in my deals?",
          answer: "No. Trustroom.ai is a platform that facilitates deal management and provides tools. We are not a party to any transaction and do not provide brokerage, legal, or advisory services. All deal terms are between you and your counterparties."
        },
        {
          question: "How do deal invitations work?",
          answer: "Deal creators can invite participants via email. Invitees receive a link to join the deal. Once accepted, participants can access deal documents, milestones, and communication tools based on their assigned role and permissions."
        },
        {
          question: "What are deal health scores?",
          answer: "Deal health scores are AI-generated indicators of deal progress and potential risks. They are based on factors like document completion, milestone status, and activity levels. These scores are informational only and should not be used as the sole basis for business decisions."
        }
      ]
    },
    {
      title: "Documents & E-Signatures",
      icon: Shield,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      questions: [
        {
          question: "What file types are supported?",
          answer: "We support common document formats including PDF, DOCX, DOC, and various image formats. For best AI analysis results, we recommend PDF documents. Maximum file size is 10MB per document."
        },
        {
          question: "How does electronic signing work?",
          answer: "We integrate with DocuSign for electronic signatures. When a document is ready for signing, parties receive a link to complete the signing process through DocuSign's secure platform. Signed documents are stored in your deal room."
        },
        {
          question: "Are electronic signatures legally valid?",
          answer: "Electronic signatures via DocuSign are generally legally valid in most jurisdictions. However, legal requirements vary by location and document type. Consult with a legal professional to ensure e-signatures meet your specific requirements."
        },
        {
          question: "How long are documents stored?",
          answer: "Documents are stored securely as long as your account is active. After account deletion, documents are removed according to our data retention policy. We recommend maintaining your own backup copies of important documents."
        }
      ]
    },
    {
      title: "Collaboration & Team",
      icon: Users,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      questions: [
        {
          question: "Who can see my deals?",
          answer: "Only users you explicitly invite can access your deals. Each deal has its own participant list with role-based permissions. You control who can view, edit, or manage different aspects of each deal."
        },
        {
          question: "What roles are available in a deal?",
          answer: "Deals support multiple roles including Seller, Buyer, Lawyer, and Advisor. Each role has different permissions and access levels. Deal creators can customize participant access as needed."
        },
        {
          question: "Can I remove someone from a deal?",
          answer: "Yes. Deal administrators can remove participants at any time. Removed users lose access to the deal immediately. Note that they may have already downloaded or copied documents prior to removal."
        },
        {
          question: "How do I communicate with other deal participants?",
          answer: "Each deal has built-in messaging and comment features. You can send messages to all participants or specific individuals. All communications within a deal are logged for transparency and audit purposes."
        }
      ]
    },
    {
      title: "Pricing & Billing",
      icon: CreditCard,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      questions: [
        {
          question: "Is Trustroom.ai free to use?",
          answer: "We offer a free tier with limited features. Premium features, including advanced AI analysis and additional storage, require a paid subscription. Visit our pricing page for current plan details."
        },
        {
          question: "How do I upgrade my account?",
          answer: "Go to Settings > Subscription to view available plans and upgrade. Payment is processed securely. You can upgrade, downgrade, or cancel at any time."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards and selected payment methods. All payments are processed securely through industry-standard payment processors."
        },
        {
          question: "Can I get a refund?",
          answer: "Refund policies vary by subscription type. Generally, we offer pro-rated refunds for annual plans cancelled within the first 30 days. Contact support for specific refund requests."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
              <p className="text-muted-foreground">Find answers to common questions about Trustroom.ai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3">
            {faqCategories.map((category) => (
              <a
                key={category.title}
                href={`#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <category.icon className="h-4 w-4" />
                {category.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Important Notice */}
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Important:</strong> The information provided in this FAQ is for general guidance only. 
                For specific questions about legal matters, consult a qualified professional. 
                For AI-related concerns, please review our{' '}
                <Link to="/ai-disclaimer" className="text-primary hover:underline">AI Disclaimer</Link>.
              </p>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          {faqCategories.map((category) => (
            <Card key={category.title} id={category.title.toLowerCase().replace(/\s+/g, '-')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.iconBg}`}>
                    <category.icon className={`h-5 w-5 ${category.iconColor}`} />
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}

          {/* Still Have Questions */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="pt-6 text-center">
              <HelpCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Still Have Questions?</h3>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help you.
              </p>
              <a 
                href="mailto:support@trustroom.ai"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
            </CardContent>
          </Card>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-4 justify-center">
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service →
            </Link>
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy →
            </Link>
            <Link to="/ai-disclaimer" className="text-sm text-muted-foreground hover:text-primary">
              AI Disclaimer →
            </Link>
            <Link to="/cookie-policy" className="text-sm text-muted-foreground hover:text-primary">
              Cookie Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
