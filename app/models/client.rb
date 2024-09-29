class Client < ApplicationRecord
  has_many :buildings, dependent: :destroy
  has_many :custom_field_values, through: :buildings
end
