import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  maxDistance: number;
  setMaxDistance: (value: number) => void;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  selectedPrograms: string[];
  setSelectedPrograms: (programs: string[]) => void;
  category?: string;
  setCategory?: (value: string) => void;
  locationEnabled?: boolean;
}

const commonSkills = [
  "3D Modeling", "Animation", "Texturing", "Rigging", "Lighting",
  "Compositing", "VFX", "Character Design", "Environment Design",
  "Concept Art", "Illustration", "Digital Painting", "UI/UX Design",
  "Motion Graphics", "Video Editing", "Game Design", "Sculpting"
];

const commonPrograms = [
  // 3D Software
  "Blender", "Maya", "3ds Max", "Cinema 4D", "Houdini", "ZBrush",
  // Adobe Suite
  "Adobe Photoshop", "Adobe Illustrator", "Adobe After Effects", "Adobe Premiere Pro",
  "Adobe InDesign", "Adobe XD", "Adobe Animate", "Adobe Substance Painter",
  "Adobe Substance Designer", "Adobe Dimension",
  // Painting & Drawing
  "Procreate", "Clip Studio Paint", "Krita", "ArtRage", "Corel Painter",
  // Game Engines
  "Unreal Engine", "Unity", "Godot", "CryEngine",
  // Other Tools
  "Substance Painter", "Marvelous Designer", "SpeedTree", "Mudbox",
  "SketchUp", "Rhino", "KeyShot", "V-Ray", "Arnold", "Redshift",
  "Octane Render", "Affinity Designer", "Affinity Photo"
];

const categories = [
  "3D Character Artist", "3D Environment Artist", "3D Animator",
  "Technical Artist", "VFX Artist", "Concept Artist"
];

export const SearchFilters = ({
  searchQuery,
  setSearchQuery,
  maxDistance,
  setMaxDistance,
  selectedSkills,
  setSelectedSkills,
  selectedPrograms,
  setSelectedPrograms,
  category,
  setCategory,
  locationEnabled
}: SearchFiltersProps) => {
  const toggleSkill = (skill: string) => {
    setSelectedSkills(
      selectedSkills.includes(skill)
        ? selectedSkills.filter(s => s !== skill)
        : [...selectedSkills, skill]
    );
  };

  const toggleProgram = (program: string) => {
    setSelectedPrograms(
      selectedPrograms.includes(program)
        ? selectedPrograms.filter(p => p !== program)
        : [...selectedPrograms, program]
    );
  };

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <div>
        <Label htmlFor="search" className="text-sm font-medium">
          Refine Search
        </Label>
        <Input
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or bio..."
          className="mt-2"
        />
      </div>

      {locationEnabled && (
        <div>
          <Label>Distance: {maxDistance} km</Label>
          <Slider
            value={[maxDistance]}
            onValueChange={(value) => setMaxDistance(value[0])}
            min={1}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>
      )}

      {setCategory && (
        <div>
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={category === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategory(category === cat ? "" : cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label>Skills</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {commonSkills.map((skill) => (
            <Badge
              key={skill}
              variant={selectedSkills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
              {selectedSkills.includes(skill) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Programs</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {commonPrograms.map((program) => (
            <Badge
              key={program}
              variant={selectedPrograms.includes(program) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleProgram(program)}
            >
              {program}
              {selectedPrograms.includes(program) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => {
          setSearchQuery("");
          setSelectedSkills([]);
          setSelectedPrograms([]);
          if (setCategory) setCategory("");
          setMaxDistance(50);
        }}
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );
};
