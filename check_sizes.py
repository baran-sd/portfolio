from PIL import Image
import glob, os

base = "C:/Users/User/AppData/Local/hermes/profiles/iris/workspace/portfolio/images"
for f in sorted(glob.glob(os.path.join(base, "**", "*.webp"), recursive=True)):
    img = Image.open(f)
    w, h = img.size
    short = os.path.relpath(f, base).replace("\\", "/")
    print(f"{short}: {w}x{h} ({w/h:.2f})")
