let flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette');
let conv = /** @type {typeof import("css-filter-converter").default} */(
    /** @type {any} */(
        require("css-filter-converter")
    )
);

/** @typedef {typeof import("tailwindcss/plugin")} Plugin */
/** @typedef {Parameters<Parameters<Plugin>[0]>[0]} TW */

const GRADIENT_KEYS = /** @type {const} */([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
/** @typedef {typeof GRADIENT_KEYS[number]} GRADIENT_KEYS */

/**
@arg {number[]} xs
@arg {number[]} ys
*/
function linear_regression(xs, ys) {
    let len = xs.length;
    if (xs.length != ys.length)
        throw new Error("Linear regression data lengths do not match!");

    let xsum = 0;
    let ysum = 0;

    for (let i=0; i<xs.length; i++) {
        xsum += xs[i];
        ysum += ys[i];
    }

    let xmean = xsum / len;
    let ymean = ysum / len;

    let num = 0;
    let denom = 0;
    for (let i=0; i<len; i++) {
        let x = xs[i];
        let y = ys[i];
        num += (x-xmean) * (y-ymean);
        denom += (x-xmean)*(x-xmean);
    }

    let m = num/denom;
    let b = ymean - (m*xmean);

    /** @arg {number} x */
    return function (x) {
        let res = Math.round(m*x + b);
        if (res < 0) return 0;
        if (res > 255) return 255;
        return res;
    };
}

/**
@arg {string} hex
@returns {[number, number, number]}
*/
function hex_to_rgb(hex) {
    hex = hex.replace("#", "");

    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);

    return [r, g, b];
}

/**
@template T
@arg {T} obj
@returns {(keyof T)[]}
*/
function keys_of(obj) {
    // @ts-ignore
    return Object.keys(obj);
}

/**
@template A, B
@arg {A} a
@arg {B} b
@returns {[A, B]}
*/
function pair(a, b) {
    return [a, b];
}

/**
@arg {Partial<Record<GRADIENT_KEYS, string>>} partial_gradient
*/
function expand_gradient(partial_gradient) {
    let keys = keys_of(partial_gradient);
    let num_keys = keys.map(k => parseInt(k+"", 10));
    // @ts-ignore
    let parsed = num_keys.map(k => pair(parseInt(k, 10), hex_to_rgb(partial_gradient[k])))
    let rs = parsed.map(c => c[1][0]);
    let gs = parsed.map(c => c[1][1]);
    let bs = parsed.map(c => c[1][2]);

    let get_r = linear_regression(num_keys, rs);
    let get_g = linear_regression(num_keys, gs);
    let get_b = linear_regression(num_keys, bs);

    let out = /** @type {Record<GRADIENT_KEYS, string>} */({...partial_gradient});

    for (let key of GRADIENT_KEYS) {
        if (!(key in out)) {
            let n = parseInt(key+"", 10);
            let r = get_r(n).toString(16).padStart(2, "0");
            let g = get_g(n).toString(16).padStart(2, "0");
            let b = get_b(n).toString(16).padStart(2, "0");
            out[key] = `#${r}${g}${b}`;
        }
    }

    return out;
}

/**
    @template T
    @typedef {keyof {
        [VAL in T as VAL extends string|number ? VAL : never]: VAL
    }} No_Symbols
*/

/** @typedef {typeof config} Config */

/** @typedef {No_Symbols<keyof Config["theme"]["colors"]>} Color_Base */

/**
    @template {Color_Base} T
    @typedef {
        Config["theme"]["colors"][T] extends string
        ? Config["theme"]["colors"][T]
        : No_Symbols<keyof Config["theme"]["colors"][T]>} Color_Variants
*/

/**
    @template {Color_Base} T
    @typedef {
        Color_Variants<T> extends string
            ? T
            : `${T}-${Color_Variants<T>}`
    } Color_Variant_Names
*/

/**
    @typedef {{
        [BASE in Color_Base]: Color_Variant_Names<BASE>
    }[Color_Base]} All_Color_Variant_Names
*/

/**
    @template {string} CLASS_NAME
    @typedef {
        | `${CLASS_NAME}-${All_Color_Variant_Names}`
        | `dark:${CLASS_NAME}-${All_Color_Variant_Names}`
        | `${CLASS_NAME}-${All_Color_Variant_Names} dark:${CLASS_NAME}-${All_Color_Variant_Names}`
        | `dark:${CLASS_NAME}-${All_Color_Variant_Names} ${CLASS_NAME}-${All_Color_Variant_Names}`
    } TW_Color
*/

/** @satisfies {import('tailwindcss').Config} */
const config = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    darkMode: "selector",
    theme: {
        colors: {
            transparent: "#00000000",
            base: expand_gradient({
                50: "#ffffff",
                100: "#f9f9f9",
                200: "#e6e6e6",
                700: "#5f5f5f",
                800: "#1a1a1a",
                900: "#111111",
            }),
            primary: {
                50:  "#f48bff",
                100: "#e981ff",
                200: "#d26bff",
                300: "#bb56ff",
                400: "#a440ff",
                500: "#8a2be2",
                600: "#7715c7",
                700: "#6700b5",
                800: "#4b0082",
                900: "#2e0072",
                950: "#1b0060",
                DEFAULT: "#bb56ff"
            },
            secondary: {
                500: "#005a9f",
                DEFAULT: "#005a9f"
            },
            metamask: "#f6851b",
        },
        fontFamily: {
            display: "Syne",
            body: "Red Hat Display",
            mono: "monospace"
        },
        extend: {
            screens: {
                sm: "450px",
                xs: "350px",
            },
            boxShadow: {
                glow: "0 0 2rem -.5rem white"
            },
        },
    },
    plugins: [
        /** @arg {TW} tw */
        function(tw) {
            tw.matchUtilities(
                {
                    /** @arg {string} val */
                    icon(val) {
                        return {
                            filter: conv.hexToFilter(val).color
                        };
                    }
                },
                {
                    values: flattenColorPalette(tw.theme('colors')),
                    type: ['color', 'any'],
                }
            );
        }
    ],
};

export default config;
