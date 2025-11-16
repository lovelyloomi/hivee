import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    title: "Welcome to ArtistConnect!",
    description: "Let's take a quick tour to help you get started on your creative journey.",
    action: null
  },
  {
    title: "Complete Your Profile",
    description: "Add your bio, skills, and portfolio to showcase your work and attract opportunities.",
    action: "/profile"
  },
  {
    title: "Upload Your Work",
    description: "Share your creations with the community. Upload 3D models, animations, or other artwork.",
    action: "/works"
  },
  {
    title: "Enable Location",
    description: "Find nearby artists and opportunities by enabling location services.",
    action: "/profile"
  },
  {
    title: "Start Swiping",
    description: "Discover and connect with other artists. Swipe right on profiles you're interested in!",
    action: "/find"
  },
  {
    title: "Explore Opportunities",
    description: "Browse job opportunities and collaborations posted by the community.",
    action: "/opportunities"
  }
];

export const OnboardingTutorial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user) {
      checkOnboarding();
    }
  }, [user]);

  const checkOnboarding = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user?.id)
      .single();

    if (data && !data.onboarding_completed) {
      setOpen(true);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await markComplete();
    setOpen(false);
  };

  const handleComplete = async () => {
    await markComplete();
    const lastStep = steps[steps.length - 1];
    if (lastStep.action) {
      navigate(lastStep.action);
    }
    setOpen(false);
  };

  const markComplete = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.action) {
      setOpen(false);
      navigate(step.action);
    } else {
      handleNext();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
          <div className="flex gap-1 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleAction} className="flex-1">
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
