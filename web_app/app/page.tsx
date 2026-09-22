
import Image from "next/image";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { clientConfig, serverConfig } from "@/lib/firebase/config";
import Link from "next/link";
import HomePage from "@/app/HomePage";
import Navbar from "@/app/navigation";
import {useAuth} from "@/lib/firebase/AuthContext";


export default function Home() {


  return (
      <HomePage></HomePage>
  );
}
