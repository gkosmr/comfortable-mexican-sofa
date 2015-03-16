#= select_tag :test, options_for_select([1,2,3,4]), data: { chosen: true }, style: "width: 100%", multiple: true
class ComfortableMexicanSofa::Tag::FieldSelect
  include ComfortableMexicanSofa::Tag
  
  def self.regex_tag_signature(identifier = nil)
    identifier ||= IDENTIFIER_REGEX
    /\{\{\s*cms:field:(#{identifier}):select:?(.*?)\s*\}\}/
  end
  
  def content
    block.content
  end
  
  def render
    ''
  end
  
end