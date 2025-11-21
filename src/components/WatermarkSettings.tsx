import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const WatermarkSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkStyle, setWatermarkStyle] = useState<'center' | 'repeat' | 'disabled'>('center');
  const [watermarkSections, setWatermarkSections] = useState<string[]>(['profile', 'works', 'gallery']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('watermark_enabled, watermark_style, watermark_sections')
      .eq('id', user.id)
      .single();

    if (data) {
      setWatermarkEnabled(data.watermark_enabled || false);
      setWatermarkStyle((data.watermark_style as 'center' | 'repeat' | 'disabled') || 'center');
      setWatermarkSections(data.watermark_sections || ['profile', 'works', 'gallery']);
    }
  };

  const toggleSection = (section: string) => {
    setWatermarkSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          watermark_enabled: watermarkEnabled,
          watermark_style: watermarkStyle,
          watermark_sections: watermarkSections
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni della filigrana sono state aggiornate"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Filigrana (Watermark)</h2>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="watermark-enabled"
            checked={watermarkEnabled}
            onCheckedChange={(checked) => setWatermarkEnabled(checked as boolean)}
          />
          <Label htmlFor="watermark-enabled">
            Attiva filigrana con il tuo username
          </Label>
        </div>

        {watermarkEnabled && (
          <>
            <div>
              <Label>Stile Filigrana</Label>
              <RadioGroup value={watermarkStyle} onValueChange={(value: any) => setWatermarkStyle(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="center" id="center" />
                  <Label htmlFor="center">Centro (singola)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="repeat" id="repeat" />
                  <Label htmlFor="repeat">Ripetuta</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disabled" id="disabled" />
                  <Label htmlFor="disabled">Disabilitata</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-3 block">Dove applicare la filigrana</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="section-profile"
                    checked={watermarkSections.includes('profile')}
                    onCheckedChange={() => toggleSection('profile')}
                  />
                  <Label htmlFor="section-profile">Immagini del profilo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="section-works"
                    checked={watermarkSections.includes('works')}
                    onCheckedChange={() => toggleSection('works')}
                  />
                  <Label htmlFor="section-works">Opere pubblicate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="section-gallery"
                    checked={watermarkSections.includes('gallery')}
                    onCheckedChange={() => toggleSection('gallery')}
                  />
                  <Label htmlFor="section-gallery">Galleria</Label>
                </div>
              </div>
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </div>
    </Card>
  );
};
