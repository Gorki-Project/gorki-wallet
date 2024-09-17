import { useState, useEffect } from "react";
import { useLayout } from 'Context';
import { ModalBase } from './ModalBase';
import * as u from 'utils';
import * as Components from 'components';

export function usePassConfirm() {
        let password1 = u.useWritableWithToggle("", false);
        let password2 = u.useWritableWithToggle("", false);

        const [valid, set_valid] = useState(false);

        function check_validity() {
                if (password1.value.length < 6) {
                        set_valid(false);
                        return;
                }

                if (password2.value !== password1.value) {
                        set_valid(false);
                        return;
                }

                set_valid(true);
        }

        useEffect(check_validity, [password1, password2]);

        return {
            password1,
            password2,
            valid
        };
}

interface PassConfirmProps {
    state: ReturnType<typeof usePassConfirm>;
};

export function PassConfirmForm(props: PassConfirmProps) {
    let { password1, password2 } = props.state;

    return (<>
        <label title="PASSWORD" className="border-base-50">
            <input placeholder="PASSWORD"
                className="text-base-50"
                value={password1.value}
                type={password1.toggle_value ? "text" : "password"}
                onChange={password1.write}
            />
            <Components.ToggleButton
                val={password1.toggle_value}
                setval={password1.set_toggle}
            />
        </label>
        <p className="-mt-4 ml-4">6+ characters</p>

        <label title="CONFIRM PASSWORD" className="border-base-50">
            <input placeholder="CONFIRM PASSWORD"
                className="text-base-50"
                value={password2.value}
                type={password2.toggle_value ? "text" : "password"}
                onChange={password2.write}/>
            <Components.ToggleButton
                val={password2.toggle_value}
                setval={password2.set_toggle}
            />
        </label>
    </>)
}

export interface PassConfirmModalProps extends ModalBase<string> {
    title: string;
    text: string;
    button: string;
}

export function PassConfirmModal(props: PassConfirmModalProps) {
    const layout = useLayout();
    const pc = usePassConfirm();

    function finish() {
        props.onFinish(pc.password1.value);
        layout.pop_modal();
    }

    return (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-max w-[90vw] text-base-50" onClick={(ev)=>ev.stopPropagation()}>
            <Components.Strip bg="bg-primary-900">
                <h3>{ props.title }</h3>
                <p>{ props.text }</p>
                <PassConfirmForm state={pc} />
                <p></p>
                <Components.Button
                    className="w-fit mx-auto bg-base-50 text-base-900"
                    onClick={() => finish()}
                    disabled={!pc.valid}>
                    { props.button }
                </Components.Button>
            </Components.Strip>
        </div>
    );
}
