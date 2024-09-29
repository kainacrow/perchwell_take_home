# Clear existing data
CustomFieldValue.destroy_all
CustomField.destroy_all
Building.destroy_all
Client.destroy_all

# Seed Clients
clients = Client.create([
                          { name: 'Client A' },
                          { name: 'Client B' },
                          { name: 'Client C' },
                          { name: 'Client D' },
                          { name: 'Client E' }
                        ])

# Seed Global Custom Fields (no longer tied to specific clients)
custom_fields = CustomField.create([
                                     { name: 'Number of Floors', field_type: 'number' },
                                     { name: 'Building Type', field_type: 'enum', enum_values: ['Residential', 'Commercial', 'Industrial'] },
                                     { name: 'Color', field_type: 'freeform' }
                                   ])

# Seed Buildings and Custom Field Values for each client
clients.each_with_index do |client, index|
  building1 = client.buildings.create!(
    address: "#{index + 1} Main St",
    state: 'NY',
    zip: "1000#{index + 1}"
  )

  building2 = client.buildings.create!(
    address: "#{index + 1} Broadway Ave",
    state: 'NY',
    zip: "1000#{index + 2}"
  )

  # Seed Custom Field Values for Building 1
  building1.custom_field_values.create!(
    [
      { custom_field: CustomField.find_by(name: 'Number of Floors'), value: "#{index + 3}" }, # Different number of floors for each client
      { custom_field: CustomField.find_by(name: 'Building Type'), value: ['Residential', 'Commercial'].sample },
      { custom_field: CustomField.find_by(name: 'Color'), value: ['Blue', 'Red', 'Green'].sample }
    ]
  )

  # Seed Custom Field Values for Building 2
  building2.custom_field_values.create!(
    [
      { custom_field: CustomField.find_by(name: 'Number of Floors'), value: "#{index + 2}" }, # Different number of floors for each client
      { custom_field: CustomField.find_by(name: 'Building Type'), value: ['Commercial', 'Industrial'].sample },
      { custom_field: CustomField.find_by(name: 'Color'), value: ['Yellow', 'Purple', 'Orange'].sample }
    ]
  )

  # Add three more buildings without all three custom fields for each client
  3.times do |i|
    building = client.buildings.create!(
      address: "#{i + 3} Elm St",
      state: 'NY',
      zip: "1000#{i + 3 + index}"
    )

    # For these buildings, assign varying custom field values
    case i
    when 0
      # Only assign "Number of Floors"
      building.custom_field_values.create!(
        { custom_field: CustomField.find_by(name: 'Number of Floors'), value: "#{i + 4}" }
      )
    when 1
      # Only assign "Building Type"
      building.custom_field_values.create!(
        { custom_field: CustomField.find_by(name: 'Building Type'), value: ['Residential', 'Commercial', 'Industrial'].sample }
      )
    when 2
      # Only assign "Color"
      building.custom_field_values.create!(
        { custom_field: CustomField.find_by(name: 'Color'), value: ['Pink', 'Gray', 'White'].sample }
      )
    end
  end
end

puts "Seeded #{Client.count} clients, #{Building.count} buildings, and #{CustomField.count} custom fields."
