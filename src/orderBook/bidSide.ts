/*
 * This class defines functionality of one side in the order book. This class
 * defines functions as they would have been defined for the bid side of the
 * order book.
 */

export class bidSide{
    public quotes:number[];
    public owners:number[];
    public stored:number;
    private capacity:number;
    constructor(maxCapacity:number) {
        let i:number=0;
        this.capacity=maxCapacity;
        this.quotes=new Array(this.capacity);
        this.owners=new Array(this.capacity);
        for(i=0;i<this.capacity;i+=1) {
            this.quotes[i]=-1;
            this.owners[i]=-1;
        }
        this.stored=0;
    }
    public get(order:1|-1=1):number[] {
        if(order>0) {// default ordering
            return this.quotes.slice(0,this.stored);
        }
        return this.quotes.slice(0,this.stored).reverse();
    }
    public add(quote:number, ownerId:number, orderIds:number[]):void {
        let i:number=0;
        let j:number=0;
        let jm:number=0;
        if(this.stored>=this.capacity) {
            throw "Add overflow!";
        }
        for(i=0;i<this.stored;i+=1) {
            if(this.quotes[i]<quote) {
                break;
            }
        }
        if(i<this.stored) {
            for(j=this.stored;j>i;j-=1) {
                jm=j-1;
                this.quotes[j]=this.quotes[jm];
                this.owners[j]=this.owners[jm];
                orderIds[this.owners[j]]=j;
            }
            this.quotes[i]=quote;
            this.owners[i]=ownerId;
            orderIds[ownerId]=i;
            this.stored+=1;
        } else {
            this.quotes[i]=quote;
            this.owners[i]=ownerId;
            orderIds[ownerId]=i;
            this.stored+=1;
        }
    }
    public cancel(orderId:number, orderIds:number[]):void {
        let i:number=0;
        let im:number=0;
        if(orderId>=this.stored) {
            throw "Cancel overflow!";
        }
        orderIds[this.owners[orderId]]=-1;
        for(i=orderId+1;i<this.stored;i+=1) {
            im=i-1;
            this.quotes[im]=this.quotes[i];
            this.owners[im]=this.owners[i];
            orderIds[this.owners[i]]=im;
        }
        this.stored-=1;
    }
    public revise(orderId:number, quote:number, orderIds:number[]):void {
        let i:number=0;
        if(orderId>=this.stored) {
            throw "Revise overflow!";
        }
        if(this.quotes[orderId]<quote) {
            this.quotes[orderId]=quote;
            for(i=orderId-1;i>-1;i-=1) {
                if(this.quotes[i+1]<this.quotes[i]) {
                    break;
                }
                this.swap(i,i+1,orderIds);
            }
        } else {
            this.quotes[orderId]=quote;
            for(i=orderId+1;i<this.stored;i+=1) {
                if(this.quotes[i-1]>this.quotes[i]) {
                    break;
                }
                this.swap(i,i-1,orderIds);
            }
        }
    }
    public wouldMarket(quote:number):boolean {
        if(this.stored==0) {
            return false;
        }
        return this.quotes[0]>quote;
    }
    private swap(i1:number, i2:number, orderIds:number[]):void {
        let swapQuote:number=this.quotes[i1];
        let swapOwner:number=this.owners[i1];
        this.quotes[i1]=this.quotes[i2];
        this.owners[i1]=this.owners[i2];
        this.quotes[i2]=swapQuote;
        this.owners[i2]=swapOwner;
        orderIds[this.owners[i1]]=i1;
        orderIds[this.owners[i2]]=i2;
    }
}
