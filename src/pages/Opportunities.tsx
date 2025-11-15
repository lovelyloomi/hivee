import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";

interface Opportunity {
  id: string;
  artistType: string;
  description: string;
  payment: string;
  postedBy: string;
  date: string;
}

const Opportunities = () => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [artistType, setArtistType] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState("");

  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: "1",
      artistType: "Photographer",
      description: "Need a professional photographer for a fashion photoshoot in Milan. 2-day project with editorial focus.",
      payment: "$1,500",
      postedBy: "Fashion Studio Milano",
      date: "2 hours ago"
    },
    {
      id: "2",
      artistType: "Graphic Designer",
      description: "Looking for a creative graphic designer to develop brand identity for a new startup. Logo, color palette, and style guide needed.",
      payment: "$800",
      postedBy: "Tech Startup",
      date: "5 hours ago"
    },
    {
      id: "3",
      artistType: "Illustrator",
      description: "Seeking a talented illustrator for a children's book project. Need 20 full-color illustrations in a whimsical style.",
      payment: "$2,000",
      postedBy: "Publishing House",
      date: "1 day ago"
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistType || !description || !payment) return;

    const newOpportunity: Opportunity = {
      id: Date.now().toString(),
      artistType,
      description,
      payment,
      postedBy: "You",
      date: "Just now"
    };

    setOpportunities([newOpportunity, ...opportunities]);
    setArtistType("");
    setDescription("");
    setPayment("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Post Opportunity
            </Button>
          </div>

          {showForm && (
            <Card className="p-6 mb-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Post a New Opportunity</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Looking for...
                  </label>
                  <Select value={artistType} onValueChange={setArtistType}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select artist type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Photographer">Photographer</SelectItem>
                      <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                      <SelectItem value="Illustrator">Illustrator</SelectItem>
                      <SelectItem value="Videographer">Videographer</SelectItem>
                      <SelectItem value="Animator">Animator</SelectItem>
                      <SelectItem value="3D Artist">3D Artist</SelectItem>
                      <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Job Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the project, requirements, timeline, etc."
                    className="min-h-[120px] bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Payment
                  </label>
                  <Input
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    placeholder="e.g., $500, €1000, Negotiable"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Post Opportunity
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <Card
                key={opportunity.id}
                className="p-6 bg-card border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          Looking for {opportunity.artistType}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Posted by {opportunity.postedBy} • {opportunity.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {opportunity.payment}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground/90 mb-4">{opportunity.description}</p>
                    <Button variant="outline" className="gap-2">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Opportunities;
