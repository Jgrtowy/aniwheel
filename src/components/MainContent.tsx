import { useSettingsStore } from "~/lib/store";
import Filters from "./Filters";
import PlannedList from "./PlannedList";
import SidePanel from "./SidePanel";
import { SpinWheel } from "./SpinWheel";
import { Card, CardContent, CardHeader } from "./ui/card";

export default function MainContent() {
    const { backdropEffects } = useSettingsStore();
    const effectClass = backdropEffects ? "backdrop-blur-2xl backdrop-brightness-75 bg-black/20" : "bg-primary-foreground";
    return (
        <div className="p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col-reverse md:flex-row gap-6">
                    <div className="flex-1">
                        <Card className={effectClass}>
                            <CardHeader>
                                <Filters />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <PlannedList />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:w-80 flex flex-col gap-4">
                        <SidePanel />
                    </div>
                </div>
            </div>
            <SpinWheel />
        </div>
    );
}
