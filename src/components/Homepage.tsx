"use client";
import React from "react";
import Aurora from "~/components/Aurora";
import Header from "~/components/Header";
import MainContent from "~/components/MainContent";
import RepoLink from "~/components/RepoLink";
import useMediaQuery from "~/hooks/useMediaQuery";

export default function Homepage() {
    const isDesktop = useMediaQuery("(width >= 40rem)");

    return (
        <>
            <div className="fixed top-0 w-[200%] sm:h-full sm:w-full -z-10 pointer-events-none">
                <Aurora colorStops={isDesktop ? ["#1100c8", "#b33796", "#a410ff"] : ["#1100c8", "#b33796"]} blend={0.75} amplitude={0.75} speed={0.5} />
            </div>
            <Header />
            <MainContent />
            <RepoLink className="fixed bottom-4 right-4" />
        </>
    );
}
