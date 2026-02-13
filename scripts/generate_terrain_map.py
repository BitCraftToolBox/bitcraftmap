from PIL import Image, ImageOps
import numpy as np
import requests
import gzip
import shutil
import math
import cv2

width = 2400
height = 2400
pixel_size = 8
scale_factor = 1    # output size multiplier for the normal image
header_size = 8     # Number of bytes to ignore in the file
hex_size = 6        # hex radius in output pixels
scale = 10          # output size multiplier for the hex image

maps_url = 'https://maps.game.bitcraftonline.com/world-maps/'
terrain_map_file_raw = 'TerrainMap.gwm'
terrain_map_file_unzip = 'TerrainMap.gwm.unc'
terrain_map_file_png = 'TerrainMap.gwm.png'
terrain_map_file_hexagon = 'TerrainMap.hex.png'
data_folder = 'static/data/'

expected_size = width * height * pixel_size

# ----------------------------------------- #
# Download and unzip the terrain map file
# ----------------------------------------- #
response = requests.get(maps_url + terrain_map_file_raw, stream=True)
response.raise_for_status()

with open(data_folder + terrain_map_file_raw, "wb") as file:
    for chunk in response.iter_content(chunk_size=8192):
        if chunk:
            file.write(chunk)

with gzip.open(data_folder + terrain_map_file_raw, "rb") as f_in:
    with open(data_folder + terrain_map_file_unzip, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)

# ----------------------------------------- #
# Uncompressed file to PNG file
# ----------------------------------------- #
with open(data_folder + terrain_map_file_unzip, "rb") as f:
    data = f.read()

pixel_data = data[header_size:]

if len(pixel_data) < expected_size:
    raise ValueError("File too small for expected image size.")
elif len(pixel_data) > expected_size:
    pixel_data = pixel_data[:expected_size]  # Trim padding if any

rgb_data = bytearray()
for i in range(0, len(pixel_data), pixel_size):
    b, g, r = pixel_data[i+1], pixel_data[i+2], pixel_data[i+3]
    rgb_data.extend([r, g, b]) 

img_array = np.frombuffer(rgb_data, dtype=np.uint8).reshape((height, width, 3))

img = Image.fromarray(img_array)
img = ImageOps.mirror(img)
img = img.rotate(180)
img = img.resize((2400 * scale_factor, 2400 * scale_factor), resample=Image.NEAREST)

img.save(data_folder + terrain_map_file_png)

# ----------------------------------------- #
# Hex Map Generation
# ----------------------------------------- #
img = cv2.imread(data_folder + terrain_map_file_png)
h, w = img.shape[:2]

# Output image
out_h = int(h * scale)
out_w = int(w * scale)
result = np.zeros((out_h, out_w, 3), dtype=np.uint8)

dx = math.sqrt(3) * hex_size
dy = 1.5 * hex_size

for y in np.arange(0, out_h + dy, dy):
    for x in np.arange(0, out_w + dx, dx):
        offset = dx / 2 if int(y // dy) % 2 else 0
        cx = x + offset
        cy = y
        orig_x = int(cx / scale)
        orig_y = int(cy / scale)
        if 0 <= orig_x < w and 0 <= orig_y < h:
            color = tuple(int(c) for c in img[orig_y, orig_x])
            pts = []
            for i in range(6):
                angle = math.pi / 6 + math.pi / 3 * i  # pointy top
                px = int(cx + hex_size * math.cos(angle))
                py = int(cy + hex_size * math.sin(angle))
                pts.append([px, py])
            pts = np.array([pts], dtype=np.int32)
            cv2.fillPoly(result, pts, color)

# Save output
cv2.imwrite(data_folder + terrain_map_file_hexagon, result)