require "set"

class PasswordChecker
  WORDLIST_FILES = [
    "common-passwords.txt",
    "ncsc-passwords.txt"
  ].freeze

  def self.compromised?(password)
    wordlists.any? { |wordlist| wordlist.include?(password) }
  end

  def self.wordlists
    @wordlists ||= WORDLIST_FILES.map do |filename|
      path = Rails.root.join("data", "wordlists", filename)

      Set.new(
        File.foreach(path, chomp: true)
            .map(&:strip)
            .reject(&:empty?)
      )
    end
  end
end