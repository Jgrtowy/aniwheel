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
        <article className="p-6 max-w-2/3 mx-auto">
            <header>
                <Link href="/" className="inline-block mb-4">
                    <Button size="lg">
                        <ArrowLeft />
                        Back to Home
                    </Button>
                </Link>
                <p className="text-sm text-muted-foreground mb-1">Last updated: August 10, 2025</p>
                <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                <h2 className="text-xl font-bold mb-2">TL;DR We do not collect any personal data - we don't need it for anything.</h2>
            </header>

            <main>
                <section>
                    <h2 className="text-xl font-semibold mt-4 mb-2">Data Sources</h2>
                    <p>This app only interacts with the following services:</p>
                    <ul className="list-disc list-inside space-y-1 my-2">
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
                    <h2 className="text-xl font-semibold mt-4 mb-2">Web privacy & security</h2>
                    <p>We use Cloudflare for DDoS protection, proxying connections, and Vercel for hosting our app. Both of these services are GDPR and HIPAA compliant.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mt-4 mb-2">Data Storage</h2>
                    <p>All your data is stored locally on your device and on the servers of AniList and MyAnimeList (as required for their operation). We do not store any information on our own servers.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mt-4 mb-2">Third-Party Access</h2>
                    <p>We do not share your data with any third parties other than AniList and MyAnimeList. There are no analytics, advertising trackers, or other external services involved.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mt-4 mb-2">Changes to This Policy</h2>
                    <p>If we make changes to this Privacy Policy, it will be indicated in the date at the top of this page. Your continued use of the app means you agree to the updated policy.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mt-4 mb-2">Contact Us</h2>
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
