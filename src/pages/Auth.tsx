import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useCaptcha } from "@/hooks/useCaptcha";
import { useBehavioralAnalysis } from "@/hooks/useBehavioralAnalysis";
import { Turnstile } from '@marsidev/react-turnstile';
import Header from "@/components/Header";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const turnstileRef = useRef<any>(null);
  const { checkRateLimit } = useRateLimit();
  const { verifyCaptcha, isBypassed } = useCaptcha();
  const { trackInteraction, logSuspiciousActivity, isSuspicious } = useBehavioralAnalysis(
    isLogin ? 'login' : 'signup'
  );

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check honeypot field (bots fill this, humans don't see it)
    if (honeypot) {
      toast({
        title: "Suspicious activity detected",
        variant: "destructive"
      });
      return;
    }
    
    // Check behavioral analysis
    const suspicionScore = await logSuspiciousActivity();
    if (suspicionScore >= 80) {
      toast({
        title: "Suspicious behavior detected",
        description: "Please complete the verification to continue",
        variant: "destructive"
      });
      setShowCaptcha(true);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(isLogin ? 'login' : 'signup');
    if (!rateLimitResult.allowed) {
      toast({
        title: "Rate limit exceeded",
        description: rateLimitResult.message || 'Too many attempts. Please try again later.',
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // CAPTCHA verification for signup or after failed login attempts
    if (!isLogin || (isLogin && loginAttempts >= 2)) {
      if (!captchaToken) {
        toast({
          title: "CAPTCHA required",
          description: "Please complete the CAPTCHA verification",
          variant: "destructive"
        });
        setShowCaptcha(true);
        setLoading(false);
        return;
      }

      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        toast({
          title: "CAPTCHA verification failed",
          description: "Please try again",
          variant: "destructive"
        });
        setCaptchaToken("");
        turnstileRef.current?.reset();
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          // Show CAPTCHA after 2 failed attempts
          if (newAttempts >= 2) {
            setShowCaptcha(true);
          }
          
          toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setLoginAttempts(0);
          setShowCaptcha(false);
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in."
          });
          navigate("/");
        }
      } else {
        if (!fullName.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your full name",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        if (!birthDate) {
          toast({
            title: "Birth date required",
            description: "Please enter your birth date",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        // Check if user is at least 13 years old
        const birthDateObj = new Date(birthDate);
        const age = Math.floor((new Date().getTime() - birthDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 13) {
          toast({
            title: "Age requirement",
            description: "You must be at least 13 years old to sign up",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, birthDate);
        if (error) {
          toast({
            title: "Error signing up",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to SwipeJob"
          });
          setCaptchaToken("");
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
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
      
      <div className="container mx-auto px-4 pt-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md p-8 bg-card border-border">
          <h1 className="text-3xl font-bold text-center mb-6 text-foreground">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      trackInteraction();
                    }}
                    placeholder="John Doe"
                    required={!isLogin}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Birth Date
                  </label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      trackInteraction();
                    }}
                    required={!isLogin}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  trackInteraction();
                }}
                placeholder="you@example.com"
                required
                className="bg-background border-border text-foreground"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  trackInteraction();
                }}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background border-border text-foreground"
              />
            </div>
            
            {/* Honeypot field - hidden from users, bots will fill it */}
            <div className="absolute left-[-9999px]">
              <label htmlFor="website">Website</label>
              <Input
                id="website"
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            
            {/* CAPTCHA - shown for signup or after failed login attempts */}
            {/* Hidden when CAPTCHA is bypassed */}
            {!isBypassed && (!isLogin || showCaptcha) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Security Verification
                </label>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onError={() => {
                    setCaptchaToken("");
                    toast({
                      title: "CAPTCHA error",
                      description: "Please refresh and try again",
                      variant: "destructive"
                    });
                  }}
                />
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Loading..." : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
