Table32::Application.routes.draw do
  devise_for :users
  root :to => 'lists#landing'

  resources :lists, :except => [:show]
  get "/:user_slug/lists" => "lists#user_lists", :as => :user_lists

  resources :tags, :only => [:index]
  get "auth-details" => "lists#auth_details", :as => :auth_details
  get "call-google" => "lists#call_google", :as => :call_google

  get "/:list_slug" => "lists#show", :as => :public_list
end
