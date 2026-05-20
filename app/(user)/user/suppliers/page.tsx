"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuppliersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/user/ecosystem/suppliers");
  }, [router]);
  return null;
}
