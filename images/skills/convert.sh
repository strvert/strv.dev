pngs="original_*.png"

for path in $pngs; do
    ffmpeg -i $path -vf "scale=-1:300" -q 2 ${path#original_}
done
