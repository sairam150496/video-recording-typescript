import Camera from '../Camera/Components/Camera'
import Constraints from '../Camera/Components/Interfaces';





interface VideoProps{
  cameraAccess: (cb: (stream: MediaStream|null, error:string|null)=>void)=>void;
  start: (applySettingsLater?: boolean, cb?: (context: CanvasRenderingContext2D)=>void)=>void;
  stop: (cb: (blob: Blob|null, error: string|null)=>void)=>void;
  pause: ()=>string|null;
  play: ()=>string|null;
  doesSupportConstraint: (constraint: Array<string>)=>string|object;
  getAllContraints: ()=>Array<string>;
  getSupportedConstraints: ()=>string|object;
  getConstraintValues: (constraint: Array<string>)=>string|object;
  takePhoto: (cb: (blob: Blob|null, error: string|null)=>void)=>void;
  getMediaTrackCapabilityRangeSettings: (capability: Array<string>)=>string|object;
  setColorTemerature: (temperature: number)=>void;
  setExposure: (exposureLevel: number)=>void;
  torch: (torchMode: boolean)=>void;
  setZoom: (zoomLevel: number)=>void;
  getTime: (props: GetTime)=>string;

}

interface GetTime{
  format?:"mins"|":";
}

class Video implements VideoProps{
    private element: any;
    private video: any;
    private chunks: Array<Blob|BlobPart>;
    private cameraConstraints: Constraints | null;
    private pausedTime: number;
    private pausedDate: Date;
    private stream: MediaStream|null;
    private mediaRecorder: MediaRecorder | null;
    private init_time: Date;
    private canvasContext: any;
    private cStream: MediaStream|null;
    private interval: any;
    private playPauseTime: number;

  public constructor(element: HTMLCanvasElement, cameraConstraints: Constraints) {
    this.element = element;
    this.video = document.createElement("video");
    this.video.style = "display: none";
    this.cameraConstraints = cameraConstraints;
    this.video.muted = true;
    this.pausedTime = 0;
    this.playPauseTime = 0;
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    this.pausedDate = new Date();
    this.init_time = new Date();
    this.canvasContext = null;
    this.interval = null;
    this.cStream = null
  }

  public cameraAccess(cb: (stream: MediaStream|null, error:string|null)=>void):void {
    Camera(this.cameraConstraints!)
      .then((stream: any) => {
        cb(stream, null)
      })
      .catch((err:any) => {
        cb(null, err);
      });
  }

  /*

    * Returns TRUE if the device supports the feature / Constraint

  */

  public doesSupportConstraint(constraint: Array<string>): string|object {
      try{
      let obj:any = {}
      constraint.forEach((item, index)=>{
        obj[item] = item in this.stream!.getVideoTracks()[0].getCapabilities()?true:false;
      })
      return obj;
    }
    catch(e){
      return e.message
    }
  }


public getAllContraints(): Array<string>{
  return ([
    "aspectRatio",
    "autoGainControl",
    "brightness",
    "channelCount",
    "colorTemperature",
    "contrast",
    "deviceId",
    "echoCancellation",
    "exposureCompensation",
    "exposureMode",
    "exposureTime",
    "facingMode",
    "focusDistance",
    "focusMode",
    "frameRate",
    "groupId",
    "height",
    "iso",
    "latency",
    "noiseSuppression",
    "pointsOfInterest",
    "resizeMode",
    "sampleRate",
    "sampleSize",
    "saturation",
    "sharpness",
    "torch",
    "whiteBalanceMode",
    "width",
    "zoom"
  ]);
}

/*

* This Returns All The Supported Constraints

*/

  public getSupportedConstraints(): string|object{
    try{
      let obj: any = {}
      const cap: any = this.stream!.getVideoTracks()[0].getCapabilities();
        Object.keys(cap).forEach((item, index)=>{
          obj[item] = cap[item]
        })
        return obj
      }catch(e){
        return e.message
      }
  }

  /*

  * This Returns Mentioned Constraint Values

*/

