import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Heart, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArtistOfTheMonth } from "@/components/ArtistOfTheMonth";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profileCompleted, loading } = useAuth();

  // Redirect to onboarding if profile not completed
  useEffect(() => {
    if (!loading && user && profileCompleted === false) {
      navigate('/onboarding');
    }
  }, [user, profileCompleted, loading, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20">
      <Header />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 pt-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-muted rounded-full text-muted-foreground text-sm font-medium mb-4">
            🚀 The Future of Job Hunting
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-primary bg-clip-text text-transparent">
            Swipe Your Way to<br />
            Your Dream Job
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Skip the endless scrolling. Find opportunities that match your skills with a simple swipe. Right for yes, left for pass.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!user ? (
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary text-white hover:opacity-90 px-8 py-6 text-lg rounded-full shadow-card hover:shadow-card-hover transition-all hover:scale-105 group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate("/swipe")}
                className="bg-gradient-primary text-white hover:opacity-90 px-8 py-6 text-lg rounded-full shadow-card hover:shadow-card-hover transition-all hover:scale-105 group"
              >
                Start Swiping
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/opportunities")}
              className="px-8 py-6 text-lg rounded-full"
            >
              View Opportunities
            </Button>
          </div>
        </div>
      </div>

      {/* Artist of the Month Section */}
      <ArtistOfTheMonth />

      {/* Features Section */}
      <div className="relative z-10 px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full animate-slide-in">
          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-card-hover transition-all hover:scale-105 shadow-card">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Review dozens of job opportunities in minutes, not hours
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-card-hover transition-all hover:scale-105 shadow-card">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">Perfect Matches</h3>
            <p className="text-muted-foreground">
              Smart algorithm shows you jobs that fit your skills and goals
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-card-hover transition-all hover:scale-105 shadow-card">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">Career Growth</h3>
            <p className="text-muted-foreground">
              Discover opportunities from startups to established companies
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
