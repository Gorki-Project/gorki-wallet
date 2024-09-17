import type { TW_Color } from "index/../../tailwind.config.js";
import type { Intrinsic } from "utils";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { ICON, Icon } from "assets";

interface Strip_Props extends Intrinsic<"div"> {
    bg?: TW_Color<"bg"> | "";
    children: ReactNode;
};

export function Strip(props: Strip_Props) {
    const attrs = { ...props };
    delete attrs["bg"];

    const bg = props.bg ?? "bg-primary-700";

    let inner_class = "flex flex-col gap-4 mx-auto w-fit p-8 max-w-[60ch]";

    let inner = (
        <div {...attrs} className={twMerge(inner_class, attrs.className)}>
            {props.children}
        </div>
    );

    return <div className={"flex-1 flex flex-col " + bg}>
        {inner}
    </div>;
}

interface Card_Props {
    icon: ICON,
    title: string,
    icon_color?: TW_Color<"icon">|"",
    bg: TW_Color<"bg">,
    shadow: TW_Color<"shadow">,
    fg: TW_Color<"text">,
    children: ReactNode,
};

export function Card(props: Card_Props) {
    return (
        <div className={
            `${props.bg} ${props.fg} ${props.shadow} flex flex-col shadow-glow w-72 h-80 rounded-xl p-4 gap-4`
        }>
            <div className="flex flex-col gap-4 pb-2">
                <div className="size-12 bg-base-50 p-1 rounded-full relative">
                    <Icon name={props.icon} color={props.icon_color} className="size-6 absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
                </div>
                <h2>{props.title}</h2>
            </div>
            { props.children }
        </div>
    );
}
