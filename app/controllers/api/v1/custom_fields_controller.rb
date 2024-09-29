module Api
  module V1
    class CustomFieldsController < ApplicationController
      def index
        custom_fields = CustomField.all

        render json: { custom_fields: custom_fields }, status: :ok
      end
    end
  end
end