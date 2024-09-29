class Client < ApplicationRecord
  has_many :buildings, dependent: :destroy
end
