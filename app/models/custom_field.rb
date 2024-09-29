class CustomField < ApplicationRecord
  has_many :custom_field_values, dependent: :destroy

  validates :name, presence: true
  validates :field_type, presence: true, inclusion: { in: ['number', 'freeform', 'enum'] }

  validate :validate_enum_values

  private

  def validate_enum_values
    if field_type == 'enum' && enum_values.empty?
      errors.add(:enum_values, 'must be provided for enum field types')
    end
  end
end
