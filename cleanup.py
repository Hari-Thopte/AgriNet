import os
import re

def deduplicate_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Deduplicate imports
    import_stmt = "import { useTranslation } from 'react-i18next';"
    if content.count(import_stmt) > 1:
        content = content.replace(import_stmt, '', content.count(import_stmt) - 1)
        
    # Deduplicate const { t } = useTranslation();
    # This is tricky because it might be in different components, but usually we just want to remove the exact duplicate in the SAME block.
    # Actually, the error happens when we injected it into a component that already had it, or we injected it multiple times.
    # Let's find blocks that have multiple `const { t } = useTranslation();`
    
    # Simple fix: find all `const { t } = useTranslation();` and if there are multiple in a file, it might be fine if they are in different functions. 
    # But wait, "Identifier 't' has already been declared" means it's in the SAME scope.
    
    new_content = re.sub(r'(const \{ t \} = useTranslation\(\);\s*){2,}', r'\1', content)
    
    # If the error is still there, it's probably because `const { t } = useTranslation();` is declared in the same function twice, separated by other code.
    # Let's use a simpler approach: we just replace the file content by keeping the first occurrence in the function? No.
    
    # Let's just fix the files that were listed in the error logs:
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    src_dir = os.path.join(os.getcwd(), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.tsx') or file.endswith('.js'):
                path = os.path.join(root, file)
                deduplicate_in_file(path)

if __name__ == '__main__':
    main()
