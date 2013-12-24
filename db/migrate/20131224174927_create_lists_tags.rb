class CreateListsTags < ActiveRecord::Migration
  def change
    create_table :lists_tags do |t|
      t.belongs_to :list
      t.belongs_to :tag
    end
  end
end
