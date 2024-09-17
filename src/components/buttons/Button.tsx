import { Intrinsic } from "utils";
import { twMerge } from "tailwind-merge";

export function Button(
    props: Intrinsic<"button">,
) {
    const base_class = "dark:bg-base-50 dark:text-base-900 bg-primary-300 text-base-50 font-medium px-4 py-2 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
    return (
        <button {...props}
            className={twMerge(base_class, props.className)}>
            { props.children }
        </button>
    );
}

export function BigButton({
    title="",
    subtitle="",
    icon="",
    iconClass="",
    onClick=()=>{}
}) {
    return (
        <Button
            className="flex justify-between items-center gap-4 text-left"
            onClick={onClick}
        >
            {(title || subtitle) &&
                <div>
                    {title && <h3>{title}</h3>}
                    {subtitle && <p>{subtitle}</p>}
                </div>
            }
            <img className={iconClass} src={icon} alt=""/>
        </Button>
    );
}
