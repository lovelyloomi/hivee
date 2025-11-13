import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { Upload, Briefcase, Award, MapPin } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
          Your Profile
        </h1>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                JD
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Profile Picture</h3>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </Card>

          {/* Basic Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="New York, NY" />
              </div>
            </div>
          </Card>

          {/* Professional Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Professional Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" placeholder="Frontend Developer" />
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="React, TypeScript, CSS..."
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell companies about yourself..."
                  rows={4}
                />
              </div>
            </div>
          </Card>

          {/* CV/Portfolio */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              CV & Portfolio
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cv">Upload CV</Label>
                <div className="mt-2">
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button className="w-full bg-gradient-primary text-white hover:opacity-90">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
