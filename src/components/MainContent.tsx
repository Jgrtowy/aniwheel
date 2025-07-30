import { useSettingsStore } from "~/lib/store";
import Filters from "./Filters";
import PlannedList from "./PlannedList";
import SidePanel from "./SidePanel";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";

export default function MainContent() {
    const { backdropEffects } = useSettingsStore();
    const effectClass = backdropEffects ? "backdrop-blur-2xl backdrop-brightness-75 bg-black/20" : "bg-primary-foreground";
    return (
        <div className="p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col-reverse md:flex-row gap-6">
                    <div className="flex-1">
                        <Card className={effectClass}>
                            {/* <CardHeader className="gap-0">
                                <Filters />
                            </CardHeader> */}
                            <CardContent className="space-y-4 p-0">
                                <Filters />
                                <Separator className="my-4" />
                                <PlannedList />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:w-80 flex flex-col gap-4">
                        <SidePanel />
                    </div>
                </div>
            </div>
        </div>
    );
}
