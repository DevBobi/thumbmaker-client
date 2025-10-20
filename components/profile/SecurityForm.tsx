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
import { Eye, EyeOff, Shield } from "lucide-react";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecurityFormProps {
  user: any;
}

export const SecurityForm = ({ user }: SecurityFormProps) => {
  const { user: clerkUser } = useClerk();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormValues>();

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
      await clerkUser?.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast({
        title: "Password updated successfully",
        description: "Your password has been changed",
      });
      reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Failed to update password",
        description: "Please check your current password and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Password & Security</CardTitle>
        <CardDescription>
          Manage your password and security settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.primaryEmailAddress?.verification.strategy === "email_code" ? (
          <form onSubmit={handleSubmit(onSubmitPassword)}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  {...register("currentPassword", {
                    required: "Current password is required",
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    {...register("newPassword", {
                      required: "New password is required",
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: "Please confirm your new password",
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
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You are signed in with Google. Password management is handled
                through your Google account.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
