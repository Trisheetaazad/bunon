"use client";
import { Suspense } from "react";
import RegisterForm from "./RegisterForm"; // We will move your logic here

export default function Register() {
  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="text-center py-10">
          <p className="text-gray-500">Loading registration form...</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}