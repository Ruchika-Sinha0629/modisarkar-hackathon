"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Zap, Activity } from "lucide-react";
import { Zone } from "@/lib/types/dashboard";

interface IncidentPanelProps {
    zones: Zone[];
}

export default function IncidentPanel({ zones }: IncidentPanelProps) {
    const [selectedZone, setSelectedZone] = useState<string>("");
    const [intensity, setIntensity] = useState<number[]>([5]);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        if (!selectedZone) return;
        setLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            setLoading(false);
            alert(`Incident triggered in zone ${selectedZone} with intensity +${intensity[0]}`);
        }, 1000);
    };

    return (
        <Card className="border-red-100 dark:border-red-900">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-red-600">
                    <Activity className="h-5 w-5" />
                    <CardTitle>Incident Simulator</CardTitle>
                </div>
                <CardDescription>Trigger density spikes to test auto-resolution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Target Zone</label>
                    <Select onValueChange={setSelectedZone}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Zone..." />
                        </SelectTrigger>
                        <SelectContent>
                            {zones.map((z) => (
                                <SelectItem key={z._id} value={z._id}>{z.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium">Spike Intensity (ΔD)</label>
                        <span className="font-bold text-red-600">+{intensity}</span>
                    </div>
                    <Slider
                        value={intensity}
                        onValueChange={setIntensity}
                        max={10}
                        min={1}
                        step={1}
                        className="cursor-pointer"
                    />
                </div>

                <Button
                    onClick={handleSimulate}
                    disabled={loading || !selectedZone}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                    {loading ? "Calculations Pending..." : (
                        <><Zap className="mr-2 h-4 w-4" /> Trigger Incident</>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}