import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Aniwheel Privacy Policy - Learn how we protect your data and privacy. We collect anonymous analytics to improve the app, but no personal data that can identify you.",
    openGraph: {
        title: "Privacy Policy | Aniwheel",
        description: "Aniwheel Privacy Policy - Learn how we protect your data and privacy. We collect anonymous analytics to improve the app, but no personal data that can identify you.",
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
                <p className="text-sm text-muted-foreground">Last updated: September 8, 2025</p>
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                <h2 className="text-lg">
                    <span className="font-bold italic">TL;DR</span> We collect anonymous usage analytics to improve the app, but no personal data that can identify you.
                </h2>
            </header>

            <main className="space-y-6">
                <section>
                    <h2 className="text-xl font-bold">Analytics & Usage Data</h2>
                    <p>We use PostHog for anonymous analytics to understand how users interact with our app and improve the user experience. The data collected includes:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Pages visited and features used</li>
                        <li>General usage patterns and performance metrics</li>
                        <li>Error tracking to help us fix bugs</li>
                        <li>Device type and browser information (anonymized)</li>
                    </ul>
                    <p className="mt-2">
                        <strong>Important:</strong> All analytics data is anonymized and cannot be traced back to individual users. We do not collect any personally identifiable information through analytics. You can easily opt out of analytics tracking at any time through the settings menu in the app.
                    </p>
                </section>

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
                    <p>
                        Your personal data (anime lists, preferences) is stored locally on your device and on the servers of AniList and MyAnimeList as required for their operation. Anonymous analytics data is processed by PostHog in compliance with GDPR regulations. We do not store any personally identifiable
                        information on our own servers.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">Third-Party Services</h2>
                    <p>We share data with the following third-party services:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            <strong>AniList and MyAnimeList:</strong> Your account data and media lists (as required for app functionality)
                        </li>
                        <li>
                            <strong>PostHog:</strong> Anonymous usage analytics and error tracking data
                        </li>
                        <li>
                            <strong>Cloudflare:</strong> DDoS protection and proxying (GDPR and HIPAA compliant)
                        </li>
                        <li>
                            <strong>Vercel:</strong> App hosting (GDPR and HIPAA compliant)
                        </li>
                    </ul>
                    <p className="mt-2">No personally identifiable information is shared with PostHog, Cloudflare, or Vercel.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Opt out of analytics tracking through the settings menu in the app</li>
                        <li>Request information about what anonymous data we collect</li>
                        <li>Delete your account data from AniList or MyAnimeList directly through their platforms</li>
                    </ul>
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
