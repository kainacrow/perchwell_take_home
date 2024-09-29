class CreateCustomFields < ActiveRecord::Migration[7.2]
  def change
    create_table :custom_fields do |t|
      t.string :name, null: false # Field name
      t.string :field_type, null: false # 'number', 'freeform', or 'enum'
      t.string :enum_values, array: true, default: [] # For enum type
      t.timestamps
    end

    add_index :custom_fields, :name, unique: true # Ensure field names are unique globally
    add_index :custom_fields, :field_type
  end
end
