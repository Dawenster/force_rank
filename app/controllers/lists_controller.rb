class ListsController < ApplicationController
  def index
    @lists = List.all
  end

  def new
    @list = List.new
  end

  def create
    @list = List.new(params[:list])
    if @list.save
      flash[:success] = "#{@list.title} has been successfully created."
      redirect_to admin_lists_path
    else
      flash.now[:warning] = @list.errors.messages.join(". ")
      render "new"
    end
  end

  def edit
    @list = List.find(params[:id])
  end

  def update
    @list = List.find(params[:id])
    params = convert_param_dates
    @list.assign_attributes(params[:list])
    if @list.save
      flash[:success] = "#{@list.title} has been successfully updated."
      redirect_to admin_lists_path
    else
      flash.now[:warning] = @list.errors.messages.join(". ")
      render "edit"
    end
  end

  def destroy
    list = List.find(params[:id]).destroy
    flash[:success] = "#{list.title} has been deleted."
    redirect_to admin_lists_path
  end

  private

  def user_profile_parameters
    params.require(:user).permit(:title, :user_id)
  end
end