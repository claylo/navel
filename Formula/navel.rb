class Navel < Formula
  desc "Introspection toolkit for examining Claude Code internals"
  homepage "https://github.com/claylo/navel"
  url "https://github.com/claylo/navel/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "PLACEHOLDER"
  license "MIT"

  depends_on "jq"
  depends_on "ripgrep"

  def install
    libexec.install Dir["libexec/*"]
    # Rewrite path resolution for Homebrew: hard-code LIBEXEC and default
    # NAVEL_HOME to ~/.navel/ instead of detecting relative to script location.
    inreplace "bin/navel" do |s|
      s.gsub! /# ─+\n# Path resolution.*?^fi\n/m, <<~BASH
        # Path resolution (Homebrew)
        LIBEXEC="#{libexec}"
        NAVEL_HOME="${NAVEL_HOME:-$HOME/.navel}"
      BASH
      s.gsub! 'VERSION="devel"', "VERSION=\"#{version}\""
    end
    bin.install "bin/navel"
  end

  def caveats
    <<~EOS
      Node.js is required for prompt capture (navel prompts capture).
      Install it with: brew install node

      Data is stored in ~/.navel/ by default.
      Override with: export NAVEL_HOME=/path/to/data
    EOS
  end

  test do
    assert_match "navel", shell_output("#{bin}/navel help")
  end
end
