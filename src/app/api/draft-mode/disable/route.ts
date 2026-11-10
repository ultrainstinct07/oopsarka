import { draftMode } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()
  const back = request.nextUrl.searchParams.get('redirect')
  const destination = back && back.startsWith('/') && !back.startsWith('//') ? back : '/'
  return NextResponse.redirect(new URL(destination, request.url))
}
