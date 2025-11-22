import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email richiesta",
        description: "Inserisci la tua email per recuperare la password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Email inviata!",
          description: "Controlla la tua casella di posta per il link di recupero password"
        });
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

  return (
    <div className="min-h-screen bg-background pt-16">
      <Header />
      
      <div className="flex items-center justify-center px-4 pt-20">
        <Card className="w-full max-w-md p-8 space-y-6 bg-card border-border">
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna al login
          </Button>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Recupera Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Inserisci la tua email per ricevere il link di recupero password
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Invio in corso..." : "Invia link di recupero"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-foreground">
                  Ti abbiamo inviato un'email a <strong>{email}</strong> con le istruzioni per recuperare la password.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Non hai ricevuto l'email? Controlla la cartella spam o riprova tra qualche minuto.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
