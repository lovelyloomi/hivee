import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Instagram, Linkedin, Twitter, Globe, GraduationCap, Languages, Briefcase } from "lucide-react";
import { HexagonAvatar } from "@/components/HexagonAvatar";

interface ProfilePreviewProps {
  username: string;
  fullName?: string;
  bio?: string;
  location?: string;
  workImages: string[];
  portfolioUrl?: string;
  instagramUrl?: string;
  behanceUrl?: string;
  artstationUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  artistSpecialization?: string;
  educationLevel?: string;
  languages?: string[];
  yearsOfExperience?: number;
  availabilityStatus?: string;
  preferredWorkTypes?: string[];
  skills?: string[];
  programs?: string[];
}

export const ProfilePreview = ({
  username,
  fullName,
  bio,
  location,
  workImages,
  portfolioUrl,
  instagramUrl,
  behanceUrl,
  artstationUrl,
  linkedinUrl,
  twitterUrl,
  websiteUrl,
  artistSpecialization,
  educationLevel,
  languages,
  yearsOfExperience,
  availabilityStatus,
  preferredWorkTypes,
  skills,
  programs
}: ProfilePreviewProps) => {
  const displayName = fullName || username;
  const avatarImage = workImages[0];

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2 mb-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Anteprima Profilo</h3>
          <p className="text-sm text-muted-foreground">Come vedranno gli altri il tuo profilo</p>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4">
          <HexagonAvatar 
            src={avatarImage}
            fallback={displayName?.[0]?.toUpperCase() || 'U'}
            size="lg"
          />
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            {username && <p className="text-muted-foreground">@{username}</p>}
            {location && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{location}</span>
              </div>
            )}
            {bio && <p className="text-sm text-muted-foreground max-w-md">{bio}</p>}
          </div>
        </div>

        {/* Professional Info */}
        {(artistSpecialization || educationLevel || yearsOfExperience || availabilityStatus) && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="font-semibold text-sm">Informazioni Professionali</h4>
            
            {artistSpecialization && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{artistSpecialization}</span>
              </div>
            )}
            
            {educationLevel && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs">
                  {educationLevel.replace('_', ' ')}
                </Badge>
              </div>
            )}
            
            {yearsOfExperience && (
              <div className="text-sm">
                <strong>Esperienza:</strong> {yearsOfExperience} anni
              </div>
            )}
            
            {availabilityStatus && (
              <Badge variant={availabilityStatus === 'open_to_opportunities' ? 'default' : 'outline'} className="text-xs">
                {availabilityStatus.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Lingue</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Work Types */}
        {preferredWorkTypes && preferredWorkTypes.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="font-semibold text-sm">Tipi di Lavoro Preferiti</h4>
            <div className="flex flex-wrap gap-2">
              {preferredWorkTypes.map((type) => (
                <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="font-semibold text-sm">Competenze</h4>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
              ))}
              {skills.length > 6 && <Badge variant="secondary" className="text-xs">+{skills.length - 6}</Badge>}
            </div>
          </div>
        )}

        {/* Programs */}
        {programs && programs.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="font-semibold text-sm">Software</h4>
            <div className="flex flex-wrap gap-2">
              {programs.slice(0, 6).map((program) => (
                <Badge key={program} variant="outline" className="text-xs">{program}</Badge>
              ))}
              {programs.length > 6 && <Badge variant="outline" className="text-xs">+{programs.length - 6}</Badge>}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(instagramUrl || behanceUrl || artstationUrl || linkedinUrl || twitterUrl || websiteUrl || portfolioUrl) && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="font-semibold text-sm">Collegamenti</h4>
            <div className="grid grid-cols-2 gap-2">
              {instagramUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Instagram className="h-3 w-3" />
                  Instagram
                </div>
              )}
              {behanceUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  Behance
                </div>
              )}
              {artstationUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  ArtStation
                </div>
              )}
              {linkedinUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Linkedin className="h-3 w-3" />
                  LinkedIn
                </div>
              )}
              {twitterUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Twitter className="h-3 w-3" />
                  Twitter/X
                </div>
              )}
              {websiteUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  Website
                </div>
              )}
            </div>
          </div>
        )}

        {/* Work Gallery Preview */}
        {workImages.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="font-semibold text-sm">Galleria ({workImages.length})</h4>
            <div className="grid grid-cols-3 gap-2">
              {workImages.slice(0, 3).map((url, index) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden bg-muted">
                  <img src={url} alt={`Work ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
