import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Header from "@/components/Header";

interface Match {
  id: string;
  company: string;
  position: string;
  logo: string;
  lastMessage: string;
  timestamp: string;
}

const Matches = () => {
  const navigate = useNavigate();
  const [matches] = useState<Match[]>([
    {
      id: "1",
      company: "TechCorp",
      position: "Junior Developer",
      logo: "💻",
      lastMessage: "We'd love to chat about your portfolio!",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      company: "StartupHub",
      position: "UX Designer Intern",
      logo: "🎨",
      lastMessage: "When are you available for an interview?",
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      company: "GrowthLabs",
      position: "Marketing Assistant",
      logo: "📈",
      lastMessage: "Thanks for your interest!",
      timestamp: "1 day ago",
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-2xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Your Matches
          </h1>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <Card
              key={match.id}
              className="p-6 cursor-pointer hover:shadow-card-hover transition-shadow"
              onClick={() => navigate(`/chat/${match.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{match.logo}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    {match.company}
                  </h3>
                  <p className="text-sm bg-gradient-primary bg-clip-text text-transparent font-medium">
                    {match.position}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {match.lastMessage}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {match.timestamp}
                  </p>
                </div>
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Matches;
