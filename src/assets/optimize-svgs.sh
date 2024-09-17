#!/bin/bash
shopt -s globstar nullglob

echo "OPTIMIZING SVGS..."
BASEDIR="$(dirname "${BASH_SOURCE[0]}")"

OPTIONS=(--coordinates-precision 2 --transforms-precision 2 --properties-precision 2 --paths-coordinates-precision 2 --quiet)

for img in "$BASEDIR"/**/*.svg; do
	(
		svgcleaner "${OPTIONS[@]}" "$img" -c >"$img.opti"
		if [ ! -s "$img.opti" ]; then
			echo "UNABLE TO CREATE IMAGE $img"
			rm "$img.opti"
		else
			rm "$img"
			mv "$img.opti" "$img"
		fi
	) &
done

wait
echo "DONE OPTIMIZING SVGS"
