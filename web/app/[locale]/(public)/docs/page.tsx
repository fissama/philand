"use client";

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
  Settings,
  TrendingUp,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeSelector } from '@/components/features/shared/theme-selector';
import { LanguageSwitcher } from '@/components/features/shared/language-switcher';

export default function DocsPage() {
  const t = useTranslations();

  // Function to handle learn more clicks
  const handleLearnMore = (categoryTitle: string) => {
    // Map category titles to section IDs
    const sectionMap: Record<string, string> = {
      [t('docs.budgetManagement')]: 'features',
      [t('docs.teamCollaboration')]: 'security-permissions',
      [t('docs.advancedFeatures')]: 'tech-stack',
      [t('docs.bestPractices')]: 'quick-start',
      [t('docs.troubleshooting')]: 'community'
    };

    const sectionId = sectionMap[categoryTitle];
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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

  const gettingStartedSteps = [
    {
      step: 1,
      title: t('docs.step1Title'),
      description: t('docs.step1Description'),
      icon: Users
    },
    {
      step: 2,
      title: t('docs.step2Title'),
      description: t('docs.step2Description'),
      icon: Settings
    },
    {
      step: 3,
      title: t('docs.step3Title'),
      description: t('docs.step3Description'),
      icon: Target
    },
    {
      step: 4,
      title: t('docs.step4Title'),
      description: t('docs.step4Description'),
      icon: TrendingUp
    },
    {
      step: 5,
      title: t('docs.step5Title'),
      description: t('docs.step5Description'),
      icon: BarChart3
    }
  ];

  const guideCategories = [
    {
      title: t('docs.budgetManagement'),
      description: t('docs.budgetManagementDescription'),
      icon: Target,
      color: 'bg-blue-500'
    },
    {
      title: t('docs.teamCollaboration'),
      description: t('docs.teamCollaborationDescription'),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: t('docs.advancedFeatures'),
      description: t('docs.advancedFeaturesDescription'),
      icon: Zap,
      color: 'bg-purple-500'
    },
    {
      title: t('docs.bestPractices'),
      description: t('docs.bestPracticesDescription'),
      icon: Lightbulb,
      color: 'bg-yellow-500'
    },
    {
      title: t('docs.troubleshooting'),
      description: t('docs.troubleshootingDescription'),
      icon: AlertCircle,
      color: 'bg-red-500'
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

        {/* User Guide Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">{t('docs.userGuide')}</h2>
            <p className="text-muted-foreground">{t('docs.userGuideDescription')}</p>
          </div>

          {/* Getting Started Steps */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">{t('docs.gettingStartedGuide')}</h3>
              <p className="text-muted-foreground">{t('docs.gettingStartedDescription')}</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gettingStartedSteps.map((step, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Guide Categories */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">{t('docs.learnMore')}</h3>
              <p className="text-muted-foreground">Explore detailed guides for different aspects of Philand</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guideCategories.map((category, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${category.color} text-white`}>
                        <category.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{category.description}</CardDescription>
                    <div className="mt-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 group-hover:gap-3 transition-all"
                        onClick={() => handleLearnMore(category.title)}
                      >
                        {t('docs.learnMore')}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="py-8">
          <Separator />
        </div>

        {/* Technical Documentation Section */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Technical Documentation</h2>
            <p className="text-muted-foreground">Developer resources and technical specifications</p>
          </div>

          {/* Features Section */}
          <div id="features" className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">{t('docs.keyFeatures')}</h3>
              <p className="text-muted-foreground">{t('docs.featuresDescription')}</p>
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

          {/* Tech Stack Section */}
          <div id="tech-stack" className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">{t('docs.techStack')}</h3>
              <p className="text-muted-foreground">{t('docs.techStackDescription')}</p>
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

          {/* Security & Roles Section */}
          <div id="security-permissions" className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">{t('docs.securityPermissions')}</h3>
              <p className="text-muted-foreground">{t('docs.securityDescription')}</p>
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

          {/* Quick Start Section */}
          <div id="quick-start" className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">{t('docs.quickStart')}</h3>
              <p className="text-muted-foreground">{t('docs.quickStartDescription')}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {t('docs.dockerSetup')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <div>git clone https://github.com/fissama/philand.git</div>
                    <div>cd philand</div>
                    <div>cp .env.example .env</div>
                    <div>docker-compose up -d --build</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access the app at http://localhost:3000
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {t('docs.localDevelopment')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <div>cargo sqlx migrate run</div>
                    <div>cargo run</div>
                    <div>cd web && npm install</div>
                    <div>npm run dev</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Backend: :8080, Frontend: :3000
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
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