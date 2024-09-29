import React, { useState, useEffect } from 'react';
import BuildingForm from './BuildingForm';

const BuildingList = () => {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState(null); // Track selected building for editing

    useEffect(() => {
        fetch('/api/v1/buildings')
            .then(response => response.json())
            .then(data => setBuildings(data.buildings || []))
            .catch(error => console.error('Error fetching buildings:', error));
    }, []);

    // Refresh the list after creating or editing
    const refreshBuildings = () => {
        fetch('/api/v1/buildings')
            .then(response => response.json())
            .then(data => {
                setBuildings(data.buildings || []);
                setSelectedBuilding(null); // Exit edit mode after refresh
            })
            .catch(error => console.error('Error fetching buildings:', error));
    };

    return (
        <div>
            <h1>Building List</h1>
            {buildings.length > 0 ? (
                buildings.map((building) => (
                    <div key={building.id} className="building-card">
                        <p><strong>Client Name:</strong> {building.client_name}</p>
                        <p><strong>Address:</strong> {building.address}</p>

                        {Object.keys(building).map((field) => {
                            if (['id', 'client_name', 'address'].includes(field)) return null;
                            return (
                                <p key={field}>
                                    <strong>{field}:</strong> {building[field] || 'N/A'}
                                </p>
                            );
                        })}

                        <button onClick={() => setSelectedBuilding(building)}>Edit</button> {/* Edit button */}
                        <br />
                    </div>
                ))
            ) : (
                <p>No buildings available</p>
            )}

            {/* Building Form for creating or editing a building */}
            <BuildingForm
                building={selectedBuilding} // Pass the selected building for editing
                onSuccess={refreshBuildings}
                key={selectedBuilding ? selectedBuilding.id : 'new'} // Key ensures re-render on form reset
            />
        </div>
    );
};

export default BuildingList;
