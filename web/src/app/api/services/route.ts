import { NextResponse } from 'next/server'

// Firebase migration - API route disabled temporarily
export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Esta API foi desabilitada durante a migração para Firebase' 
  }, { status: 503 })
}

export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: 'Esta API foi desabilitada durante a migração para Firebase' 
  }, { status: 503 })
}

export async function PUT() {
  return NextResponse.json({ 
    success: false, 
    error: 'Esta API foi desabilitada durante a migração para Firebase' 
  }, { status: 503 })
}

export async function DELETE() {
  return NextResponse.json({ 
    success: false, 
    error: 'Esta API foi desabilitada durante a migração para Firebase' 
  }, { status: 503 })
}