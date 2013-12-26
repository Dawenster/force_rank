class AddUrlsToItems < ActiveRecord::Migration
  def change
    add_column :items, :url, :string
    add_column :items, :mobile_url, :string
  end
end
