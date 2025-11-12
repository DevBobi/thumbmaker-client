import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useClerk } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordFormValues {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecurityFormProps {
  user: any;
}

export const SecurityForm = ({}: SecurityFormProps) => {
  const { user: clerkUser, openSignIn } = useClerk();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [needsReverification, setNeedsReverification] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormValues>();

  // Check if user has a password set
  const hasPassword = clerkUser?.passwordEnabled;
  
  // Check if user signed in with OAuth (Google, etc.)
  const hasOAuthAccount = clerkUser?.externalAccounts?.some(
    (account) => account.provider === "google"
  );

  const handleReverification = async () => {
    try {
      // Open Clerk sign-in modal for reverification
      await openSignIn?.({
        afterSignInUrl: window.location.href,
      });
    } catch (error) {
      console.error("Reverification error:", error);
      toast({
        title: "Verification failed",
        description: "Please try again or sign out and sign back in",
        variant: "destructive",
      });
    }
  };

  const onSubmitPassword = async (data: PasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!hasPassword) {
        // For OAuth users setting their first password
        // Clerk will automatically trigger reverification via OAuth
        await clerkUser?.updatePassword({
          newPassword: data.newPassword,
          signOutOfOtherSessions: false,
        });

        toast({
          title: "Password created successfully",
          description: "You can now sign in with your email and password",
        });
      } else {
        // For users with existing password
        if (!data.currentPassword) {
          toast({
            title: "Current password required",
            description: "Please enter your current password",
            variant: "destructive",
          });
          return;
        }

        await clerkUser?.updatePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          signOutOfOtherSessions: false,
        });

        toast({
          title: "Password updated successfully",
          description: "Your password has been changed",
        });
      }
      reset();
    } catch (error: any) {
      console.error("Error updating password:", error);
      
      // Handle specific Clerk errors
      const errorCode = error?.errors?.[0]?.code;
      const errorMessage = error?.errors?.[0]?.message || error?.message;
      
      if (errorCode === "session_reverification_required") {
        // Set flag to show reverification UI
        setNeedsReverification(true);
        
        toast({
          title: "Verification Required",
          description: "Please verify your identity with Google to continue",
          variant: "default",
        });
      } else if (errorMessage?.includes("password")) {
        toast({
          title: "Failed to update password",
          description: hasPassword 
            ? "Please check your current password and try again"
            : "Please ensure your password meets the requirements (min 8 characters)",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to update password",
          description: errorMessage || "An error occurred. Please try again",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Password & Security</CardTitle>
        <CardDescription>
          {hasPassword 
            ? "Update your password and security settings."
            : "Set a password to enable email/password sign in."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info alert for OAuth users without password */}
        {hasOAuthAccount && !hasPassword && !needsReverification && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You signed in with Google. Set a password to also enable email/password sign in.
            </AlertDescription>
          </Alert>
        )}

        {/* Reverification required alert */}
        {needsReverification && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="flex flex-col gap-3">
              <div className="text-amber-900 dark:text-amber-100">
                <strong>Identity Verification Required</strong>
                <p className="mt-1">
                  For security reasons, you need to verify your identity with Google before setting a password.
                </p>
              </div>
              <Button 
                onClick={handleReverification} 
                variant="outline" 
                className="w-fit border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900"
              >
                <Shield className="h-4 w-4 mr-2" />
                Verify with Google
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmitPassword)}>
          {/* Only show current password field if user has a password */}
          {hasPassword && (
            <div className="space-y-2 mb-4">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  {...register("currentPassword", {
                    required: hasPassword ? "Current password is required" : false,
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {hasPassword ? "New Password" : "Password"}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword", {
                    required: hasPassword ? "New password is required" : "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {hasPassword ? "Confirm New Password" : "Confirm Password"}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting 
                ? hasPassword ? "Updating..." : "Setting..." 
                : hasPassword ? "Update Password" : "Set Password"}
            </Button>
          </div>
        </form>

        {/* Additional security info */}
        {hasOAuthAccount && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Connected Accounts</p>
                <p>You can sign in using Google OAuth.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
