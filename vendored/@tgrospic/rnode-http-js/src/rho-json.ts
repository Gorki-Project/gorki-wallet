import identity from 'ramda/src/identity';
import map from 'ramda/src/map';
import toPairs from 'ramda/src/toPairs';
import mapObjIndexed from 'ramda/src/mapObjIndexed';
import isNil from 'ramda/src/isNil';
import find from 'ramda/src/find';
import path from 'ramda/src/path';
import pipe from 'ramda/src/pipe';

// Converts RhoExpr response from RNode WebAPI
// https://github.com/rchain/rchain/blob/b7331ae05/node/src/main/scala/coop/rchain/node/api/WebApi.scala#L128-L147
// - return!("One argument")   // monadic
// - return!((true, A, B))     // monadic as tuple
// - return!(true, A, B)       // polyadic
// new return(`rho:rchain:deployId`) in {
//   return!((true, "Hello from blockchain!"))
// }
// TODO: make it stack safe
export const rhoExprToJson = (input: any) => {
  const loop = (rhoExpr: any) => convert(rhoExpr)(converters)
  const converters = toPairs(converterMapping(loop))
  return loop(input)
}

const converterMapping = (loop: any) => ({
  "ExprInt": identity,
  "ExprBool": identity,
  "ExprString": identity,
  "ExprBytes": identity,
  "ExprUri": identity,
  "UnforgDeploy": identity,
  "UnforgDeployer": identity,
  "UnforgPrivate": identity,
  "ExprUnforg": loop,
  "ExprPar": map(loop),
  "ExprTuple": map(loop),
  "ExprList": map(loop),
  "ExprSet": map(loop),
  "ExprMap": mapObjIndexed(loop),
})

const convert = (rhoExpr: any) => pipe(
  map(matchTypeConverter(rhoExpr)),
  find(x => !isNil(x)),
  // Return the whole object if unknown type
  x => isNil(x) ? [identity, rhoExpr] : x,
  ([f, d]) => f(d)
)

const matchTypeConverter = (rhoExpr: any) => ([type, f]: [string, any]) => {
  const d = path([type, 'data'], rhoExpr)
  return isNil(d) ? void 666 : [f, d]
}
