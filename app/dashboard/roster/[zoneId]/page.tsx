import React from 'react';

export default function RosterZonePage({ params }: { params: { zoneId: string } }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Roster Zone Details</h1>
            <p>Details for roster zone ID: {params.zoneId}</p>
        </div>
    );
}
