class ListsController < ApplicationController
  
  before_filter :authenticate_user!, :only => [:new, :edit]

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
    @list_owner = @list.user == current_user
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
    respond_to do |format|
      @list = List.find(params[:id])
      @list.title = params[:title]
      @list.description = params[:description]
      @list.user_id = current_user.id

      @list.items = []
      @list.tags = []

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

  def destroy
    list = List.find(params[:id]).destroy
    flash[:success] = "#{list.title} has been deleted."
    redirect_to user_lists_path(current_user.slug)
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
    @user = User.find_by_slug(params[:user_slug])
    @lists = @user.lists.sort_by{ |l| l.created_at }.reverse
  end

  def results_items_list
    respond_to do |format|
      local_variables = {
        :name => params[:name],
        :mobile_url => params[:mobile_url],
        :url => params[:url],
        :image => params[:image],
        :location => params[:location],
        :full_location => params[:full_location],
        :yelp_id => params[:yelp_id]
      }
      template = render_to_string(:partial => 'results_items_list', :locals => local_variables)
      format.json { render :json => { :template => template } }
    end
  end

  def selected_items_list
    respond_to do |format|
      local_variables = {
        :name => params[:name],
        :mobile_url => params[:mobile_url],
        :url => params[:url],
        :image => params[:image],
        :location => params[:location],
        :yelp_id => params[:yelp_id],
        :item => nil
      }
      template = render_to_string(:partial => 'selected_items_list', :locals => local_variables)
      format.json { render :json => { :template => template } }
    end
  end

  private

  def create_tags(tags, list)
    tags.each do |tag_name|
      tag = Tag.find_by_slug(tag_name.parameterize)
      tag ||= Tag.create(:name => tag_name.downcase.capitalize)
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
      item = Item.find_by_name(v[:item])
      note = item.note(list)
      if v[:content].blank?
        note.destroy if note
      else
        if note
          note.update_attributes(
            :content => v[:content]
          )
        else
          Note.create(
            :content => v[:content],
            :list_id => list.id,
            :user_id => current_user.id,
            :item_id => item.id
          )
        end
      end
    end
    return list
  end

  def user_profile_parameters
    params.require(:user).permit(:title, :user_id, :description)
  end
end