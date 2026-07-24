import { NextResponse } from "next/server";
import { authUrl } from "@/services/google-auth";
export async function GET() { return NextResponse.redirect(authUrl()); }
