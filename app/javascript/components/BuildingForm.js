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
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Fetch clients and set selected client if editing
    useEffect(() => {
        fetch('/api/v1/clients')
            .then((response) => response.json())
            .then((data) => {
                setClients(data.clients || []);
                if (building?.client_name) {
                    const matchedClient = data.clients.find(c => c.name === building.client_name);
                    if (matchedClient) setSelectedClient(matchedClient.id);
                }
            })
            .catch(error => console.error('Error fetching clients:', error));
    }, [building]);

    // Fetch custom fields
    useEffect(() => {
        fetch('/api/v1/custom_fields')
            .then(response => response.json())
            .then(data => setCustomFields(data.custom_fields || []))
            .catch(error => console.error('Error fetching custom fields:', error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBuildingData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const method = building?.id ? 'PATCH' : 'POST';
        const url = building?.id ? `/api/v1/buildings/${building.id}` : '/api/v1/buildings';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...buildingData, client_id: selectedClient }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    onSuccess();
                    setMessage(method === 'POST' ? 'Building created successfully!' : 'Building updated successfully!');
                    setMessageType('success');
                    if (method === 'POST') {
                        setBuildingData({ address: '', state: '', zip: '' });
                        setSelectedClient('');
                        setSelectedCustomField('');
                    }
                } else {
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
            setBuildingData(prevData => ({ ...prevData, [selectedCustomField]: '' }));
        }
    };

    const handleDeleteCustomField = (fieldName) => {
        const { [fieldName]: _, ...updatedData } = buildingData;
        setBuildingData(updatedData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {message && <div className={`notification ${messageType}`}>{message}</div>}

            <div>
                <label>Client:</label>
                <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} required>
                    <option value="">Select Client</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Address:</label>
                <input type="text" name="address" value={buildingData.address} onChange={handleInputChange} required />
            </div>

            <div>
                <label>State:</label>
                <input type="text" name="state" value={buildingData.state} onChange={handleInputChange} required />
            </div>

            <div>
                <label>Zip:</label>
                <input type="text" name="zip" value={buildingData.zip} onChange={handleInputChange} required />
            </div>

            <div>
                <label>Add Custom Field:</label>
                <select value={selectedCustomField} onChange={(e) => setSelectedCustomField(e.target.value)}>
                    <option value="">Select Custom Field</option>
                    {customFields.map((field, index) => (
                        <option key={`${field.name}-${index}`} value={field.name}>{field.name}</option>
                    ))}
                </select>
                <button type="button" onClick={handleAddCustomField}>Add</button>
            </div>

            {/* Render Custom Fields with delete functionality */}
            {Object.keys(buildingData).map((key, index) => {
                if (['address', 'state', 'zip'].includes(key)) return null;

                const selectedField = customFields.find(field => field.name === key);
                if (!selectedField) return null;

                return (
                    <div key={`${key}-${index}`}>
                        <label>{selectedField.name}:</label>
                        {selectedField.field_type === 'enum' ? (
                            <select name={key} value={buildingData[key]} onChange={handleInputChange} required>
                                <option value="">Select {selectedField.name}</option>
                                {selectedField.enum_values.map(value => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={selectedField.field_type === 'number' ? 'number' : 'text'}
                                name={key}
                                value={buildingData[key]}
                                onChange={handleInputChange}
                                required
                            />
                        )}
                        <button type="button" onClick={() => handleDeleteCustomField(key)}>Delete</button>
                    </div>
                );
            })}

            <button type="submit">{building ? 'Update Building' : 'Create Building'}</button>
        </form>
    );
};

export default BuildingForm;
