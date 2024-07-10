// api/fetcher.ts
import axios from 'axios';
import {auth} from "../utils/firebase";
import {Cart} from "../models/Cart";
import {Address} from "../models/Address";
import {Page} from "../models/Page";
import {Movie} from "../models/Movie";

const CART_API = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;
const ADDRESS_API = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/users/address`;
const PAYMENT_API = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/users/payment-methods`;

export interface CartResponse {
    items: Cart[];
}

export const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
})

axiosInstance.interceptors.request.use(async config => {
    return config
}, (error) => {
    return Promise.reject(error)
})


export const fetchCart = async (): Promise<Cart[]> => {
    const user = auth.currentUser;
    if (user) {
        const idToken = await user.getIdToken();
        const response = await axiosInstance.get(CART_API, {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });
        return response.data;
    } else {
        throw new Error('User not authenticated');
    }
};

export const fetchAddresses = async (): Promise<Address[]> => {
    const user = auth.currentUser;
    if (user) {
        const idToken = await user.getIdToken();
        const response = await axiosInstance.get(ADDRESS_API, {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });
        return response.data;
    } else {
        throw new Error('User not authenticated');
    }
}

export const fetchPaymentMethods = async (): Promise<any[]> => {
    const user = auth.currentUser;
    if (user) {
        const idToken = await user.getIdToken();
        const response = await axiosInstance.get(PAYMENT_API, {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });
        return response.data;
    } else {
        throw new Error('User not authenticated');
    }
}

//Authnenticated fetch
export const fetchMovies= async (urL: string, page: number, limit: number): Promise<Page<Movie>> => {
    const user = auth.currentUser;
    if (user) {
        const idToken = await user.getIdToken();
        //?sortBy=created
        const response = await axiosInstance.get<Page<Movie>>(`${urL}?page=${page}&limit=${limit}&sortBy=created`, {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });
        return response.data;
    } else {
        throw new Error('User not authenticated');
    }
};