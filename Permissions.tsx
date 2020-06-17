export default function CheckCameraPermission(){
   return new Promise((resolve, reject)=>{
        try{
            if(navigator){      
                navigator.permissions.query({name: 'camera'})
                .then(permissionStatus=>{
                    if(permissionStatus.state === "granted"){
                        resolve("granted")
                    }else if(permissionStatus.state === "denied"){
                        resolve("denied")
                    }else{
                        resolve("prompt")
                    }
                })
                .catch(err=>{
                    resolve("Not A Chrome Browser")
                })
            }else{
                reject("Not A Https call")
            }
        }catch(e){
            reject("Camera Is Not SUpported In This Device")
        }
    })
}