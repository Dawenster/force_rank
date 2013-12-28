class TagsController < ApplicationController
  def index
    respond_to do |format|
      format.json { render :json => { :tags => Tag.all.map{ |t| t.name } } }
    end
  end

  def tag_template
    respond_to do |format|
      template = render_to_string(:partial => 'tags/tag_template', :locals => { :tag => tag_name })
      format.json { render :json => { :template => template } }
    end
  end
end