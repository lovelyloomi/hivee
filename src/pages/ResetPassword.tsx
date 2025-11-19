import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Verify that we have a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      } else {
        toast({
          title: "Sessione non valida",
          description: "Il link di recupero è scaduto o non valido",
          variant: "destructive"
        });
        navigate("/auth");
      }
    });
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: "Password troppo corta",
        description: "La password deve contenere almeno 6 caratteri",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Le password non coincidono",
        description: "Assicurati che le due password siano identiche",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password aggiornata!",
          description: "La tua password è stata cambiata con successo"
        });
        
        // Redirect to home after successful password reset
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!validSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex items-center justify-center px-4 pt-20">
        <Card className="w-full max-w-md p-8 space-y-6 bg-card border-border">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Imposta Nuova Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Scegli una nuova password sicura per il tuo account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Nuova Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Almeno 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Conferma Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ripeti la password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-background border-border text-foreground"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Aggiornamento..." : "Aggiorna Password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
