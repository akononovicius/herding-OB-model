/*
 * Defines general functionality of the order book.
 * Functionalities relevant to the different sides of the order book were
 * implemented in their respective files.
 */

import { askSide } from "./askSide"
import { bidSide } from "./bidSide"

export class orderBook{
    public ask:askSide;
    public bid:bidSide;
    constructor(maxCapacity:number) {
        this.ask=new askSide(maxCapacity);
        this.bid=new bidSide(maxCapacity);
    }
    public wouldExecute():boolean {
        return this.ask.quotes[0]<this.bid.quotes[0];
    }
    public best():number[] {
        let price:number=(this.ask.quotes[0]+this.bid.quotes[0])/2.0;
        let ownerA:number=this.ask.owners[0];
        let ownerB:number=this.bid.owners[0];
        return [price,ownerA,ownerB];
    }
}
