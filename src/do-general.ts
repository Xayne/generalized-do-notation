import { p } from "fp-essentials/compiled/utils/apply-fn-pipe"

export type AddKvToRecord<r, k extends string, v> = k extends (keyof r)
    ? never : H<r & { readonly [kk in k]: v }>
type H<v> = (() => { [k in keyof v]: v[k] }) extends () => infer r ? r : never

type Monad<a> = any

type DoNota<r> = {
    $: <k extends string, v>(k: k, next: (r: r) => Monad<v>) => DoNota<AddKvToRecord<r, k, v>>
    _: <v>(next: (r: r) => Monad<v>) => DoNota<r>
    e: <v>(exit: (r: r) => Monad<v>) => Monad<v>
    pure: <v>(exit: (r: r) => v) => Monad<v>
}


/**
 * declare the next type: (substitute `MONAD` with the real type of the monad)
 * ```
 * type DoMONAD<r> = {
 *   $: <k extends string, v>(k: k, next: (r: r) => MONAD<v>) => DoMONAD<AddKvToRecord<r, k, v>>
 *   _: <v>(next: (r: r) => MONAD<v>) => DoMONAD<r>
 *   e: <v>(exit: (r: r) => MONAD<v>) => MONAD<v>
 *   pure: <v>(exit: (r: r) => v) => MONAD<v>
 * }
 * ```
 * pass `pure`, `map`, `bind` to the config of the function
 * (substitute `MONAD` with the real type of the monad):
 * ```
 * export const doMONAD: DoMONAD<{}> = mkDoNotationFor({
 *   pure,  // <a>    (x: a)                  => MONAD<a> 
 *   map,   // <a, b> (f: (x: a) => b)        => (m: MONAD<a>) => MONAD<b>
 *   bind,  // <a, b> (f: (x: a) => MONAD<b>) => (m: MONAD<a>) => MONAD<b>
 * })
 * ```
 * your do notation is ready! 
 */
export const mkDoNotationFor: (cfg: {
    /** `<a>    (x: a)                  => MONAD<a>` */ 
    pure: <v>(v: v) => Monad<v>
    /** `<a, b> (f: (x: a) => MONAD<b>) => (m: MONAD<a>) => MONAD<b>` */ 
    bind: <a, b>(f: (a: a) => Monad<b>) => (m: Monad<a>) => Monad<b>
    /** `<a, b> (f: (x: a) => b)        => (m: MONAD<a>) => MONAD<b>` */ 
    map: <a, b>(f: (a: a) => b) => (m: Monad<a>) => Monad<b>
}) => DoNota<{}>
    = ({ pure, bind, map }) => {

        const mkNext: <r>(r: Monad<r>) => DoNota<r>
            = mr => ({
                $: (k, n) => mkNext(p(
                    mr,
                    bind(r => p(n(r as any),
                        map(v => Object.assign({}, r, { [k]: v } as { [kk in typeof k]: typeof v }))
                    ))
                )),
                _: n => mkNext(p(
                    mr, bind(r => p(n(r as any), map(_ => r)))
                )),
                e: e => p(mr, bind(r => e(r as any))),
                pure: e => p(mr, map(r => e(r as any)))
            })

        return {
            $: (k, n) => mkNext(
                p(n({}), map(v => ({ [k]: v }) as { [kk in typeof k]: typeof v }))
            ),
            _: n => mkNext(p(n({}), map(_ => ({})))),
            e: e => e({}),
            pure: e => pure(e({}))
        }
    }
