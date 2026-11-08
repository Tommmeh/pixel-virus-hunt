// The fake broker's own memory: the bank link it collected, the cash and the positions.
// Persisted so closing the window doesn't quietly undo a trade — or the login, which it claims to
// keep "on file".
import { createStore } from "../../system/store";
import { INITIAL_MARKET, type MarketState } from "./market";

export const marketStore = createStore<MarketState>("vh-stockladder", INITIAL_MARKET);
