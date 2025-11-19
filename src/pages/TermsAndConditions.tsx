import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, checkProfileCompletion } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted) {
      toast({
        title: "Accettazione richiesta",
        description: "Devi accettare i termini e condizioni per continuare",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true
        })
        .eq('id', user?.id);

      if (error) throw error;

      await checkProfileCompletion();

      toast({
        title: "Benvenuto su HIVEE!",
        description: "Il tuo profilo è stato completato con successo"
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-3xl mx-auto px-4 py-8 pt-24">
        <Card className="p-8 space-y-6 bg-card border-border">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Termini e Condizioni
            </h1>
            <p className="text-muted-foreground">
              Prima di iniziare, leggi e accetta i nostri termini
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-md">
            <h2 className="text-xl font-semibold">1. Accettazione dei Termini</h2>
            <p className="text-sm text-muted-foreground">
              Utilizzando HIVEE, accetti di essere vincolato da questi termini e condizioni. Se non accetti questi termini, non potrai utilizzare il nostro servizio.
            </p>

            <h2 className="text-xl font-semibold">2. Utilizzo del Servizio</h2>
            <p className="text-sm text-muted-foreground">
              HIVEE è una piattaforma per artisti e professionisti creativi. Ti impegni a utilizzare il servizio in modo responsabile e rispettoso degli altri utenti.
            </p>

            <h2 className="text-xl font-semibold">3. Contenuti degli Utenti</h2>
            <p className="text-sm text-muted-foreground">
              Sei responsabile di tutti i contenuti che carichi sulla piattaforma. Garantisci di possedere i diritti necessari per condividere il tuo lavoro e che non viola i diritti di terzi.
            </p>

            <h2 className="text-xl font-semibold">4. Privacy</h2>
            <p className="text-sm text-muted-foreground">
              Rispettiamo la tua privacy. Le informazioni personali saranno utilizzate solo per migliorare la tua esperienza sulla piattaforma e non saranno condivise con terze parti senza il tuo consenso.
            </p>

            <h2 className="text-xl font-semibold">5. Proprietà Intellettuale</h2>
            <p className="text-sm text-muted-foreground">
              Tutti i contenuti che carichi rimangono di tua proprietà. Concedi a HIVEE una licenza non esclusiva per visualizzare il tuo lavoro sulla piattaforma.
            </p>

            <h2 className="text-xl font-semibold">6. Comportamento degli Utenti</h2>
            <p className="text-sm text-muted-foreground">
              È vietato utilizzare la piattaforma per molestie, spam, contenuti offensivi o qualsiasi attività illegale. Ci riserviamo il diritto di sospendere o terminare account che violano questi termini.
            </p>

            <h2 className="text-xl font-semibold">7. Modifiche ai Termini</h2>
            <p className="text-sm text-muted-foreground">
              Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno comunicate agli utenti e entreranno in vigore immediatamente.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accetto i termini e condizioni
            </label>
          </div>

          <Button
            onClick={handleAccept}
            disabled={!accepted || loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Caricamento..." : "Accetta e Continua"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
