import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationBar from "./components/navbar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ServiHub – Connect with Trusted Service Providers",
    description:
        "ServiHub is a platform that links service providers with people who need their services. Find reliable professionals or offer your skills today.",
    keywords: ["ServiHub", "service marketplace", "hire professionals", "find work", "service providers", "freelance services", "local services"],
    openGraph: {
        title: "ServiHub – Connect with Trusted Service Providers",
        description: "Discover, hire, and offer services all in one place. ServiHub connects service providers with those who need them.",
        url: "https://servihub.com", // update when you have your domain
        siteName: "ServiHub",
        images: [
            {
                url: "/og-image.png", // replace with your actual OG image
                width: 1200,
                height: 630,
                alt: "ServiHub platform preview",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "ServiHub – Connect with Trusted Service Providers",
        description: "ServiHub links service providers with clients. Find reliable services or showcase your skills.",
        images: ["/og-image.png"], // replace with your actual image
        creator: "@yourtwitterhandle", // optional
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <NavigationBar />
                {children}
            </body>
        </html>
    );
}
