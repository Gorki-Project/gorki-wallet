import "./Dashboard.scss";
import { useState, useEffect } from 'react';
import { g, OPERATION, Unbox, wallet_is_metamask, useAsync, useNavigateIf, /*CoinGecko*/ } from 'utils';
import * as Components from 'components';
import { useNodes } from "Context";
import { Icon } from "assets";

type Balance = Unbox<ReturnType<typeof g.check_balance>>;

export function Dashboard() {
    const node_context = useNodes();
    let [name] = useState(g?.user?.name || "My Wallet");
    let balance = useAsync<Balance>({ balance: 0, error: null });
    let value = useAsync<number>(null);


    useNavigateIf(!g.user, "/");
    if (!g.user) return <></>;

    useEffect(() => {
        get_balance();
    }, [node_context.node])

    function get_balance() {
        balance.set(g.check_balance(node_context));
    }

    function format_balance(val: number, divisor=100000000) {
        val = val / divisor;
        return val.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        });
    }

    function get_balance_button() {
        return (
            <Components.Button onClick={get_balance} className="p-2 rounded-full">
                <Icon name="refresh-cw" color={"dark:icon-base-900 icon-base-50"} className="w-6 h-6" />
            </Components.Button>
        );
    }

    function show_balance() {
        return <span>
            {format_balance(balance.value?.balance ?? 0)}
        </span>;
    }

    /** function show_exchange_rate() {
        if (value.op !== OPERATION.DONE || value.value === null) {
            return null;
        }

        return <div>
            <span style={{marginRight: "1em"}}>
                <span>1</span>
                <span className="Alt">GOR</span>
            </span>
            <span>
                <span>{format_balance(value.value, 1)}</span>
                <span className="Alt">$</span>
            </span>
        </div>;
    } */

    if (balance.op === OPERATION.INITIAL && balance.error === null) {
        get_balance();
    }

    if (value.op === OPERATION.INITIAL && value.error === null) {
        /*value.set(CoinGecko.price());*/
    }

    function wallet_addr() {
        if (!g.user) { return <></>; }

        if (wallet_is_metamask(g.user)) {
            return <>
                <span className="flex-none">ETH&nbsp;</span>
                <span className="overflow-hidden text-ellipsis">{g.user.ethAddr}</span>
            </>;

        } else {
            return <>
                <span className="flex-none">PUB&nbsp;</span>
                <span className="overflow-hidden text-ellipsis">{g.user.pubKey}</span>
            </>;
        }
    }

    return <Components.Strip className="w-fit max-w-full sm:mt-16" bg="">
        <h2 className="flex justify-between items-center">
            <span>Wallet</span>
            <div>
                { get_balance_button() }
            </div>
        </h2>

        <div className="credit-card">
            <div className="flex justify-between">
                <img className="h-[3vw] sm:h-3" src={import.meta.env.BASE_URL+"lettering-white.svg"} />
                <img className="h-[6vw] sm:h-8" src={import.meta.env.BASE_URL+"logo-white.svg"} />
            </div>

            <div className="chip">
                <Icon name="chip" color="" />
            </div>

            <div className="flex justify-between text-right">
                {wallet_addr()}
            </div>

            <div className="flex justify-between text-right">
                <span className="flex-none">GOR&nbsp;</span>
                <span className="overflow-hidden text-ellipsis">{g.user.revAddr}</span>
            </div>

            <div className="flex justify-between h-4 mt-auto">
                <div>{name}</div>
                <Components.Spinner
                    color="icon-base-50"
                    className="w-4 h-4 mx-4"
                    icon_class="w-4 h-4"
                    op={balance.op}
                    children_done={ show_balance() }
                />
            </div>
        </div>

        <h3 className="mt-4">Network</h3>
        <Components.NodePicker />

        {/*<TransactionList />*/}
    </Components.Strip>;
}
