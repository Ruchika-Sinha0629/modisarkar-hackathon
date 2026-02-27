import React from 'react';

export default function ZonePage({ params }: { params: { zoneId: string } }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Zone Details</h1>
            <p>Details for zone ID: {params.zoneId}</p>
        </div>
    );
}
