import React from 'react';

export default function ZoneConfigurePage({ params }: { params: { zoneId: string } }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Configure Zone</h1>
            <p>Configuration for zone ID: {params.zoneId}</p>
        </div>
    );
}
