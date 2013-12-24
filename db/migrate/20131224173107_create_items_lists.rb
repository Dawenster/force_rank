class CreateItemsLists < ActiveRecord::Migration
  def change
    create_table :items_lists do |t|
      t.belongs_to :item
      t.belongs_to :list
    end
  end
end
