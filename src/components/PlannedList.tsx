"use client";
import { useSession } from "next-auth/react";
import React from "react";
import type { PlannedItem } from "~/app/api/[service]/planned/route";

export default function PlannedList() {
    const [plannedList, setPlannedList] = React.useState<PlannedItem[]>([]);
    const { data: session } = useSession();

    React.useEffect(() => {
        if (!session?.provider) return;
        const fetchPlannedList = async () => {
            const response = await fetch(`/api/${session?.provider}/planned`);
            const data = await response.json();
            setPlannedList(data);
        };

        fetchPlannedList();
        console.log(plannedList);
    }, [session?.provider]);

    return (
        <>
            <div>
                <ul>
                    {/* {plannedList.map((item) => (
                        <li key={item.id}>
                            <div>
                                <h3>{item.title}</h3>
                                {item.image && <img src={item.image} alt={item.title} width={100} height={150} />}
                            </div>
                        </li>
                    ))} */}
                </ul>
            </div>
        </>
    );
}
