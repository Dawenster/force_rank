class List < ActiveRecord::Base
  has_and_belongs_to_many :items
  has_and_belongs_to_many :tags
  belongs_to :user

  def item_with_rank(num)
    ranking = self.items.sort_by{ |i| i.score }.reverse
    return ranking[num - 1]
  end

  def rank_for(item)
    ranking = self.items.sort_by{ |i| i.score }.reverse
    return ranking.index(item) + 1
  end
end