  public getConstraintValues(constraint: Array<string>):string|object {
    try{
      let obj:any = {}
      const cap:any = this.stream!.getTracks()[0].getCapabilities()
      constraint.forEach((item, index)=>{
        obj[item] = cap[item]
      })
      return obj;    
    }catch(e){
      return e.message
    }
    
  }

  public takePhoto(cb: (blob: Blob|null, error: string|null)=>void): void {
    try{
      new ImageCapture(this.stream!.getVideoTracks()[0])
      .takePhoto()
      .then(blob => {
        cb(blob, null);
      })
      .catch(err => {
        cb(null, err.message);
      });
    }catch(e){
      cb(null, e.message)
    }
    
  }

  /*

  * This returns the min, max and step values of the capability that mentioned in the array.
  * EX: colorTemperature, exposureCalibration etc 

*/

  public getMediaTrackCapabilityRangeSettings(capability: Array<string>): string|object {
    try{
      if (this.stream) {
        let obj: any = {}
        const cap: any = this.stream!.getVideoTracks()[0].getCapabilities();
        capability.forEach((item, index)=>{
          obj[item] = {
            min: cap[item].min,
            max: cap[item].max,
            step: cap[item].step
          }
        })
        return obj;
      } else {
        return "Stream is not available";
      } 
    }catch(e){
      return e.message
    }
  }

  public setColorTemerature(temp: number): string|null {
    try{
      const colorTempProp: any = this.getMediaTrackCapabilityRangeSettings(["colorTemperature"])
      const colorTempSettings = colorTempProp.colorTemperature
      if(this.stream){
        if(temp<colorTempSettings.min){
          temp = colorTempSettings.min
        }else if(temp> colorTempSettings.max){
          temp = colorTempSettings.max
        }
        this.stream.getVideoTracks()[0].applyConstraints({
          advanced:[{
            colorTemperature: temp
          }]
        })
        return null
      }else{
        return "Stream has not started yet"
      }
    }catch(e){
      return e.message
    }
  }

  public setExposure(temp: number): string | null{
    try{
      const colorTempProp:any = this.getMediaTrackCapabilityRangeSettings(["exposureCompensation"])
      const colorTempSettings = colorTempProp.colorTemperature
      if(this.stream){
        if(temp<colorTempSettings.min){
          temp = colorTempSettings.min
        }else if(temp> colorTempSettings.max){
          temp = colorTempSettings.max
        }
        this.stream.getVideoTracks()[0].applyConstraints({
          advanced:[{
            exposureCompensation: temp
          }]
        })
        return null
      }else{
        return "Stream Has Not Started Yet"
      }
    }catch(e){
      return e.message
    }
  }

  public torch(mode: boolean): void{
    try{
        const tracks:any = this.stream!.getVideoTracks()[0];
        tracks.applyConstraints({advanced:[{
          torch: mode
        }]})
      }
      catch(e){
      }
  }


public destroy(): void{
  if(this.stream){
    this.stream.getTracks().forEach((track)=>{
      track.stop()
    })
  }
  if(this.interval){
    clearInterval(this.interval)
  }
  this.element = null;
  this.video = null;
  this.cameraConstraints = null;
  this.pausedTime = 0;
  this.mediaRecorder = null;
  this.stream = null;
  this.chunks = [];
  this.pausedDate = new Date();
  this.init_time = new Date();
  this.canvasContext = null;
  this.interval = null;
  this.cStream = null;
  this.playPauseTime = 0;
}

  public setZoom(zoom: number): null|string {
    try{
      if (this.stream) {
        const tracks:any = this.stream.getVideoTracks()[0];
        const capabilities:any = tracks.getCapabilities();
        if ("zoom" in capabilities) {
          if (zoom >= capabilities.zoom.max) {
            zoom = capabilities.zoom.max
          } else if (zoom <= capabilities.zoom.min) {
            zoom = capabilities.zoom.min
          }
          tracks.applyConstraints({ advanced: [{ zoom: zoom }] });
          this.stream.addTrack(tracks);
        
        } else {
          return "Zoom Is not Supported By The Device"
        }
      }
      else{
        return "Stream Is Not Ready Yet"
      }
      return null
    }
    catch(e){
      return e.message
    }
    
  }


