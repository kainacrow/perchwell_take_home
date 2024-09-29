module Api
  module V1
    class ClientsController < ApplicationController
      def index
        clients = Client.all
        render json: { clients: clients }, status: :ok
      end
    end
  end
end