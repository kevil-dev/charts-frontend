"use client";
import { Menu } from "lucide-react";

export default function MobileMenuToggle() {
    return (
        <button className="hidden p-1.5 max-md:inline-flex">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open Menu</span>
        </button>
    );
}