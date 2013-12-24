ForceRank::Application.routes.draw do
  devise_for :users
  root :to => 'lists#index'

  resources :lists, :except => [:show]
end
