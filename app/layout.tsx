import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
export const metadata: Metadata = { title: "StockSense", description: "Inventory management for growing operations" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><div className="flex min-h-screen"><Sidebar /><div className="flex min-w-0 flex-1 flex-col"><Topbar /><main className="flex-1 p-6 lg:p-8">{children}</main></div></div></body></html>; }
