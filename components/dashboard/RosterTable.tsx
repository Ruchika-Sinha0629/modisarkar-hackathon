import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import ShiftCell from "./ShiftCell";
import { DailyRoster } from "@/lib/types/dashboard";

export default function RosterTable({ schedule }: { schedule: DailyRoster[] }) {
    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead>Morning (06-14)</TableHead>
                        <TableHead>Evening (14-22)</TableHead>
                        <TableHead>Night (22-06)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedule.map((day, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-medium text-xs">
                                {format(day.date, "EEE, MMM d")}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {day.shifts.morning.map((s, idx) => <ShiftCell key={idx} data={s} label="Morning" />)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {day.shifts.evening.map((s, idx) => <ShiftCell key={idx} data={s} label="Evening" />)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {day.shifts.night.map((s, idx) => <ShiftCell key={idx} data={s} label="Night" />)}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}