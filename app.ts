/*
 * The main file, which implements CLI communication with the order book model.
 */

// imports
import {model} from "./src/jointModel";
import {processPDF} from "./src/stats/pdf";
import {processPSD} from "./src/stats/psd";
import {writeFileSync} from "fs";
import {EOL} from "os";

// parse CLI args
let args=require("yargs").default({
    realizations: 1,
    points: 1048576,//16777216,
    output: "test",
    reportTick: 1,
    price: 30000,
    priceFundamental: 30000,
    nFunds: 250,
    nChars: 250,
    laEvent: 0.00001,
    laTradeChar: 100,
    laTradeFund: 100,
    laMoodChange: 10,
    eF: 2,
    eC: 2,
    a: 2,
    laZero: 0.005,
    cMood: 0.75,
    cSpreadShape: 4,
    cSpreadScale: 15.5,
    normalizeReturn: false,
    normalizeTrade: false,
    writeSeries: false,
    timeout: 300,
}).alias({
    output: "o",
    points: "n",
    realizations: "r",
}).argv;

// initialize model object
let jointModel:model=new model(args.reportTick,args.price,args.priceFundamental);
jointModel.resetAgents(
    args.nFunds,args.nChars,
    args.laEvent,args.laTradeChar,args.laTradeFund,args.laMoodChange,
    args.eF,args.eC,args.a,args.laZero,
    args.cMood,args.cSpreadShape,args.cSpreadScale
);

// helper variables
let i:number=0;// index for the ticks loop (as well as for other related loops)
let realizationId:number=0;// index for the realization loop
let currentFileName:string="";
let outRet:number[]=new Array(args.points);
let outTrades:number[]=new Array(args.points);
let outArr:number[][]=new Array();
let oldPrice:number=args.price;
let oldTrades:number=0;
let maxRet:number=-1;
let maxTrades:number=-1;
let returnMean:number=0;
let tradeMean:number=0;
let returnStd:number=0;
let stopAt:number=Date.now()+args.timeout*1000;

// loop through realizations
for(;realizationId<args.realizations;realizationId+=1) {
    currentFileName=eval("`"+args.output+"`");
    maxRet=-1;
    maxTrades=-1;
    returnMean=0;
    oldTrades=0;
    jointModel.tradeEvents=0;
    console.time(currentFileName+" simulation");
    // loop through ticks in a realization ------------------------------------
    for(i=0;i<args.points;i+=1) {
        if(stopAt<Date.now()) {
            throw Error("Timeout");
        }
        jointModel.step();
        outRet[i]=Math.log(jointModel.lastPrice/oldPrice);
        returnMean+=outRet[i];
        if(outRet[i]>maxRet) {
            maxRet=outRet[i];
        }
        outTrades[i]=jointModel.tradeEvents-oldTrades;
        if(outTrades[i]>maxTrades) {
            maxTrades=outTrades[i];
        }
        oldPrice=jointModel.lastPrice;
        oldTrades=jointModel.tradeEvents;
    }
    // normalize return to unit standard deviation ----------------------------
    if(args.normalizeReturn) {
        returnMean/=args.points;
        returnStd=0;
        for(i=0;i<args.points;i+=1) {
            returnStd+=(outRet[i]-returnMean)*(outRet[i]-returnMean);
        }
        returnStd=Math.sqrt(returnStd/(args.points-1));
        for(i=0;i<args.points;i+=1) {
            outRet[i]/=returnStd;
        }
        maxRet/=returnStd;
    }
    // normalize trade to unit mean -------------------------------------------
    if(args.normalizeTrade) {
        tradeMean=jointModel.tradeEvents/args.points;
        for(i=0;i<args.points;i+=1) {
            outTrades[i]/=tradeMean;
        }
    }
    // output series to files -------------------------------------------------
    if(args.writeSeries) {
        writeFileSync(currentFileName+".ret.series",outRet.join(EOL));
        writeFileSync(currentFileName+".trade.series",outTrades.join(EOL));
    }
    // take modulus of the return ---------------------------------------------
    for(i=0;i<args.points;i+=1) {
        outRet[i]=Math.abs(outRet[i]);
    }
    console.timeEnd(currentFileName+" simulation");
    console.log(currentFileName+": "+jointModel.tradeEvents+" total trades");
    // deal with return PDF ---------------------------------------------------
    if(!args.normalizeReturn) {
        outArr=processPDF(outRet,true,1e-4*maxRet,1.1*maxRet);
    } else {
        outArr=processPDF(outRet,true,1e-2,maxRet);
    }
    writeFileSync(currentFileName+".ret.dist",outArr.map(cv=>cv.join(" ")).join(EOL));
    // deal with return PSD ---------------------------------------------------
    outArr=processPSD(outRet,args.reportTick);
    writeFileSync(currentFileName+".ret.spec",outArr.map(cv=>cv.join(" ")).join(EOL));
    // deal with trade PDF ----------------------------------------------------
    if(!args.normalizeTrade) {
        outArr=processPDF(outTrades,true,1,maxTrades);
    } else {
        outArr=processPDF(outTrades,true,1/tradeMean,maxTrades/tradeMean);
    }
    writeFileSync(currentFileName+".trade.dist",outArr.map(cv=>cv.join(" ")).join(EOL));
    // deal with trade PSD ----------------------------------------------------
    outArr=processPSD(outTrades,args.reportTick);
    writeFileSync(currentFileName+".trade.spec",outArr.map(cv=>cv.join(" ")).join(EOL));
}
