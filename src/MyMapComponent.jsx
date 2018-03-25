import {
    withGoogleMap,
    GoogleMap,
    Marker,
    DirectionsRenderer
} from "react-google-maps"
import React from "react";

const MyMapComponent = withGoogleMap((props) => {
    const center = {lat: props.lat || 40.623715, lng: props.lng || -73.962799};

    return <GoogleMap
        defaultZoom={14}
        defaultCenter={{lat: 40.623715, lng: -73.962799}}
        center={center}
    >
        {props.isMarkerShown && <Marker position={center}/>}
        {props.directions && <DirectionsRenderer directions={props.directions} />}
    </GoogleMap>
});

export default MyMapComponent;