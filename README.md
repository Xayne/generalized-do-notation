# Generalized do notation

Small lib that provides util for creating type-safe and strict 
do-notation for any monad.

## Installation

`npm install generalized-do-notation`

## Usage

### Creating do notation for a monad

declare the next type: (substitute `MONAD` with the real type of the monad)
```typescript
type DoMONAD<r> = {
  $: <k extends string, v>(k: k, next: (r: r) => MONAD<v>) => DoMONAD<AddKvToRecord<r, k, v>>
  _: <v>(next: (r: r) => MONAD<v>) => DoMONAD<r>
  e: <v>(exit: (r: r) => MONAD<v>) => MONAD<v>
  pure: <v>(exit: (r: r) => v) => MONAD<v>
}
```
create do notation using util `mkDoNotationFor`: 
(substitute `MONAD` with the real type of the monad)
pass `pure`, `map`, `bind` to the config of the function
```typescript
export const doMONAD: DoMONAD<{}> = mkDoNotationFor({
  pure,  // <a>    (x: a)                  => MONAD<a> 
  map,   // <a, b> (f: (x: a) => b)        => (m: MONAD<a>) => MONAD<b>
  bind,  // <a, b> (f: (x: a) => MONAD<b>) => (m: MONAD<a>) => MONAD<b>
})
```
your do notation is ready! 

### Using do notation

after creation you get 
```typescript
doMONAD // (substitute `MONAD` with the real type of the monad)
```
constant. 

which can be used like this:
(substitute `MONAD` with the real type of the monad)
```typescript
const result = doMONAD
    // 'unwraps' someMONADvalue and stores it's value to `a`:
    .$('a', _ => someMONADvalue) 
    // `a` from prev step can be read here (or in any lower step) like this: 
    // (also `fn` here is a some function that takes value and returns MONAD
    // returned value is stored to `b` and can be read in lower steps
    // )
    .$('b', x => fn(x.a))      
    // if there is no need of reading value of the monad and it's only importand 
    // to have sideEffect of this monad, there is `_` method which binds the 
    // monad the same way as `$` does, but doesn't stores it's value
    ._(x => sideEffectMONAD)  
    // every do notation must be finished with 'exit' 
    // there is `e` method that finishes binding with the last monad
    // in this example the last monad is the one produced by `fn2` function. 
    // the result of `fn2` function will be stored into `const result` (see start of this chain)
    .e(x => fn2(x.b))

const result = doMONAD = doMONAD
    // there is another way of exiting from do notation: 
    // method `pure`. it just wraps any value returned by the function into MONAD
    // `const result` will be 42 wrapped into MONAD
    .pure(x => 42)

```

## Typescript limitations

## Documentation

*detailed documentation and examples will be provided later*.

