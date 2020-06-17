import React, { useEffect, useState } from "react";
import Video from "./Video";

export default function VideoComponent(): JSX.Element {
  const [video, setVideo] = useState<any>(null);

  
  useEffect(() => {
    setVideo(new Video(document.querySelector("canvas")!, {audio: {
      autoGainControl: false,
      noiseSuppression: false,
      echoCancellation: true
    }, video: true}));
  }, []);

  useEffect(()=>{
    if(video)
    video.start(true)
  }, [video])

  const checkPermissions = ()=>{
    video.cameraAccess((resp: any, err: any) => {
      if (err) {
        alert("Camera Permissions Denied");
      }
    });
  }


  const handleStart = () => {
    checkPermissions() 
    video.applySettings((context: CanvasRenderingContext2D)=>{
      context.font = "20px serif";
      context.fillStyle = "white";
      const str = video.getTime({format: 'mins'});
      context.fillText(str, 0, 20, 300);
      
    });
  };

  const handlePause = () => {
    video.pause();
  };


  const handlePlay = () => {
    video.play();
  };


  const handleStop = () => {
    video.stop((blob: Blob|null, err: string|null) => {
      if(!err){
        const player:any = document.querySelector("#player")!;
        player.src = window.URL.createObjectURL(blob);
      }
    });
    
  };
  
  const handleZoom = ()=>{
    // video.setZoom(3)
    // console.log(video.getConstraints())
    // console.log(video.returnConstraints("zoom"))
  }
  return (
    <>
      <canvas width="500" height="500" />
      <button onClick={handleStart}>Start</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handleStop}>Stop</button>
      <button onClick={handleZoom}>Zoom</button>
      <video id="player" autoPlay controls />
    </>
  );
}
