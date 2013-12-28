Table32::Application.routes.draw do
  devise_for :users
  root :to => 'lists#landing'

  resources :lists, :except => [:show]
  get "/:user_slug/lists" => "lists#user_lists", :as => :user_lists
  get "/lists/result-items-list" => "lists#results_items_list", :as => :results_items_list
  get "/lists/selected-items-list" => "lists#selected_items_list", :as => :selected_items_list
  get "/lists/auth-details" => "lists#auth_details", :as => :auth_details
  get "/lists/call-google" => "lists#call_google", :as => :call_google

  resources :tags, :only => [:index]
  get "tag-template" => "tags#tag_template", :as => :tag_template

  get "/:list_slug" => "lists#show", :as => :public_list
end
