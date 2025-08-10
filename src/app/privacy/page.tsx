import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function page() {
    return (
        <div className="p-6 max-w-1/2">
            <Link href="/" className="underline flex items-center">
                <ArrowLeft className="mr-2" />
                Back to Home
            </Link>
            <p className="text-sm text-gray-400 mb-2">Last updated: August 10, 2025</p>
            <h3 className="text-xl font-bold mb-2">TL;DR We do not collect any personal data.</h3>
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

            <h2 className="text-xl font-semibold mt-4 mb-2">Web privacy & security</h2>
            <p>We use Cloudflare for DDoS protection, proxying connections, and Vercel for hosting our app. Both of these services are GDPR and HIPAA compliant.</p>

            <h2 className="text-xl font-semibold mt-4 mb-2">Data Storage</h2>
            <p>All your data is stored locally on your device and on the servers of AniList and MyAnimeList (as required for their operation). We do not store any information on our own servers.</p>

            <h2 className="text-xl font-semibold mt-4 mb-2">Third-Party Access</h2>
            <p>We do not share your data with any third parties other than AniList and MyAnimeList. There are no analytics, advertising trackers, or other external services involved.</p>

            <h2 className="text-xl font-semibold mt-4 mb-2">Changes to This Policy</h2>
            <p>If we make changes to this Privacy Policy, we will update the date and show a notification for 2 weeks after the change. Your continued use of the app means you agree to the updated policy.</p>

            <h2 className="text-xl font-semibold mt-4 mb-2">Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us.</p>
        </div>
    );
}
