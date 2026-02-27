import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zone } from "@/lib/types/dashboard";

export default function ZoneHeatmap({ zones }: { zones: Zone[] }) {
    const getColor = (color: string) => {
        switch (color) {
            case 'red': return 'bg-red-500 text-white';
            case 'orange': return 'bg-orange-500 text-white';
            case 'yellow': return 'bg-yellow-400 text-black';
            case 'green': return 'bg-green-500 text-white';
            default: return 'bg-slate-200';
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-card">
            <h3 className="text-sm font-semibold mb-3">Strategic Heatmap</h3>
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                <TooltipProvider>
                    {zones.map((zone) => (
                        <Tooltip key={zone._id}>
                            <TooltipTrigger asChild>
                                <div className={`
                  h-10 w-full rounded flex items-center justify-center 
                  text-[10px] font-bold cursor-pointer hover:opacity-80 transition
                  ${getColor(zone.heatmapColor)}
                `}>
                                    {zone.code}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-xs">
                                    <p className="font-bold">{zone.name}</p>
                                    <p>Deployment: {zone.currentDeployment}</p>
                                    <p>Density: {zone.densityScore}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
        </div>
    );
}