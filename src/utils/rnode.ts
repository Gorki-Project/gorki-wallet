// noindex

import * as u from './utils';
import * as rho from './rho';

const rn = (async () => {
    const { makeRNodeWeb } = await import("../../vendored/@tgrospic/rnode-http-js/src");
    return makeRNodeWeb({ fetch, now: Date.now });
})();

export async function check_balance(
    readonly_url: string,
    rev_addr: string
) {
    const code = rho.fn_check_balance(rev_addr);

    try {
        const rnode_http = (await rn).rnodeHttp;
        const res = await rnode_http(readonly_url, 'explore-deploy', code);
        const expr = res.expr[0];
        if (!expr) {
            return { balance: null, error: "Unknown error" };
        }

        const balance = expr?.ExprInt?.data as number;
        const err = expr?.ExprString?.data;

        return {
            balance: balance || null,
            error: err || null
        };
    } catch (err) {
        return {
            balance: null,
            error: String(err)
        };
    }
}

export async function transfer(
    node_url: string,
    from_wallet: u.NamedWallet,
    to_wallet: u.NamedWallet,
    amount: number,
    cancel: ()=>boolean = ()=>false
) {
    u.wallet_normalize(from_wallet);
    u.wallet_normalize(to_wallet);
    const code = rho.fn_transfer_funds(from_wallet.revAddr, to_wallet.revAddr, amount);

    let {
        sendDeploy,
        getDataForDeploy
    } = await rn;

    let signature: string|null;
    try {
        signature = (await sendDeploy({httpUrl: node_url}, from_wallet, code, 500000)).signature;
    } catch (err) {
        return {
            cost: null,
            error: String(err)
        };
    }

    let data: any;
    let cost: number | null;
    try {
        let res = await getDataForDeploy({httpUrl: node_url}, signature, cancel);
        data = res.data;
        cost = res.cost;
    } catch (err) {
        return {
            cost: null,
            error: String(err)
        };
    }

    let { rhoExprToJson } = await import("../../vendored/@tgrospic/rnode-http-js/src")
    const args = data ? rhoExprToJson(data.expr) : null;

    if (!args) {
        return {
            cost: null,
            error: "Deploy found in the block, but failed to get confirmation data."
        };
    }

    if (!args[0]) {
        return {
            cost: cost || null,
            error: args[0]
        };
    }

    return {
        cost: cost,
        error: null
    };
}

export async function deploy(
    node_url: string,
    wallet: u.NamedWallet,
    code: string,
    phlo_limit: number,
    cancel: ()=>boolean = ()=>false
) {
    let signature: string;

    u.wallet_normalize(wallet);

    let {
        sendDeploy,
        getDataForDeploy
    } = await rn;

    try {
        signature = (await sendDeploy({httpUrl: node_url}, wallet, code, phlo_limit)).signature;
    } catch (err) {
        console.log("Error", err);
        return {
            message: null,
            cost: null,
            error: u.error_string(err)
        };
    }

    let data: any;
    let cost: number | null;
    try {
        let res = await getDataForDeploy({httpUrl: node_url}, signature, cancel);
        data = res.data;
        cost = res.cost;
    } catch (err) {
        console.log("Error", err);
        return {
            message: null,
            cost: null,
            error: u.error_string(err)
        };
    }
    let { rhoExprToJson } = await import("../../vendored/@tgrospic/rnode-http-js/src");
    const args = data ? rhoExprToJson(data.expr) : null;

    if (!args) {
        return {
            message: null,
            cost: cost || null,
            error: "Deploy found in the block, but data is not sent on `rho:rchain:deployId` channel."
        };
    }

    return {
        message: u.is_type(args, Array) ? args.join(", ") : args,
        cost: cost || null,
        error: null
    };
}

export async function explore(
    readonly_url: string,
    code: string,
) {
    try {
        const rnode_http = (await rn).rnodeHttp;
        const res = await rnode_http(readonly_url, 'explore-deploy', code);

        const expr = res.expr;
        if (!expr) {
            return { expr: null, error: "Unknown error" };
        }

        return { expr, error: null };

    } catch (err) {
        return {
            expr: null,
            error: String(err)
        };
    }
}

export async function propose(
    admin_url: string
) {
    try {
        const rnode_http = (await rn).rnodeHttp;
        const res = await rnode_http(admin_url, 'propose', {});

        const expr = res.expr;
        if (!expr) {
            return { expr: null, error: "Unknown error" };
        }

        return { expr, error: null };

    } catch (err) {
        return {
            expr: null,
            error: String(err)
        };
    }
}
