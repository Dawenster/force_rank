class ListsController < ApplicationController
  def landing
    random_lists = List.all.sample(4)
    @featured_list = random_lists.pop
    @other_featured_lists = random_lists
  end

  def index
    @lists = List.order("created_at DESC")
  end

  def new
    @list = List.new
  end

  def create
    respond_to do |format|
      @list = List.new
      @list.title = params[:title]
      @list.description = params[:description]
      @list.user_id = current_user.id

      params[:matters].each do |tag|
        tag = Tag.find_or_create_by_name(tag)
        @list.tags << tag
      end

      params[:establishments].each do |k, v|
        name = v["name"].gsub("×", "")
        item = Item.find_or_create_by_name(name)
        item.image = v["image"]
        item.location = v["location"]
        item.score = v["score"].to_i
        item.save
        @list.items << item
      end

      if @list.save
        flash[:success] = "#{@list.title} has been successfully created."
        format.json { render :json => { :path => lists_path } }
      else
        flash.now[:warning] = @list.errors.messages.join(". ")
        format.json { render :json => { :path => "#" } }
      end
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
      redirect_to lists_path
    else
      flash.now[:warning] = @list.errors.messages.join(". ")
      render "edit"
    end
  end

  def destroy
    list = List.find(params[:id]).destroy
    flash[:success] = "#{list.title} has been deleted."
    redirect_to lists_path
  end

  def auth_details
    respond_to do |format|
      auth = {
        consumerKey: ENV["CONSUMER_KEY"],
        consumerSecret: ENV["CONSUMER_SECRET"],
        accessToken: ENV["TOKEN"],
        accessTokenSecret: ENV["TOKEN_SECRET"],
        serviceProvider: { 
          signatureMethod: "HMAC-SHA1"
        }
      }
      format.json { render :json => { :auth => auth } }
    end
  end

  def call_google
    respond_to do |format|
      term = params[:term].gsub(",", " ").gsub(" ", "+")
      url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" + term + "&radius=500&types=(regions)&sensor=true&key=AIzaSyCCghLMewvbiDArJfKlxL0OUdIeihQzAqQ"
      results = JSON.parse(RestClient.get url, {})
      format.json { render :json => { :results => results } }
    end
  end

  def user_lists
    user = User.find_by_slug(params[:user_slug])
    @lists = user.lists
  end

  private

  def user_profile_parameters
    params.require(:user).permit(:title, :user_id, :description)
  end
end