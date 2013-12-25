class AddImageAndLocationToItems < ActiveRecord::Migration
  def change
    add_column :items, :image, :string
    add_column :items, :location, :string
  end
end
