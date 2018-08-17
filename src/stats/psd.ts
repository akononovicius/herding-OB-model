/*
 * Defines processPSD function, which processes array of numbers and produces
 * estimate of the PSD. PSD estimate would be best plotted on log-log scale
 * (frequencies estimated are equi-sampled on logarithmic scale).
 */

export function processPSD(arrx:number[],timeTick:number,outPoints:number=100,
        sliceSize:number=131072):number[][] {
    let i:number=0;
    let slices:number=Math.floor(arrx.length/sliceSize);
    let psdLen=sliceSize/2;
    let psd:number[]=new Array(psdLen);
    for(i=0;i<psdLen;i+=1) {
        psd[i]=0;
    }
    let tpsd:number[]=new Array();
    for(i=0;i<slices;i+=1) {
        tpsd=_fft(arrx.slice(i*sliceSize,(i+1)*sliceSize));
        psd=psd.map((cv,ci)=>cv+tpsd[ci]);
    }
    for(i=0;i<psdLen;i+=1) {
        psd[i]/=slices;
    }
    return _modification(psd,timeTick,outPoints);
}

function _fft(arrx:number[]):number[] {
    let n=arrx.length;
    let m=Math.log(n)/Math.LN2;
    if(m % 1>0) {
        throw new Error(`_fft: bad point count (${n})`);
    }
    let nm1:number=n-1;
    let nd2:number=Math.floor(n/2);
    let i:number=0;
    let j:number=nd2;
    let k:number=0;
    let rex:number[]=new Array(n);
    let imx:number[]=new Array(n);
    for(i=0;i<n;i+=1) {
        rex[i]=arrx[i];
        imx[i]=0;
    }
    let tr:number=0;
    let ti:number=0;
    for(i=1;i<nm1;i+=1) {//bit reversal
        if(i<=j) {
            tr=rex[j];
            ti=imx[j];
            rex[j]=rex[i];
            imx[j]=imx[i];
            rex[i]=tr;
            imx[i]=ti;
        }
        k=nd2;
        while(k<=j) {
            j-=k;
            k=Math.floor(k/2);
        }
        j+=k;
    }
    let le:number=0;
    let le2:number=0;
    let ur:number=0;
    let ui:number=0;
    let sr:number=0;
    let si:number=0;
    let jm1:number=0;
    let ip:number=0;
    for(k=1;k<m+1;k+=1) {
        le=Math.pow(2,k);
        le2=le/2;
        ur=1;
        ui=0;
        tr=0;
        ti=0;
        sr=Math.cos(Math.PI/(le2));
        si=-Math.sin(Math.PI/(le2));
        for(j=1;j<le2+1;j+=1) {
            jm1=j-1;
            for(i=jm1;i<n;i+=le) {
                ip=i+le2;
                tr=rex[ip]*ur-imx[ip]*ui;
                ti=imx[ip]*ur+rex[ip]*ui;
                rex[ip]=rex[i]-tr;
                imx[ip]=imx[i]-ti;
                rex[i]+=tr;
                imx[i]+=ti;
            }
            tr=ur;
            ur=tr*sr-ui*si;
            ui=tr*si+ui*sr;
        }
    }
    for(i=0;i<n/2;i+=1) {
        rex[i]=(rex[i]*rex[i]+imx[i]*imx[i]);
    }
    return rex.slice(0,n/2);
}

function _modification(spec:number[],timeTick:number,outPoints:number):number[][] {
    let lg:(x:number)=>number=(x)=>Math.log(x)/Math.LN10;
    let i:number=0;
    let normalization:number=lg(timeTick/spec.length);
    let scale:number=lg(2.0*spec.length*timeTick);
    let llim:number=0;
    let rlim:number=lg(spec.length);
    let lstep:number=(rlim-llim)/(outPoints-1.0);
    let clim:number=llim+lstep;
    let inInterval:number=0;
    let psd:number[][]=new Array<Array<number>>(outPoints);
    for(i=0;i<outPoints;i+=1) {
        psd[i]=[0,0];
    }
    let used:number=0;
    let total:number=0;
    let oldX:number=0;
    i=1;
    while(clim<=rlim) {
        while(lg(i)<clim) {
            total+=spec[i];
            i+=1;
            inInterval+=1;
        }
        if(total>0) {
            if(used==0) {
                oldX=Math.pow(10,clim-scale);
                psd[used][0]=lg(oldX/2.0);
                psd[used][1]=lg(total/(inInterval));
            } else {
                let newX=Math.pow(10,clim-scale);
                psd[used][0]=lg((newX+oldX)/2.0);
                psd[used][1]=lg(total/(inInterval));
                oldX=newX;
            }
            psd[used][1]+=normalization;
            used+=1;
        }
        inInterval=0;
        total=0;
        clim+=lstep;
    }
    return psd.slice(0,used);
}
