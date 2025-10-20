import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { useClerk } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  company: string;
}

interface ProfileFormProps {
  user: any;
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const { user: clerkUser } = useClerk();
  const { toast } = useToast();
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      company: (user?.unsafeMetadata?.company as string) || "",
    },
  });

  // Reset form when user data changes
  React.useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        company: (user.unsafeMetadata?.company as string) || "",
      });
    }
  }, [user, reset]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clerkUser) return;

    setIsUploadingAvatar(true);
    try {
      await clerkUser.setProfileImage({ file });
      toast({
        title: "Avatar updated successfully",
        description: "Your profile picture has been updated",
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Failed to update avatar",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await clerkUser?.update({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      await clerkUser?.update({
        unsafeMetadata: {
          ...user?.unsafeMetadata,
          company: data.company,
        },
      });

      toast({
        title: "Profile updated successfully",
        description: "Your profile has been updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details and preferences.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.imageUrl} alt="User" />
                <AvatarFallback>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid gap-4 w-full">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  value={user?.emailAddresses[0]?.emailAddress || ""}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input {...register("company")} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end mt-4">
          <Button type="submit" variant="brand" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
