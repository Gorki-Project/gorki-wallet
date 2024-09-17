import type { ReactElement } from "react";

export interface ModalBase<T> {
    onFinish: (result: T | null) => void;
    noCloseOnClickOutside?: boolean;
    hostClassName?: string;
};

export interface Modal<T extends ModalBase<any>> {
	component: (props: T) => ReactElement,
	props: T
};
