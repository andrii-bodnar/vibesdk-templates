#!/usr/bin/env python3
"""
Update API type definitions in usage.md files.
Extracts .d.ts files from @crowdin/crowdin-api-client and injects them into usage.md.
"""

import sys
import re
import subprocess
import shutil
from pathlib import Path
from typing import Optional


def remove_comments_and_empty_lines(content: str) -> str:
    """Remove all comments, JSDoc, and empty lines from TypeScript."""
    
    # Remove JSDoc comments (/** ... */)
    content = re.sub(r'/\*\*[\s\S]*?\*/', '', content)
    
    # Remove multi-line comments (/* ... */)
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    
    # Remove single-line comments (// ...)
    content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
    
    # Remove @internal, @deprecated tags that might remain
    content = re.sub(r'@\w+.*$', '', content, flags=re.MULTILINE)
    
    # Remove all empty lines
    lines = [line.rstrip() for line in content.split('\n') if line.strip()]
    
    return '\n'.join(lines)


def generate_api_types_markdown(template_path: Path) -> str:
    """Generate markdown with all .d.ts files from @crowdin/crowdin-api-client."""
    
    out_dir = template_path / 'node_modules/@crowdin/crowdin-api-client/out'
    
    if not out_dir.exists():
        print(f"Error: {out_dir} not found", file=sys.stderr)
        print(f"Make sure node_modules is installed in {template_path}", file=sys.stderr)
        return None
    
    markdown = ""
    
    # Find all .d.ts files
    dts_files = sorted(out_dir.glob('**/*.d.ts'))
    
    # Skip internal/test files
    skip_patterns = ['internal', 'test', '__']
    
    for dts_file in dts_files:
        # Get relative path from out/
        rel_path = dts_file.relative_to(out_dir)
        
        # Skip internal files
        if any(pattern in str(rel_path) for pattern in skip_patterns):
            continue
        
        # Read file content
        content = dts_file.read_text(encoding='utf-8')
        
        # Remove comments and clean up
        content_clean = remove_comments_and_empty_lines(content)
        
        # Skip if file becomes empty after cleaning
        if not content_clean.strip():
            continue
        
        # Add section
        markdown += f"#### {rel_path}\n\n"
        markdown += "```typescript\n"
        markdown += content_clean
        markdown += "\n```\n\n"
    
    # Remove trailing newlines
    return markdown.rstrip()


def inject_api_types(usage_md_path: Path, api_types_content: str) -> bool:
    """Inject API types into usage.md between placeholders."""
    
    if not usage_md_path.exists():
        print(f"Error: {usage_md_path} not found", file=sys.stderr)
        return False
    
    usage_content = usage_md_path.read_text(encoding='utf-8')
    
    # Check if placeholders exist
    if '<!-- CROWDIN_API_CLIENT_TYPES_START -->' not in usage_content:
        print(f"Warning: CROWDIN_API_CLIENT_TYPES_START placeholder not found in {usage_md_path}", file=sys.stderr)
        return False
    
    # Replace content between placeholders
    pattern = r'<!-- CROWDIN_API_CLIENT_TYPES_START -->.*?<!-- CROWDIN_API_CLIENT_TYPES_END -->'
    
    replacement = f"<!-- CROWDIN_API_CLIENT_TYPES_START -->\n\n{api_types_content.strip()}\n\n<!-- CROWDIN_API_CLIENT_TYPES_END -->"
    
    updated_content = re.sub(pattern, replacement, usage_content, flags=re.DOTALL)
    
    # Write back
    usage_md_path.write_text(updated_content, encoding='utf-8')
    
    return True


