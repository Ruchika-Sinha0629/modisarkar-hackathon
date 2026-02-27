import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ShiftStatus } from "@/lib/types/dashboard";

interface ShiftCellProps {
    data?: ShiftStatus;
    label: string;
}

export default function ShiftCell({ data, label }: ShiftCellProps) {
    if (!data || data.status === 'Empty') {
        return (
            <div className="h-10 w-full border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-xs text-slate-400 hover:bg-slate-50 cursor-pointer">
                +
            </div>
        );
    }

    const bgColors = {
        Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
        Leave: 'bg-gray-200 text-gray-600 border-gray-300',
        Fatigue_Warning: 'bg-red-100 text-red-800 border-red-200',
        Empty: ''
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className={cn(
                    "h-full w-full p-2 rounded text-xs border cursor-pointer truncate",
                    bgColors[data.status]
                )}>
                    <span className="font-semibold block">{data.officerName || "Assigned"}</span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 text-sm">
                <p className="font-bold mb-1">{label}</p>
                <p>Officer: {data.officerName}</p>
                <p>Status: {data.status}</p>
            </PopoverContent>
        </Popover>
    );
}