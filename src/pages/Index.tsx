import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Heart, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
            🚀 The Future of Job Hunting
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Swipe Your Way to<br />
            <span className="text-accent">Your Dream Job</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Skip the endless scrolling. Find opportunities that match your skills with a simple swipe. Right for yes, left for pass.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/swipe")}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
            >
              Start Swiping
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg rounded-full"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full animate-slide-in">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/15 transition-all hover:scale-105 shadow-card">
            <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
            <p className="text-white/80">
              Review dozens of job opportunities in minutes, not hours
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/15 transition-all hover:scale-105 shadow-card">
            <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Perfect Matches</h3>
            <p className="text-white/80">
              Smart algorithm shows you jobs that fit your skills and goals
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/15 transition-all hover:scale-105 shadow-card">
            <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Career Growth</h3>
            <p className="text-white/80">
              Discover opportunities from startups to established companies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
