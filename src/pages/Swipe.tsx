import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Heart, Briefcase, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: number;
  company: string;
  position: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  logo: string;
}

const mockJobs: Job[] = [
  {
    id: 1,
    company: "TechStart Inc.",
    position: "Junior Frontend Developer",
    location: "Remote",
    salary: "$45k - $60k",
    description: "Join our dynamic team building cutting-edge web applications. Perfect for recent graduates looking to kickstart their career.",
    requirements: ["React", "TypeScript", "CSS"],
    logo: "🚀"
  },
  {
    id: 2,
    company: "Creative Labs",
    position: "UX/UI Designer",
    location: "New York, NY",
    salary: "$50k - $70k",
    description: "Design beautiful, user-centered experiences for our growing portfolio of products.",
    requirements: ["Figma", "Adobe Creative Suite", "User Research"],
    logo: "🎨"
  },
  {
    id: 3,
    company: "DataFlow Analytics",
    position: "Junior Data Analyst",
    location: "Boston, MA",
    salary: "$55k - $65k",
    description: "Analyze data trends and help drive business decisions through insights.",
    requirements: ["SQL", "Python", "Excel"],
    logo: "📊"
  },
  {
    id: 4,
    company: "Marketing Pro",
    position: "Social Media Coordinator",
    location: "Remote",
    salary: "$40k - $55k",
    description: "Manage social media campaigns and grow our online presence across platforms.",
    requirements: ["Content Creation", "Analytics", "Copywriting"],
    logo: "📱"
  },
  {
    id: 5,
    company: "GreenTech Solutions",
    position: "Sustainability Specialist",
    location: "San Francisco, CA",
    salary: "$50k - $65k",
    description: "Help companies transition to sustainable practices and reduce their carbon footprint.",
    requirements: ["Environmental Science", "Project Management", "Communication"],
    logo: "🌱"
  }
];

const Swipe = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const navigate = useNavigate();

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (currentIndex < jobs.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All jobs swiped - could show completion screen
        setJobs([]);
      }
      setSwipeDirection(null);
    }, 300);
  };

  if (jobs.length === 0 || currentIndex >= jobs.length) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-4">All done!</h2>
          <p className="text-white/90 mb-6">You've reviewed all available positions. Check back soon for more opportunities!</p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-white text-primary hover:bg-white/90"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const currentJob = jobs[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="w-full max-w-md mb-4 relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10"
        >
          ← Back
        </Button>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-md h-[600px] mb-8">
        {/* Background cards for depth effect */}
        {currentIndex + 1 < jobs.length && (
          <div className="absolute inset-0 bg-card rounded-3xl transform scale-95 opacity-50 shadow-card"></div>
        )}
        {currentIndex + 2 < jobs.length && (
          <div className="absolute inset-0 bg-card rounded-3xl transform scale-90 opacity-25 shadow-card"></div>
        )}

        {/* Main card */}
        <div
          className={`absolute inset-0 bg-gradient-card rounded-3xl shadow-card-hover p-6 flex flex-col transition-all duration-300 ${
            swipeDirection === "left"
              ? "transform -translate-x-[150%] -rotate-12 opacity-0"
              : swipeDirection === "right"
              ? "transform translate-x-[150%] rotate-12 opacity-0"
              : ""
          }`}
        >
          {/* Company Logo/Icon */}
          <div className="text-6xl mb-4 text-center">{currentJob.logo}</div>

          {/* Job Info */}
          <div className="flex-1 overflow-y-auto space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">{currentJob.position}</h2>
              <p className="text-lg text-primary font-semibold">{currentJob.company}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{currentJob.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">{currentJob.salary}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                About the role
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{currentJob.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {currentJob.requirements.map((req, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-6 relative z-10">
        <Button
          size="lg"
          onClick={() => handleSwipe("left")}
          className="h-16 w-16 rounded-full bg-white hover:bg-white/90 shadow-lg hover:scale-110 transition-transform"
        >
          <X className="w-8 h-8 text-destructive" />
        </Button>
        <Button
          size="lg"
          onClick={() => handleSwipe("right")}
          className="h-16 w-16 rounded-full bg-accent hover:bg-accent/90 shadow-lg hover:scale-110 transition-transform"
        >
          <Heart className="w-8 h-8 text-white" />
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 text-white/80 text-sm relative z-10">
        {currentIndex + 1} / {jobs.length}
      </div>
    </div>
  );
};

export default Swipe;
