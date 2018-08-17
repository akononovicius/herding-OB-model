/*
 * Defines an array, which has predefined capacity. This class tracks number
 * of elements added to the array and parses only them. After initialization
 * this array is filled with some preset value, but as array shrinks the
 * outside values are not redefined.
 */

export class fixedNumberArray {
    public stored:number;// number of stored elements
    public capacity:number;// number of storable elements
    public vals:number[];// array to store elements in
    // object constructor -----------------------------------------------------
    constructor(defaultFiller:number=-1,capacity:number=100) {
        let i:number=0;
        this.stored=0;
        this.capacity=capacity;
        this.vals=new Array(capacity);
        for(;i<capacity;i+=1) {
            this.vals[i]=defaultFiller;
        }
    }
    // public methods ---------------------------------------------------------
    public add(val:number):void {// add new element
        if(this.stored>=this.capacity) {
            throw Error(`fixedNumberArray.add: overflow(${this.stored},${this.capacity})`);
        }
        this.vals[this.stored]=val;
        this.stored+=1;
    }
    public removeById(id:number):void {// remove element by id
        if(id<0 || this.stored<id) {
            throw Error(`fixedNumberArray.rem: overflow(${id},${this.stored})`);
        }
        this.stored-=1;
        this.vals[id]=this.vals[this.stored];
    }
    public removeByValue(val:number):void {// remove element by value
        this.removeById(this.find(val));
    }
    public find(val:number):number {// find first occurence of value
        let i:number=0;
        for(;i<this.stored;i+=1) {
            if(this.vals[i]==val) {
                return i;
            }
        }
        return -1;
    }
}
