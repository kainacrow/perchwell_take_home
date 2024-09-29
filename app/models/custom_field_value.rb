class CustomFieldValue < ApplicationRecord
  belongs_to :building
  belongs_to :custom_field

  validates :value, presence: true
  validate :validate_enum_value

  private

  def validate_enum_value
    if custom_field.field_type == 'enum'
      unless custom_field.enum_values.include?(value)
        errors.add(:value, "is not a valid option for #{custom_field.name}")
      end
    end
  end
end
