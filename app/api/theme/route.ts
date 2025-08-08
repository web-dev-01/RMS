import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    companyName: "Champion Semiconductor LLP",
    heading: "Build Faster with",
    brandWord: "YourCompany",
    primaryColor: "#00ED64",       // MongoDB green
    secondaryColor: "#0A0F19",     // MongoDB dark background
    cta1: "Start Building",
    cta2: "Explore Docs"
  });
}
