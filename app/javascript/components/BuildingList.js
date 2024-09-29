import React, { useState, useEffect } from 'react';
import BuildingForm from './BuildingForm';
import './BuildingList.css';

const BuildingList = () => {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetch(`/api/v1/buildings?page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                setBuildings(data.buildings || []);
                setTotalPages(data.total_pages);
            })
            .catch(error => console.error('Error fetching buildings:', error));
    }, [currentPage]);

    const refreshBuildings = (message) => {
        fetch(`/api/v1/buildings?page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                setBuildings(data.buildings || []);
                setSelectedBuilding(null);
                setIsModalOpen(false);
                setSuccessMessage(message)

                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
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

    const openModalForNewBuilding = () => {
        setSelectedBuilding(null);
        setIsModalOpen(true);
    };

    const openModalForEditBuilding = (building) => {
        setSelectedBuilding(building);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="building-list-container">
            {successMessage && (
                <div className="success-flag">
                    {successMessage}
                </div>
            )}

            <h1>Building List</h1>

            <button onClick={openModalForNewBuilding} className="create-button">
                Create New Building
            </button>

            <div className="building-cards">
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

                            <button onClick={() => openModalForEditBuilding(building)}>Edit</button>
                        </div>
                    ))
                ) : (
                    <p>No buildings available</p>
                )}
            </div>

            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={closeModal}>&times;</span>
                        <BuildingForm
                            building={selectedBuilding}
                            onSuccess={() => refreshBuildings(selectedBuilding ? 'Building updated successfully!' : 'Building created successfully!')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuildingList;
