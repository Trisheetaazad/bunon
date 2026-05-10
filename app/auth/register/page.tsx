"use client";
import { Suspense } from "react";
import RegisterForm from "./RegisterForm"; // We will move your logic here
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function Register() {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="text-center py-10">
          <p className="text-gray-500">{t("Loading registration form...", "রেজিস্ট্রেশন ফর্ম লোড হচ্ছে...")}</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}