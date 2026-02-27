"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data type - replace with actual shared type later
interface ZoneData {
    name: string;
    current: number;
    required: number;
}

interface ZoneDistributionProps {
    data: ZoneData[];
}

export default function ZoneDistribution({ data }: ZoneDistributionProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Force Allocation vs Requirement</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />

                            {/* Required Strength (Background Bar) */}
                            <Bar dataKey="required" name="Safe Threshold" fill="#e2e8f0" radius={[4, 4, 0, 0]} />

                            {/* Actual Deployment (Foreground Bar) */}
                            <Bar dataKey="current" name="Deployed" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.current < entry.required ? '#ef4444' : '#22c55e'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}