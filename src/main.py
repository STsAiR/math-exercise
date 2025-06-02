import os
import json

def generate_exercise_manifest(exercises_dir, output_file):
    """
    Scan the exercises_dir for PDF files and write their filenames to output_file as JSON list.
    """
    if not os.path.isdir(exercises_dir):
        print(f"Error: Directory '{exercises_dir}' does not exist.")
        return

    pdf_files = [
        f for f in os.listdir(exercises_dir)
        if os.path.isfile(os.path.join(exercises_dir, f)) and f.lower().endswith('.pdf')
    ]

    pdf_files.sort()  # Optional: sort filenames alphabetically

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(pdf_files, f, indent=2, ensure_ascii=False)

    print(f"Manifest generated with {len(pdf_files)} files at '{output_file}'.")

if __name__ == "__main__":
    # Adjust these paths if needed
    exercises_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'exercises')
    manifest_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'exerciseList.json')
    
    generate_exercise_manifest(exercises_folder, manifest_file)