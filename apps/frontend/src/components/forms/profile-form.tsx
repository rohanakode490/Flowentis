"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditUserProfileSchema } from "@/lib/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import api from "@/lib/api";
import useStore from "@/lib/store";
import { User, Mail, ShieldAlert } from "lucide-react";

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const {
    ui: { addToast },
  } = useStore();

  const form = useForm<z.infer<typeof EditUserProfileSchema>>({
    mode: "onChange",
    resolver: zodResolver(EditUserProfileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Tesler's law & Parkinson's law: Auto-fetch existing user details to save user effort
  useEffect(() => {
    let mounted = true;
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted && resp.data?.user) {
          form.reset({
            name: resp.data.user.name || "",
            email: resp.data.user.email || "",
          });
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    };
    fetchUserProfile();
    return () => {
      mounted = false;
    };
  }, [form]);

  const onSubmit = async (values: z.infer<typeof EditUserProfileSchema>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        "/user",
        { name: values.name.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      addToast("Profile updated successfully", "success");
    } catch (err: any) {
      console.error("Update profile error", err);
      addToast(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card className="border border-border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </Card>
    );
  }

  return (
    // Law of Common Region: Enclose related profile settings within a unified card
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Details
        </CardTitle>
        <CardDescription>
          Update your public name and view your primary account email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Law of Proximity: Group label, input, and helper tightly */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Your display name"
                        className="h-10 text-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    This name will appear on your workflow logs and notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={true}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        disabled
                        className="h-10 text-sm bg-muted/50 cursor-not-allowed opacity-80"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Your primary login email is tied to authentication and cannot be changed here.
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Doherty threshold: Instant loading feedback on save */}
            <div className="pt-2">
              <Button
                type="submit"
                className="self-start min-w-[140px]"
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
