"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const settingsSchema = z.object({
    totalForce: z.coerce.number().min(1),
    standbyPercentage: z.coerce.number().min(0).max(100),
    weightSize: z.coerce.number().min(0).max(1),
    weightDensity: z.coerce.number().min(0).max(1),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SystemSettingsForm() {
    const form = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            totalForce: 5000,
            standbyPercentage: 15,
            weightSize: 0.3,
            weightDensity: 0.7,
        },
        mode: "onChange",
    });

    const onSubmit = (data: SettingsFormValues) => {
        const sum = parseFloat((data.weightSize + data.weightDensity).toFixed(1));
        if (sum !== 1.0) {
            form.setError("weightSize", { message: "Weights must sum to 1.0" });
            form.setError("weightDensity", { message: "Weights must sum to 1.0" });
            return;
        }
        console.log("System Config:", data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Global System Parameters</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="totalForce"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Available Force (F)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="5000"
                                                {...field}
                                                // FIX: Explicitly cast value to number
                                                value={field.value as number}
                                            />
                                        </FormControl>
                                        <FormDescription>Total personnel count.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="standbyPercentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Standby Reserve (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="15"
                                                {...field}
                                                // FIX: Explicitly cast value to number
                                                value={field.value as number}
                                            />
                                        </FormControl>
                                        <FormDescription>Percentage kept in global reserve.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">Z-Score Weights</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="weightSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Size Weight (W_s)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    max="1"
                                                    {...field}
                                                    // FIX: Explicitly cast value to number
                                                    value={field.value as number}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="weightDensity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Density Weight (W_d)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    max="1"
                                                    {...field}
                                                    // FIX: Explicitly cast value to number
                                                    value={field.value as number}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Button type="submit" variant="destructive" className="w-full">Update Algorithm Parameters</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}