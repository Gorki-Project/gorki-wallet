	import { type Intrinsic } from 'utils';
	import type { TW_Color } from "index/../../tailwind.config.js";
	import { twMerge } from 'tailwind-merge';

	type ICON_NAME = | "access"| "account"| "activity"| "airplay"| "alert-circle"| "alert-octagon"| "alert-triangle"| "align-center"| "align-justify"| "align-left"| "align-right"| "anchor"| "aperture"| "archive"| "arrow-down-circle"| "arrow-down-left"| "arrow-down-right"| "arrow-down"| "arrow-left-circle"| "arrow-left"| "arrow-right-circle"| "arrow-right"| "arrow-up-circle"| "arrow-up-left"| "arrow-up-right"| "arrow-up"| "arrow"| "at-sign"| "award"| "bar-chart-2"| "bar-chart"| "battery-charging"| "battery"| "bell-off"| "bell"| "bluetooth"| "bold"| "book-open"| "book"| "bookmark"| "box"| "briefcase"| "bubble-small"| "bubble"| "calendar"| "camera-off"| "camera"| "cancel"| "cast"| "check-circle"| "check-square"| "check"| "chevron-down"| "chevron-left"| "chevron-right"| "chevron-up"| "chevron"| "chevrons-down"| "chevrons-left"| "chevrons-right"| "chevrons-up"| "chevrons"| "chip"| "chrome"| "circle"| "clipboard"| "clock"| "cloud-drizzle"| "cloud-lightning"| "cloud-off"| "cloud-rain"| "cloud-snow"| "cloud"| "code"| "codepen"| "codesandbox"| "coffee"| "columns"| "command"| "compass"| "copy"| "corner-down-left"| "corner-down-right"| "corner-left-down"| "corner-left-up"| "corner-right-down"| "corner-right-up"| "corner-up-left"| "corner-up-right"| "cpu"| "credit-card"| "crop"| "crosshair"| "dash"| "database"| "delete"| "deploy"| "disc"| "divide-circle"| "divide-square"| "divide"| "dollar-sign"| "download-cloud"| "download"| "dribbble"| "droplet"| "edit-2"| "edit-3"| "edit"| "external-link"| "eye-crossed"| "eye-off"| "eye"| "facebook"| "fast-forward"| "feather"| "figma"| "file-minus"| "file-plus"| "file-text"| "file"| "film"| "filter"| "flag"| "folder-minus"| "folder-plus"| "folder"| "framer"| "frown"| "gift"| "git-branch"| "git-commit"| "git-merge"| "git-pull-request"| "github"| "gitlab"| "globe"| "grid"| "hard-drive"| "hash"| "headphones"| "heart"| "help-circle"| "hexagon"| "home"| "image"| "inbox"| "info"| "instagram"| "italic"| "key-small"| "key"| "keystore-small"| "keystore"| "knowit"| "layers"| "layout"| "life-buoy"| "link-2"| "link"| "linkedin"| "list"| "loader"| "localpass"| "lock"| "log-in"| "log-out"| "mail"| "map-pin"| "map"| "maximize-2"| "maximize"| "meh"| "menu-close"| "menu"| "message-circle"| "message-square"| "metamask"| "mic-off"| "mic"| "minimize-2"| "minimize"| "minus-circle"| "minus-square"| "minus"| "monitor"| "moon"| "more-horizontal"| "more-vertical"| "mouse-pointer"| "move"| "music"| "navigation-2"| "navigation"| "network"| "octagon"| "package"| "paperclip"| "pause-circle"| "pause"| "pen-tool"| "percent"| "phone-call"| "phone-forwarded"| "phone-incoming"| "phone-missed"| "phone-off"| "phone-outgoing"| "phone"| "pie-chart"| "play-circle"| "play"| "plus-circle"| "plus-square"| "plus"| "pocket"| "power"| "printer"| "profile-small"| "profile"| "radio"| "refresh-ccw"| "refresh-cw"| "refresh"| "repeat"| "rewind"| "rotate-ccw"| "rotate-cw"| "rss"| "run"| "save"| "scissors"| "search"| "send"| "server"| "settings"| "share-2"| "share"| "shield-off"| "shield"| "shopping-bag"| "shopping-cart"| "shuffle"| "sidebar"| "skip-back"| "skip-forward"| "slack"| "slash"| "sliders"| "smartphone"| "smile"| "social-discord"| "social-github"| "social-telegram"| "social-twitter"| "social-youtube"| "speaker"| "spinner"| "square"| "star"| "stop-circle"| "sun"| "sunrise"| "sunset"| "tablet"| "tag"| "target"| "terminal"| "thermometer"| "thumbs-down"| "thumbs-up"| "toggle-left"| "toggle-right"| "tool"| "trans"| "trash-2"| "trash"| "trello"| "trending-down"| "trending-up"| "triangle"| "truck"| "tv"| "twitch"| "twitter"| "type"| "umbrella"| "underline"| "unlock"| "upload-cloud"| "upload"| "user-check"| "user-minus"| "user-plus"| "user-x"| "user"| "users"| "video-off"| "video"| "voicemail"| "volume-1"| "volume-2"| "volume-x"| "volume"| "wallet-simple"| "wallet-small"| "wallet"| "watch"| "wifi-off"| "wifi"| "wind"| "x-circle"| "x-octagon"| "x-square"| "x"| "youtube"| "zap-off"| "zap"| "zoom-in"| "zoom-out"| "logo-notext"| "logo-white-oneline"| "logo-white"| "logo";
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
			base += "?1726487366";
		}

		return <svg {...attrs}>
			<use className={color} href={base + "#" + props.name} />
		</svg>;
	}
