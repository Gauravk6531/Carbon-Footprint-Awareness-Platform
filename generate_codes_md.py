import os

PROJECT_ROOT = r"c:\Users\ASUS\Desktop\Desktop\promptwars\Carbon Footprint Awareness Platform"
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "all_project_codes.md")

IGNORE_DIRS = {
    ".git", "node_modules", "dist", "build", ".pytest_cache", "__pycache__", "venv", "env", "public", ".vscode", "__tests__"
}
IGNORE_FILES = {
    "package-lock.json", "carbon_db.sqlite", "all_project_codes.md", "generate_codes_md.py", ".gitignore", "carbon_db.sqlite-journal"
}
IGNORE_EXTS = {
    ".pyc", ".png", ".jpg", ".jpeg", ".ico", ".svg", ".sqlite", ".db", ".pdf", ".docx", ".zip", ".tar.gz", ".ttf", ".woff", ".woff2"
}

def generate_tree(dir_path, prefix=""):
    tree_str = ""
    try:
        entries = sorted(os.listdir(dir_path))
    except Exception:
        return ""
    
    entries = [e for e in entries if e not in IGNORE_DIRS and e not in IGNORE_FILES]
    for i, entry in enumerate(entries):
        path = os.path.join(dir_path, entry)
        is_last = (i == len(entries) - 1)
        if os.path.isdir(path):
            tree_str += f"{prefix}{'└── ' if is_last else '├── '}{entry}/\n"
            tree_str += generate_tree(path, prefix + ("    " if is_last else "│   "))
        else:
            if not any(entry.endswith(ext) for ext in IGNORE_EXTS):
                tree_str += f"{prefix}{'└── ' if is_last else '├── '}{entry}\n"
    return tree_str

def main():
    md_content = "# Project Codes\n\n"
    
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Modify dirs in-place to prune search
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if file in IGNORE_FILES or any(file.endswith(ext) for ext in IGNORE_EXTS):
                continue
            
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, PROJECT_ROOT)
            
            # The prompt asks for "all important files including env and env.example etc all server ,backend, frontend"
            
            md_content += f"## File: `{rel_path}`\n\n"
            
            # Use appropriate code block language if possible
            ext = os.path.splitext(file)[1].lower()
            lang = ""
            if ext == ".py": lang = "python"
            elif ext == ".js" or ext == ".jsx": lang = "javascript"
            elif ext == ".ts" or ext == ".tsx": lang = "typescript"
            elif ext == ".html": lang = "html"
            elif ext == ".css": lang = "css"
            elif ext == ".json": lang = "json"
            elif ext == ".md": lang = "markdown"
            elif ext == ".sh": lang = "bash"
            
            md_content += f"```{lang}\n"
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    md_content += f.read()
            except Exception as e:
                md_content += f"// Could not read file: {e}\n"
            
            # Ensure the file ends with a newline before closing the code block
            if not md_content.endswith("\n"):
                md_content += "\n"
            md_content += "```\n\n"
            
    md_content += "# Folder Structure\n\n"
    md_content += "```\n"
    md_content += "Carbon Footprint Awareness Platform/\n"
    md_content += generate_tree(PROJECT_ROOT)
    md_content += "```\n"
    
    try:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            f.write(md_content)
        print("Successfully generated all_project_codes.md")
    except Exception as e:
        print(f"Failed to write md file: {e}")

if __name__ == "__main__":
    main()
