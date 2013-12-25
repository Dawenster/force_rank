class ItemsController < ApplicationController
  
  private

  def user_profile_parameters
    params.require(:user).permit(:name, :score, :image, :location)
  end
end