import React, { useState, useEffect } from 'react';
import BuildingForm from './BuildingForm';

const BuildingList = () => {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetch(`/api/v1/buildings?page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                setBuildings(data.buildings || []);
                setTotalPages(data.total_pages);
            })
            .catch(error => console.error('Error fetching buildings:', error));
    }, [currentPage]);

    const refreshBuildings = () => {
        fetch(`/api/v1/buildings?page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                setBuildings(data.buildings || []);
                setSelectedBuilding(null);
            })
            .catch(error => console.error('Error fetching buildings:', error));
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
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

            <div>
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>

            {/* Building Form for creating or editing a building */}
            <BuildingForm
                building={selectedBuilding}
                onSuccess={refreshBuildings}
                key={selectedBuilding ? selectedBuilding.id : 'new'}
            />
        </div>
    );
};

export default BuildingList;
