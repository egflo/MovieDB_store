import {useQuery} from "@apollo/client";
import {useEffect, useState} from "react";


interface Location {
    country_code: string;
    country_name: string;
    city: string;
    postal: string;
    latitude: number;
    longitude: number;
    IPv4: string;
    state: string;
}

function Location() {
    const [location, setLocation] = useState<Location>();

    const getLocation = async () => {
        const response = await fetch("https://geolocation-db.com/json/");
        const data = await response.json();
        setLocation(data);
    }

    useEffect(() => {
        getLocation();
    }, []);

}