# navel — Claude Code introspection toolkit

# Run all bats tests
test:
    bats tests/

# Run a specific test file (e.g., just test-one command-scanner)
test-one NAME:
    bats tests/{{NAME}}.bats

# Full update: npm sync, scan, docs, readme
update:
    bin/navel update

# Check scanner outputs
status:
    @echo "commands: $(jq '.commands | length' reports/commands.json)"
    @echo "hooks:    $(jq '.hooks | length' reports/hooks.json)"
    @echo "docs:     $(ls docs/*.md 2>/dev/null | wc -l | tr -d ' ') files"
    @echo "versions: $(ls npm/versions 2>/dev/null | wc -l | tr -d ' ') cached"
