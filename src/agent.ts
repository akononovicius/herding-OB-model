/*
 * Defines states available to agents as well as properties tracked for
 * each agent.
 */

export enum AgentStates {
    FUNDAMENTALIST, CHARTIST
}

export interface Agent {
    cHalfSpread:number;// half of the spread used in chartistic logic
    cValuation:number;// valuation used in chartistic logic
    state:AgentStates;// see consts below
}
