"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define strict ranks directly here to avoid missing file import error
const RANKS = ['DGP', 'ADGP', 'IG', 'DIG', 'SP', 'DSP', 'Inspector', 'SI', 'Constable'] as const;

const personnelSchema = z.object({
    name: z.string().min(2, "Name is required"),
    badgeNumber: z.string().min(3, "Badge number is required"),
    rank: z.enum(RANKS),
    homeZone: z.string().optional(),
});

type PersonnelFormValues = z.infer<typeof personnelSchema>;

export default function PersonnelForm() {
    const form = useForm<PersonnelFormValues>({
        resolver: zodResolver(personnelSchema),
        defaultValues: { name: "", badgeNumber: "", rank: "Constable" },
    });

    const onSubmit = (data: PersonnelFormValues) => {
        console.log("Personnel Data:", data);
    };

    return (
        <Card className="max-w-xl mx-auto">
            <CardHeader>
                <CardTitle>Officer Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Officer Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="badgeNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Badge #</FormLabel>
                                        <FormControl>
                                            <Input placeholder="12345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rank"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rank</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Rank" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {RANKS.map((rank) => (
                                                    <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full">Create Profile</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}