class SelectData

  def self.countries
    f = YAML.load_file(Rails.root.join 'config', 'countries.yml')
    f['countries'].map{ |code, country| country['name'] }
  end
end