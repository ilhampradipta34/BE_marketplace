<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class ApiController extends Controller
{
    protected function ok(mixed $data, string $message = 'OK', int $status = 200, ?array $meta = null): JsonResponse
    {
       return response()->json(
            array_filter(
                [
                    'success' => true,
                    'message' => $message,
                    'data'    => $data,
                    'meta'    => $meta,
                ],
                fn ($value) => $value !== null
            ),
            $status
        );
    }

    /** Run a write operation atomically and roll it back if any exception occurs. */
    protected function transaction(callable $callback): mixed
    {
        DB::beginTransaction();

        try {
            $result = $callback();
            DB::commit();

            return $result;
        } catch (Throwable $exception) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            throw $exception;
        }
    }
}
