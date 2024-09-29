class Building < ApplicationRecord
  belongs_to :client
  has_many :custom_field_values, dependent: :destroy
end
