import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { toast } from "react-toastify";

type GoogleMapsProps = {
  style: string;
  initialAddress: string;
  onLocationSelect: (address: string, latitude: number, longitude: number) => void;
  initialLatitude: number;
  initialLongitude: number;
};

const GoogleMaps: React.FC<GoogleMapsProps> = ({
  style,
  initialAddress,
  onLocationSelect,
  initialLatitude,
  initialLongitude,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [address, setAddress] = useState(initialAddress);
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [markerPosition, setMarkerPosition] = useState({ lat: latitude, lng: longitude });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "invalidKey",
    libraries: ["places"],
  });

  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const inputRef = useRef<google.maps.places.SearchBox | null>(null);

  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude]);

  useEffect(() => {
    // Initialize Geocoder only after the script is loaded
    if (isLoaded && !geocoderRef.current && typeof google !== "undefined") {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng && geocoderRef.current) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ lat, lng });

      // Reverse geocoding to get the address
      try {
        const response = await geocoderRef.current.geocode({
          location: { lat, lng },
        });
        if (response.results[0]) {
          setAddress(response.results[0].formatted_address);
        } else {
          console.error("No address found for this location.");
        }
      } catch (error) {
        console.error("Geocoder failed: ", error);
      }
    }
  };

  const handleSetLocation = () => {
    if(!address?.length || !latitude || !longitude){
        toast.error("Please select a valid address",{
            position:"top-center",
            autoClose:2000,
            theme:'dark'
        })
    }
    onLocationSelect(address, latitude, longitude);
  };

  return (
    <div className="w-full h-[90%]">
      {!isLoaded ? (
        <div>Loading...</div>
      ) : (
        <>
          <GoogleMap
            mapContainerClassName="w-full h-full rounded-lg"
            center={center}
            zoom={10}
            onLoad={(map) => setMap(map)}
            onClick={handleMapClick} // Handle clicks on the map
          >
            <StandaloneSearchBox
              onLoad={(ref) => (inputRef.current = ref)}
              onPlacesChanged={() => {
                const places = inputRef.current?.getPlaces();
                if (places && places[0]) {
                  const place = places[0];
                  setAddress(place.formatted_address || "");
                  setLatitude(place.geometry?.location?.lat() || 0);
                  setLongitude(place.geometry?.location?.lng() || 0);
                  setMarkerPosition({
                    lat: place.geometry?.location?.lat() || 0,
                    lng: place.geometry?.location?.lng() || 0,
                  });
                }
              }}
            >
              <div className="absolute top-4 left-4 w-[300px]">
                <input
                  type="text"
                  className={`w-full p-3 rounded-lg border border-gray-300 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${style}`}
                  placeholder="Search for a location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </StandaloneSearchBox>

            <Marker
              draggable
              position={markerPosition}
              onDragEnd={(event) => {
                if (event.latLng) {
                  const lat = event.latLng.lat();
                  const lng = event.latLng.lng();
                  setLatitude(lat);
                  setLongitude(lng);
                  setMarkerPosition({ lat, lng });
                }
              }}
            />
          </GoogleMap>
          <div className="absolute bottom-4 left-4">
            <button
              onClick={handleSetLocation}
              className="px-4 py-2 bg-green-600 text-white flex justify-end w-full rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Set Location
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GoogleMaps;
