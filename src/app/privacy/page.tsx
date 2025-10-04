import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Aniwheel Privacy Policy - Learn how we protect your data and privacy. We don't collect personal data and only interact with AniList and MyAnimeList APIs.",
    openGraph: {
        title: "Privacy Policy | Aniwheel",
        description: "Aniwheel Privacy Policy - Learn how we protect your data and privacy. We don't collect personal data and only interact with AniList and MyAnimeList APIs.",
    },
    robots: { index: true, follow: true },
};

export default function PrivacyPage() {
    return (
        <article className="p-6 w-full max-w-5xl mx-auto">
            <header className="mb-6 space-y-2">
                <Link href="/" className="inline-block mb-4">
                    <Button size="lg">
                        <ArrowLeft />
                        Go back to Aniwheel
                    </Button>
                </Link>
                <p className="text-sm text-muted-foreground">Last updated: October 04, 2025</p>
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                <h2 className="text-lg">
                    <span className="font-bold italic">TL;DR</span> We do not collect any personal data - we don't need it for anything.
                </h2>
            </header>

            <main className="space-y-6">
                <section>
                    <h2 className="text-xl font-bold">Data Sources</h2>
                    <p>This app only interacts with the following services:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            <strong>AniList API</strong>
                        </li>
                        <li>
                            <strong>MyAnimeList API</strong>
                        </li>
                    </ul>
                    <p>We use both of these services API's for brief purpose, such as retrieving your account data, fetching content or updates, updating your account's media list.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">Web privacy & security</h2>
                    <p>We use Cloudflare for DDoS protection, proxying connections, and Vercel for hosting our app. Both of these services are GDPR and HIPAA compliant.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">Data Storage</h2>
                    <p>All your data is stored locally on your device and on the servers of AniList and MyAnimeList (as required for their operation). We do not store any information on our own servers.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">Third-Party Access</h2>
                    <p>We do not share your data with any third parties other than AniList and MyAnimeList. There are no analytics, advertising trackers, or other external services involved.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">Changes to This Policy</h2>
                    <p>If we make changes to this Privacy Policy, it will be indicated in the date at the top of this page. Your continued use of the app means you agree to the updated policy.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">Contact Us</h2>
                    <p>
                        If you have any questions or concerns about this Privacy Policy, please{" "}
                        <a href="https://github.com/Jgrtowy/aniwheel" className="underline" target="_blank" rel="noopener noreferrer">
                            contact us
                        </a>
                        .
                    </p>
                </section>
            </main>
        </article>
    );
}
