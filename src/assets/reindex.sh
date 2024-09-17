#!/bin/bash
shopt -s globstar nullglob

BASEDIR="$(dirname "${BASH_SOURCE[0]}")"
ROOT="$(realpath "$BASEDIR/..")"

bash "$BASEDIR/optimize-svgs.sh"

echo "REINDEXING ICONS..."

# find icons created via function call: icon("icon-name")
readarray -t FUNCTION_ICONS < <(grep -hoRE '[iI]con[(][^)]+' "$ROOT" | cut -d"(" -f2 | tr -d '"' | tr -d "'")

# find icons inserted via jsx: <Icon name="icon-name" />
readarray -t JSX_ICONS < <(grep -hoRE '<[iI]con\s+name=\S+' "$ROOT" | cut -d= -f2 | tr -d '"' | tr -d "'" | tr -d "{" | tr -d "}")

USED_ICON_NAMES=" ${FUNCTION_ICONS[*]} ${JSX_ICONS[*]} "

old_icons="$(cat "$ROOT/../public/icons.svg")"

sheet='<svg xmlns="http://www.w3.org/2000/svg"><defs>'
icon_names=''

for icon in "$BASEDIR/"**/*.svg "$BASEDIR/"**/*.png; do
	icon=$(realpath --relative-to "$BASEDIR" "$icon")
	icon_path="$BASEDIR/$icon"
	icon_name=$(basename "$icon_path" | cut -d. -f1)

	if [ "$icon_name" == "sheet" ]; then
		continue
	fi

	icon_names=$icon_names"| \"$icon_name\""

	if ! echo "$USED_ICON_NAMES" | grep -F " $icon_name " &>/dev/null ; then
		continue
	fi

	echo "$icon_name is used!"

	VIEWBOX=$(grep -oE 'viewBox="[0-9. ]+"' "$icon_path" | head -n1)
	FILL=$(grep -oE 'fill="[^"]+"' "$icon_path" | head -n1)
	CONTENT=$(
		sed -e 's/<\/*svg[^>]*>//g' "$icon_path" |
		sed -e 's/id="\([^"]\+\)"/id="\1-'"$icon_name"'"/g' |
		sed -e 's/url(#\([^)]\)/url(#\1-'"$icon_name"'/g'
	)

	sheet="$sheet<symbol id=\"$icon_name\" $FILL $VIEWBOX>$CONTENT</symbol>"
done

sheet=$sheet'</defs></svg>'

if [ "$sheet" != "$old_icons" ]; then
	echo "$sheet" >"$BASEDIR/icons/sheet.svg"

	cp "$BASEDIR/icons/sheet.svg" "$ROOT/../public/icons.svg"

	cat >"$BASEDIR/icons/viewer.html" << EOF
		<style>
			body { background: gray }
		</style>
		<script>

			window.onload = () => {
				const svg = document.querySelector("svg");
				svg.style.display = "none";

				const symbols = document.querySelectorAll("symbol");
				symbols.forEach(symbol => {
					document.body.insertAdjacentHTML("beforeend", \`
						<svg width="50" height="50">
						<title>#\${symbol.id}</title>
						<use xlink:href="#\${symbol.id}" />
					\`);
				});
			};
		</script>
		$sheet
EOF

	cat >"$BASEDIR/icons.tsx" << EOF
	import { type Intrinsic } from 'utils';
	import type { TW_Color } from "index/../../tailwind.config.js";
	import { twMerge } from 'tailwind-merge';

	type ICON_NAME = $icon_names;
	export type ICON = ICON_NAME & { __brand: 'icon' };

	type Literal_Icon<T extends ICON_NAME> = ICON_NAME extends T ? never : T;

	export function icon(name: ICON_NAME): ICON {
		return name as ICON;
	}

	interface Icon_Props<T extends ICON_NAME> extends Intrinsic<"svg"> {
		name: ICON|Literal_Icon<T>;
		color?: TW_Color<"icon"> | "";
	};

	export function Icon<T extends ICON_NAME>(props: Icon_Props<T>) {
		const attrs = {...props};
		const color = props.color ?? "icon-base-900";
		attrs.className = twMerge("w-8 h-8", attrs.className);
		delete (attrs as any)["name"];
		delete (attrs as any)["color"];

		let base = import.meta.env.BASE_URL + "icons.svg";
		if (import.meta.env.DEV) {
			base += "?$(date +%s)";
		}

		return <svg {...attrs}>
			<use className={color} href={base + "#" + props.name} />
		</svg>;
	}
EOF
fi

echo "DONE REINDEXING ICONS"
