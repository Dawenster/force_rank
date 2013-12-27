class ListsController < ApplicationController
  def landing
    random_lists = List.all.sample(4)
    @featured_list = random_lists.pop
    @other_featured_lists = random_lists
  end

  def index
    @lists = List.order("created_at DESC")
  end

  def show
    @list = List.find_by_slug(params[:list_slug])
    @show_page = true
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

      @list = create_tags(params[:matters], @list)
      @list = create_items(params[:establishments], @list)

      if @list.save
        @list = create_notes(params[:notes], @list)
        flash[:success] = "#{@list.title} has been successfully created."
        format.json { render :json => { :path => public_list_path(@list.slug) } }
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

  def create_tags(tags, list)
    tags.each do |tag|
      tag = Tag.find_or_create_by_name(tag)
      list.tags << tag
    end
    return list
  end

  def create_items(items, list)
    items.each do |k, v|
      name = v["name"].gsub("×", "")
      item = Item.find_or_create_by_name(name)
      item.image = v["image"]
      item.location = v["location"]
      item.url = v["url"]
      item.mobile_url = v["mobile_url"]
      item.score = v["score"].to_i
      item.save
      list.items << item
    end
    return list
  end

  def create_notes(notes, list)
    notes.each do |k, v|
      unless v[:content].blank?
        Note.create(
          :content => v[:content],
          :list_id => list.id,
          :user_id => current_user.id,
          :item_id => Item.find_by_name(v[:item]).id
        )
      end
    end
    return list
  end

  def user_profile_parameters
    params.require(:user).permit(:title, :user_id, :description)
  end
end