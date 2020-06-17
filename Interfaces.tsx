interface Constraints{
    audio?: boolean | MediaTrackConstraints;
    video: boolean | MediaTrackConstraints;
}

export default Constraints