def update_all_templates(reference_path: Path, definitions_path: Path) -> bool:
    """Update API types for all templates using reference as source."""
    
    # Generate API types from reference/crowdin-reference
    print(f"Generating API types from {reference_path}...")
    api_types_content = generate_api_types_markdown(reference_path)
    
    if not api_types_content:
        print("Error: Failed to generate API types", file=sys.stderr)
        return False
    
    print(f"✅ Generated {len(api_types_content.splitlines())} lines of type definitions\n")
    
    # Find all templates in definitions/
    templates = sorted([d for d in definitions_path.iterdir() if d.is_dir() and d.name.startswith('crowdin-')])
    
    if not templates:
        print(f"Error: No templates found in {definitions_path}", file=sys.stderr)
        return False
    
    print(f"Found {len(templates)} templates to update:\n")
    
    success_count = 0
    fail_count = 0
    
    for template_dir in templates:
        usage_md_path = template_dir / 'prompts/usage.md'
        
        if not usage_md_path.exists():
            print(f"⚠️  Skipping {template_dir.name}: usage.md not found")
            fail_count += 1
            continue
        
        print(f"Processing {template_dir.name}...")
        
        # Inject into usage.md
        if inject_api_types(usage_md_path, api_types_content):
            lines_count = len(usage_md_path.read_text().splitlines())
            print(f"✅ Updated: {lines_count} lines\n")
            success_count += 1
        else:
            print(f"❌ Failed\n")
            fail_count += 1
    
    print(f"{'='*50}")
    print(f"Summary: {success_count} succeeded, {fail_count} failed")
    
    return fail_count == 0


def ensure_node_modules(reference_path: Path) -> bool:
    """Ensure node_modules exists in reference, run npm install if needed."""
    
    node_modules = reference_path / 'node_modules/@crowdin/crowdin-api-client'
    package_json = reference_path / 'package.json'
    
    # Check if package.json exists
    if not package_json.exists():
        print(f"Error: package.json not found in {reference_path}", file=sys.stderr)
        return False
    
    # Check if node_modules exists
    if node_modules.exists():
        print(f"✅ node_modules already installed in {reference_path}\n")
        return True
    
    print(f"📦 node_modules not found, running npm install in {reference_path}...")
    
    try:
        result = subprocess.run(
            ['npm', 'install'],
            cwd=reference_path,
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        if result.returncode == 0:
            print(f"✅ npm install completed successfully\n")
            return True
        else:
            print(f"Error: npm install failed", file=sys.stderr)
            print(result.stderr, file=sys.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print(f"Error: npm install timed out", file=sys.stderr)
        return False
    except FileNotFoundError:
        print(f"Error: npm not found. Please install Node.js", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error running npm install: {e}", file=sys.stderr)
        return False


def cleanup_node_modules(reference_path: Path) -> None:
    """Remove node_modules and package-lock.json after generation."""
    
    print(f"\n🧹 Cleaning up...")
    
    node_modules = reference_path / 'node_modules'
    package_lock = reference_path / 'package-lock.json'
    
    # Remove node_modules
    if node_modules.exists():
        try:
            shutil.rmtree(node_modules)
            print(f"✅ Removed {node_modules}")
        except Exception as e:
            print(f"⚠️  Failed to remove node_modules: {e}", file=sys.stderr)
    
    # Remove package-lock.json
    if package_lock.exists():
        try:
            package_lock.unlink()
            print(f"✅ Removed {package_lock}")
        except Exception as e:
            print(f"⚠️  Failed to remove package-lock.json: {e}", file=sys.stderr)


def main():
    # Default paths
    repo_root = Path(__file__).parent.parent
    reference_path = repo_root / 'reference/crowdin-reference'
    definitions_path = repo_root / 'definitions'
    
    # Check if reference exists
    if not reference_path.exists():
        print(f"Error: Reference path not found: {reference_path}", file=sys.stderr)
        sys.exit(1)
    
    # Check if definitions exists
    if not definitions_path.exists():
        print(f"Error: Definitions path not found: {definitions_path}", file=sys.stderr)
        sys.exit(1)
    
    # Ensure node_modules is installed
    if not ensure_node_modules(reference_path):
        sys.exit(1)
    
    try:
        # Update all templates
        success = update_all_templates(reference_path, definitions_path)
    finally:
        # Always cleanup, even if update fails
        cleanup_node_modules(reference_path)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

