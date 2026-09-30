import os
import re

def to_snake_case(text):
    text = text.strip()
    if not text:
        return text
    # basic non-alphanumeric strip
    clean = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    # lowercase and replace spaces with underscores
    return '_'.join(clean.lower().split())[:30] # Limit key length

def wrap_jsx_text(content):
    # Find text between > and <
    # e.g., >Hello World<  -> >{t('hello_world')}<
    def repl_text(match):
        text = match.group(1)
        # Check if text is just whitespace
        if not text.strip() or '{' in text or '}' in text:
            return f">{text}<"
        key = to_snake_case(text)
        if not key:
            return f">{text}<"
        return f">{{t('{key}')}}<"
    
    new_content = re.sub(r'>([^<]+)<', repl_text, content)
    return new_content

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = wrap_jsx_text(content)

    if new_content != content:
        # Also need to make sure `useTranslation` is imported and instantiated if we add t()
        if 'useTranslation' not in new_content and 't(' in new_content:
            new_content = "import { useTranslation } from 'react-i18next';\n" + new_content
            # Note: injecting `const { t } = useTranslation();` into the component is too hard with regex.
            # We will just do the wrapping for now as a best-effort script.
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    src_dir = os.path.join(os.getcwd(), 'src')
    count = 0
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.tsx') or file.endswith('.js'):
                path = os.path.join(root, file)
                if process_file(path):
                    count += 1
    print(f"Modified {count} files.")

if __name__ == '__main__':
    main()
