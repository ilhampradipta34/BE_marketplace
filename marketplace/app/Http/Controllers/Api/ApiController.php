<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ApiController extends Controller
{
    protected function ok(mixed $data, string $message = 'OK', int $status = 200, ?array $meta = null): JsonResponse
    {
        return response()->json(array_filter(['success' => true, 'message' => $message, 'data' => $data, 'meta' => $meta], fn ($v) => $v !== null), $status);
    }
}
