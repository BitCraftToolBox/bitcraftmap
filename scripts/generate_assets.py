import os
import shutil

def flatten_folder(src_dir, dst_dir):
    os.makedirs(dst_dir, exist_ok=True)

    for root, _, files in os.walk(src_dir):
        for file in files:
            src_path = os.path.join(root, file)
            dst_path = os.path.join(dst_dir, file)
            if os.path.exists(dst_path):
                base, ext = os.path.splitext(file)
                i = 1
                while os.path.exists(dst_path):
                    dst_path = os.path.join(dst_dir, f"{base}_{i}{ext}")
                    i += 1
            shutil.copy2(src_path, dst_path)

def delete_by_extension(target_dir, extensions):
    for root, _, files in os.walk(target_dir):
        for file in files:
            if any(file.lower().endswith(ext.lower()) for ext in extensions):
                os.remove(os.path.join(root, file))

def empty_folder(folder):
    if os.path.exists(folder):
        shutil.rmtree(folder)
    os.makedirs(folder, exist_ok=True)

if __name__ == "__main__":
    source = "C:/Users/Manserk/repos/bitcraftassets"
    destination = "C:/Users/Manserk/repos/bitcraftassets_flat"
    extensions_to_delete = ['.asset', '.glb', '.cs', '.dll', '.csproj', '.bytes', '.json']
    
    empty_folder(destination)
    flatten_folder(source, destination)
    delete_by_extension(destination, extensions_to_delete)