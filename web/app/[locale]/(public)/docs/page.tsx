"use client";

import { useState } from 'react';
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Smartphone, 
  Globe, 
  Zap,
  Database,
  Code,
  ArrowRight,
  Github,
  ExternalLink,
  Target,
  Layers,
  TrendingUp,
  BookOpen,
  Terminal,
  CheckCircle2,
  Clock,
  MessageSquare,
  Bell,
  Repeat,
  Palette,
  UserPlus,
  FolderPlus,
  PlusCircle,
  FileText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeSelector } from '@/components/features/shared/theme-selector';
import { LanguageSwitcher } from '@/components/features/shared/language-switcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DocsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('user-guide');

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'JWT + bcrypt with role-based access control'
    },
    {
      icon: Users,
      title: 'Multi-Budget Management',
      description: 'Personal and team budgets with categories'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Visual charts and monthly summaries'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'PWA with intuitive mobile navigation'
    },
    {
      icon: Globe,
      title: 'Internationalization',
      description: 'English and Vietnamese support'
    },
    {
      icon: Zap,
      title: 'Modern UI/UX',
      description: 'Responsive design with dark/light themes'
    }
  ];

  const techStack = [
    {
      category: 'Backend',
      icon: Database,
      technologies: ['Rust', 'Axum', 'SQLx', 'MySQL', 'JWT']
    },
    {
      category: 'Frontend',
      icon: Code,
      technologies: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS']
    },
    {
      category: 'Infrastructure',
      icon: Layers,
      technologies: ['Docker', 'Nginx', 'MySQL', 'Redis']
    }
  ];

  const roles = [
    {
      name: 'Owner',
      description: 'Full control, manage members, delete budget',
      level: 'Full Access'
    },
    {
      name: 'Manager',
      description: 'Manage categories and settings, view all data',
      level: 'Management'
    },
    {
      name: 'Contributor',
      description: 'Add/edit transactions, view budget data',
      level: 'Read/Write'
    },
    {
      name: 'Viewer',
      description: 'Read-only access to budget and summaries',
      level: 'Read Only'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/philand.png"
                alt="Logo"
                width={36}
                height={36}
                className="h-9 w-auto transition-transform group-hover:scale-110"
                priority
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Philand
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <ThemeSelector />
                <LanguageSwitcher />
              </div>
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    {t('auth.signup')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('docs.heroTitle')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('docs.heroDescription')}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">v1.0.0</Badge>
            <Badge variant="secondary">Rust 1.70+</Badge>
            <Badge variant="secondary">Next.js 14.2+</Badge>
            <Badge variant="secondary">MIT License</Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                {t('docs.getStarted')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <a href="https://github.com/fissama/philand" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                {t('docs.viewOnGithub')}
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </section>

        {/* Tabbed Documentation */}
        <section className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="user-guide" className="gap-2">
                <BookOpen className="h-4 w-4" />
                User Guide
              </TabsTrigger>
              <TabsTrigger value="technical" className="gap-2">
                <Terminal className="h-4 w-4" />
                Technical Guide
              </TabsTrigger>
            </TabsList>

            {/* USER GUIDE TAB */}
            <TabsContent value="user-guide" className="space-y-12 mt-8">

              {/* Getting Started */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Getting Started</h3>
                  <p className="text-muted-foreground">Complete walkthrough from signup to your first budget analysis</p>
                </div>
                
                {/* Step 1: Create Account */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-lg font-bold">
                        1
                      </div>
                      <div>
                        <CardTitle>Create Your Account</CardTitle>
                        <CardDescription>Sign up and verify your email to get started</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        a
                      </div>
                      <div>
                        <p className="text-sm font-medium">Click "Sign Up" in the top right corner</p>
                        <p className="text-sm text-muted-foreground">Or use the button on the homepage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        b
                      </div>
                      <div>
                        <p className="text-sm font-medium">Enter your email and create a strong password</p>
                        <p className="text-sm text-muted-foreground">Use at least 8 characters with numbers and symbols</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        c
                      </div>
                      <div>
                        <p className="text-sm font-medium">Verify your email address</p>
                        <p className="text-sm text-muted-foreground">Check your inbox for the verification link</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        d
                      </div>
                      <div>
                        <p className="text-sm font-medium">Log in with your credentials</p>
                        <p className="text-sm text-muted-foreground">You'll be redirected to your dashboard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Create First Budget */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-lg font-bold">
                        2
                      </div>
                      <div>
                        <CardTitle>Create Your First Budget</CardTitle>
                        <CardDescription>Set up a budget to organize your finances</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        a
                      </div>
                      <div>
                        <p className="text-sm font-medium">Click "Create Budget" on your dashboard</p>
                        <p className="text-sm text-muted-foreground">Or navigate to Budgets → Create Budget</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        b
                      </div>
                      <div>
                        <p className="text-sm font-medium">Choose a descriptive name</p>
                        <p className="text-sm text-muted-foreground">Examples: "Personal 2025", "Family Budget", "Project X"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        c
                      </div>
                      <div>
                        <p className="text-sm font-medium">Select your budget type</p>
                        <p className="text-sm text-muted-foreground">Standard (general use), Saving, Debt, Investment, or Sharing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        d
                      </div>
                      <div>
                        <p className="text-sm font-medium">Choose your currency</p>
                        <p className="text-sm text-muted-foreground">USD, EUR, VND, or other supported currencies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        e
                      </div>
                      <div>
                        <p className="text-sm font-medium">Add an optional description</p>
                        <p className="text-sm text-muted-foreground">Helps you remember the budget's purpose</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3: Set Up Categories */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-lg font-bold">
                        3
                      </div>
                      <div>
                        <CardTitle>Set Up Categories</CardTitle>
                        <CardDescription>Organize your transactions with custom categories</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        a
                      </div>
                      <div>
                        <p className="text-sm font-medium">Open your budget and go to the "Categories" tab</p>
                        <p className="text-sm text-muted-foreground">Located in the budget navigation menu</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        b
                      </div>
                      <div>
                        <p className="text-sm font-medium">Click "Create Category"</p>
                        <p className="text-sm text-muted-foreground">Start with common categories like Salary, Groceries, Rent</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        c
                      </div>
                      <div>
                        <p className="text-sm font-medium">Choose Income or Expense type</p>
                        <p className="text-sm text-muted-foreground">Income: salary, bonus, gifts | Expense: food, bills, entertainment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        d
                      </div>
                      <div>
                        <p className="text-sm font-medium">Customize with colors and icons</p>
                        <p className="text-sm text-muted-foreground">Makes categories easy to identify at a glance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        e
                      </div>
                      <div>
                        <p className="text-sm font-medium">Create 5-10 categories to start</p>
                        <p className="text-sm text-muted-foreground">You can always add more later as needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 4: Add Your First Entries */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-lg font-bold">
                        4
                      </div>
                      <div>
                        <CardTitle>Add Your First Transactions</CardTitle>
                        <CardDescription>Start tracking your income and expenses</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        a
                      </div>
                      <div>
                        <p className="text-sm font-medium">Go to the "Entries" tab in your budget</p>
                        <p className="text-sm text-muted-foreground">Or use the quick-add button (+ icon) from any page</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        b
                      </div>
                      <div>
                        <p className="text-sm font-medium">Click "Add Entry" or "Quick Add"</p>
                        <p className="text-sm text-muted-foreground">The form will open with all necessary fields</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        c
                      </div>
                      <div>
                        <p className="text-sm font-medium">Select Income or Expense</p>
                        <p className="text-sm text-muted-foreground">Choose the transaction type first</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        d
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pick a category and enter the amount</p>
                        <p className="text-sm text-muted-foreground">Example: Salary - $3,000 or Groceries - $150</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        e
                      </div>
                      <div>
                        <p className="text-sm font-medium">Set the date and add a description</p>
                        <p className="text-sm text-muted-foreground">Description is optional but helps you remember details</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        f
                      </div>
                      <div>
                        <p className="text-sm font-medium">Save your entry</p>
                        <p className="text-sm text-muted-foreground">It will appear in your entries list immediately</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">💡 Pro Tip:</p>
                      <p className="text-sm text-muted-foreground">Add your current month's transactions to get an accurate picture. You can filter by date range to see specific periods.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 5: Invite Team Members (Optional) */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-lg font-bold">
                        5
                      </div>
                      <div>
                        <CardTitle>Invite Team Members (Optional)</CardTitle>
                        <CardDescription>Collaborate with family or team members</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        a
                      </div>
                      <div>
                        <p className="text-sm font-medium">Go to the "Members" tab in your budget</p>
                        <p className="text-sm text-muted-foreground">Only budget owners can invite members</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        b
                      </div>
                      <div>
                        <p className="text-sm font-medium">Click "Add Member" or "Invite Member"</p>
                        <p className="text-sm text-muted-foreground">Enter their email address</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        c
                      </div>
                      <div>
                        <p className="text-sm font-medium">Choose their role</p>
                        <p className="text-sm text-muted-foreground">Manager (full access), Contributor (add/edit), or Viewer (read-only)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        d
                      </div>
                      <div>
                        <p className="text-sm font-medium">Send the invitation</p>
                        <p className="text-sm text-muted-foreground">They'll receive an email to join your budget</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 6: View Analytics */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-lg font-bold">
                        6
                      </div>
                      <div>
                        <CardTitle>View Your Analytics</CardTitle>
                        <CardDescription>Understand your financial patterns</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        a
                      </div>
                      <div>
                        <p className="text-sm font-medium">Check the "Overview" tab</p>
                        <p className="text-sm text-muted-foreground">See your current balance, income, and expenses at a glance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        b
                      </div>
                      <div>
                        <p className="text-sm font-medium">Explore the "Summary" tab</p>
                        <p className="text-sm text-muted-foreground">View monthly trends, charts, and category breakdowns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        c
                      </div>
                      <div>
                        <p className="text-sm font-medium">Filter by date range</p>
                        <p className="text-sm text-muted-foreground">Compare different periods: this month, last 3 months, this year</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        d
                      </div>
                      <div>
                        <p className="text-sm font-medium">Identify spending patterns</p>
                        <p className="text-sm text-muted-foreground">See which categories consume most of your budget</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">🎉 Congratulations!</p>
                      <p className="text-sm text-muted-foreground">You're now ready to manage your finances with Philand. Keep adding transactions regularly for the best insights.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Guides */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Feature Guides</h3>
                  <p className="text-muted-foreground">Learn how to use each feature effectively</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Budget Management */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500 p-2 text-white">
                          <FolderPlus className="h-5 w-5" />
                        </div>
                        <CardTitle>Budget Management</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Create budgets</strong> for different purposes (personal, family, projects)
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Choose budget types:</strong> Standard, Saving, Debt, Investment, Sharing
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Archive budgets</strong> when no longer active
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Collaboration */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-500 p-2 text-white">
                          <UserPlus className="h-5 w-5" />
                        </div>
                        <CardTitle>Team Collaboration</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Invite members</strong> by email with specific roles
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Role-based permissions:</strong> Owner, Manager, Contributor, Viewer
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Manage team access</strong> and remove members when needed
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Categories */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-500 p-2 text-white">
                          <Palette className="h-5 w-5" />
                        </div>
                        <CardTitle>Categories</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Create custom categories</strong> for income and expenses
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Customize with colors & icons</strong> for easy identification
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Hide unused categories</strong> to keep forms clean
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Entries */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-500 p-2 text-white">
                          <PlusCircle className="h-5 w-5" />
                        </div>
                        <CardTitle>Transaction Entries</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Quick add entries</strong> from any page
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Filter by type, category, date,</strong> and member
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Edit or delete</strong> your own entries anytime
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comments */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-pink-500 p-2 text-white">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <CardTitle>Comments & Mentions</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Comment on entries</strong> to add context or notes
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Mention team members</strong> with @ to notify them
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Attach images</strong> like receipts or invoices
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transfers */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-cyan-500 p-2 text-white">
                          <Repeat className="h-5 w-5" />
                        </div>
                        <CardTitle>Budget Transfers</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Transfer money</strong> between your budgets
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Automatic entry creation</strong> in both budgets
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Track transfer history</strong> with linked entries
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notifications */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-yellow-500 p-2 text-white">
                          <Bell className="h-5 w-5" />
                        </div>
                        <CardTitle>Notifications</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Get notified</strong> when mentioned in comments
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Budget activity alerts</strong> for important changes
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Mark as read</strong> to keep your inbox organized
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytics */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-500 p-2 text-white">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <CardTitle>Analytics & Reports</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Overview dashboard</strong> with key metrics
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Monthly summaries</strong> with charts and trends
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Category breakdown</strong> to see spending patterns
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Development Roadmap */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Development Roadmap</h3>
                  <p className="text-muted-foreground">Structured development phases for comprehensive financial management</p>
                </div>

                {/* Phase 1 */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500 p-2 text-white">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Phase 1: Enhanced Budget Management</CardTitle>
                          <CardDescription>Budget Types & Entry Enhancements • Q4 2025</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Budget Types:</strong> Personal, Shared, Business, Project budgets with UI badges
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Entry Comments:</strong> Add detailed notes and context to transactions
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Entry Tags:</strong> Flexible tagging system for better organization
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Advanced Filtering:</strong> Filter by tags, comments, and budget types
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Bulk Operations:</strong> Mass edit tags and comments on multiple entries
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phase 2 */}
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-500 p-2 text-white">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Phase 2: Collaborative Finance</CardTitle>
                          <CardDescription>Sharing & Split Management • Q1 2026</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Budget Sharing:</strong> Share budgets with external users (payer system)
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Equal Split:</strong> Automatic expense splitting among participants
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Balance Tracking:</strong> Real-time balance calculations between members
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Settlement System:</strong> Track who owes whom and settlement history
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Split Notifications:</strong> Alerts for new shared expenses and settlements
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phase 3 */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-500 p-2 text-white">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Phase 3: Specialized Financial Profiles</CardTitle>
                          <CardDescription>Advanced Financial Management • Q2 2026</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Savings Tracking:</strong> Dedicated savings goals and progress monitoring
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Debt Management:</strong> Debt tracking with payment schedules and interest
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Investment Portfolio:</strong> Basic investment tracking and performance metrics
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Financial Profiles:</strong> Customizable profiles for different financial behaviors
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Goal Setting:</strong> SMART financial goals with milestone tracking
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phase 4 */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-500 p-2 text-white">
                          <Repeat className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Phase 4: Advanced Operations</CardTitle>
                          <CardDescription>Transaction Safety & Transfers • Q3 2026</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Inter-Budget Transfers:</strong> Safe transfers between budgets with integrity
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Transfer History:</strong> Complete audit trail of all transfers
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Batch Transfers:</strong> Multiple transfers in a single transaction
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Transfer Approval:</strong> Multi-step approval process for large transfers
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Rollback System:</strong> Safe rollback of transfers with proper validation
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phase 5 */}
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-500 p-2 text-white">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Phase 5: Audit & Compliance</CardTitle>
                          <CardDescription>Complete Audit System • Q4 2026</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Comprehensive Audit Log:</strong> Track all important actions and changes
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>User Activity Tracking:</strong> Detailed logs of user interactions
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Data Export:</strong> Export audit logs for compliance and analysis
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Retention Policies:</strong> Configurable data retention and archival
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Compliance Reports:</strong> Generate reports for financial auditing
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Future Enhancements */}
                <Card className="border-l-4 border-l-cyan-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-cyan-500 p-2 text-white">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Future Enhancements</CardTitle>
                          <CardDescription>Advanced Features • 2027+</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">Future</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Mobile Applications:</strong> Native iOS and Android apps
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>API Integrations:</strong> Bank account synchronization and fintech partnerships
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Advanced Analytics:</strong> AI-powered insights and spending predictions
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Multi-Currency:</strong> Advanced currency conversion and international support
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Enterprise Features:</strong> SSO, advanced security, and enterprise-grade features
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TECHNICAL GUIDE TAB */}
            <TabsContent value="technical" className="space-y-12 mt-8">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Technology Stack</h3>
                  <p className="text-muted-foreground">Built with modern, reliable technologies</p>
                </div>

                
                <div className="grid md:grid-cols-3 gap-6">
                  {techStack.map((stack, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <stack.icon className="h-6 w-6 text-primary" />
                          <CardTitle>{stack.category}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {stack.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline">{tech}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Key Features</h3>
                  <p className="text-muted-foreground">Technical capabilities and architecture</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <feature.icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Installation & Setup */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Installation & Setup</h3>
                  <p className="text-muted-foreground">Get Philand running on your machine</p>
                </div>

                {/* Prerequisites */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Prerequisites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Backend Requirements</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Rust 1.70+ (latest stable)</li>
                          <li>• MySQL 8.0+</li>
                          <li>• Cargo & SQLx CLI</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Frontend Requirements</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Node.js 18+</li>
                          <li>• npm or yarn</li>
                          <li>• Modern web browser</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Docker Setup */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Docker Setup (Recommended)
                      </CardTitle>
                      <CardDescription>Easiest way to get started</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1">
                        <div className="text-muted-foreground"># Clone the repository</div>
                        <div>git clone https://github.com/fissama/philand.git</div>
                        <div>cd philand</div>
                        <div className="mt-2 text-muted-foreground"># Configure environment</div>
                        <div>cp .env.example .env</div>
                        <div className="text-muted-foreground"># Edit .env with your settings</div>
                        <div className="mt-2 text-muted-foreground"># Start with Docker</div>
                        <div>docker-compose up -d --build</div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Access at <code className="bg-muted px-1 rounded">http://localhost:3000</code></span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Local Development */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Local Development
                      </CardTitle>
                      <CardDescription>For development and testing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1">
                        <div className="text-muted-foreground"># Setup database</div>
                        <div>./scripts/setup.sh</div>
                        <div className="mt-2 text-muted-foreground"># Start backend (Terminal 1)</div>
                        <div>cargo build --release</div>
                        <div>./target/release/philand</div>
                        <div className="mt-2 text-muted-foreground"># Start frontend (Terminal 2)</div>
                        <div>cd web</div>
                        <div>npm install</div>
                        <div>npm run dev</div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">Backend: <code className="bg-muted px-1 rounded">http://localhost:8080</code></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">Frontend: <code className="bg-muted px-1 rounded">http://localhost:3000</code></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Configuration</h3>
                  <p className="text-muted-foreground">Environment variables and settings</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Environment Variables</CardTitle>
                    <CardDescription>Configure your .env file with these settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1">
                      <div className="text-muted-foreground"># Database</div>
                      <div>DB_URL="mysql://user:password@host:port/database"</div>
                      <div className="mt-2 text-muted-foreground"># JWT Secret</div>
                      <div>JWT_SECRET="your-secret-key-here"</div>
                      <div className="mt-2 text-muted-foreground"># Server</div>
                      <div>SERVER_HOST="0.0.0.0"</div>
                      <div>SERVER_PORT=8080</div>
                      <div className="mt-2 text-muted-foreground"># Optional: S3 Storage</div>
                      <div>AWS_ACCESS_KEY_ID="your-key"</div>
                      <div>AWS_SECRET_ACCESS_KEY="your-secret"</div>
                      <div>AWS_REGION="us-east-1"</div>
                      <div>S3_BUCKET_NAME="your-bucket"</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security & Permissions */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Security & Permissions</h3>
                  <p className="text-muted-foreground">Role-based access control system</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roles.map((role, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">{role.level}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">{role.description}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* API Documentation */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">API Documentation</h3>
                  <p className="text-muted-foreground">RESTful API endpoints</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">POST</Badge>
                        <code>/api/auth/signup</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">POST</Badge>
                        <code>/api/auth/login</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">POST</Badge>
                        <code>/api/auth/logout</code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Budgets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600">GET</Badge>
                        <code>/api/budgets</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">POST</Badge>
                        <code>/api/budgets</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">PUT</Badge>
                        <code>/api/budgets/:id</code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Entries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600">GET</Badge>
                        <code>/api/entries</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">POST</Badge>
                        <code>/api/entries</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-500/10 text-red-600">DELETE</Badge>
                        <code>/api/entries/:id</code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Comments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600">GET</Badge>
                        <code>/api/comments</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">POST</Badge>
                        <code>/api/comments</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">PUT</Badge>
                        <code>/api/comments/:id</code>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">{t('docs.readyToStart')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('docs.joinUsers')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                {t('docs.createFreeAccount')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                {t('auth.login')}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/philand.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="h-9 w-auto transition-transform group-hover:scale-110"
                  priority
                />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Philand
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Modern financial management platform for individuals and teams.
              </p>
              <div className="flex items-center gap-2">
                <ThemeSelector />
                <LanguageSwitcher />
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/signup" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Get Started
                </Link>
                <Link href="/login" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/docs" className="block text-muted-foreground hover:text-foreground transition-colors">
                  {t('docs.documentation')}
                </Link>
                <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </div>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <div className="space-y-2 text-sm">
                <a href="#user-guide" className="block text-muted-foreground hover:text-foreground transition-colors">
                  {t('docs.userGuide')}
                </a>
                <a href="#tech-stack" className="block text-muted-foreground hover:text-foreground transition-colors">
                  {t('docs.techStack')}
                </a>
                <a href="#roadmap" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Roadmap
                </a>
                <a href="https://github.com/fissama/philand" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
              </div>
            </div>

            {/* Community Links */}
            <div id="community" className="space-y-4">
              <h4 className="font-semibold">{t('docs.community')}</h4>
              <div className="space-y-2 text-sm">
                <a href="https://github.com/fissama/philand/discussions" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Discussions
                </a>
                <a href="https://github.com/fissama/philand/issues" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Issues
                </a>
                <a href="mailto:laphi1612@gmail.com" className="block text-muted-foreground hover:text-foreground transition-colors">
                  {t('docs.support')}
                </a>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-2 pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com/fissama/philand" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>MIT License © 2025 Philand Project. {t('docs.allRightsReserved')}</p>
            <p>{t('docs.builtWithLove')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}