import React, { useState, useEffect } from 'react';

const BuildingForm = ({ building, onSuccess }) => {
    const initializeBuildingData = (building) => {
        let initialData = {
            address: building?.address || '',
            state: building?.state || '',
            zip: building?.zip || '',
        };

        if (building) {
            Object.keys(building).forEach((key) => {
                if (!['id', 'client_name', 'address', 'state', 'zip'].includes(key)) {
                    initialData[key] = building[key] || '';
                }
            });
        }

        return initialData;
    };

    const [buildingData, setBuildingData] = useState(initializeBuildingData(building));
    const [clients, setClients] = useState([]);
    const [customFields, setCustomFields] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedCustomField, setSelectedCustomField] = useState('');
    const [message, setMessage] = useState('');  // To display notifications
    const [messageType, setMessageType] = useState('');  // To store the type of message (success or error)

    // Fetch clients and handle client selection for editing
    useEffect(() => {
        fetch('/api/v1/clients')
            .then((response) => response.json())
            .then((data) => {
                setClients(data.clients || []);
                if (building && building.client_name) {
                    const matchedClient = data.clients.find(c => c.name === building.client_name);
                    if (matchedClient) {
                        setSelectedClient(matchedClient.id);
                    }
                }
            })
            .catch(error => console.error('Error fetching clients:', error));
    }, [building]);

    // Fetch custom fields

    useEffect(() => {
        fetch('/api/v1/custom_fields')
            .then(response => response.json())
            .then(data => {
                setCustomFields(data.custom_fields || []);
            })
            .catch(error => console.error('Error fetching custom fields:', error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBuildingData({
            ...buildingData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const method = building && building.id ? 'PATCH' : 'POST'; // Use PATCH for update, POST for create
        const url = building && building.id ? `/api/v1/buildings/${building.id}` : '/api/v1/buildings';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...buildingData,
                client_id: selectedClient,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    onSuccess();

                    // Set success message based on create or update
                    if (method === 'POST') {
                        setMessage('Building created successfully!');
                    } else {
                        setMessage('Building updated successfully!');
                    }
                    setMessageType('success');

                    // Clear the form after creation
                    if (method === 'POST') {
                        setBuildingData({
                            address: '',
                            state: '',
                            zip: '',
                        });
                        setSelectedClient('');
                        setSelectedCustomField('');
                    }
                } else {
                    // Set error message returned from backend
                    setMessage(data.error || 'An error occurred while saving the building.');
                    setMessageType('error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setMessage('An unexpected error occurred.');
                setMessageType('error');
            });
    };

    const handleAddCustomField = () => {
        if (selectedCustomField && !buildingData[selectedCustomField]) {
            setBuildingData({
                ...buildingData,
                [selectedCustomField]: '',
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Notification Message */}
            {message && (
                <div className={`notification ${messageType}`}>
                    {message}
                </div>
            )}

            <div>
                <label>Client:</label>
                <select
                    value={selectedClient || ''}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                            {client.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Address:</label>
                <input
                    type="text"
                    name="address"
                    value={buildingData.address}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label>State:</label>
                <input
                    type="text"
                    name="state"
                    value={buildingData.state}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label>Zip:</label>
                <input
                    type="text"
                    name="zip"
                    value={buildingData.zip}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label>Add Custom Field:</label>
                <select
                    value={selectedCustomField}
                    onChange={(e) => setSelectedCustomField(e.target.value)}
                >
                    <option value="">Select Custom Field</option>
                    {customFields.map((field, index) => (
                        <option key={`${field.name}-${index}`} value={field.name}>
                            {field.name}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={handleAddCustomField}>
                    Add
                </button>
            </div>

            {/* Dynamically Render Custom Fields */}
            {Object.keys(buildingData).map((key, index) => {
                if (!['address', 'state', 'zip'].includes(key)) {
                    const selectedField = customFields.find(field => field.name === key);
                    if (!selectedField) return null;

                    return (
                        <div key={`${key}-${index}`}>
                            <label>{selectedField.name}:</label>
                            {selectedField.field_type === 'enum' ? (
                                <select
                                    name={key}
                                    value={buildingData[key] || ''}
                                    onChange={(e) => handleInputChange(e)}
                                    required
                                >
                                    <option value="">Select {selectedField.name}</option>
                                    {selectedField.enum_values.map((enumValue) => (
                                        <option key={enumValue} value={enumValue}>
                                            {enumValue}
                                        </option>
                                    ))}
                                </select>
                            ) : selectedField.field_type === 'number' ? (
                                <input
                                    type="number"
                                    name={key}
                                    value={buildingData[key] || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            ) : (
                                <input
                                    type="text"
                                    name={key}
                                    value={buildingData[key] || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            )}
                        </div>
                    );
                }
                return null;
            })}

            <button type="submit">{building ? 'Update Building' : 'Create Building'}</button>
        </form>
    );
};

export default BuildingForm;
