ForceRank::Application.routes.draw do
  root :to => 'lists#index'

  resources :lists, :except => [:show]
end
