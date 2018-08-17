/*
 * Defines processPDF function, which processes array of numbers and produces
 * estimate of the PDF, where the bins are either linearly or logarithmically
 * equi-sampled.
 */

export function processPDF(arrx:number[],log:boolean,llim:number,rlim:number,
        outPoints:number=100):number[][] {
    let hsteps:number=outPoints*100;
    let xstep:number=_histogramStep(llim,rlim,hsteps);
    let pdf:number[]=_histogram(arrx,llim,rlim,xstep,hsteps,true);
    return _modification(pdf,log,llim,rlim,outPoints,llim,xstep);
}

function _modification(pdf:number[],log:boolean,llim:number,rlim:number,
        outPoints:number,xlim:number=1,xstep:number=1):number[][] {
    if(log && llim<=0) {
        return [];
    }
    let i:number=0;
    let pdfLen:number=pdf.length;
    let pdfModified:number[][]=new Array<Array<number>>(outPoints);
    for(i=0;i<outPoints;i+=1) {
        pdfModified[i]=[0,0];
    }
    let lstep:number=0;
    let used:number=0;
    let integral:number=0;
    let parsed:number=0;
    let curlim:number=xlim;
    while(curlim<llim) {
        curlim+=xstep;
        parsed+=1;
    }
    if(log) {
        let normalization:number=0;
        let lg:(x:number)=>number=(x)=>Math.log(x)/Math.LN10;
        llim=lg(llim);
        rlim=lg(rlim);
        lstep=_histogramStep(llim,rlim,outPoints);
        used=0;
        while(llim<=rlim && used<outPoints) {
            integral=0;
            llim+=lstep;
            while(lg(curlim)<llim && parsed<pdfLen) {
                curlim+=xstep;
                integral+=pdf[parsed];
                parsed+=1;
            }
            if(integral>0) {
                pdfModified[used][0]=llim-0.5*lstep;
                normalization=Math.pow(10,pdfModified[used][0]);
                if(used>0) {
                    normalization-=Math.pow(10,pdfModified[used-1][0]);
                } else {
                    normalization-=Math.pow(10,pdfModified[used][0]-lstep);
                }
                pdfModified[used][1]=lg(integral/normalization);
                used+=1;
            }
        }
        if(used<outPoints) {
            pdfModified=pdfModified.slice(0,used);
        }
    } else {
        lstep=_histogramStep(llim,rlim,outPoints);
        for(i=0;i<outPoints;i+=1) {
            integral=0;
            llim+=lstep;
            while((curlim<llim)&&(parsed<pdfLen)) {
                curlim+=xstep;
                integral+=pdf[parsed];
                parsed+=1;
            }
            pdfModified[i][0]=llim-0.5*lstep;
            pdfModified[i][1]=integral/lstep;
        }
    }
    return pdfModified;
}

function _histogram(arrx:number[],llim:number,rlim:number,xstep:number,
        steps:number,normalizeInInterval:boolean=true):number[] {
    let i:number=0;
    let lstep:number=xstep;
    let pdf:number[]=new Array(steps);
    for(i=0;i<steps;i+=1) {
        pdf[i]=0;
    }
    let samples=0;
    for(i=0;i<arrx.length;i+=1) {
        if((llim<=arrx[i])&&(arrx[i]<=rlim)) {
            pdf[Math.floor((arrx[i]-llim)/lstep)]+=1;
            samples+=1;
        }
    }
    if(normalizeInInterval) {
        for(i=0;i<steps;i+=1) {
            pdf[i]/=(samples);
        }
    } else {
        for(i=0;i<steps;i+=1) {
            pdf[i]/=(arrx.length);
        }
    }
    return pdf;
}

function _histogramStep(llim:number,rlim:number,steps:number):number {
    return (rlim-llim)/(steps-1.0);
}
