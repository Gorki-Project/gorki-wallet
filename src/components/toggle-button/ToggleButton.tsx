import { ICON, Icon, icon } from 'assets';

interface ToggleButtonProps {
	val: boolean;
	setval: (val: boolean) => void;
	on_img?: ICON;
	off_img?: ICON;
	className?: string;
}

export function ToggleButton(props: ToggleButtonProps) {
	let on_img = props.on_img || icon("eye-off");
	let off_img = props.off_img || icon("eye");

	function toggle() {
		props.setval(!props.val);
	}

	return (
		<button className={props.className} onClick={toggle}>
			<Icon name={props.val ? on_img : off_img} className="w-6 h-6" color={"icon-base-50"} />
		</button>
	);
}
