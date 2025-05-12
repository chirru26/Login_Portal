import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Info, Mail, Phone, Lock, User, UserPlus, KeyRound, Eye, EyeOff } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";
import { StarField } from "@/components/star-field";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof insertUserSchema>;

// For CAPTCHA implementation
const generateCaptchaCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [captchaCode, setCaptchaCode] = useState(generateCaptchaCode());
  const [enteredCaptcha, setEnteredCaptcha] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [showAuthCodeField, setShowAuthCodeField] = useState(false);
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Regenerate captcha when needed
  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
    setEnteredCaptcha('');
  };

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  // Login form 
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      captchaToken: "",
    },
  });
  
  // Generate a separate captcha for login
  const [loginCaptchaCode, setLoginCaptchaCode] = useState(generateCaptchaCode());
  const [enteredLoginCaptcha, setEnteredLoginCaptcha] = useState('');
  
  // Refresh login captcha
  const refreshLoginCaptcha = () => {
    setLoginCaptchaCode(generateCaptchaCode());
    setEnteredLoginCaptcha('');
  };

  const onLoginSubmit = (data: LoginFormValues) => {
    // Validate captcha
    if (enteredLoginCaptcha !== loginCaptchaCode) {
      loginForm.setError('captchaToken', { 
        type: 'manual', 
        message: 'CAPTCHA verification failed. Please try again.' 
      });
      refreshLoginCaptcha();
      return;
    }
    
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      captchaToken: "",
      authCode: "",
    },
    mode: "onChange",
  });

  // Update the form when contact method changes
  useEffect(() => {
    if (contactMethod === 'email') {
      registerForm.setValue('phone', '');
    } else {
      registerForm.setValue('email', '');
    }
  }, [contactMethod, registerForm]);

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Validate captcha
    if (enteredCaptcha !== captchaCode) {
      registerForm.setError('captchaToken', { 
        type: 'manual', 
        message: 'CAPTCHA verification failed. Please try again.' 
      });
      refreshCaptcha();
      return;
    }
    
    // Convert form data to proper API request format
    const submissionData = {
      ...data,
      // Include only the contact method that was filled
      email: contactMethod === 'email' ? data.email : '',
      phone: contactMethod === 'phone' ? data.phone : '',
    };
    
    // Submit the registration
    registerMutation.mutate(submissionData, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <StarField />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md transition-all duration-300 animate-in fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 backdrop-blur-sm bg-background/50 p-1 border border-primary/20 shadow-sm">
            <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-indigo-500/80 data-[state=active]:text-white">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/80 data-[state=active]:to-primary/80 data-[state=active]:text-white">
              Create Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border border-primary/20 backdrop-blur-sm bg-background/80 shadow-lg shadow-primary/10">
              <CardHeader className="border-b border-primary/10 pb-6">
                <CardTitle className="text-2xl font-medium text-center bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Welcome Back</CardTitle>
                <CardDescription className="text-center">Please sign in to your account</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <Button variant="link" className="h-auto p-0 text-xs text-primary hover:text-primary/80">
                              Forgot password?
                            </Button>
                          </div>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showLoginPassword ? "text" : "password"} 
                                placeholder="Enter your password" 
                                {...field} 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              tabIndex={-1}
                            >
                              {showLoginPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showLoginPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                    
                    {/* CAPTCHA for login */}
                    <div className="space-y-2 py-1">
                      <FormLabel>Security Verification</FormLabel>
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <div 
                          className="bg-primary/10 font-mono text-sm p-2 tracking-widest flex-1 text-center font-semibold select-none"
                          style={{ 
                            fontFamily: 'monospace', 
                            letterSpacing: '3px',
                            background: 'linear-gradient(to bottom, rgba(var(--primary-rgb), 0.05), rgba(var(--primary-rgb), 0.2))',
                            color: 'var(--primary)'
                          }}
                        >
                          {loginCaptchaCode}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="h-full rounded-none border-l px-3"
                          onClick={refreshLoginCaptcha}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                        </Button>
                      </div>
                      <Input 
                        placeholder="Enter the code above" 
                        value={enteredLoginCaptcha}
                        onChange={(e) => {
                          setEnteredLoginCaptcha(e.target.value);
                          loginForm.setValue('captchaToken', e.target.value);
                        }}
                        className="mt-1"
                      />
                      {loginForm.formState.errors.captchaToken && (
                        <p className="text-sm font-medium text-destructive">
                          {loginForm.formState.errors.captchaToken.message}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={loginMutation.isPending} 
                      className="w-full py-6 bg-gradient-to-r from-primary to-indigo-500 hover:opacity-90 transition-all shadow-md"
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : <Lock className="mr-2 h-4 w-4" />}
                      Sign In
                    </Button>
                    
                    <div className="text-center text-sm mt-6">
                      <span className="text-muted-foreground">Don't have an account?</span>
                      <Button 
                        variant="link" 
                        className="text-primary hover:text-primary/80 font-medium p-0 h-auto" 
                        onClick={() => setActiveTab("register")}
                      >
                        Create account
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="border border-primary/20 backdrop-blur-sm bg-background/80 shadow-lg shadow-primary/10">
              <CardHeader className="border-b border-primary/10 pb-6">
                <CardTitle className="text-2xl font-medium text-center bg-gradient-to-r from-indigo-500 to-primary bg-clip-text text-transparent">Create an Account</CardTitle>
                <CardDescription className="text-center">Sign up to get started</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {/* Name Section */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Username field */}
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 opacity-70" />
                              <span>Username</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Contact Method Selector */}
                    <div className="space-y-2">
                      <FormLabel>Contact Method</FormLabel>
                      <RadioGroup 
                        defaultValue="email" 
                        className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4 pt-1"
                        onValueChange={(value) => setContactMethod(value as 'email' | 'phone')}
                        value={contactMethod}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email" />
                          <label htmlFor="email" className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <Mail className="h-3.5 w-3.5 opacity-70" />
                            Email
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="phone" />
                          <label htmlFor="phone" className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <Phone className="h-3.5 w-3.5 opacity-70" />
                            Phone
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {/* Conditional Contact Field */}
                    {contactMethod === 'email' ? (
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                            <FormDescription className="text-xs">
                              Include country code (e.g., +1 for US)
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Password fields */}
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-1">
                              <Lock className="h-3.5 w-3.5 opacity-70" />
                              <span>Password</span>
                            </div>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showRegisterPassword ? "text" : "password"} 
                                placeholder="Create a strong password" 
                                {...field} 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              tabIndex={-1}
                            >
                              {showRegisterPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showRegisterPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                          <FormDescription className="text-xs">
                            At least 8 characters with mixed case, numbers, and symbols
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Verify your password" 
                                {...field} 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showConfirmPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* CAPTCHA */}
                    <div className="space-y-2 py-2">
                      <FormLabel>CAPTCHA Verification</FormLabel>
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <div 
                          className="bg-primary/10 font-mono text-sm p-2 tracking-widest flex-1 text-center font-semibold select-none"
                          style={{ 
                            fontFamily: 'monospace', 
                            letterSpacing: '3px',
                            background: 'linear-gradient(to bottom, rgba(var(--primary-rgb), 0.05), rgba(var(--primary-rgb), 0.2))',
                            color: 'var(--primary)'
                          }}
                        >
                          {captchaCode}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="h-full rounded-none border-l px-3"
                          onClick={refreshCaptcha}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                        </Button>
                      </div>
                      <Input 
                        placeholder="Enter the code above" 
                        value={enteredCaptcha}
                        onChange={(e) => {
                          setEnteredCaptcha(e.target.value);
                          registerForm.setValue('captchaToken', e.target.value);
                        }}
                        className="mt-2"
                      />
                      {registerForm.formState.errors.captchaToken && (
                        <p className="text-sm font-medium text-destructive">
                          {registerForm.formState.errors.captchaToken.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Authentication Code (Optional) */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center">
                        <FormLabel>Authentication Code</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Enter an authentication code if you were provided one</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="authCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <Input placeholder="Optional: Enter code if provided" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <Button 
                      type="submit" 
                      disabled={registerMutation.isPending} 
                      className="w-full py-6 bg-gradient-to-r from-indigo-500 to-primary hover:opacity-90 transition-all shadow-md"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Create Account
                    </Button>
                    
                    <div className="text-center text-sm mt-2">
                      <span className="text-muted-foreground">Already have an account?</span>
                      <Button 
                        variant="link" 
                        className="text-primary hover:text-primary/80 font-medium p-0 h-auto" 
                        onClick={() => setActiveTab("login")}
                      >
                        Sign in
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
