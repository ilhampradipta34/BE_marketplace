import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl =
  process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000/api";
const allowedRoots = new Set(["products", "customers", "orders"]);

async function proxyToBackend(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const accessToken = token?.apiAccessToken;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid atau sudah berakhir." },
      { status: 401 },
    );
  }

  const { path } = await context.params;
  if (!path?.length || !allowedRoots.has(path[0])) {
    return NextResponse.json(
      { success: false, message: "Endpoint tidak diizinkan." },
      { status: 404 },
    );
  }

  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const target = new URL(`${apiBaseUrl.replace(/\/$/, "")}/${encodedPath}`);
  target.search = request.nextUrl.search;

  try {
    const response = await fetch(target, {
      method: request.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(request.headers.get("content-type")
          ? { "Content-Type": request.headers.get("content-type") as string }
          : {}),
      },
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.text(),
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Tidak dapat menghubungi server API Laravel." },
      { status: 502 },
    );
  }
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