  public getTime(props: GetTime): string{
    let x: number = Math.round(((this.pausedDate.getTime() - this.init_time.getTime()) - this.pausedTime) / 1000);
    if(props.format === "mins"){
      return(
          (Math.floor(x / 3600) % 60) +
          " hours " +
          (Math.floor(x / 60) % 60) +
          " mins " +
          Math.floor(x % 60) +
          " secs");
    }else{
      return ((Math.floor(x / 60) % 60) +
        ":" +
        Math.floor(x % 60));
    }
  }


  private captureDataToCanvas(cb: (context: CanvasRenderingContext2D)=>void) {
    this.init_time = new Date();
    this.interval = setInterval(() => {
      if (!this.video.paused) {
        this.canvasContext.drawImage(this.video, 0, 0, this.element.width, this.element.height);
        this.pausedDate = new Date()
        cb(this.canvasContext)
      }else{
            this.pausedTime = Math.round(new Date().getTime() - this.pausedDate.getTime())+ this.playPauseTime
      }
    }, 0);
  }

// If we do not pass any parameter then video will be rendered on to the canvas and starts recording.
// If apply settings Later = true, then the video is rendered on to the component on start but will not be recorded.

  public start(applySettingsLater: boolean = false, cb:(context:CanvasRenderingContext2D)=>void=(context: CanvasRenderingContext2D)=>{}): void {
    this.cameraAccess((stream: MediaStream|null, err: string|null) => {
      if (!err && this.cameraConstraints!.video) {
        this.stream = stream;
        this.video.srcObject = stream;
        const context = this.element.getContext("2d");
        this.canvasContext = context
        const cStream = this.element.captureStream(30);
        this.cStream = cStream;
        if(this.cameraConstraints!.audio)
          cStream.addTrack(stream!.getAudioTracks()[0]);
        this.video.onloadeddata = () => { 
          this.video.play();
          this.captureDataToCanvas(cb);
        };
        if(!applySettingsLater){
          this.mediaRecorder = new MediaRecorder(cStream);
          this.startMediaRecorder();
        }          
      }
      else{
          return("Class Only Supports Video Recording, Please ask for video in permissions")
      }
    });
  }

  public applySettings(cb: (context: CanvasRenderingContext2D)=>void): void{
    if(this.stream){
      if(this.interval){
        clearInterval(this.interval)
      }
      this.captureDataToCanvas(cb)
      this.mediaRecorder = new MediaRecorder(this.cStream!);
      this.startMediaRecorder();
    }
  }


  private startMediaRecorder(): void {
    if(this.stream){
      this.mediaRecorder!.start();
    this.mediaRecorder!.ondataavailable = e => {
      this.chunks.push(e.data);
    };
    }
    else{
      
    }
  }


  public pause(): string|null {
    try{
      if(this.stream){
        this.video.pause();
        this.mediaRecorder!.pause();
        return null
      }else{
        return("Video Has Not Started Yet")
      }
        
    }catch(e){
        return e.message
    }
  }


  public play(): string|null {
      this.playPauseTime = this.pausedTime
      try{
        if(this.stream){
          this.video.play();
        this.mediaRecorder!.resume();
        return null
        }
        else{
          return "Video is not paused"
        }
      }catch(e){
          return e.message
      }
  }


  public stop(cb: (blob: Blob|null, err: string|null)=>void): void{
      try{
          if(this.stream){
            this.video.pause();
          this.mediaRecorder!.stop();
          this.mediaRecorder!.onstop = () => {
          const blob = new Blob(this.chunks);
          this.chunks = [];
          cb(blob, null)
        }
      }else{
        this.destroy()
        cb(null, "Video Has not started yet")
      }
      }catch(e){
        cb(null, e.message)
    }
    finally{
      this.destroy();
    }
  }
}
export default Video;
