import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface OpportunityFiltersProps {
  artistType: string;
  setArtistType: (value: string) => void;
  workType: string;
  setWorkType: (value: string) => void;
  maxDistance: number;
  setMaxDistance: (value: number) => void;
  locationEnabled?: boolean;
  showDownloadable?: boolean;
  setShowDownloadable?: (value: boolean) => void;
  showAiMade?: boolean;
  setShowAiMade?: (value: boolean) => void;
}

const artistTypes = [
  "Graphic Designer",
  "Illustrator",
  "3D Artist",
  "Animator",
  "UI/UX Designer",
  "Character Designer",
  "Environment Artist",
  "Concept Artist",
  "VFX Artist",
  "Motion Designer"
];

const workTypes = [
  { value: "all", label: "All Types" },
  { value: "commission", label: "Commission" },
  { value: "part_time", label: "Part-Time" },
  { value: "full_time", label: "Full-Time" }
];

export const OpportunityFilters = ({
  artistType,
  setArtistType,
  workType,
  setWorkType,
  maxDistance,
  setMaxDistance,
  locationEnabled,
  showDownloadable,
  setShowDownloadable,
  showAiMade,
  setShowAiMade
}: OpportunityFiltersProps) => {
  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border border-border">
      <div>
        <Label className="text-sm font-medium mb-3 block">Artist Type</Label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={artistType === "" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setArtistType("")}
          >
            All Types
          </Badge>
          {artistTypes.map((type) => (
            <Badge
              key={type}
              variant={artistType === type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setArtistType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Work Type</Label>
        <Select value={workType} onValueChange={setWorkType}>
          <SelectTrigger>
            <SelectValue placeholder="Select work type" />
          </SelectTrigger>
          <SelectContent>
            {workTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {locationEnabled && (
        <div>
          <Label className="text-sm font-medium">Distance: {maxDistance} km</Label>
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

      {setShowDownloadable && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-downloadable"
            checked={showDownloadable}
            onCheckedChange={(checked) => setShowDownloadable(checked as boolean)}
          />
          <Label htmlFor="show-downloadable" className="cursor-pointer">
            Solo opere scaricabili
          </Label>
        </div>
      )}

      {setShowAiMade && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-ai-made"
            checked={showAiMade}
            onCheckedChange={(checked) => setShowAiMade(checked as boolean)}
          />
          <Label htmlFor="show-ai-made" className="cursor-pointer">
            Mostra opere create con AI
          </Label>
        </div>
      )}
    </div>
  );
};
