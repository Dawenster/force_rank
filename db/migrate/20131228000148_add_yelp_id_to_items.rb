class AddYelpIdToItems < ActiveRecord::Migration
  def change
    add_column :items, :yelp_id, :string
  end
end
