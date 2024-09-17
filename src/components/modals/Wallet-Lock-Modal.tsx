import { useState, useEffect } from 'react';
import { useLayout } from 'Context';
import { ModalBase } from './ModalBase';
import * as u from 'utils';
import * as Components from 'components';

function useWalletLock() {
    let name = u.useWritable("");
    let { password1, password2 } = Components.usePassConfirm();

    const [registration_valid, set_registration_valid] = useState(false);

    function check_validity() {
        if (name.value.length < 3) {
            set_registration_valid(false);
            return;
        }

        if (u.g.wallet_exists(u.g.user_list, name.value)) {
            set_registration_valid(false);
            return;
        }

        if (password1.value.length < 6) {
            set_registration_valid(false);
            return;
        }

        if (password2.value !== password1.value) {
            set_registration_valid(false);
            return;
        }

        set_registration_valid(true);
    }

    useEffect(check_validity, [name, password1, password2]);

    return {
        name,
        password1,
        password2,
        registration_valid
    };
}

interface WalletLockProps {
    state: ReturnType<typeof useWalletLock>;
};

export function WalletLockForm(props: WalletLockProps) {
    let { name } = props.state;

    return (<>
        <label title="NAME" className="border-base-50">
            <input placeholder="NAME"
            className="text-base-50"
                value={name.value}
                onChange={name.write}/>
        </label>
        <p className="-mt-4 ml-4">3+ characters</p>

        <Components.PassConfirmForm state={{ ...props.state, valid: true }} />
    </>);
}

interface WalletLockResult {
    name: string;
    password: string;
};

export interface WalletLockModalProps extends ModalBase<WalletLockResult> {
    title: string;
    text: string;
    button: string;
}

export function WalletLockModal(props: WalletLockModalProps) {
    const layout = useLayout();
    const lock = useWalletLock();

    function finish() {
        props.onFinish({
            name: lock.name.value,
            password: lock.password1.value
        });
        layout.pop_modal();
    }

    return (<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-max w-[90vw] text-base-50" onClick={(ev)=>ev.stopPropagation()}>
        <Components.Strip bg="bg-primary-900">
        <h3>{ props.title }</h3>
        <p>{ props.text }</p>
        <WalletLockForm state={lock} />
        <Components.Button
                className="self-end bg-base-50 text-base-900"
                onClick={() => finish()}
                disabled={!lock.registration_valid}>
            { props.button }
        </Components.Button>
        </Components.Strip>
    </div>);
}
