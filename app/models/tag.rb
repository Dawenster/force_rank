class Tag < ActiveRecord::Base
  has_and_belongs_to_many :lists

  before_save :create_slug

  private

  def create_slug
    self.slug = self.name.parameterize
  end
end