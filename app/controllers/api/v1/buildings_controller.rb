class Api::V1::BuildingsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create, :update]

  def create
    client = Client.find(params[:client_id])

    building = client.buildings.find_or_create_by(
      address: params[:address].downcase,
      state: params[:state].downcase,
      zip: params[:zip]
    )

    if building.persisted?
      return render json: { error: 'Building with the same address already exists' }, status: :unprocessable_entity
    end

    process_custom_fields(building, custom_field_params)

    if building.save
      render json: { status: 'success', building: building }, status: :created
    else
      render json: { status: 'error', errors: building.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    building = Building.find(params[:id])
    building.update(address: params[:address])

    process_custom_fields(building, custom_field_params)

    if building.save
      render json: { status: 'success', building: building }, status: :ok
    else
      render json: { status: 'error', errors: building.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def index
    buildings = Building.includes(:client, :custom_field_values).page(params[:page]).per(20)
    formatted_buildings = buildings.map do |building|
      building_data = {
        id: building.id,
        client_name: building.client.name,
        address: building.address,
        state: building.state,
        zip: building.zip
      }

      building.custom_field_values.each do |custom_field_value|
        building_data[custom_field_value.custom_field.name] = custom_field_value.value
      end

      building_data
    end

    render json: { status: 'success', buildings: formatted_buildings }
  end

  def show
    building = Building.find(params[:id])
    custom_fields_data = building.custom_field_values.map do |field_value|
      {
        field_name: field_value.custom_field.name,
        value: field_value.value,
        field_type: field_value.custom_field.field_type
      }
    end

    render json: {
      id: building.id,
      client_name: building.client.name,
      address: building.address,
      state: building.state,
      zip: building.zip,
      custom_fields: custom_fields_data
    }
  end

  private

  def process_custom_fields(building, field_params)
    field_params.each do |field_name, field_value|
      custom_field = CustomField.find_by(name: field_name)
      unless custom_field
        return render json: { error: "Custom field #{field_name} not found" }, status: :unprocessable_entity
      end

      custom_field_value = building.custom_field_values.find_or_initialize_by(custom_field: custom_field)
      custom_field_value.value = case custom_field.field_type
                                 when 'number'
                                   field_value.to_i
                                 when 'freeform'
                                   field_value.to_s
                                 when 'enum'
                                   if custom_field.enum_values.include?(field_value)
                                     field_value
                                   else
                                     return render json: { error: "Invalid value for #{field_name}" }, status: :unprocessable_entity
                                   end
                                 end
      custom_field_value.save
    end
  end

  def building_params
    params.require(:building).permit(:address, :state, :zip, custom_fields: {})
  end

  def custom_field_params
    params.except(:address, :state, :zip, :client_id, :controller, :action, :id, :building)
  end
end
