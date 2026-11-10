import ProfileForm from "@/components/forms/profile-form";
import Header from "@/components/globals/heading";
import React from "react";

export default function SettingPage() {
  return (
    <Header heading="Settings">
      <div className="flex flex-col gap-8 p-4 md:p-6 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Account Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal profile details and account settings
          </p>
        </div>
        <ProfileForm />
      </div>
    </Header>
  );
}
