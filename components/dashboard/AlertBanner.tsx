import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AlertBannerProps {
    type: 'critical' | 'warning' | 'success';
    title: string;
    message: string;
}

export default function AlertBanner({ type, title, message }: AlertBannerProps) {
    const config = {
        critical: {
            variant: "destructive" as const,
            icon: AlertCircle,
            // FIX: Added empty className so all objects have the same shape
            className: ""
        },
        warning: {
            variant: "default" as const,
            className: "border-yellow-500 text-yellow-700 bg-yellow-50",
            icon: AlertTriangle
        },
        success: {
            variant: "default" as const,
            className: "border-green-500 text-green-700 bg-green-50",
            icon: CheckCircle2
        },
    };

    const { variant, icon: Icon, className } = config[type];

    return (
        <Alert variant={variant} className={className}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}