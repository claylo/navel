class Navel < Formula
  desc "Introspection toolkit for examining Claude Code internals"
  homepage "https://github.com/claylo/navel"
  url "https://github.com/claylo/navel/archive/refs/tags/v1.1.0.tar.gz"
  sha256 "PLACEHOLDER"
  license "MIT"

  depends_on "jq"
  depends_on "ripgrep"

  def install
    libexec.install Dir["libexec/*"]

    # Static assets for PDF and Dash pipelines
    prefix.install "pdf"
    prefix.install "dash"
    prefix.install "no-plugins"
    prefix.install "package.json"
    prefix.install "package-lock.json"

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
      Core features (update, sync, scan) require only jq and ripgrep.

      For PDF generation (navel pdf):
        brew install node typst
        cd #{prefix} && npm install

      For Dash docset (navel dash):
        brew install node
        cd #{prefix} && npm install

      For prompt capture (navel prompts capture):
        brew install node

      Data is stored in ~/.navel/ by default.
      Override with: export NAVEL_HOME=/path/to/data
    EOS
  end

  test do
    assert_match "navel", shell_output("#{bin}/navel help")
  end
end
