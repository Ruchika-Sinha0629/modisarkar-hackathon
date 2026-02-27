import React from 'react';

export default function OfficerPage({ params }: { params: { officerId: string } }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Officer Details</h1>
            <p>Details for officer ID: {params.officerId}</p>
        </div>
    );
}
