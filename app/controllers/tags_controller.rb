class TagsController < ApplicationController
  def index
    respond_to do |format|
      format.json { render :json => { :tags => Tag.all.map{ |t| t.name } } }
    end
  end
end