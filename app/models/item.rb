class Item < ActiveRecord::Base
  has_and_belongs_to_many :lists
  has_many :notes

  def note(list)
    return false unless list
    note = self.notes.select do |note|
      note.item_id == self.id &&
      note.list_id == list.id
    end
    return note[0]
  end
end